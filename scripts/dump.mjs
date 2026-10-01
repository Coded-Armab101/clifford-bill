/**
 * Print the innerHTML plus per-child geometry of a selector in each build.
 * Compares real markup, not just box metrics, when a region renders differently.
 *
 * Usage: node scripts/dump.mjs <urlA> <urlB> <selector> [width] [height] [depth]
 */
const [, , urlA, urlB, sel, W = '1440', H = '900', DEPTH = '3'] = process.argv

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
await send(ws, 'Emulation.setDeviceMetricsOverride', {
  width: Number(W), height: Number(H), deviceScaleFactor: 1, mobile: Number(W) < 768,
})

for (const [tag, url] of [['REF', urlA], ['MINE', urlB]]) {
  await send(ws, 'Page.navigate', { url })
  await sleep(9000)
  const r = await send(ws, 'Runtime.evaluate', {
    expression: `(() => {
      const el = document.querySelector(${JSON.stringify(sel)});
      if (!el) return JSON.stringify({ error: 'selector not found' });
      const px = v => Math.round(parseFloat(v)*100)/100;
      const walk = (node, depth) => {
        const out = [];
        for (const c of node.children) {
          const b = c.getBoundingClientRect();
          const cs = getComputedStyle(c);
          const own = [...c.childNodes].filter(n => n.nodeType === 3)
            .map(n => n.textContent.trim()).filter(Boolean).join(' | ');
          out.push({
            d: depth, tag: c.tagName, cls: c.className || '(none)',
            box: [px(b.left + scrollX), px(b.top + scrollY), px(b.width), px(b.height)],
            display: cs.display, lh: cs.lineHeight, fs: cs.fontSize, ls: cs.letterSpacing,
            color: cs.color, whiteSpace: cs.whiteSpace, ownText: own,
          });
          if (depth < ${Number(DEPTH)}) out.push(...walk(c, depth + 1));
        }
        return out;
      };
      return JSON.stringify({ html: el.innerHTML, kids: walk(el, 1) });
    })()`,
    returnByValue: true,
  })
  console.log(`\n########## ${tag}  ${url}  ${sel} ##########`)
  if (r.exceptionDetails) {
    console.log('EXCEPTION ' + r.exceptionDetails.text)
    continue
  }
  const d = JSON.parse(r.result.value)
  if (d.error) {
    console.log(d.error)
    continue
  }
  console.log('--- innerHTML ---')
  console.log(d.html)
  console.log('--- tree ---')
  for (const k of d.kids) {
    console.log(
      `${'  '.repeat(k.d)}<${k.tag} class="${k.cls}"> box=[${k.box.join(',')}] display=${k.display} fs=${k.fs} lh=${k.lh} ls=${k.ls} ws=${k.whiteSpace} color=${k.color}` +
        (k.ownText ? `  text="${k.ownText}"` : ''),
    )
  }
}
ws.close()
process.exit(0)