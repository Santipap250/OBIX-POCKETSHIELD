(function(root){
'use strict';
const WORD_A = root.WORD_A || [];
const WORD_B = root.WORD_B || [];
const COMMON = new Set(['password','password1','password123','123456','12345678','123456789','qwerty','qwerty123','admin','administrator','letmein','welcome','iloveyou','monkey','dragon','abc123','111111','000000','changeme','secret','passw0rd','football','master','login','sunshine','princess']);
const KEYBOARD = ['qwerty','asdfgh','zxcvbn','qazwsx','1qaz2wsx','0987654321','qwertyuiop','asdfghjkl','zxcvbnm'];
const SEQUENCES = ['0123456789','9876543210','abcdefghijklmnopqrstuvwxyz','zyxwvutsrqponmlkjihgfedcba'];
const enc = new TextEncoder();
function randomInt(max){
  if(!Number.isSafeInteger(max)||max<1||max>0x100000000)throw new RangeError('Invalid random range');
  const limit=Math.floor(0x100000000/max)*max;
  const buf=new Uint32Array(1); let value;
  do{crypto.getRandomValues(buf);value=buf[0]}while(value>=limit);
  return value%max;
}
function generatePassword({length=20,upper=true,lower=true,numbers=true,symbols=true}={}){
  const groups=[];
  if(upper)groups.push('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
  if(lower)groups.push('abcdefghijklmnopqrstuvwxyz');
  if(numbers)groups.push('0123456789');
  if(symbols)groups.push('!@#$%^&*()-_=+[]{};:,.?');
  if(!groups.length)throw new Error('เลือกชุดอักขระอย่างน้อยหนึ่งชุด');
  if(!Number.isInteger(length)||length<8||length>64)throw new RangeError('ความยาวต้องอยู่ระหว่าง 8–64 ตัวอักษร');
  if(groups.length>length)throw new RangeError('ความยาวไม่พอสำหรับชุดอักขระที่เลือก');
  const all=groups.join('');
  const chars=groups.map(g=>g[randomInt(g.length)]);
  while(chars.length<length)chars.push(all[randomInt(all.length)]);
  for(let i=chars.length-1;i>0;i--){const j=randomInt(i+1);[chars[i],chars[j]]=[chars[j],chars[i]];}
  return chars.join('');
}
function generatePassphrase(count=7){
  if(!Number.isInteger(count)||count<6||count>10)throw new RangeError('จำนวนคำต้องอยู่ระหว่าง 6–10');
  const words=[];
  for(let i=0;i<count;i++)words.push(WORD_A[randomInt(WORD_A.length)]+'-'+WORD_B[randomInt(WORD_B.length)]);
  return words.join('-');
}
function passphraseBits(count=7){return count*Math.log2(WORD_A.length*WORD_B.length);}
function estimatePassword(password){
  const p=String(password||'');
  if(!p)return{score:0,label:'ยังไม่ได้กรอก',en:'Not entered',reasons:[]};
  const lower=p.toLowerCase(), reasons=[];
  let score=0;
  const unique=new Set(p).size, uniqueRatio=unique/p.length;
  const repeatedChar=/(.)\1{2,}/u.test(p);
  const repeatedBlock=/^(..+)\1{1,}$/u.test(p);
  const hasSequence=SEQUENCES.some(seq=>{for(let n=4;n<=Math.min(8,seq.length);n++){for(let i=0;i<=seq.length-n;i++){const part=seq.slice(i,i+n);if(lower.includes(part))return true;}}return false;});
  const keyboard=KEYBOARD.some(pattern=>lower.includes(pattern));
  const common=COMMON.has(lower)||[...COMMON].some(word=>word.length>=6&&lower.includes(word));
  const digitsOnly=/^\d+$/.test(p), lettersOnly=/^[a-z]+$/i.test(p);
  const years=/(19|20)\d{2}/.test(p);
  if(common){reasons.push('ตรงกับหรือมีส่วนของรหัสผ่านที่พบบ่อย');score=0;}
  else {
    if(p.length>=8)score++;
    if(p.length>=12)score++;
    if(p.length>=16)score++;
    const groups=[/[a-z]/.test(p),/[A-Z]/.test(p),/\d/.test(p),/[^A-Za-z0-9]/.test(p)].filter(Boolean).length;
    if(groups>=2)score++;
    if(groups>=3)score++;
    if(groups===4)score++;
  }
  if(repeatedChar){score=0;reasons.push('มีอักขระเดิมซ้ำติดกันหลายครั้ง');}
  if(repeatedBlock){score=Math.min(score,0);reasons.push('มีรูปแบบชุดอักขระซ้ำ');}
  if(uniqueRatio<0.35){score=Math.min(score,0);reasons.push('ความหลากหลายของอักขระต่ำมาก');}
  else if(uniqueRatio<0.55){score=Math.min(score,2);reasons.push('มีอักขระซ้ำจำนวนมาก');}
  if(hasSequence){score=Math.min(score,2);reasons.push('มีลำดับตัวเลขหรือตัวอักษรที่คาดเดาได้');}
  if(keyboard){score=Math.min(score,2);reasons.push('มีรูปแบบแป้นพิมพ์ที่พบบ่อย');}
  if(digitsOnly||lettersOnly){score=Math.min(score,2);reasons.push('ใช้ชุดอักขระเพียงประเภทเดียว');}
  if(years){score=Math.min(score,2);reasons.push('มีปี ค.ศ. ซึ่งคาดเดาได้และมักใช้เป็นส่วนท้ายของรหัสผ่าน');}
  if(p.length<12)reasons.push('แนะนำให้ใช้ความยาวอย่างน้อย 12 ตัวอักษร');
  if(p.length>=20&&uniqueRatio>=0.7&&groupsCount(p)>=3&&!hasSequence&&!keyboard&&!common&&!repeatedBlock&&!repeatedChar&&!years)score=Math.max(score,4);
  score=Math.max(0,Math.min(4,score));
  const labels=[['อ่อนมาก','Very weak'],['อ่อน','Weak'],['พอใช้','Fair'],['แข็งแรง','Strong'],['แข็งแรงมาก','Very strong']];
  return{score,label:labels[score][0],en:labels[score][1],reasons,approximate:true};
}
function groupsCount(p){return [/[a-z]/.test(p),/[A-Z]/.test(p),/\d/.test(p),/[^A-Za-z0-9]/.test(p)].filter(Boolean).length;}
const ITER=600000, MAGIC=[0x4f,0x50,0x53,0x31], HEADER=37, MIN_ITER=100000, MAX_ITER=1000000;
function b64(bytes){let binary='';for(let i=0;i<bytes.length;i+=0x8000)binary+=String.fromCharCode(...bytes.subarray(i,i+0x8000));return btoa(binary);}
function unb64(str){const clean=String(str).replace(/\s/g,'');if(!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(clean))throw new Error('ข้อมูล Base64 ไม่ถูกต้อง');const binary=atob(clean);return Uint8Array.from(binary,c=>c.charCodeAt(0));}
async function deriveKey(password,salt,iterations){const material=await crypto.subtle.importKey('raw',enc.encode(password),'PBKDF2',false,['deriveKey']);return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations,hash:'SHA-256'},material,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);}
async function seal(password,data){if(!password)throw new Error('กรุณากำหนดรหัสผ่าน');const input=data instanceof Uint8Array?data:new Uint8Array(data);const salt=crypto.getRandomValues(new Uint8Array(16)),iv=crypto.getRandomValues(new Uint8Array(12));const key=await deriveKey(password,salt,ITER);const cipher=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv,tagLength:128},key,input));const header=new Uint8Array(HEADER);header.set(MAGIC,0);header[4]=1;new DataView(header.buffer).setUint32(5,ITER);header.set(salt,9);header.set(iv,25);const output=new Uint8Array(HEADER+cipher.length);output.set(header);output.set(cipher,HEADER);return output;}
async function open(password,input){const bytes=input instanceof Uint8Array?input:new Uint8Array(input);if(bytes.length<HEADER+16||MAGIC.some((b,i)=>bytes[i]!==b)||bytes[4]!==1)throw new Error('รูปแบบไฟล์ไม่ถูกต้องหรือไม่รองรับ');const iterations=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength).getUint32(5);if(iterations<MIN_ITER||iterations>MAX_ITER)throw new Error('ส่วนหัวระบุจำนวนรอบ PBKDF2 ที่ไม่รองรับ');const key=await deriveKey(password,bytes.slice(9,25),iterations);try{return new Uint8Array(await crypto.subtle.decrypt({name:'AES-GCM',iv:bytes.slice(25,37),tagLength:128},key,bytes.slice(HEADER)));}catch(_){throw new Error('รหัสผ่านไม่ถูกต้องหรือข้อมูลถูกแก้ไข');}}
const COMMON_BRANDS=[
 {name:'PayPal',domains:['paypal.com']},{name:'Google',domains:['google.com','google.co.th']},{name:'Apple',domains:['apple.com','icloud.com']},{name:'Microsoft',domains:['microsoft.com','live.com','office.com','outlook.com']},{name:'Facebook',domains:['facebook.com','meta.com']},{name:'Instagram',domains:['instagram.com']},{name:'LINE',domains:['line.me','line.biz']},{name:'KBank',domains:['kasikornbank.com','kbank.co.th']},{name:'SCB',domains:['scb.co.th']},{name:'Bangkok Bank',domains:['bangkokbank.com','bangkokbank.co.th']},{name:'Krungsri',domains:['krungsri.com','krungsri.co.th']},{name:'Amazon',domains:['amazon.com','amazon.co.uk','amazon.co.jp']},{name:'Netflix',domains:['netflix.com']},{name:'Lazada',domains:['lazada.co.th','lazada.com']},{name:'Shopee',domains:['shopee.co.th','shopee.com']},{name:'DHL',domains:['dhl.com']},{name:'Thailand Post',domains:['thailandpost.co.th']}
];
const SHORTENERS=new Set(['bit.ly','tinyurl.com','t.co','goo.gl','ow.ly','is.gd','buff.ly','cutt.ly','rebrand.ly','shorturl.at','t.ly']);
function inspectUrl(rawInput){const raw=String(rawInput||'').trim();if(!raw)throw new Error('กรุณาวาง URL ก่อน');const hasScheme=/^[a-z][a-z0-9+.-]*:/i.test(raw);let url;try{url=new URL(hasScheme?raw:'https://'+raw);}catch(_){throw new Error('รูปแบบ URL ไม่ถูกต้อง');}const host=(url.hostname||'').toLowerCase();if(!host)throw new Error('ไม่พบชื่อโดเมน');let score=0;const signals=[];const add=(n,s)=>{score+=n;signals.push(s);};
 if(!['http:','https:'].includes(url.protocol))add(4,'โปรโตคอลนี้ไม่ใช่เว็บ HTTP/HTTPS ทั่วไป');else if(url.protocol==='http:')add(2,'ไม่ได้ใช้ HTTPS');
 if(/^\d{1,3}(?:\.\d{1,3}){3}$/.test(host)||host.includes(':'))add(3,'ใช้ IP Address แทนชื่อโดเมน');
 if(url.username||url.password)add(3,'มีข้อมูลผู้ใช้ฝังอยู่ใน URL');
 if(url.port&&!['80','443'].includes(url.port))add(2,'ใช้พอร์ตที่ไม่ใช่ค่าทั่วไป');
 if(host.split('.').some(label=>label.startsWith('xn--')))add(3,'ชื่อโดเมนมี Punycode');
 try{decodeURIComponent(raw);}catch(_){add(2,'มี Percent-Encoding ที่ไม่สมบูรณ์');}
 if(SHORTENERS.has(host))add(2,'เป็นบริการย่อลิงก์ที่ซ่อนปลายทาง');
 const labels=host.split('.');if(labels.length>5)add(1,'มี Subdomain หลายระดับผิดปกติ');
 const tld=labels.at(-1)||'';if(['zip','mov','top','xyz','click','work','country','gq','tk','ml'].includes(tld))add(1,'ใช้นามสกุลโดเมนที่ควรตรวจสอบเพิ่มเติม');
 for(const brand of COMMON_BRANDS){const official=brand.domains.some(d=>host===d||host.endsWith('.'+d));if(official)continue;const terms=labels.flatMap(x=>x.split(/[-_]/));const lookalike=brand.name==='LINE'?terms.includes('line'):terms.some(t=>brand.domains.some(d=>{const root=d.split('.')[0];return t===root||(t.length>root.length&&t.startsWith(root));}));if(lookalike)add(4,'ชื่อโดเมนอาจเลียนแบบ '+brand.name+' แต่ไม่ใช่โดเมนทางการที่ระบุ');}
 if((host.match(/-/g)||[]).length>2)add(1,'โดเมนมีเครื่องหมายขีดหลายตำแหน่ง');
 const level=score>=4?'HIGH':score>=2?'MEDIUM':'LOW';return{url,hostname:host,score,level,signals,schemeAssumed:!hasScheme};}
