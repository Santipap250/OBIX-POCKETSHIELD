/* Minimal local QR encoder: byte mode, error-correction level L, versions 1–4. */
(function (root) {
  'use strict';
  const DATA_CW = [0,19,34,55,80];
  const ECC_CW = [0,7,10,15,20];
  const encoder = new TextEncoder();
  const getBit = (value, index) => ((value >>> index) & 1) !== 0;
  function gfMultiply(x, y) {
    let z = 0;
    for (let i = 0; i < 8; i++) {
      if (y & 1) z ^= x;
      const high = x & 0x80;
      x = (x << 1) & 0xff;
      if (high) x ^= 0x1d;
      y >>>= 1;
    }
    return z;
  }
  function rsDivisor(degree) {
    const result = new Array(degree).fill(0);
    result[degree - 1] = 1;
    let root = 1;
    for (let i = 0; i < degree; i++) {
      for (let j = 0; j < degree; j++) {
        result[j] = gfMultiply(result[j], root);
        if (j + 1 < degree) result[j] ^= result[j + 1];
      }
      root = gfMultiply(root, 2);
    }
    return result;
  }
  function rsRemainder(data, divisor) {
    const result = new Array(divisor.length).fill(0);
    for (const byte of data) {
      const factor = byte ^ result[0];
      result.shift();
      result.push(0);
      for (let i = 0; i < result.length; i++) result[i] ^= gfMultiply(divisor[i], factor);
    }
    return result;
  }
  function appendBits(bits, value, length) {
    for (let i = length - 1; i >= 0; i--) bits.push(getBit(value, i) ? 1 : 0);
  }
  function makeCodewords(bytes, version, useUtf8Eci) {
    const bits = [];
    if (useUtf8Eci) {
      // ECI assignment 26 identifies UTF-8 for scanners that honor ECI.
      appendBits(bits, 0b0111, 4);
      appendBits(bits, 26, 8);
    }
    appendBits(bits, 0b0100, 4); // byte mode
    appendBits(bits, bytes.length, 8); // versions 1–4 use an 8-bit byte count
    for (const byte of bytes) appendBits(bits, byte, 8);
    const capacity = DATA_CW[version] * 8;
    for (let i = 0; i < Math.min(4, capacity - bits.length); i++) bits.push(0);
    while (bits.length % 8) bits.push(0);
    const data = [];
    for (let i = 0; i < bits.length; i += 8) {
      let value = 0;
      for (let j = 0; j < 8; j++) value = (value << 1) | bits[i + j];
      data.push(value);
    }
    for (let pad = 0; data.length < DATA_CW[version]; pad++) data.push(pad % 2 === 0 ? 0xec : 0x11);
    return data.concat(rsRemainder(data, rsDivisor(ECC_CW[version])));
  }
  function maskBit(mask, x, y) {
    switch (mask) {
      case 0: return (x + y) % 2 === 0;
      case 1: return y % 2 === 0;
      case 2: return x % 3 === 0;
      case 3: return (x + y) % 3 === 0;
      case 4: return (Math.floor(y / 2) + Math.floor(x / 3)) % 2 === 0;
      case 5: return (x * y) % 2 + (x * y) % 3 === 0;
      case 6: return ((x * y) % 2 + (x * y) % 3) % 2 === 0;
      case 7: return ((x + y) % 2 + (x * y) % 3) % 2 === 0;
      default: return false;
    }
  }
  function formatBits(mask) {
    const data = (1 << 3) | mask; // error correction level L
    let rem = data << 10;
    for (let i = 14; i >= 10; i--) if (getBit(rem, i)) rem ^= 0x537 << (i - 10);
    return ((data << 10) | rem) ^ 0x5412;
  }
  function buildBase(version) {
    const size = version * 4 + 17;
    const modules = Array.from({length:size}, () => new Array(size).fill(false));
    const fixed = Array.from({length:size}, () => new Array(size).fill(false));
    const set = (x, y, dark) => { if (x >= 0 && y >= 0 && x < size && y < size) { modules[y][x] = !!dark; fixed[y][x] = true; } };
    function finder(cx, cy) {
      for (let dy = -1; dy <= 7; dy++) for (let dx = -1; dx <= 7; dx++) {
        const x = cx + dx, y = cy + dy;
        const inside = dx >= 0 && dx <= 6 && dy >= 0 && dy <= 6;
        const dist = Math.max(Math.abs(dx - 3), Math.abs(dy - 3));
        set(x, y, inside && (dist === 3 || dist <= 1));
      }
    }
    finder(0, 0); finder(size - 7, 0); finder(0, size - 7);
    if (version >= 2) {
      const center = size - 7;
      for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
        set(center + dx, center + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
      }
    }
    for (let i = 8; i < size - 8; i++) {
      set(6, i, i % 2 === 0);
      set(i, 6, i % 2 === 0);
    }
    // Reserve format-information areas and the fixed dark module.
    for (let i = 0; i <= 5; i++) set(8, i, false);
    set(8, 7, false); set(8, 8, false); set(7, 8, false);
    for (let i = 9; i < 15; i++) set(14 - i, 8, false);
    for (let i = 0; i < 8; i++) set(size - 1 - i, 8, false);
    for (let i = 8; i < 15; i++) set(8, size - 15 + i, false);
    set(8, size - 8, true);
    return { size, modules, fixed };
  }
  function placeData(base, codewords) {
    const {size, modules, fixed} = base;
    const bits = [];
    for (const byte of codewords) appendBits(bits, byte, 8);
    let bitIndex = 0, upward = true;
    for (let right = size - 1; right >= 1; right -= 2) {
      if (right === 6) right--;
      for (let vert = 0; vert < size; vert++) {
        const y = upward ? size - 1 - vert : vert;
        for (let offset = 0; offset < 2; offset++) {
          const x = right - offset;
          if (!fixed[y][x]) modules[y][x] = bitIndex < bits.length ? bits[bitIndex++] === 1 : false;
        }
      }
      upward = !upward;
    }
  }
  function addFormat(base, mask) {
    const {size, modules} = base;
    const bits = formatBits(mask);
    const set = (x, y, dark) => { modules[y][x] = !!dark; };
    for (let i = 0; i <= 5; i++) set(8, i, getBit(bits, i));
    set(8, 7, getBit(bits, 6)); set(8, 8, getBit(bits, 7)); set(7, 8, getBit(bits, 8));
    for (let i = 9; i < 15; i++) set(14 - i, 8, getBit(bits, i));
    for (let i = 0; i < 8; i++) set(size - 1 - i, 8, getBit(bits, i));
    for (let i = 8; i < 15; i++) set(8, size - 15 + i, getBit(bits, i));
    set(8, size - 8, true);
  }
  function penalty(matrix) {
    const size = matrix.length;
    let score = 0, dark = 0;
    const linePenalty = line => {
      let points = 0, runColor = line[0], run = 1;
      for (let i = 1; i < line.length; i++) {
        if (line[i] === runColor) run++;
        else { if (run >= 5) points += 3 + run - 5; runColor = line[i]; run = 1; }
      }
      if (run >= 5) points += 3 + run - 5;
      const str = line.map(v => v ? '1' : '0').join('');
      for (let i = 0; i <= str.length - 11; i++) {
        const part = str.slice(i, i + 11);
        if (part === '10111010000' || part === '00001011101') points += 40;
      }
      return points;
    };
    for (let y = 0; y < size; y++) {
      score += linePenalty(matrix[y]);
      for (let x = 0; x < size; x++) if (matrix[y][x]) dark++;
    }
    for (let x = 0; x < size; x++) score += linePenalty(matrix.map(row => row[x]));
    for (let y = 0; y < size - 1; y++) for (let x = 0; x < size - 1; x++) {
      const c = matrix[y][x];
      if (c === matrix[y][x+1] && c === matrix[y+1][x] && c === matrix[y+1][x+1]) score += 3;
    }
    score += Math.floor(Math.abs(dark * 20 - size * size * 10) / (size * size)) * 10;
    return score;
  }
  function generate(text) {
    const value = String(text ?? '');
    if (!value) throw new Error('กรุณากรอกข้อความหรือ URL ก่อน');
    const bytes = Array.from(encoder.encode(value));
    const useUtf8Eci = bytes.some(byte => byte >= 0x80);
    const requiredBits = (useUtf8Eci ? 12 : 0) + 4 + 8 + bytes.length * 8;
    let version = 1;
    while (version <= 4 && requiredBits > DATA_CW[version] * 8) version++;
    if (version > 4) throw new Error('ข้อความยาวเกินความจุ QR (สูงสุด 78 ไบต์สำหรับข้อความ ASCII; UTF-8 อาจรองรับได้น้อยกว่า)');
    const codewords = makeCodewords(bytes, version, useUtf8Eci);
    const base = buildBase(version);
    placeData(base, codewords);
    let best = null, bestScore = Infinity;
    for (let mask = 0; mask < 8; mask++) {
      const candidate = base.modules.map(row => row.slice());
      for (let y = 0; y < base.size; y++) for (let x = 0; x < base.size; x++) {
        if (!base.fixed[y][x] && maskBit(mask, x, y)) candidate[y][x] = !candidate[y][x];
      }
      const formatted = {size:base.size,modules:candidate};
      addFormat(formatted, mask);
      const score = penalty(candidate);
      if (score < bestScore) { bestScore = score; best = candidate; }
    }
    return { version, size: base.size, modules: best, errorCorrection: 'L', utf8Eci: useUtf8Eci, maskPenalty: bestScore };
  }
  const api = { generate };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.PSQR = api;
})(typeof window !== 'undefined' ? window : globalThis);
