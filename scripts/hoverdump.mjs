/**
 * Print the hover snapshots from hover.mjs in a readable form.
 *
 * Usage: node scripts/hoverdump.mjs <file.json> [label]
 */
import { readFileSync } from 'node:fs'

const file = process.argv[2]
const label = process.argv[3] ?? ''
const raw = readFileSync(file, 'utf8').replace(/^\uFEFF/, '')
const d = JSON.parse(raw)

console.log(`source: ${label || d.url} @ ${d.viewport}\n`)

const show = (title, key) => {
  const v = d.hovered[key]
  if (!v) {
    console.log(`=== ${title} ===\n  (absent)\n`)
    return
  }
  console.log(`=== ${title} ===`)
  const s = v.self
  console.log(`  self  transform=${s.transform}  opacity=${s.opacity}`)
  console.log(`        letterSpacing=${s.letterSpacing}  mixBlendMode=${s.mixBlendMode}`)
  console.log(`        padding=${s.padding}  backgroundColor=${s.backgroundColor}`)
  v.kids.forEach((k, i) => {
    console.log(
      `  kid${i}  "${k.text}"  transform=${k.transform}  opacity=${k.opacity}  ` +
        `position=${k.position}`,
    )
    console.log(`        fontSize=${k.fontSize}  letterSpacing=${k.letterSpacing}  color=${k.color}`)
    console.log(`        top=${k.top}  height=${k.height}`)
  })
  console.log('')
}

for (const [title, key] of [
  ['HEADER BUTTON label', 'headerBtnLabel'],
  ['HEADER LINK label', 'headerLinkLabel'],
  ['HERO h1', 'heroH1'],
  ['HERO desc', 'heroDesc'],
  ['HORSE', 'horse'],
  ['VIDEO CARD', 'videoCard'],
]) {
  show(title, key)
}