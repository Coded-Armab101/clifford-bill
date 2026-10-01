/**
 * Hover probe. Dispatches real mouse input at a point, then reads back the
 * computed transform/opacity of the elements involved, so hover states can be
 * diffed between the reference build and this one.
 *
 * Usage: node scripts/hover.mjs [url] [width] [height]
 */
import { writeFileSync } from 'node:fs'

const [, , url = 'http://localhost:5180/', W = '1440', H = '900', outFile] = process.argv

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

/* name -> selector whose children are inspected */
const TARGETS = {
  headerBtn: '.header .btn',
  headerBtnLabel: '.header .btn .btn_label',
  headerLink: '.header_right_location .link',
  headerLinkLabel: '.header_right_location .link_label',
  heroH1: '.intro-wrap h1',
  heroTitle: '.intro-wrap_title',
  horse: '.horse.intro',
  heroDesc: '.intro-wrap_content_desc-2 p',
  videoCard: '.intro-wrap .video-card',
}

const SNAPSHOT = `(() => {
  const targets = ${JSON.stringify(TARGETS)}
  const out = {}
  for (const [name, sel] of Object.entries(targets)) {
    const el = document.querySelector(sel)
    if (!el) { out[name] = null; continue }
    const cs = getComputedStyle(el)
    const r = el.getBoundingClientRect()
    out[name] = {
      rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
      self: { transform: cs.transform, opacity: cs.opacity, mixBlendMode: cs.mixBlendMode,
              letterSpacing: cs.letterSpacing, color: cs.color, padding: cs.padding,
              backgroundColor: cs.backgroundColor, transition: cs.transitionProperty },
      kids: [...el.children].slice(0, 4).map((k) => {
        const ks = getComputedStyle(k)
        const kr = k.getBoundingClientRect()
        return { text: (k.textContent || '').trim().slice(0, 24),
                 transform: ks.transform, opacity: ks.opacity, position: ks.position,
                 top: Math.round(kr.top), height: Math.round(kr.height),
                 fontSize: ks.fontSize, color: ks.color, letterSpacing: ks.letterSpacing }
      }),
    }
  }
  return out
})()`

const list = await (await fetch('http://127.0.0.1:9222/json/list')).json()
const t = list.find((x) => x.type === 'page')
const ws = new WebSocket(t.webSocketDebuggerUrl)
await new Promise((r) => ws.addEventListener('open', r, { once: true }))
await send(ws, 'Page.enable')
await send(ws, 'Runtime.enable')
await send(ws, 'Emulation.setDeviceMetricsOverride', {
  width: Number(W), height: Number(H), deviceScaleFactor: 1, mobile: false,
})
await send(ws, 'Page.navigate', { url })
await sleep(6000)

const snap = async () => {
  const r = await send(ws, 'Runtime.evaluate', { expression: SNAPSHOT, returnByValue: true })
  return r.result.value
}

const before = await snap()

/* park the pointer away from everything, then hover each target in turn */
await send(ws, 'Input.dispatchMouseEvent', { type: 'mouseMoved', x: 5, y: 700 })
await sleep(400)

const hovered = {}
for (const [name, sel] of Object.entries(TARGETS)) {
  const at = await send(ws, 'Runtime.evaluate', {
    expression: `(() => { const el = document.querySelector(${JSON.stringify(sel)});
      if (!el) return null; const r = el.getBoundingClientRect();
      return { x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2) } })()`,
    returnByValue: true,
  })
  const pt = at.result.value
  if (!pt) continue
  await send(ws, 'Input.dispatchMouseEvent', { type: 'mouseMoved', x: pt.x, y: pt.y })
  await sleep(900)
  const s = await snap()
  hovered[name] = s[name]
  await send(ws, 'Input.dispatchMouseEvent', { type: 'mouseMoved', x: 5, y: 700 })
  await sleep(400)
}

const payload = { url, viewport: `${W}x${H}`, hovered }
const json = JSON.stringify(payload, null, 2)
if (outFile) {
  writeFileSync(outFile, json, 'utf8')
  console.log(`wrote ${outFile}`)
} else {
  console.log(json)
}
ws.close()
process.exit(0)