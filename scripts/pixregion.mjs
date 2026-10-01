/**
 * Capture one region in two builds and report exactly where non-background
 * pixels are, row by row, plus the dominant colours. Shows the painted
 * content directly rather than inferring it from box geometry.
 *
 * Usage: node scripts/pixregion.mjs <urlA> <urlB> <selector> [width] [height] [outPng]
 */
const [, , urlA, urlB, sel, W = '1440', H = '900', out = ''] = process.argv

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
  await send(ws, 'Runtime.evaluate', {
    expression: `(() => { for (const el of document.querySelectorAll('*')) {
        const cs = getComputedStyle(el);
        if (cs.animationName && cs.animationName !== 'none') el.style.animationPlayState = 'paused'; }
      return true; })()`,
  })
  await sleep(1500)
  const clip = await send(ws, 'Runtime.evaluate', {
    expression: `(() => { const r = document.querySelector(${JSON.stringify(sel)}).getBoundingClientRect();
      return { x: Math.round(r.left + scrollX), y: Math.round(r.top + scrollY),
               width: Math.round(r.width), height: Math.round(r.height) }; })()`,
    returnByValue: true,
  })
  const shot = await send(ws, 'Page.captureScreenshot', {
    format: 'png', captureBeyondViewport: true, clip: { ...clip.result.value, scale: 1 },
  })
  return { b64: shot.data, box: clip.result.value }
}

const A = await shoot(urlA)
const B = await shoot(urlB)
console.log(`ref  ${JSON.stringify(A.box)}`)
console.log(`mine ${JSON.stringify(B.box)}\n`)

const EXPR = `(() => new Promise((resolve) => {
  const load = (src) => new Promise((res, rej) => { const i = new Image(); i.onload=()=>res(i); i.onerror=rej; i.src=src; });
  const analyse = (img) => {
    const c = document.createElement('canvas');
    c.width = img.width; c.height = img.height;
    const g = c.getContext('2d', { willReadFrequently: true });
    g.drawImage(img, 0, 0);
    const d = g.getImageData(0, 0, img.width, img.height).data;
    const W = img.width, H = img.height;
    const at = (x, y) => { const i = (y * W + x) * 4; return [d[i], d[i+1], d[i+2]]; };
    const counts = new Map();
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const p = at(x, y), k = p.join(',');
      counts.set(k, (counts.get(k) || 0) + 1);
    }
    const bg = [...counts.entries()].sort((a,b) => b[1]-a[1])[0][0].split(',').map(Number);
    const diff = (p) => Math.max(Math.abs(p[0]-bg[0]), Math.abs(p[1]-bg[1]), Math.abs(p[2]-bg[2]));
    const rows = [];
    for (let y = 0; y < H; y++) {
      let n = 0, first = -1, last = -1;
      for (let x = 0; x < W; x++) if (diff(at(x, y)) > 14) { n++; if (first < 0) first = x; last = x; }
      rows.push([y, n, first, last]);
    }
    const cols = [];
    for (let x = 0; x < W; x += 1) {
      let n = 0, first = -1, last = -1;
      for (let y = 0; y < H; y++) if (diff(at(x, y)) > 14) { n++; if (first < 0) first = y; last = y; }
      if (n > 0) cols.push([x, n, first, last]);
    }
    return { dims: [W, H], bg, top: [...counts.entries()].sort((a,b)=>b[1]-a[1]).slice(0,10)
             .map(([k,v]) => [k, v, Math.round(1000*v/(W*H))/10 + '%']), rows, cols };
  };
  load(${JSON.stringify('data:image/png;base64,' + A.b64)}).then(a =>
    load(${JSON.stringify('data:image/png;base64,' + B.b64)}).then(b => {
      try { resolve(JSON.stringify({ a: analyse(a), b: analyse(b) })) }
      catch (e) { resolve(JSON.stringify({ err: (e && e.stack) || String(e) })) }
    })).catch((e) => resolve(JSON.stringify({ err: (e && e.stack) || String(e) })));
}))()`

const r = await send(ws, 'Runtime.evaluate', { expression: EXPR, awaitPromise: true, returnByValue: true })
if (r.exceptionDetails) {
  console.log('EXCEPTION ' + r.exceptionDetails.text)
  console.log(JSON.stringify(r.exceptionDetails.exception?.description || r.exceptionDetails, null, 2).slice(0, 2000))
  process.exit(1)
}
const d = JSON.parse(r.result.value)
if (d.err) { console.log('canvas error: ' + d.err); process.exit(1) }

for (const [tag, res, box] of [['REF', d.a, A.box], ['MINE', d.b, B.box]]) {
  console.log(`########## ${tag}  ${res.dims[0]}x${res.dims[1]}  bg=rgb(${res.bg})  origin=(${box.x},${box.y})`)
  console.log('  dominant colours: ' + res.top.map(([k, v, p]) => `${k} ${p}`).join('  '))
  const active = res.rows.filter((r2) => r2[1] > 0)
  console.log(`  rows with ink: ${active.length}/${res.dims[1]}`)
  const fmt = (r2) => `    y=${String(r2[0]).padStart(3)} (page ${box.y + r2[0]})  ink=${String(r2[1]).padStart(4)}  x=[${r2[2]},${r2[3]}] page=[${box.x + r2[2]},${box.x + r2[3]}]`
  console.log('  --- rows ---')
  for (const r2 of active) console.log(fmt(r2))
  console.log('  --- column runs (x ranges that carry ink) ---')
  let run = null
  const flush = () => { if (run) console.log(`    x=[${run[0]},${run[1]}] page=[${box.x + run[0]},${box.x + run[1]}] maxInk=${run[2]}`); run = null }
  for (const c of res.cols) {
    if (run && c[0] === run[1] + 1) { run[1] = c[0]; run[2] = Math.max(run[2], c[1]) }
    else { flush(); run = [c[0], c[0], c[1]] }
  }
  flush()
  console.log('')
}
ws.close()
process.exit(0)