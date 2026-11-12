const test = require('node:test');
const assert = require('node:assert/strict');
const { generate } = require('../qr.js');

test('generates a valid-size version 1 QR matrix for short text', () => {
  const qr = generate('HELLO WORLD');
  assert.equal(qr.version, 1);
  assert.equal(qr.size, 21);
  assert.equal(qr.modules.length, 21);
  assert.ok(qr.modules.every(row => row.length === 21 && row.every(v => typeof v === 'boolean')));
});

test('supports Thai UTF-8 content locally', () => {
  const qr = generate('สวัสดี');
  assert.ok(qr.version >= 1 && qr.version <= 4);
  assert.equal(qr.errorCorrection, 'L');
  assert.equal(qr.utf8Eci, true);
});

test('supports 78-byte ASCII payloads and rejects longer input', () => {
  const qr = generate('A'.repeat(78));
  assert.equal(qr.version, 4);
  assert.throws(() => generate('A'.repeat(79)), /78 ไบต์/);
});

test('rejects empty QR payload', () => {
  assert.throws(() => generate(''), /กรุณากรอก/);
});
