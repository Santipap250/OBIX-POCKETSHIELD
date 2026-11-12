const test = require('node:test'), assert = require('node:assert');
const { assess } = require('../strength.js');
const crypto = require('node:crypto');
test('predictable passwords are never Strong/Very Strong', () => {
  for (const p of ['aaaaaaaaaaaaaaaaaaaa','12345678901234567890','password123','qwerty123456','abcdefghijklmnop','Password1!','P@ssw0rd2024','abcabcabcabcabcabc','1q2w3e4r5t6y','zzzzzzzzzzzzzzzzzzzzzzzz']) {
    const r = assess(p); assert.ok(r.score <= 2, p + ' scored ' + r.en);
  }
});
test('very predictable examples are Very Weak/Weak', () => {
  for (const p of ['aaaaaaaaaaaaaaaaaaaa','12345678901234567890','password123','qwerty123456','abcdefghijklmnop']) assert.ok(assess(p).score <= 1, p);
});
test('random 20-char passwords are Strong or better; random 8-char capped', () => {
  const cs = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  for (let k = 0; k < 40; k++) {
    const gen = n => Array.from({ length: n }, () => cs[crypto.randomInt(cs.length)]).join('');
    assert.ok(assess(gen(20)).score >= 3);
    assert.ok(assess(gen(7)).score <= 1);
  }
});
test('empty -> null; short never above Weak; has bilingual tips', () => {
  assert.strictEqual(assess(''), null);
  assert.ok(assess('Xk9#m2').score <= 1);
  const r = assess('password123'); assert.ok(r.tips.every(t => t.th && t.en)); assert.ok(r.th && r.en);
});
test('unicode/Thai input does not throw', () => { assert.ok(assess('รหัสผ่านของฉัน123') !== null); assert.ok(assess('😀😀😀😀😀😀😀😀😀😀😀😀').score <= 2); });
