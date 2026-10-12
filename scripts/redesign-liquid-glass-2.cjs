const fs = require('fs');
const files = ['src/App.tsx', ...fs.readdirSync('src/components').filter(f => f.endsWith('.tsx')).map(f => `src/components/${f}`)];

const btnMap = {
  'from-blue-500 to-blue-600': '#3B82F6',
  'from-purple-500 to-purple-600': '#8B5CF6',
  'from-amber-500 to-amber-600': '#D4A843',
  'from-emerald-500 to-emerald-600': '#2F6A43',
  'from-green-500 to-green-600': '#2F6A43',
  'from-red-500 to-red-600': '#B76E79',
  'from-rose-500 to-rose-600': '#B76E79',
};

let changed = 0;
for (const file of files) {
  let s = fs.readFileSync(file, 'utf8');
  const before = s;

  // Tombol gradient tailwind -> solid glossy (palet tetap untuk warna brand)
  s = s.replace(/bg-gradient-to-[a-z]+ (from-\S+ to-\S+)/g, (m, pair) => {
    const key = pair.replace('from-', '').replace(' to-', ' ').trim();
    const c = btnMap[pair];
    if (c) return `glass-btn-primary bg-[${c}]`;
    return m.replace(/bg-gradient-to-[a-z]+ /, '');
  });
  // Panel gradient pastel -> tint lembut
  s = s.replace(/bg-gradient-to-br from-(\w+)-50 to-(?:white|\1)-50/g, 'glass-card');

  // Sidebar & drawer -> kaca vertikal
  s = s.replace(/(aside[^>]*?className=")([^"]*?)bg-white([^"]*?)"/g, '$1$2glass-card$3"');
  s = s.replace(/className="(hidden lg:flex flex-col fixed left-0 top-0 h-full w-64 )glass-card([^"]*)border-r border-\[#D6E5DC\]/, 'className="$1glass-panel rounded-none border-r border-white/40$2'.replace('$2',''));

  // Header sticky -> glass bar
  s = s.replace(/sticky top-0 z-30 bg-white\/80 backdrop-blur-md border-b border-\[#D6E5DC\]/, 'sticky top-0 z-30 glass-bar');

  // Bottom nav mobile -> floating pill glass
  s = s.replace(/fixed bottom-0 left-0 right-0 bg-white border-t border-\[#D6E5DC\] shadow-lg/, 'fixed bottom-2 left-2 right-2 glass-card rounded-2xl border border-white/50');

  // Toast & modal overlay sudah blur — samakan material panel
  s = s.replace(/bg-white rounded-2xl shadow-2xl/g, 'glass-panel rounded-2xl');
  s = s.replace(/sticky top-0 bg-white border-b border-gray-200/g, 'sticky top-0 glass-card border-b border-white/40');
  s = s.replace(/rounded-t-2xl/g, 'rounded-t-2xl');

  if (s !== before) { fs.writeFileSync(file, s); changed++; console.log('updated', file); }
}
console.log('changed:', changed);
