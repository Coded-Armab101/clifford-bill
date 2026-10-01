import { readFileSync, writeFileSync } from 'node:fs';

const file = 'src/App.css';
const src = readFileSync(file, 'utf8');
const lines = src.split(/\r?\n/);

const oldNums = [7, 8, 9, 10]; // .project__* orphaned rules
const out = lines.filter((_, i) => !oldNums.includes(i + 1));
writeFileSync(file, out.join('\n'));
console.log('Removed orphaned .project__ rules (lines 7-10).');