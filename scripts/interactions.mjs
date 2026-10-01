/**
 * Interaction smoke test. Drives the page the way a visitor would and
 * reports whether each behaviour actually fired.
 *
 * Notes on the harness:
 *  - React batches state updates, so every assertion runs in a separate
 *    `Runtime.evaluate` after a tick rather than in the same synchronous
 *    block as the interaction that triggered it.
 *  - Scrolling goes through the Lenis instance on `window` (exposed in dev)
 *    because Lenis owns the scroll position and reverts raw `window.scrollTo`
 *    calls. Production builds do not expose it, so `gotoY` falls back to
 *    native scrolling and the suite still works against `vite preview`.
 *
 * Usage: node scripts/interactions.mjs [url] [width] [height]
 */
const [, , url = 'http://localhost:5180/', W = '1440', H = '900'] = process.argv

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
    setTimeout(() => reject(new Error(`timeout ${method}`)), 30000)
  })
}

const problems = []
async function connect(width, height) {
  const list = await (await fetch('http://127.0.0.1:9222/json/list')).json()
  const ws = new WebSocket(list.find((t) => t.type === 'page').webSocketDebuggerUrl)
  await new Promise((r) => ws.addEventListener('open', r, { once: true }))

  ws.addEventListener('message', (ev) => {
    const m = JSON.parse(ev.data)
    if (m.method === 'Runtime.exceptionThrown') {
      problems.push(
        `EXCEPTION: ${m.params.exceptionDetails.exception?.description ?? m.params.exceptionDetails.text}`,
      )
    }
    if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') {
      problems.push(`CONSOLE: ${m.params.args.map((a) => a.value ?? a.description).join(' ')}`)
    }
  })

  await send(ws, 'Runtime.enable')
  await send(ws, 'Page.enable')
  await send(ws, 'Emulation.setDeviceMetricsOverride', {
    width, height, deviceScaleFactor: 1, mobile: width < 768,
  })
  await send(ws, 'Page.navigate', { url })
  return ws
}

