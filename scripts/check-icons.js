const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, '..', 'src', 'App.jsx');
const iconsDir = path.join(__dirname, '..', 'node_modules', 'lucide-react', 'dist', 'esm', 'icons');

const src = fs.readFileSync(appPath, 'utf8');
const importMatch = src.match(/import\s*\{([\s\S]*?)\}\s*from\s*['"]lucide-react['"]/);
if (!importMatch) {
  console.error('找不到從 lucide-react 的命名匯入。');
  process.exit(2);
}

const imports = importMatch[1]
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

function pascalToKebab(name) {
  // Insert hyphen between lower->upper or letter->digit or digit->letter
  let s = name
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .replace(/([a-zA-Z])([0-9])/g, '$1-$2')
    .replace(/([0-9])([a-zA-Z])/g, '$1-$2');
  return s.toLowerCase();
}

const files = fs.readdirSync(iconsDir);
const jsFiles = new Set(files.filter(f => f.endsWith('.js')));

const missing = [];
const found = [];

for (const name of imports) {
  const kebab = pascalToKebab(name);
  const candidates = [
    `${kebab}.js`,
    `${kebab}-2.js`,
    `${kebab}-1.js`,
    `${kebab}.map`,
  ];
  let ok = false;
  for (const c of candidates) {
    if (jsFiles.has(c)) {
      ok = true;
      break;
    }
  }
  if (!ok) missing.push({ name, kebab, candidates });
  else found.push({ name, kebab });
}

console.log('檢查結果：');
console.log('已找到：', found.map(f => f.name).join(', ') || '(無)');
if (missing.length) {
  console.log('\n找不到以下 icon 對應的檔案：');
  missing.forEach(m => console.log(`- ${m.name} -> 可能檔名: ${m.kebab}.js`));
  process.exit(3);
} else {
  console.log('\n所有匯入的 icon 檔案均存在於 lucide-react 套件。');
  process.exit(0);
}
