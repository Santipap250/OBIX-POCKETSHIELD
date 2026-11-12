const test=require('node:test'),assert=require('node:assert'),fs=require('fs'),vm=require('vm');
const js=fs.readFileSync(__dirname+'/../app.js','utf8');
const cut=(a,b)=>js.slice(js.indexOf(a),js.indexOf(b));
const code=cut('function ri(n)','const WORDS')+cut('const b64=','function dl(')+cut('const hex=','$(\'hGo\')');
const ctx={enc:new TextEncoder(),dec:new TextDecoder(),crypto:globalThis.crypto,TextEncoder,TextDecoder,btoa,atob,Uint8Array,Uint32Array,DataView,Math,Error,Promise,$:()=>({})};
vm.createContext(ctx);vm.runInContext(code+';this.api={ri,seal,open,b64,unb64,hex}',ctx);
const {ri,seal,open,hex}=ctx.api;const E=new TextEncoder();
test('AES round-trip text (Thai + emoji)',async()=>{const m=E.encode('สวัสดี 🔐 secret');const out=await open('pw1',await seal('pw1',m));assert.deepStrictEqual([...out],[...m])});
test('wrong password rejected',async()=>{const c=await seal('right',E.encode('x'));await assert.rejects(()=>open('wrong',c),/รหัสผ่านไม่ถูกต้อง/)});
test('tampered data rejected',async()=>{const c=await seal('p',E.encode('hello world'));c[c.length-1]^=1;await assert.rejects(()=>open('p',c))});
test('bad header / empty rejected',async()=>{await assert.rejects(()=>open("p",new Uint8Array(0)),/รูปแบบข้อมูล/);await assert.rejects(()=>open("p",new Uint8Array(80)),/รูปแบบข้อมูล/)});
test('salt and IV differ each time',async()=>{const a=await seal('p',E.encode('x')),b=await seal('p',E.encode('x'));assert.notDeepStrictEqual([...a.slice(9,37)],[...b.slice(9,37)])});
test('binary 1MB file round-trip',async()=>{const d=new Uint8Array(1048576);for(let i=0;i<d.length;i+=65536)crypto.getRandomValues(d.subarray(i,i+65536));const o=await open('p',await seal('p',d));assert.deepStrictEqual(Buffer.from(o),Buffer.from(d))});
test('SHA-256 known vector',async()=>{assert.strictEqual(hex(await crypto.subtle.digest('SHA-256',E.encode('abc'))),'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad')});
test('ri stays in range and covers values',()=>{const s=new Set();for(let i=0;i<3000;i++){const v=ri(7);assert.ok(v>=0&&v<7);s.add(v)}assert.strictEqual(s.size,7)});

test('zero-byte file round-trip',async()=>{const d=new Uint8Array(0);const encrypted=await seal('empty-file-password',d);assert.equal(encrypted.length,53);const decrypted=await open('empty-file-password',encrypted);assert.equal(decrypted.length,0)});