const mkEval = (ws) => async (expression) => {
  const r = await send(ws, 'Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.text)
  return r.result.value
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

/* Scroll helper. `expr` is an in-page expression that resolves to the target
   Y. Prefers the Lenis instance because Lenis owns the scroll position, but
   falls back to native scrolling when it is not exposed (any production
   build) so the suite is not dev-server-only. */
const gotoY = (ws) => async (expr) => {
  const r = await send(ws, 'Runtime.evaluate', {
    expression: `(() => {
      const y = (${expr});
      if (window.lenis && typeof window.lenis.scrollTo === 'function') {
        window.lenis.scrollTo(y, { immediate: true });
      } else {
        window.scrollTo(0, y);
      }
      return window.scrollY;
    })()`,
    returnByValue: true,
  })
  return r.result.value
}

const results = []
const check = (name, pass, detail = '') => {
  results.push({ name, pass: !!pass, detail })
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? `  (${detail})` : ''}`)
}

/* ================================================================
   Desktop
   ================================================================ */
let ws = await connect(Number(W), Number(H))
let run = mkEval(ws)
await sleep(6000)

const width = await run(`document.documentElement.clientWidth`)
console.log(`\n=== desktop @ ${width}px ===`)

check('Lenis smooth scroll active', await run(`document.documentElement.classList.contains('lenis')`))
check(
  'No horizontal overflow',
  !(await run(`document.documentElement.scrollWidth > document.documentElement.clientWidth + 1`)),
  `scrollWidth ${await run(`document.documentElement.scrollWidth`)} vs ${width}`,
)

/* --- about slider --- */
// NB: offsetTop resolves against the nearest positioned ancestor, and
// `.section` is position:relative, so use absolute document coordinates.
const absTop = `(sel) => Math.round(document.querySelector(sel).getBoundingClientRect().top + window.scrollY)`

const go = gotoY(ws)

await go(`(() => {
  const t = document.querySelector('.sticky-wrap-outer');
  const top = t.getBoundingClientRect().top + window.scrollY;
  return top + (t.offsetHeight - innerHeight) * 0.62;
})()`)
await sleep(1200)
const slide = await run(`(() => ({
  active: [...document.querySelectorAll('.about-slide')].findIndex(s => s.hasAttribute('data-active')),
  dot: [...document.querySelectorAll('.about-slider_dot')].findIndex(d => d.hasAttribute('data-active')),
  chars: document.querySelectorAll('.about-slide[data-active] .anim-char[data-on]').length,
}))()`)
check('About slider advances with scroll', slide.active > 0, `slide ${slide.active} of 5`)
check('About slider dot rail syncs', slide.dot === slide.active, `dot ${slide.dot} vs slide ${slide.active}`)
check('Active headline characters revealed', slide.chars > 0, `${slide.chars} chars lit`)

/* --- infrastructure horizontal track --- */
await go(`(() => {
  const t = document.querySelector('.infra-wrap');
  return t.getBoundingClientRect().top + window.scrollY + innerHeight * 1.2;
})()`)
await sleep(1800)
const infra = await run(`(() => {
  const l = document.querySelector('.infra-cms_list');
  return { x: Math.round(new DOMMatrixReadOnly(getComputedStyle(l).transform).m41),
           scrollable: l.scrollWidth > innerWidth + 50,
           cards: l.querySelectorAll('.infra-card').length };
})()`)
check('Infrastructure track is scrollable', infra.scrollable, `scrollWidth ${await run(`document.querySelector('.infra-cms_list').scrollWidth`)}`)
check('Infrastructure track translates on scroll', infra.x < -40, `x = ${infra.x}px`)
check('All infrastructure cards present', infra.cards === 7, `${infra.cards} cards`)

/* the reference keeps .infra-card_desc collapsed until the card is used */
const infraDesc = await run(`(() => {
  const d = document.querySelector('.infra-card_desc');
  return Math.round(d.getBoundingClientRect().height);
})()`)
check('Infrastructure card description starts collapsed', infraDesc === 0, `h=${infraDesc}px`)
await run(`document.querySelector('.infra-card').click()`)
await sleep(300)
const infraOpen = await run(`(() => {
  const c = document.querySelector('.infra-card');
  return { h: Math.round(c.querySelector('.infra-card_desc').getBoundingClientRect().height),
           open: c.hasAttribute('data-open') };
})()`)
check('Infrastructure card click reveals description', infraOpen.open && infraOpen.h > 0, `h=${infraOpen.h}px`)
await run(`document.querySelector('.infra-card').click()`)
await sleep(300)

/* --- masterplan pins --- */
await go(`(() => {
  const t = document.querySelector('.genplan-wrap');
  return t.getBoundingClientRect().top + window.scrollY + innerHeight;
})()`)
await sleep(1200)
const pinBox = await run(`(() => { const r = document.querySelector('.pin.is-03').getBoundingClientRect();
  return { w: Math.round(r.width), h: Math.round(r.height) }; })()`)
check('Pins are laid out', pinBox.w > 0 && pinBox.h > 0, `${pinBox.w}x${pinBox.h}`)
await run(`document.querySelector('.pin.is-03').click()`)
await sleep(400)
const pin = await run(`(() => {
  const p = document.querySelector('.pin.is-03');
  return { card: p.querySelector('.pin-details').hasAttribute('data-show'),
           label: document.querySelector('.pin-visual.is-03').hasAttribute('data-show'),
           title: p.querySelector('.pin-details_title').textContent.trim() };
})()`)
check('Pin click reveals map label', pin.label)
check('Pin click reveals detail card', pin.card, pin.title)

/* --- custom select --- */
await run(`document.querySelectorAll('.select-label')[0].click()`)
await sleep(400)
const selOpen = await run(`(() => {
  const d = document.querySelector('.select-dropdown');
  return { hidden: d.hasAttribute('hidden'), items: d.querySelectorAll('.select-dropdown-item').length };
})()`)
check('Custom select opens', !selOpen.hidden, `${selOpen.items} options`)
await run(`document.querySelector('.select-dropdown:not([hidden]) .select-dropdown-item').click()`)
await sleep(400)
const selVal = await run(`(() => {
  const w = document.querySelector('.select-wrap');
  return { value: w.querySelector('input[type=hidden]').value,
           closed: w.querySelector('.select-dropdown').hasAttribute('hidden') };
})()`)
check('Custom select commits and closes', !!selVal.value && selVal.closed, `value = "${selVal.value}"`)

/* --- form --- */
// Required inputs are marked `required`, so the browser's own validation
// must block submission and never reach the handler.
await run(`document.querySelector('#register-interest-submit').click()`)
await sleep(500)
const emptySubmit = await run(`(() => {
  const f = document.querySelector('#cta form');
  return { success: !!document.querySelector('.form_success'),
           invalid: [...f.querySelectorAll(':invalid')].map(el => el.name) };
})()`)
check(
  'Native validation blocks an empty submit',
  !emptySubmit.success && emptySubmit.invalid.length > 0,
  `invalid: ${emptySubmit.invalid.join(', ')}`,
)

await run(`(() => {
  const f = document.querySelector('#cta form');
  for (const [n, v] of [['fullName','Test User'],['phone','0400000000'],['email','a@b.com']]) {
    const el = f.querySelector('[name="'+n+'"]');
    const setter = Object.getOwnPropertyDescriptor(el.constructor.prototype, 'value').set;
    setter.call(el, v);
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }
  f.querySelector('#register-interest-submit').click();
})()`)
await sleep(600)
check('Valid submit shows success', await run(`!!document.querySelector('.form_success')`))

/* --- video modal --- */
await go(`0`)
await sleep(800)
await run(`document.querySelector('.video-card .btn-ico-nest').click()`)
await sleep(500)
const modal = await run(`(() => {
  const pop = document.querySelector('.video-pop-up');
  return { open: !!pop, src: pop?.querySelector('iframe')?.getAttribute('src') ?? '',
           locked: document.body.classList.contains('no-scroll') };
})()`)
check('Video modal opens with an embed', modal.open && /youtube/.test(modal.src), modal.src)
check('Video modal locks body scroll', modal.locked)
await run(`document.querySelector('.video-pop-up_btn-close a').click()`)
await sleep(500)
check('Video modal closes', await run(`!document.querySelector('.video-pop-up')`))
check('Body scroll unlocks on close', await run(`!document.body.classList.contains('no-scroll')`))

/* --- back to top --- */
await go(`document.body.scrollHeight`)
await sleep(900)
const before = await run(`Math.round(window.scrollY)`)
await run(`document.querySelector('.footer-wrap_bottom-bar_btn a').click()`)
await sleep(2500)
const after = await run(`Math.round(window.scrollY)`)
// `#intro` sits just below the fixed header, so landing on the header's
// own height is correct.
const headerH = await run(`Math.round(document.querySelector('.header').getBoundingClientRect().height)`)
check('Back-to-top returns to the hero', after <= headerH + 4, `${before}px -> ${after}px (header ${headerH}px)`)

ws.close()

/* ================================================================
   Mobile
   ================================================================ */
ws = await connect(390, 844)
run = mkEval(ws)
await sleep(6000)
console.log(`\n=== mobile @ ${await run(`document.documentElement.clientWidth`)}px ===`)

const mob = await run(`(() => ({
  overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  burger: getComputedStyle(document.querySelector('.header_burger')).display,
  burgerW: Math.round(document.querySelector('.header_burger').getBoundingClientRect().width),
  burgerRight: Math.round(document.querySelector('.header_burger').getBoundingClientRect().right),
  location: getComputedStyle(document.querySelector('.header_right_location')).display,
  regBtn: getComputedStyle(document.querySelector('.header .btn')).display,
  regBtnW: Math.round(document.querySelector('.header .btn').getBoundingClientRect().width),
  regBtnRight: Math.round(document.querySelector('.header .btn').getBoundingClientRect().right),
  pinLayer: getComputedStyle(document.querySelector('.genplan-pins-wrap')).display,
  pinList: getComputedStyle(document.querySelector('.pins-wrap')).display,
  aboutSticky: getComputedStyle(document.querySelector('.section.clip.sticky')).position,
}))()`)
check('Mobile: no horizontal overflow', !mob.overflow)
check('Mobile: burger visible and on-screen', mob.burger !== 'none' && mob.burgerRight <= 390 && mob.burgerW >= 40, `w=${mob.burgerW} right=${mob.burgerRight}`)
check('Mobile: location line hidden, Register CTA kept', mob.location === 'none' && mob.regBtn !== 'none' && mob.regBtnRight <= 390 && mob.regBtnW >= 60, `w=${mob.regBtnW} right=${mob.regBtnRight}`)
check('Mobile: pin map layer swapped for list', mob.pinLayer === 'none' && mob.pinList !== 'none')
check('Mobile: about slider is not sticky', mob.aboutSticky === 'static')

await run(`document.querySelector('.header_burger').click()`)
await sleep(1000)
const menu = await run(`(() => {
  const m = document.querySelector('.menu');
  const cs = getComputedStyle(m);
  return { open: m.classList.contains('is-open'), opacity: cs.opacity, vis: cs.visibility,
           links: m.querySelectorAll('.menu_link').length, locked: document.body.classList.contains('no-scroll') };
})()`)
check('Mobile: menu opens', menu.open && menu.opacity === '1' && menu.vis === 'visible', `${menu.links} links`)
check('Mobile: menu locks scroll', menu.locked)
await run(`document.querySelector('.menu_link').click()`)
await sleep(900)
const closed = await run(`!document.querySelector('.menu').classList.contains('is-open')`)
check('Mobile: menu closes on nav', closed)

ws.close()

/* --- summary --- */
const failed = results.filter((r) => !r.pass).length
console.log(`\n${results.length - failed}/${results.length} passed`)
if (problems.length) console.log(`\nPAGE PROBLEMS:\n${problems.join('\n')}`)
else console.log('No console errors or exceptions.')
process.exit(failed ? 1 : 0)
