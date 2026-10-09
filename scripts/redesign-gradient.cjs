// Ganti gradient khas template AI dengan warna solid palet asli.
const fs = require('fs');
const path = require('path');

const PALET = {
  '#87A878': 'bg-[#87A878]', '#6B8A5E': 'bg-[#6B8A5E]',
  '#2F6A43': 'bg-[#2F6A43]', '#1E4A2E': 'bg-[#1E4A2E]',
  '#B76E79': 'bg-[#B76E79]', '#9A5560': 'bg-[#B76E79]',
  '#D4A843': 'bg-[#D4A843]', '#B8922F': 'bg-[#D4A843]', '#E8CC8A': 'bg-[#D4A843]',
  '#4A9B65': 'bg-[#87A878]', '#E0BC6A': 'bg-[#D4A843]',
};

function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.tsx$/.test(e.name)) prosesFile(p);
  }
}

function prosesFile(file) {
  let src = fs.readFileSync(file, 'utf8');
  const before = src;
  // pola: bg-gradient-to-(r|br|l|b) [kelas lain] from-[..] via? [to-[..]] di dalam className string
  src = src.replace(/bg-gradient-to-\w+(?:\s+from-\[[^\]]+\])?(?:\s+via-\[[^\]]+\])?(?:\s+to-\[[^\]]+\])?/g, (m) => {
    const toks = m.split(/\s+/).slice(1);
    for (const t of toks) {
      const hex = t.match(/\[([^\]]+)\]/);
      if (hex && PALET[hex[1]]) return PALET[hex[1]];
    }
    return 'bg-[#2F6A43]';
  });
  if (src !== before) { fs.writeFileSync(file, src); console.log('updated:', path.relative(process.cwd(), file)); }
}
walk(path.join(__dirname, '..', 'src'));
