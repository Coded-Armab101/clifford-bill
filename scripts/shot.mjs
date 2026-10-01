/**
 * Screenshot a vertical slice of the page, so visual-only details (masks,
 * blend modes, marquee seam) can be compared side by side.
 *
 * Usage: node scripts/shot.mjs <url> <width> <height> <scrollToSelector|number> <out.png>
 */
import { writeFileSync } from 'node:fs'

const [, , url, W = '1440', H = '900', target = '0', out = 'shot.png'] = process.argv

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
await send(ws, 'Page.navigate', { url })
await sleep(8000)

const y = await send(ws, 'Runtime.evaluate', {
  expression: /^\d+$/.test(target)
    ? `(() => { const el = document.querySelector('.info-wrap'); const top = el.getBoundingClientRect().top + window.scrollY; window.scrollTo(0, top + ${target}); return window.scrollY; })()`
    : `(() => { const el = document.querySelector(${JSON.stringify(target)}); const top = el.getBoundingClientRect().top + window.scrollY; window.scrollTo(0, top); return window.scrollY; })()`,
  returnByValue: true,
})
await sleep(2500)

const shot = await send(ws, 'Page.captureScreenshot', { format: 'png' })
writeFileSync(out, Buffer.from(shot.data, 'base64'))
console.log(`wrote ${out} (scrolled to ${y.result.value})`)
ws.close()
process.exit(0)