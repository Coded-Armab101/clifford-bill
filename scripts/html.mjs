const [, , url, sel, max = '1800'] = process.argv
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
    const el = document.querySelector(${JSON.stringify(sel)});
    return el ? el.outerHTML.slice(0, ${Number(max)}) : 'MISSING';
  })()`,
  returnByValue: true,
})
console.log(r.result.value)
ws.close()
process.exit(0)