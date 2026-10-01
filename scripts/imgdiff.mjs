/**
 * Diff every image URL a build actually requests against the reference's set.
 * Catches wrong paths, missing percent-encoding, and wrong file extensions —
 * the failures that make a page "not look like it at all".
 *
 * Usage: node scripts/imgdiff.mjs <urlA> <urlB> [width] [height]
 */
const [, , urlA, urlB, W = '1440', H = '900'] = process.argv

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

const EXPR = `(() => {
  const urls = new Set();
  for (const im of document.images) if (im.currentSrc || im.src) urls.add(im.currentSrc || im.src);
  // background images and masks too, not just <img>
  for (const el of document.querySelectorAll('*')) {
    const cs = getComputedStyle(el);
    for (const prop of ['backgroundImage', 'maskImage', 'webkitMaskImage', 'borderImageSource']) {
      const v = cs[prop];
      if (v && v !== 'none') for (const m of v.matchAll(/url\\(["']?(.*?)["']?\\)/g)) urls.add(m[1]);
    }
  }
  const imgs = [...document.images].map(im => ({
    src: im.currentSrc || im.src, ok: im.complete && im.naturalWidth > 0,
    nat: im.naturalWidth + 'x' + im.naturalHeight, cls: im.className || '(none)',
  }));
  return JSON.stringify({
    urls: [...urls].sort(),
    imgs,
  });
})()`

const list = await (await fetch('http://127.0.0.1:9222/json/list')).json()
const ws = new WebSocket(list.find((x) => x.type === 'page').webSocketDebuggerUrl)
await new Promise((r) => ws.addEventListener('open', r, { once: true }))
await send(ws, 'Page.enable')
await send(ws, 'Runtime.enable')
await send(ws, 'Emulation.setDeviceMetricsOverride', {
  width: Number(W), height: Number(H), deviceScaleFactor: 1, mobile: false,
})

const collect = async (url) => {
  await send(ws, 'Page.navigate', { url })
  await sleep(9000)
  const r = await send(ws, 'Runtime.evaluate', { expression: EXPR, returnByValue: true })
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.text)
  return JSON.parse(r.result.value)
}

const ref = await collect(urlA)
const mine = await collect(urlB)

const tail = (u) => u.split('/').pop()
const refTails = new Set(ref.urls.map(tail))

console.log(`REF  urls ${ref.urls.length}  imgs ${ref.imgs.length}  broken ${ref.imgs.filter((i) => !i.ok).length}`)
console.log(`MINE urls ${mine.urls.length}  imgs ${mine.imgs.length}  broken ${mine.imgs.filter((i) => !i.ok).length}\n`)

console.log('=== BROKEN IN MINE ===')
for (const b of mine.imgs.filter((i) => !i.ok)) {
  const known = refTails.has(tail(b.src))
  console.log(`  ${known ? 'known-in-ref-but-fails' : 'NOT-IN-REF'}  cls=${b.cls}`)
  console.log(`     ${b.src}`)
}
console.log('')

console.log('=== MINE URLs THE REFERENCE NEVER USES ===')
for (const u of mine.urls.filter((u) => !refTails.has(tail(u)))) {
  console.log(`  ${decodeURIComponent(u).includes(' ') || u.includes(' ') ? 'UNENCODED-SPACE' : '               '}  ${u}`)
}
console.log('')

console.log('=== REFERENCE URLs MISSING FROM MINE ===')
const mineTails = new Set(mine.urls.map(tail))
for (const u of ref.urls.filter((u) => !mineTails.has(tail(u)))) console.log(`  ${u}`)

ws.close()
process.exit(0)