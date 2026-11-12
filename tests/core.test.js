const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');
const words=require('../wordlist.js');Object.assign(global,words);
const C=require('../core.js');
const enc=new TextEncoder();

test('word-pair vocabulary contains 6,400 unique compound tokens',()=>{
  assert.equal(words.WORD_A.length,80);assert.equal(words.WORD_B.length,80);
  const all=words.WORD_A.flatMap(a=>words.WORD_B.map(b=>a+'-'+b));
  assert.equal(new Set(all).size,6400);
});
test('passphrase generates selectable number of words with unbiased token source',()=>{
  const phrase=C.generatePassphrase(7);assert.equal(phrase.split('-').length,14); // 7 hyphenated two-part tokens
  assert.ok(phrase.split('-').every(Boolean));
  assert.ok(C.passphraseBits(7)>88&&C.passphraseBits(7)<89);
});
test('passphrase rejects unsupported word counts',()=>{assert.throws(()=>C.generatePassphrase(5),/6–10/);assert.throws(()=>C.generatePassphrase(11),/6–10/);});
test('password generator requires valid character groups and minimum length',()=>{
  const password=C.generatePassword({length:24,upper:true,lower:true,numbers:true,symbols:true});
  assert.equal(password.length,24);assert.match(password,/[A-Z]/);assert.match(password,/[a-z]/);assert.match(password,/[0-9]/);assert.match(password,/[^A-Za-z0-9]/);
  assert.throws(()=>C.generatePassword({length:8,upper:false,lower:false,numbers:false,symbols:false}),/เลือกชุดอักขระ/);
});
test('weak repetitive, sequence and common passwords are not Strong',()=>{
  for(const p of ['aaaaaaaaaaaaaaaaaaaa','12345678901234567890','password123','qwerty123456','abcdefghijklmnop','CorrectHorseBattery!2026'])assert.ok(C.estimatePassword(p).score<3,`${p} was scored ${C.estimatePassword(p).score}`);
});
test('generated mixed high-variation password can reach Strong or Very Strong',()=>{
  const p=C.generatePassword({length:24,upper:true,lower:true,numbers:true,symbols:true});
  assert.ok(C.estimatePassword(p).score>=3);
});
test('AES-256-GCM encrypt/decrypt text with Thai and emoji',async()=>{
  const message=enc.encode('สวัสดี OBIX 🔐');const cipher=await C.seal('a strong test password',message);const plain=await C.open('a strong test password',cipher);assert.deepEqual([...plain],[...message]);
});
test('AES-GCM wrong password and tampering are rejected',async()=>{
  const cipher=await C.seal('correct password',enc.encode('secret'));
  await assert.rejects(()=>C.open('wrong password',cipher),/รหัสผ่านไม่ถูกต้อง/);
  const modified=cipher.slice();modified[modified.length-1]^=1;await assert.rejects(()=>C.open('correct password',modified),/รหัสผ่านไม่ถูกต้อง/);
});
test('AES file format accepts empty plaintext and retains OPS1 version 1',async()=>{
  const cipher=await C.seal('empty-file-passphrase',new Uint8Array(0));assert.equal(cipher.length,53);assert.equal(String.fromCharCode(...cipher.slice(0,4)),'OPS1');assert.equal(cipher[4],1);const plain=await C.open('empty-file-passphrase',cipher);assert.equal(plain.length,0);
});
test('AES header rejects unreasonable PBKDF2 iteration counts',async()=>{
  const cipher=await C.seal('password',enc.encode('hello'));new DataView(cipher.buffer).setUint32(5,5000001);await assert.rejects(()=>C.open('password',cipher),/จำนวนรอบ/);
});
test('Base64 decoder rejects invalid alphabet',()=>{assert.throws(()=>C.unb64('%%%'),/Base64/);});
test('SHA-256 known vector',async()=>{
  const digest=new Uint8Array(await crypto.subtle.digest('SHA-256',enc.encode('abc')));const hex=[...digest].map(x=>x.toString(16).padStart(2,'0')).join('');assert.equal(hex,'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
});

test('decrypts a fixed OPS1 fixture created in the previous v1.0.0 format',async()=>{
  const fixture=fs.readFileSync(path.join(__dirname,'fixtures','legacy-v1-obx.b64'),'utf8').trim();
  const plain=await C.open('legacy-pass-2026',C.unb64(fixture));
  assert.equal(new TextDecoder().decode(plain),'Legacy OBIX POCKETSHIELD v1.0.0 fixture');
});
