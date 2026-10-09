#!/usr/bin/env node
// Redesign pass: turunkan radius & shadow khas template AI (palet warna tetap sama)
const fs = require('fs');
const path = require('path');

const REPLACEMENTS = [
  ['rounded-2xl', 'rounded-lg'],
  ['rounded-xl', 'rounded-md'],
  ['shadow-lg', 'shadow-sm'],
  ['shadow-xl', 'shadow-sm'],
];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p);
    else if (/\.(tsx|ts)$/.test(entry.name)) processFile(p);
  }
}
function processFile(file) {
  let src = fs.readFileSync(file, 'utf8');
  const before = src;
  for (const [from, to] of REPLACEMENTS) src = src.split(from).join(to);
  if (src !== before) {
    fs.writeFileSync(file, src);
    console.log('updated:', path.relative(process.cwd(), file));
  }
}
walk(path.join(__dirname, '..', 'src'));
console.log('done.');
