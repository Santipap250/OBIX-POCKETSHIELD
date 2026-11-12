'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const required = [
  'index.html','style.css','wordlist.js','core.js','app.js','sw.js',
  'manifest.webmanifest','vercel.json','package.json','package-lock.json',
  'README.md','SECURITY.md','CHANGELOG.md','VERIFICATION-REPORT.md','START-HERE-TH.md',
  'icons/icon.svg','icons/icon-192.png','icons/icon-512.png',
  'tests/fixtures/legacy-v1-obx.b64'
];
const missing = required.filter(file => !fs.existsSync(path.join(root, file)));
if (missing.length) throw new Error('Missing required files: ' + missing.join(', '));
for (const file of ['wordlist.js','core.js','app.js','sw.js']) {
  new vm.Script(fs.readFileSync(path.join(root, file), 'utf8'), { filename: file });
}
for (const file of ['manifest.webmanifest','vercel.json','package.json','package-lock.json']) {
  JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
}
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
// Parse tag attributes instead of searching raw HTML so escaped XSS training examples
// such as `onerror=` in text/value samples are not mistaken for real inline handlers.
for (const match of html.matchAll(/<[a-z][^>]*>/gi)) {
  const tag = match[0];
  let cursor = tag.search(/\s/);
  while (cursor >= 0 && cursor < tag.length) {
    while (/\s/.test(tag[cursor] || '') || tag[cursor] === '/') cursor++;
    if (cursor >= tag.length || tag[cursor] === '>') break;
    const start = cursor;
    while (cursor < tag.length && !/[\s=/>]/.test(tag[cursor])) cursor++;
    const name = tag.slice(start, cursor).toLowerCase();
    while (/\s/.test(tag[cursor] || '')) cursor++;
    if (tag[cursor] === '=') {
      cursor++;
      while (/\s/.test(tag[cursor] || '')) cursor++;
      const quote = tag[cursor];
      if (quote === '"' || quote === "'") {
        cursor++;
        while (cursor < tag.length && tag[cursor] !== quote) cursor++;
        cursor++;
      } else {
        while (cursor < tag.length && !/[\s>]/.test(tag[cursor])) cursor++;
      }
    }
    if (name.startsWith('on')) throw new Error('Inline event handler is forbidden: ' + name);
  }
}
for (const script of [...html.matchAll(/<script\s+src="([^"]+)"/g)].map(match => match[1])) {
  if (!fs.existsSync(path.join(root, script.replace(/^\//, '')))) throw new Error('Missing script ' + script);
}
const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
const precache = sw.match(/const PRECACHE=\[([\s\S]*?)\];/);
if (!precache) throw new Error('Missing precache manifest');
const assets = [...precache[1].matchAll(/'([^']+)'/g)].map(match => match[1]);
for (const asset of assets) {
  const relative = asset === '/' ? 'index.html' : asset.replace(/^\//, '');
  if (!fs.existsSync(path.join(root, relative))) throw new Error('Missing precache asset ' + asset);
}
const config = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8'));
const headers = config.headers.flatMap(entry => entry.headers || []);
const csp = headers.find(header => header.key === 'Content-Security-Policy')?.value || '';
const permission = headers.find(header => header.key === 'Permissions-Policy')?.value || '';
if (!csp.includes("script-src 'self'") || /script-src[^;]*unsafe-inline/.test(csp)) throw new Error('CSP script policy is too permissive or invalid.');
if (!permission.includes('camera=(self)') || !permission.includes('microphone=()') || !permission.includes('geolocation=()')) throw new Error('Permissions-Policy is not aligned with app features.');
console.log('Production static validation passed.');
console.log('Required assets:', required.length, '| Precache assets:', assets.length, '| Inline handlers: none');
