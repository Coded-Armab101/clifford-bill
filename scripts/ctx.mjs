import fs from 'node:fs'
const f = process.argv[2]
const needle = process.argv[3] || 'sticky-wrap'
const h = fs.readFileSync(f, 'utf8')

const re = new RegExp('class="([^"]*' + needle + '[^"]*)"', 'g')
const seen = new Set()
for (const m of h.matchAll(re)) if (!seen.has(m[1])) { seen.add(m[1]); console.log('CLASS:', m[1]) }

const i = h.indexOf(needle)
if (i >= 0) {
  console.log('\n--- context around first "' + needle + '" ---')
  console.log(h.slice(Math.max(0, i - 400), i + 900))
}