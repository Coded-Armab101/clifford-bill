/**
 * Extract the declaration blocks for a set of selectors from the cached
 * reference stylesheet, reporting which media query (if any) each block
 * came from so desktop/mobile rules stay distinguishable.
 *
 * Usage: node scripts/refcss.mjs <selector> [<selector> ...]
 */
import { readFileSync } from 'node:fs'

const CSS = 'C:\\Users\\ICT\\AppData\\Local\\Temp\\opencode\\gh.css'
const css = readFileSync(CSS, 'utf8')
const wanted = process.argv.slice(2)
if (!wanted.length) {
  console.log('usage: node scripts/refcss.mjs <selector> [...]')
  process.exit(1)
}

const prelude = (s) => s.slice(0, s.indexOf('{')).trim()
const declarations = (s) =>
  s
    .slice(s.indexOf('{') + 1, s.lastIndexOf('}'))
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split(';')
    .map((d) => d.trim())
    .filter(Boolean)

/* Walk the stylesheet once. `stack` tracks enclosing at-rules so each rule
   block knows its breakpoint context. */
const rules = []
const stack = []
let bufStart = 0

for (let i = 0; i < css.length; i++) {
  const c = css[i]
  if (c === '{') {
    const head = css.slice(bufStart, i).trim()
    const parent = stack.length ? stack[stack.length - 1] : null
    if (head.startsWith('@')) {
      stack.push({ kind: head, parent })
      bufStart = i + 1
    } else {
      /* a declaration block: find its matching close */
      let depth = 1
      let j = i + 1
      while (j < css.length && depth > 0) {
        if (css[j] === '{') depth++
        else if (css[j] === '}') depth--
        j++
      }
      rules.push({
        head,
        text: css.slice(i, j),
        mq: parent && parent.parent ? parent.kind : parent ? parent.kind : null,
      })
      bufStart = j
      i = j - 1
    }
  } else if (c === '}') {
    stack.pop()
    bufStart = i + 1
  }
}

for (const w of wanted) {
  const hits = rules.filter((r) =>
    r.head
      .split(',')
      .map((x) => x.trim())
      .some((x) => x === w),
  )
  console.log(
    `\n########## ${w}  (${hits.length} block${hits.length === 1 ? '' : 's'}) ##########`,
  )
  for (const h of hits) {
    console.log(`--- ${h.mq ?? '(base)'} :: ${h.head}`)
    console.log(declarations(h.text).join('\n'))
    console.log('')
  }
  if (!hits.length) {
    const loose = rules.filter((r) => r.head.includes(w))
    if (loose.length) {
      console.log('  (selector appears as part of a grouped rule:)' )
      for (const l of loose) {
        console.log(`  --- ${l.mq ?? '(base)'} :: ${l.head}`)
        console.log(
          declarations(l.text)
            .map((d) => '      ' + d)
            .join('\n'),
        )
      }
      console.log('')
    }
  }
}