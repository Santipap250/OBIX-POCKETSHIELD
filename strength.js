/* OBIX POCKETSHIELD local password-strength estimator — pattern aware, no network, nothing stored. */
(function (root) {
  'use strict';
  const DICT = ('password 123456 12345678 123456789 qwerty abc123 letmein iloveyou admin welcome monkey dragon master sunshine princess football baseball shadow superman michael jennifer hello login secret test guest user root pass love money freedom whatever trustno1 starwars computer internet ninja batman soccer hockey hunter ranger jordan harley buster thomas tigger robert daniel andrew charlie summer winter spring autumn flower cookie coffee pepper ginger orange purple silver golden killer pokemon naruto thailand bangkok phuket santipap obix pocketshield google facebook line apple samsung number1 asdfgh zxcvbn lovely angel pass1 changeme default').split(' ');
  const RANK = new Map(DICT.map((w, i) => [w, i + 1]));
  const ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm', '1234567890', '1q2w3e4r5t6y7u8i9o0p', '1qaz2wsx3edc4rfv5tgb', 'qazwsxedcrfvtgb', 'zaq12wsxcde3', 'qwertyuiopasdfghjklzxcvbnm'];
  const LEET = { '@': 'a', '4': 'a', '3': 'e', '1': 'i', '!': 'i', '0': 'o', '$': 's', '5': 's', '7': 't', '+': 't' };
  const log2 = Math.log2;
  const kind = c => /[a-z]/.test(c) ? 'l' : /[A-Z]/.test(c) ? 'u' : /\d/.test(c) ? 'd' : 's';
  function seqStep(a, b) {
    const x = a.charCodeAt(0), y = b.charCodeAt(0), ka = kind(a);
    if (ka !== kind(b) || ka === 's') return 0;
    if (ka === 'd') { const d = (y - x + 10) % 10; return d === 1 ? 1 : d === 9 ? -1 : 0; }
    return y - x === 1 ? 1 : x - y === 1 ? -1 : 0;
  }
  function matches(p) {
    const m = [], n = p.length, low = p.toLowerCase();
    for (let i = 0; i < n; i++) {
      let j = i; while (j + 1 < n && p[j + 1] === p[i]) j++;
      if (j - i >= 2) m.push({ i, j, bits: 7 + log2(j - i + 1), t: 'repeat' });
      if (i + 1 < n) {
        const d = seqStep(p[i], p[i + 1]);
        if (d) { let k = i + 1; while (k + 1 < n && seqStep(p[k], p[k + 1]) === d) k++; if (k - i >= 2) m.push({ i, j: k, bits: 6 + log2(k - i + 1), t: 'sequence' }); }
      }
      for (let len = 3; i + len <= n; len++) {
        const s = low.slice(i, i + len);
        if (ROWS.some(r => r.includes(s) || r.split('').reverse().join('').includes(s))) m.push({ i, j: i + len - 1, bits: 6 + log2(len), t: 'keyboard' });
      }
      for (let len = 3; i + len <= n; len++) {
        const raw = low.slice(i, i + len), norm = raw.replace(/[@4310!$57+]/g, c => LEET[c]);
        const r = RANK.get(raw) || RANK.get(norm);
        if (r) m.push({ i, j: i + len - 1, bits: log2(r + 1) + 1 + (RANK.get(raw) ? 0 : 2) + (p.slice(i, i + len) !== raw ? 1 : 0), t: 'common' });
      }
      const y = /^(19|20)\d\d/.exec(p.slice(i, i + 4)); if (y) m.push({ i, j: i + 3, bits: 7, t: 'date' });
      const dm = /^(0[1-9]|[12]\d|3[01])(0[1-9]|1[0-2])((19|20)?\d\d)/.exec(p.slice(i, i + 8)); if (dm) m.push({ i, j: i + dm[0].length - 1, bits: 15, t: 'date' });
    }
    for (let len = 1; len <= n >> 1; len++) {
      for (let i = 0; i + 2 * len <= n; i++) {
        const blk = p.slice(i, i + len); let k = i + len, c = 1;
        while (p.startsWith(blk, k)) { k += len; c++; }
        if (c >= 2) m.push({ i, j: k - 1, bits: 6.6 * Math.min(len, 4) + log2(c) + 2, t: 'repeat' });
      }
    }
    return m;
  }
  function assess(pw) {
    const p = String(pw || '');
    if (!p) return null;
    const n = p.length, kinds = new Set([...p].map(kind)), card = Math.max(10, (kinds.has('l') ? 26 : 0) + (kinds.has('u') ? 26 : 0) + (kinds.has('d') ? 10 : 0) + (kinds.has('s') ? 33 : 0));
    const brute = log2(card), best = new Array(n + 1).fill(Infinity), used = new Array(n + 1).fill(null);
    best[0] = 0;
    const ms = matches(p);
    for (let e = 1; e <= n; e++) {
      best[e] = best[e - 1] + brute; used[e] = null;
      for (const m of ms) if (m.j + 1 === e && best[m.i] + m.bits < best[e]) { best[e] = best[m.i] + m.bits; used[e] = m; }
    }
    const found = new Set(); let e = n;
    while (e > 0) { const m = used[e]; if (m) { found.add(m.t); e = m.i; } else e--; }
    const bits = best[n];
    let score = bits < 28 ? 0 : bits < 40 ? 1 : bits < 60 ? 2 : bits < 80 ? 3 : 4;
    if (n < 8) score = Math.min(score, 1); else if (n < 12) score = Math.min(score, 2);
    if (found.size && score > 2 && bits < 70) score = 2;
    const tips = [];
    if (n < 12) tips.push({ th: 'ใช้อย่างน้อย 12–16 ตัวอักษร', en: 'Use at least 12–16 characters' });
    for (const t of found) tips.push({
      repeat: { th: 'หลีกเลี่ยงอักขระหรือกลุ่มอักขระที่ซ้ำกัน', en: 'Avoid repeated characters or blocks' },
      sequence: { th: 'หลีกเลี่ยงลำดับ เช่น 1234 หรือ abcd', en: 'Avoid sequences like 1234 or abcd' },
      keyboard: { th: 'หลีกเลี่ยงแนวแป้นพิมพ์ เช่น qwerty', en: 'Avoid keyboard patterns like qwerty' },
      common: { th: 'หลีกเลี่ยงคำหรือรหัสผ่านที่พบบ่อย รวมถึงการแทนตัวอักษร (a→@)', en: 'Avoid common words/passwords, including substitutions (a→@)' },
      date: { th: 'หลีกเลี่ยงวันที่และปีเกิด', en: 'Avoid dates and birth years' }
    }[t]);
    if (score < 3) tips.push({ th: 'ใช้ตัวสร้างรหัสผ่านสุ่มหรือ Passphrase หลายคำ และใช้ตัวจัดการรหัสผ่าน', en: 'Use the random generator or a multi-word passphrase, plus a password manager' });
    const L = [['อ่อนมาก', 'Very Weak'], ['อ่อน', 'Weak'], ['พอใช้', 'Fair'], ['แข็งแรง', 'Strong'], ['แข็งแรงมาก', 'Very Strong']][score];
    return { score, th: L[0], en: L[1], patterns: [...found], tips };
  }
  const api = { assess };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.PSStrength = api;
})(typeof window !== 'undefined' ? window : globalThis);
