const test = require('node:test');
const assert = require('node:assert/strict');
const { inspect } = require('../security.js');

test('recognizes common Thai official domains without brand false positives', () => {
  for (const url of ['scb.co.th','shopee.co.th','lazada.co.th','google.co.th','https://sub.scb.co.th/login']) {
    const result = inspect(url);
    assert.equal(result.level, 'LOW', `${url} should not be flagged as a fake brand domain`);
    assert.equal(result.signals.some(s => s.includes('เลียนแบบแบรนด์')), false);
  }
});

test('flags lookalike brand domains', () => {
  const result = inspect('https://scb-secure-login.example.com');
  assert.equal(result.level, 'HIGH');
  assert.ok(result.signals.some(s => s.includes('SCB')));
});

test('flags deceptive suffix after a trusted brand domain', () => {
  const result = inspect('https://scb.co.th.attacker.example/login');
  assert.equal(result.level, 'HIGH');
});

test('handles malformed percent encoding without throwing', () => {
  const result = inspect('https://example.com/login?next=%ZZ');
  assert.equal(result.level, 'MEDIUM');
  assert.ok(result.signals.some(s => s.includes('Percent-Encoding')));
});

test('assumes HTTPS when the user enters a domain without a scheme', () => {
  const result = inspect('example.com/path');
  assert.equal(result.schemeAssumed, true);
  assert.equal(result.level, 'LOW');
});

test('flags plain HTTP and unsupported schemes', () => {
  assert.equal(inspect('http://example.com').level, 'MEDIUM');
  assert.equal(inspect('javascript:alert(1)').level, 'HIGH');
});

test('does not flag generic domains that merely contain brand letter sequences', () => {
  assert.equal(inspect('https://online.example.com').level, 'LOW');
  assert.equal(inspect('https://pineapple.example.com').level, 'LOW');
});

test('flags shortened URLs and unusual ports', () => {
  const shortened = inspect('https://bit.ly/abc');
  assert.ok(shortened.signals.some(s => s.includes('ย่อลิงก์')));
  const port = inspect('https://example.com:8443');
  assert.ok(port.signals.some(s => s.includes('พอร์ต')));
});
