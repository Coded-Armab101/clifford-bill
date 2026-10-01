/**
 * Section geometry probe. Reads computed box + paint properties for a set of
 * selectors so the clone can be diffed against the reference build.
 *
 * Usage: node scripts/section.mjs <url> <width> <height> <outfile.json>
 */
import { writeFileSync } from 'node:fs'

const [, , url, W, H, outFile] = process.argv

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

const SELS = {
  section: '.info-wrap',
  container: '.info-wrap ~ * , .container',
  grid: '.info-wrap .grid',
  loc: '.intro-wrap_loc',
  locP: '.intro-wrap_loc .p1:last-child',
  partners: '.intro-wrap_partners',
  ticker: '.partners-ticker',
  tickerList: '.partners-ticker_list',
  cms: '.partners-cms',
  cmsList: '.partners-cms_list',
  cmsItem: '.partners-cms_list_item',
  card: '.partners-card',
  logo: '.partners-logo',
  dev: '.intro-wrap_dev',
  line: '.intro-wrap_line',
  p1: '.info-wrap .p1',
  maskFade: '.mask-fade',
  masked: '.masked',
}

const EXPR = `(() => {
  const sels = ${JSON.stringify(SELS)};
  const out = {};
  for (const [k, sel] of Object.entries(sels)) {
    const el = document.querySelector(sel);
    if (!el) { out[k] = null; continue }
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    const px = (v) => Math.round(parseFloat(v) * 100) / 100;
    out[k] = {
      rect: { x: px(r.x), y: px(r.y), w: px(r.width), h: px(r.height) },
      fontSize: cs.fontSize,
      padding: cs.padding,
      margin: cs.margin,
      display: cs.display,
      position: cs.position,
      alignSelf: cs.alignSelf,
      gridColumn: cs.gridColumn,
      textAlign: cs.textAlign,
      mixBlendMode: cs.mixBlendMode,
      objectFit: cs.objectFit,
      opacity: cs.opacity,
      gap: cs.gap,
      animation: cs.animationName + ' ' + cs.animationDuration + ' ' + cs.animationDirection,
      maskImage: cs.maskImage ? cs.maskImage.slice(0, 90) : cs.webkitMaskImage,
      maskSize: cs.maskSize || cs.webkitMaskSize,
      background: cs.backgroundColor,
      childCount: el.children.length,
      parentClass: el.parentElement ? el.parentElement.className : null,
    };
  }
  out.__bodyFontSize = getComputedStyle(document.body).fontSize;
  return out;
})()`

const list = await (await fetch('http://127.0.0.1:9222/json/list')).json()
const ws = new WebSocket(list.find((x) => x.type === 'page').webSocketDebuggerUrl)
await new Promise((r) => ws.addEventListener('open', r, { once: true }))
await send(ws, 'Page.enable')
await send(ws, 'Runtime.enable')
await send(ws, 'Emulation.setDeviceMetricsOverride', {
  width: Number(W), height: Number(H), deviceScaleFactor: 1, mobile: Number(W) < 768,
})
await send(ws, 'Page.navigate', { url })
await sleep(7000)

const r = await send(ws, 'Runtime.evaluate', { expression: EXPR, returnByValue: true })
if (r.exceptionDetails) {
  console.log('EXCEPTION: ' + r.exceptionDetails.text)
  process.exit(1)
}
writeFileSync(outFile, JSON.stringify({ url, viewport: `${W}x${H}`, ...r.result.value }, null, 2), 'utf8')
console.log('wrote ' + outFile)
ws.close()
process.exit(0)