// Redesign v3 "human touch" — murni class styling, tanpa mengubah logika.
// Palet warna tetap sama persis (#2F6A43 sage, #B76E79 rose, #D4A843 gold, krem).
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', 'src');

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith('.tsx')) out.push(p);
  }
  return out;
}

// Emoji -> lucide icon component name (ikon diimpor per file bila dipakai)
const EMOJI_ICON = {
  '💡': 'Lightbulb',
  '✨': 'Sparkles',
  '🎉': 'PartyPopper',
  '✅': 'CheckCircle2',
  '❌': 'XCircle',
  '⚠️': 'AlertTriangle',
  '📝': 'FileText',
  '✏️': 'Pencil',
  '📋': 'ClipboardList',
  '📊': 'BarChart3',
  '💰': 'Wallet',
  '💵': 'Banknote',
  '🎯': 'Target',
  '💥': 'Zap',
  '🟢': 'Circle',
  '📦': 'Package',
  '🔒': 'Lock',
};

const files = walk(SRC);
let changed = 0;

for (const f of files) {
  let s = fs.readFileSync(f, 'utf8');
  const orig = s;
  const usedIcons = new Set();

  // 1. Ganti emoji dekoratif dengan ikon lucide seukuran teks (natural, bukan emoji colorful)
  s = s.replace(/([\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]\uFE0F?)\s*/gu, (m, emo) => {
    const icon = EMOJI_ICON[emo] || EMOJI_ICON[emo.replace('\uFE0F', '')];
    if (!icon) return m; // pertahankan bila tidak ada mapping aman
    usedIcons.add(icon);
    return `<${icon} className="inline-block w-4 h-4 mr-1 -mt-0.5 align-middle shrink-0" /> `;
  });

  // 2. Tambah import ikon yang terpakai dari lucide-react
  if (usedIcons.size > 0) {
    const names = [...usedIcons].sort();
    if (/from ['"]lucide-react['"]/.test(s)) {
      s = s.replace(/import\s*\{([^}]*)\}\s*from\s*['"]lucide-react['"]/, (m, g) => {
        const have = g.split(',').map((x) => x.trim()).filter(Boolean);
        const add = names.filter((n) => !have.includes(n));
        if (!add.length) return m;
        return `import { ${[...have, ...add].join(', ')} } from 'lucide-react'`;
      });
    } else {
      const imp = `import { ${names.join(', ')} } from 'lucide-react';\n`;
      const firstImport = s.indexOf('import ');
      s = firstImport >= 0 ? s.slice(0, firstImport) + imp + s.slice(firstImport) : imp + s;
    }
  }

  // 3. Gradient khas template AI -> warna solid palet yang sama
  s = s.replace(/bg-gradient-to-(br|tr|bl|r|l|b)\s+from-\[([^\]]+)\](?:\s+via-\[[^\]]+\])?\s+to-\[([^\]]+)\]/g, 'bg-[$2]');
  s = s.replace(/bg-gradient-to-(br|tr|bl|r|l|b)\s+from-(purple|blue|green|rose|amber|gray|slate)-(\d\d\d)(?:\s+via-\w+-\d+)?\s+to-(purple|blue|green|rose|amber|gray|slate)-(\d\d\d)/g, 'bg-$2-$4');

  // 4. Radius seragam kecil ala desain manual (card md, kontrol sm, avatar tetap full)
  s = s.replace(/rounded-2xl/g, 'rounded-md');
  s = s.replace(/rounded-xl(?![a-z-])/g, 'rounded-md');

  // 5. Shadow tebal mengambang -> garis tepi + shadow tipis
  s = s.replace(/shadow-lg(?![a-z-])/g, 'border border-[#E5DED0] shadow-sm');
  s = s.replace(/shadow-xl(?![a-z-])/g, 'border border-[#E5DED0] shadow-sm');
  s = s.replace(/\s+hover:shadow-(lg|xl|md)(\s+hover:shadow-\S+)?/g, '');

  if (s !== orig) {
    fs.writeFileSync(f, s);
    changed++;
  }
}
console.log(`redesign-v3: ${changed} file diubah`);
