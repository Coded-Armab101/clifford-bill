/**
 * Sample a region at several scroll positions in each build: which slide is
 * visible, what colour its characters are, and the geometry of the panel.
 * Reveals behaviour that a single static snapshot cannot show.
 *
 * Usage: node scripts/scrollstates.mjs <urlA> <urlB> <selector> <childSel> <width> <height>
 */
const [, , urlA, urlB, sel, childSel, W = '1440', H = '900'] = process.argv

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

const EXPR = `(() => {
  const px = v => Math.round(parseFloat(v)*100)/100;
  const root = document.querySelector(${JSON.stringify(sel)});
  if (!root) return JSON.stringify({ error: 'no selector' });
  const rb = root.getBoundingClientRect();
  const cs = getComputedStyle(root);
  const kids = [...root.querySelectorAll(${JSON.stringify(childSel)})].map((el) => {
    const b = el.getBoundingClientRect();
    const c = getComputedStyle(el);
    const char = el.querySelector('.anim-char');
    const charCS = char ? getComputedStyle(char) : null;
    return {
      label: el.getAttribute('aria-label') || '',
      cls: (typeof el.className === 'string' ? el.className : '') || '',
      active: el.getAttribute('data-active') || '',
      ariaHidden: el.getAttribute('aria-hidden') || '',
      opacity: c.opacity, visibility: c.visibility, display: c.display,
      transform: c.transform, position: c.position,
      box: [px(b.left + scrollX), px(b.top + scrollY), px(b.width), px(b.height)],
      charColor: charCS ? charCS.color : '',
    };
  });
  return JSON.stringify({
    scrollY: Math.round(scrollY),
    root: { box: [px(rb.left + scrollX), px(rb.top + scrollY), px(rb.width), px(rb.height)],
            position: cs.position, top: cs.top, height: cs.height, overflow: cs.overflow },
    kids,
  });
})()`

for (const [tag, url] of [['REF', urlA], ['MINE', urlB]]) {
  await send(ws, 'Emulation.setDeviceMetricsOverride', {
    width: Number(W), height: Number(H), deviceScaleFactor: 1, mobile: false,
  })
  await send(ws, 'Page.navigate', { url })
  await sleep(8000)

  const track = await send(ws, 'Runtime.evaluate', {
    expression: `(() => {
      const el = document.querySelector('.sticky-wrap-outer') || document.querySelector(${JSON.stringify(sel)});
      if (!el) return null;
      return { top: el.getBoundingClientRect().top + scrollY, h: el.offsetHeight };
    })()`,
    returnByValue: true,
  })
  const t = track.result.value
  if (!t) { console.log(`\n${tag}: no track found`); continue }
  console.log(`\n########## ${tag}  track top=${t.top} h=${t.h} (${(t.h / Number(H)).toFixed(2)} screens) ##########`)

  const stops = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]
  for (const f of stops) {
    const y = Math.round(t.top + (t.h - Number(H)) * f)
    await send(ws, 'Runtime.evaluate', {
      expression: `(() => { const y = ${y};
        if (window.lenis && typeof window.lenis.scrollTo === 'function') window.lenis.scrollTo(y, { immediate: true });
        else window.scrollTo(0, y); })()`,
    })
    await sleep(1400)
    const r = await send(ws, 'Runtime.evaluate', { expression: EXPR, returnByValue: true })
    if (r.exceptionDetails) { console.log('EXCEPTION ' + r.exceptionDetails.text); continue }
    const d = JSON.parse(r.result.value)
    if (d.error) { console.log(`  f=${f} ${d.error}`); continue }
    const live = d.kids.filter((k) => k.opacity !== '0' && k.visibility !== 'hidden' && k.display !== 'none')
    console.log(`  f=${f.toFixed(1)} scrollY=${d.scrollY} root=[${d.root.box.join(',')}] pos=${d.root.position} | visible slides: ${live.length}`)
    for (const k of d.kids) {
      const mark = k.opacity !== '0' && k.visibility !== 'hidden' && k.display !== 'none' ? '*' : ' '
      console.log(
        `   ${mark} ${(k.label || k.cls).slice(0, 18).padEnd(18)} op=${k.opacity} vis=${k.visibility} disp=${k.display}` +
          ` char=${k.charColor || '-'} active=${k.active || '-'} xform=${k.transform.slice(0, 30)}`,
      )
    }
  }
}
ws.close()
process.exit(0)