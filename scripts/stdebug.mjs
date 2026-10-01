/**
 * Debug: report every ScrollTrigger instance's start/end/progress at a given
 * scroll offset, plus how the scroll position was reached.
 *
 * Usage: node scripts/stdebug.mjs <url> <trackSelector> <W> <H>
 */
const [, , url, trackSel, W = '1440', H = '900'] = process.argv

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
await send(ws, 'Page.navigate', { url })
await sleep(9000)

const probe = `(() => {
  const track = document.querySelector(${JSON.stringify(trackSel)});
  const r = track ? track.getBoundingClientRect() : null;
  const ST = window.ScrollTrigger || (window.gsap && window.gsap.core && window.ScrollTrigger);
  return JSON.stringify({
    hasWindowST: !!window.ScrollTrigger,
    hasLenisGlobal: !!window.lenis,
    scrollY: Math.round(scrollY),
    docHeight: document.documentElement.scrollHeight,
    track: r ? { top: Math.round(r.top + scrollY), h: track.offsetHeight, pos: getComputedStyle(track).position } : null,
    inner1: (() => { const e = document.querySelector('.sticky-wrap-inner-1'); if (!e) return null;
      const c = getComputedStyle(e); const b = e.getBoundingClientRect();
      return { pos: c.position, top: c.top, h: e.offsetHeight, rectTop: Math.round(b.top), rectBottom: Math.round(b.bottom) }; })(),
    stickySection: (() => { const e = document.querySelector('.section.clip.sticky'); if (!e) return null;
      const c = getComputedStyle(e); const b = e.getBoundingClientRect();
      return { pos: c.position, h: e.offsetHeight, rectTop: Math.round(b.top), rectBottom: Math.round(b.bottom) }; })(),
    triggers: ST ? ST.getAll().map((t) => ({
      start: Math.round(t.start), end: Math.round(t.end),
      progress: Math.round(t.progress * 1000) / 1000,
      triggerCls: t.trigger && typeof t.trigger.className === 'string' ? t.trigger.className : '?',
      triggerTop: t.trigger ? Math.round(t.trigger.getBoundingClientRect().top + scrollY) : null,
      triggerH: t.trigger ? t.trigger.offsetHeight : null,
    })) : 'no ScrollTrigger global',
  });
})()`

console.log(`===== ${url} =====`)
for (const label of ['load', 'f=0.0', 'f=0.25', 'f=0.5', 'f=0.75', 'f=1.0']) {
  if (label !== 'load') {
    const f = Number(label.split('=')[1])
    await send(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const t = document.querySelector(${JSON.stringify(trackSel)});
        const top = t.getBoundingClientRect().top + scrollY;
        const y = Math.round(top + (t.offsetHeight - innerHeight) * ${f});
        if (window.lenis && window.lenis.scrollTo) window.lenis.scrollTo(y, { immediate: true });
        else window.scrollTo(0, y);
      })()`,
    })
    await sleep(1600)
  }
  const res = await send(ws, 'Runtime.evaluate', { expression: probe, returnByValue: true })
  if (res.exceptionDetails) { console.log(label + ': EXCEPTION ' + res.exceptionDetails.text); continue }
  const d = JSON.parse(res.result.value)
  console.log(`\n--- ${label} --- scrollY=${d.scrollY} lenisGlobal=${d.hasLenisGlobal} windowST=${d.hasWindowST}`)
  console.log(`    track=${JSON.stringify(d.track)}`)
  console.log(`    inner1=${JSON.stringify(d.inner1)}`)
  console.log(`    stickySec=${JSON.stringify(d.stickySection)}`)
  for (const t of d.triggers) console.log(`    ST start=${t.start} end=${t.end} prog=${t.progress} trig=[${t.triggerCls}] top=${t.triggerTop} h=${t.triggerH}`)
}
ws.close()
process.exit(0)