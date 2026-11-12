/* OBIX POCKETSHIELD local URL analysis helpers — no network requests. */
(function (root) {
  'use strict';
  const SHORTENERS = new Set(['bit.ly','tinyurl.com','t.co','goo.gl','ow.ly','is.gd','buff.ly','cutt.ly','rebrand.ly','shorturl.at','t.ly']);
  const BRANDS = [
    { name:'PayPal', aliases:['paypal'], domains:['paypal.com'] },
    { name:'Google', aliases:['google'], domains:['google.com','google.co.th'] },
    { name:'Apple', aliases:['apple','icloud'], domains:['apple.com','icloud.com'] },
    { name:'Microsoft', aliases:['microsoft','office365','outlook'], domains:['microsoft.com','live.com','office.com','outlook.com'] },
    { name:'Facebook', aliases:['facebook','meta'], domains:['facebook.com','meta.com'] },
    { name:'Instagram', aliases:['instagram'], domains:['instagram.com'] },
    { name:'LINE', aliases:['line'], domains:['line.me','line.biz'] },
    { name:'KBank', aliases:['kbank','kasikorn'], domains:['kasikornbank.com','kbank.co.th'] },
    { name:'SCB', aliases:['scb'], domains:['scb.co.th'] },
    { name:'Bangkok Bank', aliases:['bangkokbank'], domains:['bangkokbank.com','bangkokbank.co.th'] },
    { name:'Krungsri', aliases:['krungsri'], domains:['krungsri.com','krungsri.co.th'] },
    { name:'Amazon', aliases:['amazon'], domains:['amazon.com','amazon.co.uk','amazon.co.jp'] },
    { name:'Netflix', aliases:['netflix'], domains:['netflix.com'] },
    { name:'Lazada', aliases:['lazada'], domains:['lazada.co.th','lazada.com'] },
    { name:'Shopee', aliases:['shopee'], domains:['shopee.co.th','shopee.com'] },
    { name:'DHL', aliases:['dhl'], domains:['dhl.com'] },
    { name:'Thailand Post', aliases:['thailandpost','thailand-post'], domains:['thailandpost.co.th'] }
  ];
  const SUSPICIOUS_TLDS = new Set(['zip','mov','top','xyz','click','work','country','gq','tk','ml']);
  const endsWithDomain = (host, domain) => host === domain || host.endsWith('.' + domain);
  const isIp = host => /^\d{1,3}(?:\.\d{1,3}){3}$/.test(host) || host.includes(':') || /^0x[0-9a-f]+$/i.test(host);
  function inspect(rawInput) {
    const raw = String(rawInput || '').trim();
    if (!raw) throw new Error('กรุณาวาง URL ก่อน');
    const hasScheme = /^[a-z][a-z0-9+.-]*:/i.test(raw);
    const candidate = hasScheme ? raw : 'https://' + raw;
    let url;
    try { url = new URL(candidate); } catch (_) { throw new Error('รูปแบบ URL ไม่ถูกต้อง'); }
    const host = (url.hostname || '').toLowerCase().replace(/^\[|\]$/g, '');
    if (!host && ['http:','https:'].includes(url.protocol)) throw new Error('ไม่พบชื่อโดเมนใน URL นี้');
    let score = 0;
    const signals = [];
    const add = (points, message) => { score += points; signals.push(message); };
    if (!['http:','https:'].includes(url.protocol)) add(4, 'โปรโตคอล ' + url.protocol + ' ไม่ใช่เว็บ HTTP/HTTPS ทั่วไป');
    else if (url.protocol === 'http:') add(2, 'ไม่ใช้ HTTPS การเชื่อมต่ออาจไม่มีการเข้ารหัสระหว่างทาง');
    if (host && isIp(host)) add(3, 'ใช้ IP Address แทนชื่อโดเมน');
    if (url.username || url.password) add(3, 'มีข้อมูลผู้ใช้ฝังอยู่ใน URL ซึ่งอาจทำให้เข้าใจโดเมนปลายทางผิด');
    if (url.port && !['80','443'].includes(url.port)) add(2, 'ใช้พอร์ตที่ไม่ใช่ค่าทั่วไป (' + url.port + ')');
    if (host.split('.').some(part => part.startsWith('xn--'))) add(3, 'ชื่อโดเมนมี Punycode ซึ่งอาจใช้อักขระหน้าตาคล้ายกัน');
    let malformedEncoding = false;
    try { decodeURIComponent(raw); } catch (_) { malformedEncoding = true; }
    if (malformedEncoding) add(2, 'มี Percent-Encoding ที่ไม่สมบูรณ์');
    if (/[^\x00-\x7f]/.test(raw)) add(1, 'มีอักขระ Unicode ควรตรวจชื่อโดเมนให้ละเอียด');
    if (SHORTENERS.has(host)) add(2, 'เป็นบริการย่อลิงก์ ทำให้มองไม่เห็นปลายทางสุดท้าย');
    const labels = host.split('.').filter(Boolean);
    if (labels.length > 5) add(1, 'มี Subdomain หลายระดับผิดปกติ');
    const tld = labels.length ? labels[labels.length - 1] : '';
    if (SUSPICIOUS_TLDS.has(tld)) add(1, 'ใช้นามสกุลโดเมนที่ควรตรวจสอบเพิ่มเติม (.' + tld + ')');
    for (const brand of BRANDS) {
      const trusted = brand.domains.some(domain => endsWithDomain(host, domain));
      if (trusted) continue;
      const tokens = labels.flatMap(label => label.split(/[-_]/));
      const mentions = brand.aliases.some(alias => tokens.some(token => token === alias || (alias !== 'line' && token.length > alias.length && token.startsWith(alias))));
      if (mentions) add(4, 'ชื่อโดเมนมีลักษณะเลียนแบบแบรนด์ ' + brand.name + ' แต่ไม่ได้อยู่บนโดเมนทางการที่ระบุ');
    }
    if ((host.match(/-/g) || []).length > 2) add(1, 'โดเมนมีเครื่องหมายขีดหลายตำแหน่ง');
    const level = score >= 4 ? 'HIGH' : score >= 2 ? 'MEDIUM' : 'LOW';
    return { url, hostname: host, score, level, signals, schemeAssumed: !hasScheme };
  }
  const api = { inspect };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.PSCore = api;
})(typeof window !== 'undefined' ? window : globalThis);
