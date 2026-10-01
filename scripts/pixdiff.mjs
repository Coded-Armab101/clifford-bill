/**
 * Pixel-level visual diff of a region between the reference and the clone.
 *
 * Numbers alone kept saying "identical" while the page still looked wrong,
 * so this compares actual rendered pixels: it screenshots the same region in
 * both builds, freezes the marquee so the two are at the same phase, samples
 * a coarse colour grid, and writes a stacked side-by-side PNG.
 *
 * The PNG is the point — this model cannot view images, but you can.
 *
 * Usage: node scripts/pixdiff.mjs <urlA> <urlB> [width] [height] [selector] [outPng]
 */
import { writeFileSync } from 'node:fs'

const [, , urlA, urlB, W = '1440', H = '900', sel = '.info-wrap', out = 'pixdiff.png'] =
  process.argv
const COLS = 24
const ROWS = 5

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

  /* wait for the region to exist, then for its images to finish decoding */
  for (let i = 0; i < 40; i++) {
    await sleep(1000)
    const r = await send(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const el = document.querySelector(${JSON.stringify(sel)});
        if (!el) return 'no-el';
        const imgs = [...el.querySelectorAll('img')];
        const pending = imgs.filter(i => !i.complete || i.naturalWidth === 0).length;
        return pending === 0 ? 'ready' : 'pending:' + pending;
      })()`,
      returnByValue: true,
    })
    if (r.result.value === 'ready') break
    if (i === 39) console.log(`  (${url}: ${r.result.value} after 40s)`)
  }

  /* freeze animation so both builds are sampled at the same phase */
  await send(ws, 'Runtime.evaluate', {
    expression: `(() => {
      for (const el of document.querySelectorAll('*')) {
        const cs = getComputedStyle(el);
        if (cs.animationName && cs.animationName !== 'none') {
          el.style.animationPlayState = 'paused';
          el.style.animationDelay = '0s';
        }
      }
      const el = document.querySelector(${JSON.stringify(sel)});
      const top = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo(0, Math.max(0, top - 8));
      return true;
    })()`,
    returnByValue: true,
  })
  await sleep(1800)

  const clip = await send(ws, 'Runtime.evaluate', {
    expression: `(() => {
      const r = document.querySelector(${JSON.stringify(sel)}).getBoundingClientRect();
      return { x: Math.round(r.left + window.scrollX) - 2, y: Math.round(r.top + window.scrollY) - 2,
               width: Math.round(r.width) + 4, height: Math.round(r.height) + 4 };
    })()`,
    returnByValue: true,
  })

  const shot = await send(ws, 'Page.captureScreenshot', {
    format: 'png',
    captureBeyondViewport: true,
    clip: { ...clip.result.value, scale: 1 },
  })
  return { b64: shot.data, box: clip.result.value }
}

const A = await shoot(urlA)
const B = await shoot(urlB)
console.log(`ref  clip ${JSON.stringify(A.box)}`)
console.log(`mine clip ${JSON.stringify(B.box)}`)

const EXPR = `(() => new Promise((resolve) => {
  const load = (src) => new Promise((res, rej) => {
    const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src;
  });
  load(${JSON.stringify('data:image/png;base64,' + A.b64)})
    .then((A) => load(${JSON.stringify('data:image/png;base64,' + B.b64)}).then((B) => {
      const COLS = ${COLS}, ROWS = ${ROWS};
      const grid = (img) => {
        const c = document.createElement('canvas');
        c.width = COLS; c.height = ROWS;
        const g = c.getContext('2d', { willReadFrequently: true });
        g.drawImage(img, 0, 0, COLS, ROWS);
        const d = g.getImageData(0, 0, COLS, ROWS).data;
        const out = [];
        for (let i = 0; i < COLS * ROWS; i++) out.push([d[i*4], d[i*4+1], d[i*4+2]]);
        return out;
      };
      const W = Math.max(A.width, B.width), H = Math.max(A.height, B.height);
      const c2 = document.createElement('canvas');
      c2.width = W; c2.height = H * 2 + 56;
      const g2 = c2.getContext('2d');
      g2.fillStyle = '#c0c0c0'; g2.fillRect(0, 0, c2.width, c2.height);
      g2.drawImage(A, 0, 28);
      g2.drawImage(B, 0, H + 56);
      g2.fillStyle = '#000';
      g2.font = '16px monospace';
      g2.fillText('REFERENCE top / CLONE bottom  (' + A.width + 'x' + A.height + ' vs ' + B.width + 'x' + B.height + ')', 6, 20);
      resolve(JSON.stringify({
        ga: grid(A), gb: grid(B),
        dims: [A.width, A.height, B.width, B.height],
        compare: c2.toDataURL('image/png'),
      }));
    }))
    .catch((e) => resolve(JSON.stringify({ error: String(e) })));
}))()`

const r = await send(ws, 'Runtime.evaluate', { expression: EXPR, awaitPromise: true, returnByValue: true })
if (r.exceptionDetails) {
  console.log('EXCEPTION ' + r.exceptionDetails.text)
  process.exit(1)
}
const d = JSON.parse(r.result.value)
if (d.error) {
  console.log('canvas error: ' + d.error)
  process.exit(1)
}

writeFileSync(out, Buffer.from(d.compare.split(',')[1], 'base64'))
console.log(`\nwrote ${out}  (ref ${d.dims[0]}x${d.dims[1]}  mine ${d.dims[2]}x${d.dims[3]})`)

const hex = (p) => p.map((v) => v.toString(16).padStart(2, '0')).join('')
console.log('\ncolour grid per cell, ref vs mine, plus mean abs channel delta:')
let worst = []
for (let row = 0; row < ROWS; row++) {
  for (let col = 0; col < COLS; col++) {
    const i = row * COLS + col
    const a = d.ga[i]
    const b = d.gb[i]
    const delta = (Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2])) / 3
    worst.push({ col, row, delta })
    process.stdout.write(`${hex(a)}/${hex(b)}${delta > 12 ? '!' : ' '}`)
  }
  console.log('')
}
worst.sort((x, y) => y.delta - x.delta)
console.log('\nlargest cell deltas (col,row -> mean channel diff):')
for (const w of worst.slice(0, 8)) console.log(`  col ${w.col} row ${w.row} -> ${w.delta.toFixed(1)}`)
const mean = worst.reduce((s, w) => s + w.delta, 0) / worst.length
console.log(`\nmean cell delta: ${mean.toFixed(2)}`)

ws.close()
process.exit(0)