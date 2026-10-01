/**
 * Dump computed styles for a set of selectors in the reference build so the
 * clone can match stacking, dimming, and control geometry exactly.
 *
 * Usage: node scripts/aboutdump.mjs <url> <W> <H> <scrollFraction>
 */
import fs from 'node:fs'

const [, , url, W = '1440', H = '900', frac = '0.5'] = process.argv

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
const px = (n) => Math.round(n * 100) / 100

const list = await (await fetch('http://127.0.0.1:9222/json/list')).json()
const ws = new WebSocket(list.find((x) => x.type === 'page').webSocketDebuggerUrl)
await new Promise((r) => ws.addEventListener('open', r, { once: true }))
await send(ws, 'Page.enable')
await send(ws, 'Runtime.enable')
await send(ws, 'Emulation.setDeviceMetricsOverride', {
  width: Number(W), height: Number(H), deviceScaleFactor: 1, mobile: false,
})
await send(ws, 'Page.navigate', { url })
await sleep(9000)

await send(ws, 'Runtime.evaluate', {
  expression: `(() => {
    const t = document.querySelector('.sticky-wrap-outer') || document.querySelector('.sections');
    const top = t.getBoundingClientRect().top + scrollY;
    const y = Math.round(top + (t.offsetHeight - innerHeight) * ${frac});
    if (window.lenis && window.lenis.scrollTo) window.lenis.scrollTo(y, { immediate: true });
    else window.scrollTo(0, y);
  })()`,
})
await sleep(1600)

const EXPR = `(() => {
  const px = v => Math.round(parseFloat(v)*100)/100;
  const sels = [
    '.about-slider', '.about-slider_mask', '.about-slider_mask_slide',
    '.about-slide', '.about-slide.text-center', '.about-slide_headline',
    '.about-slide_desc', '.about-slide_desc .p1', '.about-slide_headline .p1',
    '.about-slide_headline .h2', '.about-slider_nav', '.about-slider_dot',
    '.about-slider_arrow-l', '.about-slider_arrow-r', '.w-slider-arrow-left', '.w-slider-arrow-right'
  ];
  const out = {};
  for (const s of sels) {
    const el = document.querySelector(s);
    if (!el) { out[s] = 'MISSING'; continue; }
    const c = getComputedStyle(el);
    const b = el.getBoundingClientRect();
    out[s] = {
      box: [px(b.left+scrollX), px(b.top+scrollY), px(b.width), px(b.height)],
      display: c.display, position: c.position, opacity: c.opacity,
      visibility: c.visibility, color: c.color, bg: c.backgroundColor,
      flex: c.flex, flexGrow: c.flexGrow, height: c.height, minHeight: c.minHeight,
      whiteSpace: c.whiteSpace, overflow: c.overflow, transform: c.transform,
      transition: c.transitionProperty + ' ' + c.transitionDuration,
      zIndex: c.zIndex, inset: c.top + '/' + c.right + '/' + c.bottom + '/' + c.left,
      justify: c.justifyContent, alignItems: c.alignItems, gridArea: c.gridArea,
      marginTop: c.marginTop, padding: c.padding,
    };
  }
  const slides = [...document.querySelectorAll('.about-slide')].map((el, i) => {
    const c = getComputedStyle(el);
    const ch = el.querySelector('.anim-char');
    const desc = el.querySelector('.p1');
    return { i, op: c.opacity, vis: c.visibility, pos: c.position,
      charColor: ch ? getComputedStyle(ch).color : null,
      descColor: desc ? getComputedStyle(desc).color : null,
      descOpacity: desc ? getComputedStyle(desc).opacity : null };
  });
  const dots = [...document.querySelectorAll('.about-slider_dot, .w-slider-dot')].map((el) => {
    const c = getComputedStyle(el); const b = el.getBoundingClientRect();
    return { cls: typeof el.className === 'string' ? el.className : '', w: px(b.width), h: px(b.height), flexGrow: c.flexGrow, bg: c.backgroundColor, op: c.opacity };
  });
  const nav = document.querySelector('.about-slider_nav, .w-slider-nav');
  return JSON.stringify({ out, slides, dots, navHTML: nav ? nav.outerHTML.slice(0, 900) : null }, null, 1);
})()`

const r = await send(ws, 'Runtime.evaluate', { expression: EXPR, returnByValue: true })
if (r.exceptionDetails) console.log('EXCEPTION', r.exceptionDetails.text)
else if (process.env.OUT) fs.writeFileSync(process.env.OUT, r.result.value)
else console.log(r.result.value)
ws.close()
process.exit(0)