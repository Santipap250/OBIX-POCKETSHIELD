const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

test('all literal DOM IDs referenced by the app exist in the page', () => {
  const html = read('index.html');
  const js = read('app.js');
  const ids = new Set([...html.matchAll(/\bid=["']([^"']+)/g)].map(match => match[1]));
  const refs = new Set([...js.matchAll(/\$\(['"]([^'"]+)['"]\)/g)].map(match => match[1]));
  assert.deepEqual([...refs].filter(id => !ids.has(id)), []);
});

test('PWA precache references assets that exist', () => {
  const sw = read('sw.js');
  const block = sw.match(/const PRECACHE = \[([\s\S]*?)\];/);
  assert.ok(block, 'PRECACHE list should exist');
  const files = [...block[1].matchAll(/'([^']+)'/g)].map(match => match[1]);
  assert.ok(files.includes('/app.js'));
  assert.ok(files.includes('/security.js'));
  assert.ok(files.includes('/qr.js'));
  assert.ok(files.includes('/style.css'));
  for (const file of files) {
    const local = file === '/' ? 'index.html' : file.slice(1);
    assert.ok(fs.existsSync(path.join(root, local)), `Missing precache file: ${file}`);
  }
});

test('Vercel policy supports same-origin camera only and blocks inline scripts', () => {
  const config = JSON.parse(read('vercel.json'));
  const headers = config.headers.flatMap(entry => entry.headers || []);
  const csp = headers.find(header => header.key === 'Content-Security-Policy')?.value || '';
  const permissions = headers.find(header => header.key === 'Permissions-Policy')?.value || '';
  assert.match(csp, /script-src 'self'/);
  assert.doesNotMatch(csp, /script-src[^;]*unsafe-inline/);
  assert.match(permissions, /camera=\(self\)/);
  assert.match(permissions, /microphone=\(\)/);
  assert.match(permissions, /geolocation=\(\)/);
});

test('HTML contains no inline event handlers and all script assets are local', () => {
  const html = read('index.html');
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
        if (quote === '"' || quote === "'") { cursor++; while (cursor < tag.length && tag[cursor] !== quote) cursor++; cursor++; }
        else while (cursor < tag.length && !/[\s>]/.test(tag[cursor])) cursor++;
      }
      if (name) assert.equal(name.startsWith('on'), false, `Inline event handler found: ${name}`);
    }
  }
  const scripts = [...html.matchAll(/<script\s+src="([^"]+)"/g)].map(match => match[1]);
  assert.ok(scripts.length >= 3);
  for (const script of scripts) assert.ok(fs.existsSync(path.join(root, script.replace(/^\//, ''))));
});
