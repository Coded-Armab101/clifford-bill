/**
 * Pull the reference markup for a section out of the cached original HTML
 * so it can be compared line by line against the clone.
 *
 * Usage: node scripts/refslice.mjs <anchorClass> [maxChars]
 */
import { readFileSync } from 'node:fs'

const HTML = 'C:\\Users\\ICT\\.local\\share\\opencode\\tool-output\\tool_0f2a26564001IRgv8UjUZcGLW4'
const [, , anchor, max = '6000'] = process.argv

const html = readFileSync(HTML, 'utf8')
const at = html.indexOf(anchor)
if (at < 0) {
  console.log(`anchor "${anchor}" not found`)
  process.exit(1)
}

/* walk back to the nearest opening section-ish tag for context */
const start = html.lastIndexOf('<section', at)
const from = start > 0 ? start : Math.max(0, at - 800)
const slice = html.slice(from, at + Number(max))

/* collapse the 4-space Webflow indentation so lines are readable */
const text = slice
  .replace(/></g, '>\n<')
  .split('\n')
  .map((l) => l.trim())
  .join('\n')

console.log(text)