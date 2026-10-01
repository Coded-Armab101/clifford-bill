/**
 * Write a stacked side-by-side PNG of one region: reference on top, clone below.
 *
 * I cannot view images, so this produces a file the user can judge directly.
 * The region is scrolled into the viewport and captured at viewport
 * coordinates — captureBeyondViewport re-lays out 100vh sections, which
 * silently invalidates any clip rect measured beforehand.
 *
 * Usage: node scripts/sidebyside.mjs <urlA> <urlB> <selector> <width> <height> <outPng>
 */
import { writeFileSync } from 'node:fs'

const [, , urlA, urlB, sel, W = '1440', H = '900', out = 'sidebyside.png'] = process.argv

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
    setTimeout(() => reject(new Error(`timeout ${method}`)), 45000)
  })
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const list = await (await fetch('http://127.0.0.1:9222/json/list')).json()
const ws = new WebSocket(list.find((x) => x.type === 'page').webSocketDebuggerUrl)
await new Promise((r) => ws.addEventListener('open', r, { once: true }))
await send(ws, 'Page.enable')
await send(ws, 'Runtime.enable')

async function shoot(url) {
  await send(ws, 'Emulation.setDeviceMetricsOverride', {
    width: Number(W), height: Number(H), deviceScaleFactor: 1, mobile: Number(W) < 768,
  })
  await send(ws, 'Page.navigate', { url })
  for (let i = 0; i < 30; i++) {
    await sleep(1000)
    const r = await send(ws, 'Runtime.evaluate', {
      expression: `(() => { const el = document.querySelector(${JSON.stringify(sel)});
        if (!el) return 'no-el';
        const p = [...el.querySelectorAll('img')].filter(i => !i.complete || !i.naturalWidth).length;
        return p === 0 ? 'ready' : 'pending'; })()`,
      returnByValue: true,
    })
    if (r.result.value === 'ready') break
  }
  /* freeze marquee/scroll animations so both builds are at the same phase */
  await send(ws, 'Runtime.evaluate', {
    expression: `(() => { for (const el of document.querySelectorAll('*')) {
        const cs = getComputedStyle(el);
        if (cs.animationName && cs.animationName !== 'none') el.style.animationPlayState = 'paused'; }
      return true; })()`,
  })
  await sleep(1200)
  /* bring the region fully into the viewport */
  const rect = await send(ws, 'Runtime.evaluate', {
    expression: `(() => {
      const el = document.querySelector(${JSON.stringify(sel)});
      const r = el.getBoundingClientRect();
      const docTop = r.top + window.scrollY;
      const need = Math.ceil(r.height);
      if (need <= window.innerHeight) window.scrollTo(0, Math.max(0, docTop - 8));
      else window.scrollTo(0, Math.max(0, docTop - (window.innerHeight - r.height) / 2));
      return { docTop, h: r.height, w: r.width };
    })()`,
    returnByValue: true,
  })
  await sleep(1000)
  const vp = await send(ws, 'Runtime.evaluate', {
    expression: `(() => {
      const el = document.querySelector(${JSON.stringify(sel)});
      const r = el.getBoundingClientRect();
      return { x: Math.round(r.left), y: Math.round(r.top),
               width: Math.round(r.width), height: Math.round(r.height) };
    })()`,
    returnByValue: true,
  })
  const shot = await send(ws, 'Page.captureScreenshot', {
    format: 'png', clip: { ...vp.result.value, scale: 1 },
  })
  return { b64: shot.data, vp: vp.result.value, docTop: rect.result.value.docTop }
}

const A = await shoot(urlA)
const B = await shoot(urlB)
console.log(`ref  docTop=${A.docTop} vpClip=${JSON.stringify(A.vp)}`)
console.log(`mine docTop=${B.docTop} vpClip=${JSON.stringify(B.vp)}`)

const EXPR = `(() => new Promise((resolve) => {
  const load = (src) => new Promise((res, rej) => { const i = new Image(); i.onload=()=>res(i); i.onerror=rej; i.src=src; });
  load(${JSON.stringify('data:image/png;base64,' + A.b64)})
    .then((A) => load(${JSON.stringify('data:image/png;base64,' + B.b64)}).then((B) => {
      const W = Math.max(A.width, B.width);
      const HA = A.height, HB = B.height;
      const BAR = 34, GAP = 4;
      const c = document.createElement('canvas');
      c.width = W; c.height = BAR + HA + GAP + BAR + HB + 8;
      const g = c.getContext('2d');
      g.fillStyle = '#7a7a7a'; g.fillRect(0, 0, c.width, c.height);
      g.fillStyle = '#fff'; g.font = 'bold 15px monospace';
      g.fillText('REFERENCE ' + A.width + 'x' + A.height, 8, 22);
      g.drawImage(A, 0, BAR);
      const y2 = BAR + HA + GAP + BAR;
      g.fillStyle = '#fff';
      g.fillText('CLONE ' + B.width + 'x' + B.height, 8, y2 - 10);
      g.drawImage(B, 0, y2);
      resolve(c.toDataURL('image/png'));
    }))
    .catch((e) => resolve('ERR:' + e));
}))()`

const r = await send(ws, 'Runtime.evaluate', { expression: EXPR, awaitPromise: true, returnByValue: true })
if (r.exceptionDetails) { console.log('EXCEPTION ' + r.exceptionDetails.text); process.exit(1) }
const val = r.result.value
if (val.startsWith('ERR:')) { console.log(val); process.exit(1) }
writeFileSync(out, Buffer.from(val.split(',')[1], 'base64'))
console.log(`\nwrote ${out}`)
ws.close()
process.exit(0)