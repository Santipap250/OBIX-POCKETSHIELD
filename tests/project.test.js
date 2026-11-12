const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');const root=path.resolve(__dirname,'..');const read=f=>fs.readFileSync(path.join(root,f),'utf8');
test('all app references to literal IDs exist in HTML',()=>{const html=read('index.html'),js=read('app.js');const ids=new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]));const refs=new Set([...js.matchAll(/\$\(['"]([^'"]+)['"]\)/g)].map(m=>m[1]));assert.deepEqual([...refs].filter(id=>!ids.has(id)),[]);});
test('HTML has no inline event handler attributes',()=>{
 const html=read('index.html');
 for(const match of html.matchAll(/<[a-z][^>]*>/gi)){
  const tag=match[0];
  const attrs=tag.matchAll(/\s+([a-zA-Z_:][-a-zA-Z0-9_:.]*)(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?/g);
  for(const attr of attrs)assert.equal(attr[1].toLowerCase().startsWith('on'),false,`Inline handler found: ${attr[1]}`);
 }
});
test('precache includes all core scripts and styles',()=>{const sw=read('sw.js');for(const asset of ['/index.html','/style.css','/wordlist.js','/core.js','/app.js'])assert.ok(sw.includes("'"+asset+"'"));});
test('Vercel CSP keeps scripts same-origin and enables only same-origin camera',()=>{const config=JSON.parse(read('vercel.json'));const headers=config.headers.flatMap(x=>x.headers||[]);const csp=headers.find(x=>x.key==='Content-Security-Policy').value;const pp=headers.find(x=>x.key==='Permissions-Policy').value;assert.match(csp,/script-src 'self'/);assert.doesNotMatch(csp,/script-src[^;]*unsafe-inline/);assert.match(pp,/camera=\(self\)/);assert.match(pp,/microphone=\(\)/);assert.match(pp,/geolocation=\(\)/);});
