import fs from 'node:fs'

const ref = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'))
const mine = JSON.parse(fs.readFileSync(process.argv[3], 'utf8'))

const f = (n) => (Math.round(n * 100) / 100).toFixed(2).padStart(9)
const boxs = (b) => (Array.isArray(b) ? b.map(f).join(' ') : String(b))

console.log('selector'.padEnd(32), '                 ref box                    ', '                 mine box')
for (const key of Object.keys(ref.out)) {
  const r = ref.out[key]
  const m = mine.out[key]
  const rb = r === 'MISSING' ? 'MISSING' : r.box
  const mb = m === 'MISSING' ? 'MISSING' : m.box
  let d = ''
  if (Array.isArray(rb) && Array.isArray(mb)) {
    d = ' dW=' + f(mb[2] - rb[2]) + ' dH=' + f(mb[3] - rb[3]) + ' dT=' + f(mb[1] - rb[1])
  }
  console.log(key.padEnd(32), boxs(rb), boxs(mb), d)
}

console.log('\n--- slides (char color / desc color) ---')
for (let i = 0; i < Math.max(ref.slides.length, mine.slides.length); i++) {
  const r = ref.slides[i] || {}
  const m = mine.slides[i] || {}
  console.log(
    `slide ${i}: op r=${r.op} m=${m.op} vis r=${r.vis} m=${m.vis} | char r=${r.charColor} m=${m.charColor} | desc r=${r.descColor} m=${m.descColor}`,
  )
}

console.log('\n--- dots ---')
for (let i = 0; i < Math.max(ref.dots.length, mine.dots.length); i++) {
  const r = ref.dots[i] || {}
  const m = mine.dots[i] || {}
  console.log(`dot ${i}: w r=${r.w} m=${m.w} h r=${r.h} m=${m.h} grow r=${r.flexGrow} m=${m.flexGrow} bg r=${r.bg} m=${m.bg}`)
}