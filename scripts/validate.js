const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const required = ['index.html','style.css','app.js','security.js','qr.js','sw.js','manifest.webmanifest','vercel.json','icons/icon.svg','icons/icon-192.png','icons/icon-512.png'];
const missing = required.filter(file => !fs.existsSync(path.join(root, file)));
if (missing.length) {
  console.error('Build validation failed. Missing files:', missing.join(', '));
  process.exit(1);
}
for (const file of ['app.js','security.js','sw.js','qr.js']) {
  new vm.Script(fs.readFileSync(path.join(root, file), 'utf8'), { filename: file });
}
for (const file of ['manifest.webmanifest','vercel.json','package.json']) {
  JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
}
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
if (/<(?:button|input)[^>]*\sonclick\s*=/i.test(html)) throw new Error('Inline event handlers are not permitted by the configured CSP.');
for (const asset of ['/style.css','/security.js','/app.js']) {
  if (!html.includes(asset)) throw new Error('HTML does not reference required asset: ' + asset);
}
console.log('Static production validation passed.');
console.log('Validated files:', required.length);
console.log('Inline event handlers: none');
