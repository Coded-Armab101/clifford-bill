/**
 * Compare a section's direct children between reference and clone: for each
 * child, its box, plus its own children. Reveals why a section is far taller
 * or shorter than the reference (stacked vs side-by-side, wrong image aspect).
 *
 * Usage: node scripts/children.mjs <urlA> <urlB> <selector> [width] [height] [depth]
 */
const [, , urlA, urlB, sel, W = '1440', H = '900', DEPTH = '2'] = process.argv

let id = 0
function send(ws, method, params = {}) {
  const msgId = ++id
  ws.send(JSON.stringify({ id: msgId, method, params }))
  return new Promise((resolve, reject) => {
    const onMsg = (ev) => {
      const m = JSON.parse(ev.data)
      if (m.id !== msgId) return
      ws.removeEventListener('message', onMsg)
      m.error ? reject(new Error(JSON.stringify(m.error))) : resolve(m.result)
    }
    ws.addEventListener('message', onMsg)
    setTimeout(() => reject(new Error(`timeout ${method}`)), 40000)
  })
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const list = await (await fetch('http://127.0.0.1:9222/json/list')).json()
const ws = new WebSocket(list.find((x) => x.type === 'page').webSocketDebuggerUrl)
await new Promise((r) => ws.addEventListener('open', r, { once: true }))
await send(ws, 'Page.enable')
await send(ws, 'Runtime.enable')

const EXPR = (depth) => `(() => {
  const px = v => Math.round(parseFloat(v)*100)/100;
  const root = document.querySelector(${JSON.stringify(sel)});
  if (!root) return JSON.stringify({ error: 'selector not found' });
  const rb = root.getBoundingClientRect();
  const walk = (node, d) => {
    const out = [];
    for (const c of node.children) {
      const b = c.getBoundingClientRect();
      const cs = getComputedStyle(c);
      const own = [...c.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent.trim()).filter(Boolean).join(' ');
      out.push({
        d, tag: c.tagName, cls: (typeof c.className === 'string' ? c.className : '') || '(none)',
        box: [px(b.left + scrollX), px(b.top + scrollY), px(b.width), px(b.height)],
        display: cs.display, position: cs.position,
        gridCols: cs.gridTemplateColumns !== 'none' ? cs.gridTemplateColumns : '',
        ratio: c.tagName === 'IMG' ? (c.naturalWidth + 'x' + c.naturalHeight) : '',
        objectFit: c.tagName === 'IMG' ? cs.objectFit : '',
        ownText: own.slice(0, 40),
      });
      if (d < ${Number(depth)}) out.push(...walk(c, d + 1));
    }
    return out;
  };
  return JSON.stringify({ root: [px(rb.left + scrollX), px(rb.top + scrollY), px(rb.width), px(rb.height)],
    kids: walk(root, 1) });
})()`

const results = {}
for (const [tag, url] of [['REF', urlA], ['MINE', urlB]]) {
  await send(ws, 'Emulation.setDeviceMetricsOverride', {
    width: Number(W), height: Number(H), deviceScaleFactor: 1, mobile: Number(W) < 768,
  })
  await send(ws, 'Page.navigate', { url })
  await sleep(9000)
  const r = await send(ws, 'Runtime.evaluate', { expression: EXPR(DEPTH), returnByValue: true })
  if (r.exceptionDetails) { console.log('EXCEPTION ' + r.exceptionDetails.text); process.exit(1) }
  results[tag] = JSON.parse(r.result.value)
}

const line = (k) => {
  const parts = [
    `${'  '.repeat(k.d - 1)}<${k.tag} class="${k.cls}">`,
    `box=[${k.box.join(',')}]`,
    `disp=${k.display}`,
    k.position !== 'static' ? `pos=${k.position}` : '',
    k.gridCols ? `cols=${k.gridCols}` : '',
    k.ratio ? `nat=${k.ratio} fit=${k.objectFit}` : '',
    k.ownText ? `text="${k.ownText}"` : '',
  ]
  return parts.filter(Boolean).join(' ')
}

for (const tag of ['REF', 'MINE']) {
  const d = results[tag]
  console.log(`\n########## ${tag}  ${sel} ##########`)
  if (d.error) { console.log(d.error); continue }
  console.log(`  ROOT box=[${d.root.join(',')}]`)
  for (const k of d.kids) console.log(line(k))
}

/* highlight height mismatches between siblings */
const byCls = (tag) => {
  const m = new Map()
  for (const k of results[tag].kids) {
    if (k.d !== 1) continue
    m.set(k.cls, k)
  }
  return m
}
const a = byCls('REF')
const b = byCls('MINE')
const clsA = [...a.keys()]
const clsB = [...b.keys()]
console.log('\n########## child-class comparison (depth 1) ##########')
for (const c of [...new Set([...clsA, ...clsB])]) {
  const ra = a.get(c)
  const rb2 = b.get(c)
  if (ra && rb2) {
    const dh = Math.abs(ra.box[3] - rb2.box[3])
    const dw = Math.abs(ra.box[2] - rb2.box[2])
    const flag = dh > 2 || dw > 2 ? '  <<<' : ''
    console.log(`  ${ra.box.join(',')} vs ${rb2.box.join(',')}  dH=${dh.toFixed(2)} dW=${dw.toFixed(2)}  ${c}${flag}`)
  } else if (ra) {
    console.log(`  MISSING in MINE: ${c}  ref box=[${ra.box.join(',')}]`)
  } else {
    console.log(`  EXTRA in MINE: ${c}  mine box=[${rb2.box.join(',')}]`)
  }
}
ws.close()
process.exit(0)