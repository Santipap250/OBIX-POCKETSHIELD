const test=require('node:test');const assert=require('node:assert/strict');const {inspectUrl,decodeJwt,analyzeHeaders}=require('../core.js');
test('official Thai domains are not flagged as brand impersonation',()=>{
 for(const url of ['scb.co.th','kasikornbank.com','shopee.co.th','lazada.co.th','google.co.th','thailandpost.co.th','sub.scb.co.th'])assert.equal(inspectUrl(url).level,'LOW',url);
});
test('brand lookalike and deceptive suffix are flagged',()=>{
 assert.equal(inspectUrl('https://scb-secure-login.example.com').level,'HIGH');
 assert.equal(inspectUrl('https://scb.co.th.attacker.example/login').level,'HIGH');
 assert.equal(inspectUrl('https://google.co.th.evil.example').level,'HIGH');
});
test('malformed percent encoding does not crash URL analysis',()=>{const r=inspectUrl('https://example.com/path?x=%ZZ');assert.equal(r.level,'MEDIUM');assert.ok(r.signals.some(x=>x.includes('Percent-Encoding')));});
test('URL analysis detects HTTP, shortened domains, credentials and unusual ports',()=>{
 assert.equal(inspectUrl('http://example.com').level,'MEDIUM');assert.ok(inspectUrl('https://bit.ly/abc').signals.some(x=>x.includes('ย่อลิงก์')));assert.ok(inspectUrl('https://user:pass@example.com').signals.some(x=>x.includes('ผู้ใช้')));assert.ok(inspectUrl('https://example.com:8443').signals.some(x=>x.includes('พอร์ต')));
});
test('JWT inspector decodes payload but does not claim signature verification',()=>{
 const token='eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJ0ZXN0In0.signature';const result=decodeJwt(token);assert.equal(result.header.alg,'none');assert.equal(result.payload.sub,'test');assert.equal(result.signature,'signature');
});
test('security header analyzer identifies important headers and cookie flags',()=>{
 const result=analyzeHeaders("Content-Security-Policy: default-src 'self'\nStrict-Transport-Security: max-age=31536000\nX-Content-Type-Options: nosniff\nX-Frame-Options: DENY\nReferrer-Policy: no-referrer\nPermissions-Policy: camera=(self)\nSet-Cookie: session=x; Secure; HttpOnly; SameSite=Lax");
 assert.equal(result.checks.filter(x=>x.ok).length,6);assert.deepEqual(result.cookies[0],{name:'session',secure:true,httpOnly:true,sameSite:true});
});
