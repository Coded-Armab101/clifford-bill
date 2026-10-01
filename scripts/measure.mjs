/**
 * Targeted style dump for one selector: padding, border, margin, line box and
 * range rects. Used to explain a height difference that computed line-height
 * alone does not explain.
 *
 * Usage: node scripts/measure.mjs <urlA> <urlB> <selector> [width] [height]
 */
const [, , urlA, urlB, sel, W = '1440', H = '900'] = process.argv

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

for (const [tag, url] of [['REF', urlA], ['MINE', urlB]]) {
  await send(ws, 'Emulation.setDeviceMetricsOverride', {
    width: Number(W), height: Number(H), deviceScaleFactor: 1, mobile: Number(W) < 768,
  })
  await send(ws, 'Page.navigate', { url })
  await sleep(9000)
  const r = await send(ws, 'Runtime.evaluate', {
    expression: `(() => {
      const px = v => Math.round(parseFloat(v)*100)/100;
      const out = [];
      for (const el of document.querySelectorAll(${JSON.stringify(sel)})) {
        const b = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        const ranges = [];
        for (const n of el.childNodes) {
          if (n.nodeType === 3 && n.textContent.trim()) {
            const rg = document.createRange();
            rg.selectNodeContents(n);
            const rb = rg.getBoundingClientRect();
            const inner = [...el.querySelectorAll('*')].map((c) => {
              const cb = c.getBoundingClientRect();
              const ccs = getComputedStyle(c);
              return { tag: c.tagName, cls: c.className,
                h: px(cb.height), top: px(cb.top + scrollY),
                fontFamily: ccs.fontFamily, lh: ccs.lineHeight, fs: ccs.fontSize,
                fontStyle: ccs.fontStyle, fontWeight: ccs.fontWeight };
            });
            ranges.push({ text: n.textContent.trim().slice(0, 40),
              rect: [px(rb.left + scrollX), px(rb.top + scrollY), px(rb.width), px(rb.height)], inner });
          }
        }
        out.push({
          cls: el.className, text: (el.textContent || '').trim().slice(0, 50),
          box: [px(b.left + scrollX), px(b.top + scrollY), px(b.width), px(b.height)],
          display: cs.display, fontFamily: cs.fontFamily, fontSize: cs.fontSize,
          lineHeight: cs.lineHeight, fontStyle: cs.fontStyle, fontWeight: cs.fontWeight,
          padding: cs.padding, margin: cs.margin, border: cs.border,
          borderBottom: cs.borderBottom, display2: cs.display,
          ranges,
        });
      }
      return JSON.stringify(out);
    })()`,
    returnByValue: true,
  })
  console.log(`\n########## ${tag}  ${url}  ${sel} ##########`)
  if (r.exceptionDetails) { console.log('EXCEPTION ' + r.exceptionDetails.text); continue }
  for (const d of JSON.parse(r.result.value)) {
    console.log(`  <${d.cls}> "${d.text}"`)
    console.log(`    box=[${d.box.join(',')}] display=${d.display} fs=${d.fontSize} lh=${d.lineHeight} style=${d.fontStyle} weight=${d.fontWeight}`)
    console.log(`    family=${d.fontFamily}`)
    console.log(`    padding=${d.padding} margin=${d.margin} border=${d.border}`)
    for (const rg of d.ranges) {
      console.log(`    text "${rg.text}" rect=[${rg.rect.join(',')}]`)
      for (const i of rg.inner) {
        console.log(`      inner <${i.tag} class="${i.cls}"> h=${i.h} top=${i.top} lh=${i.lh} fs=${i.fs} style=${i.fontStyle} weight=${i.fontWeight}`)
        console.log(`        family=${i.fontFamily}`)
      }
    }
  }
}
ws.close()
process.exit(0)