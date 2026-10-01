/**
 * Compare the overall document structure of two builds: every section in
 * order with its box and opening copy, plus image load health.
 *
 * Usage: node scripts/struct.mjs <urlA> <urlB> [width] [height]
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
  const px = v => Math.round(parseFloat(v) * 100) / 100;
  const sections = [...document.querySelectorAll('section, body > div > section')].map((s, i) => {
    const r = s.getBoundingClientRect();
    const cs = getComputedStyle(s);
    return {
      i,
      cls: s.className || '(none)',
      y: px(r.top + window.scrollY),
      h: px(r.height),
      bg: cs.backgroundColor,
      pos: cs.position,
      text: (s.textContent || '').replace(/\\s+/g, ' ').trim().slice(0, 58),
    };
  });
  const imgs = [...document.images].map(im => ({
    src: im.currentSrc || im.src,
    ok: im.complete && im.naturalWidth > 0,
    nat: im.naturalWidth + 'x' + im.naturalHeight,
    cls: im.className,
  }));
  const broken = imgs.filter(i => !i.ok);
  return JSON.stringify({
    docHeight: document.documentElement.scrollHeight,
    bodyChildren: [...document.body.children].map(c => c.tagName + '.' + (c.className || '')),
    sectionCount: sections.length,
    sections,
    imgTotal: imgs.length,
    imgBroken: broken.length,
    brokenSample: broken.slice(0, 8),
  }, null, 1);
})()`

const list = await (await fetch('http://127.0.0.1:9222/json/list')).json()
const ws = new WebSocket(list.find((x) => x.type === 'page').webSocketDebuggerUrl)
await new Promise((r) => ws.addEventListener('open', r, { once: true }))
await send(ws, 'Page.enable')
await send(ws, 'Runtime.enable')
await send(ws, 'Emulation.setDeviceMetricsOverride', {
  width: Number(W), height: Number(H), deviceScaleFactor: 1, mobile: false,
})

const out = {}
for (const [tag, url] of [['REF', urlA], ['MINE', urlB]]) {
  await send(ws, 'Page.navigate', { url })
  await sleep(9000)
  const r = await send(ws, 'Runtime.evaluate', { expression: EXPR, returnByValue: true })
  if (r.exceptionDetails) {
    console.log(tag + ' EXCEPTION ' + r.exceptionDetails.text)
    continue
  }
  const d = JSON.parse(r.result.value)
  out[tag] = d
  console.log(`\n########## ${tag}  ${url} ##########`)
  console.log(`docHeight ${d.docHeight}   sections ${d.sectionCount}   images ${d.imgTotal} (broken ${d.imgBroken})`)
  if (d.brokenSample.length) {
    console.log('  BROKEN:')
    for (const b of d.brokenSample) console.log(`    ${b.cls || '(no class)'}  ${b.src.slice(0, 96)}`)
  }
  console.log('  body children: ' + d.bodyChildren.join(' | '))
  for (const s of d.sections) {
    console.log(
      `  [${String(s.i).padStart(2)}] y=${String(s.y).padStart(7)} h=${String(s.h).padStart(7)} ` +
        `bg=${s.bg.padEnd(20)} ${s.cls.slice(0, 34).padEnd(34)} "${s.text}"`,
    )
  }
}
ws.close()
process.exit(0)