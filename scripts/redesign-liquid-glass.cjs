/**
 * Migrasi desain "iOS Liquid Glass" — HANYA mengubah string className.
 * Tidak menyentuh logika/store/fungsi apa pun. Palet warna tetap sama.
 */
const fs = require('fs');

const files = ['src/App.tsx', ...fs.readdirSync('src/components').filter(f => f.endsWith('.tsx')).map(f => `src/components/${f}`)];

function transformClasses(str) {
  let s = str;

  // Gradient banner/hero -> permukaan kaca dengan tint warna asal (palet tetap)
  s = s.replace(/bg-gradient-to-[a-z]+ from-\[([#0-9A-Fa-f]+)\](\/\d+)?(?: via-\[[^\]]+\](?:\/\d+)?)? to-\[([#0-9A-Fa-f]+)\](\/\d+)?/g, (m, c1) => {
    return `glass-card bg-[${c1}]/15`;
  });

  // Kartu panel: bg solid + rounded besar -> glass
  s = s.replace(/\bbg-white\b(?=[^"`]*\brounded-(?:xl|2xl)\b)/g, 'glass-card');
  s = s.replace(/\bbg-\[#FDFBF7\]\b(?=[^"`]*\brounded-(?:xl|2xl)\b)/g, 'glass-card');
  s = s.replace(/\bbg-\[#FAF8F4\]\b(?=[^"`]*\brounded-(?:xl|2xl)\b)/g, 'glass-card');

  // Border krem keras pada kartu -> hairline kaca
  s = s.replace(/border border-\[#E8E0D4\]/g, 'border border-white/60');

  // Shadow keras -> dihapus bila sudah glass (glass punya shadow sendiri)
  s = s.replace(/\bglass-card\b([^"`]*?)\bshadow-(?:lg|xl|2xl|md)\b/g, 'glass-card$1');

  // Radius khas iOS: rounded-lg membesar satu tingkat
  s = s.replace(/\brounded-lg\b(?![-a-z])/g, 'rounded-xl');

  return s;
}

let changed = 0;
for (const file of files) {
  const before = fs.readFileSync(file, 'utf8');
  // className="..." dan className={`...`}
  const after = before.replace(/className=(?:"([^"]*)"|\{`([^`]*)`\})/g, (m, dq, tpl) => {
    if (dq !== undefined) return `className="${transformClasses(dq)}"`;
    return 'className={`' + transformClasses(tpl) + '`}';
  });
  // className={cond ? `a` : `b`} dsb — backtick string yang mengandung class tailwind
  const after2 = after.replace(/`([^`\n]*(?:rounded|bg-\[#|shadow-)[^`\n]*)`/g, (m, inner) => '`' + transformClasses(inner) + '`');
  if (after2 !== before) {
    fs.writeFileSync(file, after2);
    changed++;
    console.log('updated', file);
  }
}
console.log('files changed:', changed);