function decodeJwt(token){const parts=String(token||'').trim().replace(/^Bearer\s+/i,'').split('.');if(parts.length!==3)throw new Error('JWT ต้องมี 3 ส่วนคั่นด้วยจุด');const decodePart=part=>{const base=part.replace(/-/g,'+').replace(/_/g,'/').padEnd(Math.ceil(part.length/4)*4,'=');const binary=atob(base);const bytes=Uint8Array.from(binary,c=>c.charCodeAt(0));return JSON.parse(new TextDecoder().decode(bytes));};return{header:decodePart(parts[0]),payload:decodePart(parts[1]),signature:parts[2]};}
function analyzeHeaders(text){const headers={},cookies=[];for(const line of String(text).split(/\r?\n/)){const i=line.indexOf(':');if(i<1)continue;const k=line.slice(0,i).trim().toLowerCase(),v=line.slice(i+1).trim();if(k==='set-cookie')cookies.push(v);else headers[k]=v;}const checks=[];const add=(name,ok,detail)=>checks.push({name,ok,detail});
 add('Content-Security-Policy',!!headers['content-security-policy'],'กำหนดแหล่งที่มาของเนื้อหาและสคริปต์');add('Strict-Transport-Security',/max-age=(\d{7,})/i.test(headers['strict-transport-security']||''),'ควรกำหนด HSTS ที่มีอายุเหมาะสม');add('X-Content-Type-Options',/nosniff/i.test(headers['x-content-type-options']||''),'แนะนำค่า nosniff');add('X-Frame-Options',/deny|sameorigin/i.test(headers['x-frame-options']||''),'ป้องกันการฝังหน้าเว็บใน Frame ที่ไม่อนุญาต');add('Referrer-Policy',!!headers['referrer-policy'],'จำกัดข้อมูล Referrer');add('Permissions-Policy',!!headers['permissions-policy'],'จำกัดสิทธิ์กล้อง ไมโครโฟน และตำแหน่ง');
 const cookieResults=cookies.map(value=>({name:value.split('=')[0]||'cookie',secure:/;\s*secure(?:;|$)/i.test(value),httpOnly:/;\s*httponly(?:;|$)/i.test(value),sameSite:/;\s*samesite=(strict|lax|none)(?:;|$)/i.test(value)}));return{checks,cookies:cookieResults};}
const api={randomInt,generatePassword,generatePassphrase,passphraseBits,estimatePassword,seal,open,inspectUrl,decodeJwt,analyzeHeaders,b64,unb64,WORD_A,WORD_B};
if(typeof module!=='undefined'&&module.exports)module.exports=api;
root.PocketShieldCore=api;
})(typeof globalThis!=='undefined'?globalThis:this);
