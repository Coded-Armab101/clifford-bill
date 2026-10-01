/**
 * Identify what occupies a given document point in each build. Used when a
 * pixel diff shows content in one build that is absent in the other.
 *
 * Each point is scrolled into view before probing, because elementFromPoint
 * only works inside the viewport.
 *
 * Usage: node scripts/point.mjs <urlA> <urlB> <x,y> [<x,y> ...] [width] [height]
 */
const [, , urlA, urlB, ...rest] = process.argv
const W = rest.length >= 2 && /^\d+$/.test(rest[rest.length - 2]) ? rest.pop() : '1440'
const H = rest.length >= 1 && /^\d+$/.test(rest[rest.length - 1]) ? rest.pop() : '900'
const points = rest.map((p) => p.split(',').map(Number))

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
  width: Number(W), height: Number(H), deviceScaleFactor: 1, mobile: false,
})

const probe = (dx, dy) =>
  send(ws, 'Runtime.evaluate', {
    expression: `(() => {
      const px = v => Math.round(parseFloat(v)*100)/100;
      const stack = [];
      const el = document.elementFromPoint(${dx} - window.scrollX, ${dy} - window.scrollY);
      let cur = el;
      while (cur && stack.length < 8) {
        const b = cur.getBoundingClientRect();
        const cs = getComputedStyle(cur);
        stack.push({
          tag: cur.tagName, cls: cur.className || '(none)',
          box: [px(b.left + window.scrollX), px(b.top + window.scrollY), px(b.width), px(b.height)],
          color: cs.color, bg: cs.backgroundColor, mix: cs.mixBlendMode, op: cs.opacity,
          fs: cs.fontSize,
          txt: (cur.childElementCount === 0 ? (cur.textContent||'').trim().slice(0,40) : ''),
        });
        cur = cur.parentElement;
      }
      return JSON.stringify({ scrollY: window.scrollY, stack });
    })()`,
    returnByValue: true,
  })

for (const [tag, url] of [['REF', urlA], ['MINE', urlB]]) {
  await send(ws, 'Page.navigate', { url })
  await sleep(9000)
  console.log(`\n########## ${tag}  ${url} ##########`)
  for (const [dx, dy] of points) {
    await send(ws, 'Runtime.evaluate', {
      expression: `window.scrollTo(0, ${Math.max(0, dy - Math.floor(Number(H) / 2))})`,
    })
    await sleep(400)
    const r = await probe(dx, dy)
    if (r.exceptionDetails) {
      console.log(`\n  point (${dx},${dy}) EXCEPTION ${r.exceptionDetails.text}`)
      continue
    }
    const d = JSON.parse(r.result.value)
    console.log(`\n  point (${dx},${dy}) scrollY=${d.scrollY} ->`)
    if (!d.stack.length) console.log('    (nothing)')
    for (const s of d.stack) {
      console.log(
        `    <${s.tag} class="${s.cls}"> box=[${s.box.join(',')}] fs=${s.fs} color=${s.color} bg=${s.bg} mix=${s.mix} op=${s.op}` +
          (s.txt ? `  text="${s.txt}"` : ''),
      )
    }
  }
}
ws.close()
process.exit(0)