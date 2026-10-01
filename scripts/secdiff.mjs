/**
 * Diff two section.mjs snapshots field by field.
 *
 * Usage: node scripts/secdiff.mjs <ref.json> <mine.json> [keys...]
 */
import { readFileSync } from 'node:fs'

const [, , refFile, mineFile, ...only] = process.argv
const ref = JSON.parse(readFileSync(refFile, 'utf8'))
const mine = JSON.parse(readFileSync(mineFile, 'utf8'))

const keys = only.length ? only : Object.keys(ref).filter((k) => !k.startsWith('__'))

console.log(`REF  ${ref.url} @ ${ref.viewport}`)
console.log(`MINE ${mine.url} @ ${mine.viewport}`)
console.log(`body font-size  ref ${ref.__bodyFontSize}  mine ${mine.__bodyFontSize}\n`)

for (const k of keys) {
  const a = ref[k]
  const b = mine[k]
  if (!a || !b) {
    console.log(`### ${k}\n  ref  ${a ? 'present' : 'ABSENT'}\n  mine ${b ? 'present' : 'ABSENT'}\n`)
    continue
  }
  const rows = []
  const flat = (o, p = '') =>
    Object.entries(o).flatMap(([kk, v]) =>
      v && typeof v === 'object' ? flat(v, p + kk + '.') : [[p + kk, v]],
    )
  const fa = Object.fromEntries(flat(a))
  const fb = Object.fromEntries(flat(b))
  for (const key of new Set([...Object.keys(fa), ...Object.keys(fb)])) {
    const va = fa[key]
    const vb = fb[key]
    if (va !== vb) rows.push(`    ${key.padEnd(18)} ref=${va}   mine=${vb}`)
  }
  if (!rows.length) {
    console.log(`### ${k}  identical`)
  } else {
    console.log(`### ${k}`)
    console.log(rows.join('\n'))
  }
  console.log('')
}