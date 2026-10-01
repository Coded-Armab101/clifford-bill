const [, , url, sels = ''] = process.argv
const list = sels.split(',').filter(Boolean)
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
const l = await (await fetch('http://127.0.0.1:9222/json/list')).json()
const ws = new WebSocket(l.find((x) => x.type === 'page').webSocketDebuggerUrl)
await new Promise((r) => ws.addEventListener('open', r, { once: true }))
await send(ws, 'Page.enable')
await send(ws, 'Runtime.enable')
await send(ws, 'Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false })
await send(ws, 'Page.navigate', { url })
await sleep(8000)

const r = await send(ws, 'Runtime.evaluate', {
  expression: `(() => {
    const px = v => Math.round(parseFloat(v)*100)/100;
    const out = {};
    for (const s of ${JSON.stringify(list)}) {
      const el = document.querySelector(s);
      if (!el) { out[s] = 'MISSING'; continue; }
      const c = getComputedStyle(el); const b = el.getBoundingClientRect();
      out[s] = { box: [px(b.left+scrollX), px(b.top+scrollY), px(b.width), px(b.height)],
        display: c.display, position: c.position, top: c.top, bottom: c.bottom,
        marginTop: c.marginTop, marginBottom: c.marginBottom,
        height: c.height, minHeight: c.minHeight, maxHeight: c.maxHeight,
        zIndex: c.zIndex, overflow: c.overflow, paddingTop: c.paddingTop, paddingBottom: c.paddingBottom };
    }
    return JSON.stringify({ docHeight: document.documentElement.scrollHeight, out }, null, 1);
  })()`,
  returnByValue: true,
})
console.log(r.result.value)
ws.close()
process.exit(0)