/**
 * Headless layout audit. Connects to Edge over the DevTools protocol,
 * emulates a viewport, and reports:
 *   - any element wider than the viewport (horizontal overflow)
 *   - console errors / page exceptions
 *   - a quick census of the sections that actually rendered
 *
 * Usage: node scripts/audit.mjs [url] [width] [height]
 */
const [, , url = 'http://localhost:5180/', w = '390', h = '844'] = process.argv

const base = 'http://127.0.0.1:9222'

async function targets() {
  const res = await fetch(`${base}/json/list`)
  return res.json()
}

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

const list = await targets()
const page = list.find((t) => t.type === 'page')
if (!page) throw new Error('no page target')

const ws = new WebSocket(page.webSocketDebuggerUrl)
await new Promise((r) => ws.addEventListener('open', r, { once: true }))

const problems = []
ws.addEventListener('message', (ev) => {
  const m = JSON.parse(ev.data)
  if (m.method === 'Runtime.exceptionThrown') {
    problems.push(`EXCEPTION: ${m.params.exceptionDetails.text} ${m.params.exceptionDetails.exception?.description ?? ''}`)
  }
  if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') {
    problems.push(`CONSOLE: ${m.params.args.map((a) => a.value ?? a.description).join(' ')}`)
  }
})

await send(ws, 'Runtime.enable')
await send(ws, 'Page.enable')
await send(ws, 'Emulation.setDeviceMetricsOverride', {
  width: Number(w),
  height: Number(h),
  deviceScaleFactor: 1,
  mobile: Number(w) < 768,
})
await send(ws, 'Page.navigate', { url })
await new Promise((r) => setTimeout(r, 6000))

const audit = await send(ws, 'Runtime.evaluate', {
  returnByValue: true,
  expression: `(() => {
    const vw = document.documentElement.clientWidth;
    const wide = [];
    for (const el of document.querySelectorAll('body *')) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      const cs = getComputedStyle(el);
      if (cs.position === 'fixed') continue;
      // ignore things intentionally parked off-canvas or full-bleed
      if (el.closest('.menu, .partners-ticker_list, .infra-cms, .infra-cms_list, .line-h')) continue;
      if (r.right > vw + 2 || r.left < -2) {
        wide.push({
          tag: el.tagName.toLowerCase(),
          cls: (el.className || '').toString().slice(0, 60),
          left: Math.round(r.left), right: Math.round(r.right), vw,
        });
      }
    }
    const sec = (s) => document.querySelectorAll(s).length;
    return {
      vw,
      docScrollWidth: document.documentElement.scrollWidth,
      horizontalOverflow: document.documentElement.scrollWidth > vw + 1,
      offenders: wide.slice(0, 14),
      counts: {
        sections: sec('section'),
        infraCards: sec('.infra-card'),
        benefitTabs: sec('.benefit-tab'),
        masterplanPins: sec('.pin'),
        aboutSlides: sec('.about-slide'),
        selects: sec('.select-label'),
        metrics: sec('.metrics-wrap_item'),
      },
      heading: document.querySelector('h1')?.textContent?.trim(),
      title: document.title,
    };
  })()`,
})

console.log(JSON.stringify(audit.result.value, null, 2))
console.log(problems.length ? `\nPROBLEMS:\n${problems.join('\n')}` : '\nNo console errors or exceptions.')
ws.close()
