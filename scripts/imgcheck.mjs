/**
 * Patient broken-image audit: scrolls the whole page so lazy images load, then
 * waits for every <img> to settle and reports the ones that never loaded.
 * A fixed wait produced false positives on the CDN.
 *
 * Usage: node scripts/imgcheck.mjs <url> [width] [height]
 */
const [, , url, W = '1440', H = '900'] = process.argv

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
await send(ws, 'Emulation.setDeviceMetricsOverride', {
  width: Number(W), height: Number(H), deviceScaleFactor: 1, mobile: Number(W) < 768,
})
await send(ws, 'Page.navigate', { url })
await sleep(6000)

const scrollY = (y) =>
  send(ws, 'Runtime.evaluate', {
    expression: `(() => { const y = ${y};
      if (window.lenis && typeof window.lenis.scrollTo === 'function') window.lenis.scrollTo(y, { immediate: true });
      else window.scrollTo(0, y);
      return window.scrollY; })()`,
    returnByValue: true,
  })

/* walk down the page in viewport-sized steps so lazy images get requested */
const docH = await send(ws, 'Runtime.evaluate', {
  expression: 'document.documentElement.scrollHeight', returnByValue: true,
})
const total = docH.result.value
const step = Math.floor(Number(H) * 0.8)
for (let y = 0; y <= total; y += step) {
  await scrollY(y)
  await sleep(700)
}
await scrollY(0)
await sleep(2000)

/* wait until the pending count stops decreasing */
let prev = -1
for (let i = 0; i < 25; i++) {
  const r = await send(ws, 'Runtime.evaluate', {
    expression: `[...document.images].filter(im => !im.complete || im.naturalWidth === 0).length`,
    returnByValue: true,
  })
  const n = r.result.value
  if (n === 0) break
  if (n === prev) {
    await sleep(3000)
    const r2 = await send(ws, 'Runtime.evaluate', {
      expression: `[...document.images].filter(im => !im.complete || im.naturalWidth === 0).length`,
      returnByValue: true,
    })
    if (r2.result.value === n) break
  }
  prev = n
  await sleep(2000)
}

const res = await send(ws, 'Runtime.evaluate', {
  expression: `(() => {
    const px = v => Math.round(parseFloat(v)*100)/100;
    const broken = [], ok = [];
    for (const im of document.images) {
      const b = im.getBoundingClientRect();
      const rec = {
        src: im.currentSrc || im.src, cls: im.className || '(none)',
        nat: im.naturalWidth + 'x' + im.naturalHeight,
        disp: getComputedStyle(im).display,
        box: [px(b.left + scrollX), px(b.top + scrollY), px(b.width), px(b.height)],
        loading: im.getAttribute('loading') || '(eager)',
      };
      (im.complete && im.naturalWidth > 0 ? ok : broken).push(rec);
    }
    return JSON.stringify({ total: document.images.length, broken, ok: ok.length });
  })()`,
  returnByValue: true,
})

const d = JSON.parse(res.result.value)
console.log(`\n${url} @ ${W}x${H}   images=${d.total}  loaded=${d.ok}  broken=${d.broken.length}\n`)
for (const b of d.broken) {
  console.log(`  BROKEN <img class="${b.cls}"> ${b.nat} display=${b.disp} loading=${b.loading} box=[${b.box.join(',')}]`)
  console.log(`         ${decodeURIComponent(b.src)}`)
  console.log(`         raw: ${b.src}`)
}
if (!d.broken.length) console.log('  no broken images')

ws.close()
process.exit(0)