(() => {
'use strict';
const $ = id => document.getElementById(id);
const C = window.PocketShieldCore;
const enc = new TextEncoder();
const dec = new TextDecoder('utf-8', { fatal: true });
const MAX_FILE_BYTES = 15 * 1024 * 1024;
const NAV = [
  ['home','HOME','⌂','หน้าแรก'],['guide','GUIDE','?','วิธีใช้'],['pw','PASSWORD','⌘','รหัสผ่าน'],['aes','AES','⬡','เข้ารหัส'],['hash','HASH','#','แฮช'],['url','URL','⌁','ตรวจลิงก์'],
  ['jwt','JWT','◈','โทเคน'],['hdr','HEADERS','▤','ส่วนหัวเว็บ'],['qr','QR','▦','สแกน QR'],['lab','CYBER LAB','⚑','ห้องทดลอง'],['dev','DEV TOOLS','</>','เครื่องมือ Dev']
];
const TOOL_META = {
  pw:['PASSWORD LAB','สร้างรหัสผ่านและ Passphrase'],aes:['AES ENCRYPTION','เข้ารหัสข้อความและไฟล์'],hash:['HASH ENGINE','ตรวจสอบ SHA-256 / 384 / 512'],
  url:['URL INSPECTOR','วิเคราะห์ลิงก์น่าสงสัย'],jwt:['JWT INSPECTOR','ถอดรหัส Header และ Payload'],hdr:['HEADER AUDIT','ตรวจสอบ HTTP Security Headers'],
  qr:['QR SCANNER','สแกน QR ภายในอุปกรณ์'],lab:['SAFE CYBER LAB','ห้องทดลอง Cybersecurity แบบจำลอง'],dev:['DEV TOOLBOX','เครื่องมือแปลงข้อมูลสำหรับนักพัฒนา']
};
const Storage = {
  get(key, fallback) { try { const value = JSON.parse(localStorage.getItem(key)); return value == null ? fallback : value; } catch (_) { return fallback; } },
  set(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) { toast('ไม่สามารถบันทึกการตั้งค่าในอุปกรณ์นี้ได้'); } },
  remove(key) { try { localStorage.removeItem(key); } catch (_) {} }
};
let currentLanguage = Storage.get('ps.lang','th') === 'en' ? 'en' : 'th';
let cameraStream = null;
let scanFrame = 0;
let recent = Array.isArray(Storage.get('ps.recent',[])) ? Storage.get('ps.recent',[]) : [];
let favorites = Array.isArray(Storage.get('ps.fav',[])) ? Storage.get('ps.fav',[]) : [];

function toast(message) {
  const node = $('toast'); if (!node) return;
  node.textContent = message; node.classList.add('on');
  clearTimeout(toast.timer); toast.timer = setTimeout(() => node.classList.remove('on'), 2200);
}
function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = String(text);
  return node;
}
function resultCard(target, title, lines, tone='good') {
  const root = $(target); if (!root) return;
  const card = element('div','result-card');
  const heading = element('h3','',title); card.appendChild(heading);
  const list = element('ul');
  for (const line of lines) list.appendChild(element('li','',line));
  card.appendChild(list); root.replaceChildren(card);
  card.dataset.tone = tone;
}
function setOutput(target, value) { const node = $(target); if (node) node.textContent = value == null ? '' : String(value); }
function showError(target, message) {
  const node = $(target); if (!node) return;
  node.textContent = message || 'เกิดข้อผิดพลาด'; node.classList.add('error-text');
}
function copyText(text) {
  if (!text) { toast('ไม่มีข้อมูลให้คัดลอก'); return; }
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(() => toast('คัดลอกแล้ว'), () => fallbackCopy(text));
  } else fallbackCopy(text);
}
function fallbackCopy(text) {
  const area = document.createElement('textarea'); area.value = text;
  area.style.position = 'fixed'; area.style.opacity = '0'; area.style.pointerEvents = 'none';
  document.body.appendChild(area); area.select();
  let ok = false; try { ok = document.execCommand('copy'); } catch (_) {}
  area.remove(); toast(ok ? 'คัดลอกแล้ว' : 'คัดลอกไม่สำเร็จ');
}
function downloadFile(name, data, mime='application/octet-stream') {
  const blob = data instanceof Blob ? data : new Blob([data], {type:mime});
  const url = URL.createObjectURL(blob); const a = document.createElement('a');
  a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500); toast('เตรียมไฟล์ดาวน์โหลดแล้ว');
}
async function withBusy(button, action) {
  if (!button || button.disabled) return;
  const original = button.textContent; button.disabled = true; button.textContent = 'PROCESSING...';
  try { await action(); } catch (error) { toast(error && error.message ? error.message : 'เกิดข้อผิดพลาด'); }
  finally { button.disabled = false; button.textContent = original; }
}
function stopCamera() {
  if (scanFrame) cancelAnimationFrame(scanFrame); scanFrame = 0;
  if (cameraStream) { for (const track of cameraStream.getTracks()) track.stop(); cameraStream = null; }
  const video = $('qV'); if (video) { try { video.pause(); } catch (_) {} video.srcObject = null; video.style.display = 'none'; }
}
function saveRecent(id) {
  if (Storage.get('ps.recoff',false) || id === 'home' || !TOOL_META[id]) return;
  recent = [id, ...recent.filter(item => item !== id)].slice(0,5);
  Storage.set('ps.recent',recent); renderRecent();
}
function go(id) {
  const target = $(id); if (!target) return;
  if (id !== 'qr') stopCamera();
  document.querySelectorAll('main section').forEach(section => section.classList.toggle('on',section.id===id));
  document.querySelectorAll('#nav button').forEach(button => button.classList.toggle('on',button.dataset.go===id));
  saveRecent(id);
  try { history.replaceState(null,'','#'+id); } catch (_) {}
  window.scrollTo({top:0,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
}
function renderNavigation() {
  const nav = $('nav'); nav.replaceChildren();
  NAV.forEach(([id,label,icon]) => {
    const button = element('button'); button.type = 'button'; button.dataset.go = id; button.setAttribute('aria-label',label);
    button.append(element('span','nav-ico',icon),element('span','nav-label',currentLanguage==='th'?NAV.find(item=>item[0]===id)[3]:label)); nav.appendChild(button);
  });
}
function renderRecent() {
  const panel = $('recent'); if (!panel) return;
  panel.replaceChildren();
  const label = element('label',''); const checkbox = element('input'); checkbox.type = 'checkbox'; checkbox.checked = !Storage.get('ps.recoff',false); checkbox.id = 'recentToggle';
  label.append(checkbox,document.createTextNode(currentLanguage==='en'?' KEEP RECENT MODULES ON THIS DEVICE':' บันทึกโมดูลล่าสุดในอุปกรณ์นี้'));
  panel.appendChild(label);
  if (!Storage.get('ps.recoff',false) && recent.length) {
    const row = element('div','row');
    recent.filter(id => TOOL_META[id]).forEach(id => { const button=element('button','',currentLanguage==='th'?TOOL_META[id][1]:TOOL_META[id][0]); button.type='button'; button.dataset.go=id; row.appendChild(button); });
    const clear = element('button','',currentLanguage==='th'?'ล้าง':'CLEAR'); clear.type='button'; clear.addEventListener('click',()=>{recent=[];Storage.set('ps.recent',recent);renderRecent();}); row.appendChild(clear); panel.appendChild(row);
  }
  const fav = element('div','recent-favorites'); fav.textContent = currentLanguage==='en'?'FAVORITES: ':'รายการโปรด: ';
  favorites.forEach(id=>{if(!TOOL_META[id])return;const b=element('button','',currentLanguage==='th'?TOOL_META[id][1]:TOOL_META[id][0]);b.type='button';b.dataset.go=id;fav.appendChild(b);});
  panel.appendChild(fav);
}
function renderFavorites() {
  document.querySelectorAll('.tool-card[data-go]').forEach(card=>{
    const id=card.dataset.go; if(card.parentElement.classList.contains('tool-wrap'))return;
    const wrap=element('div','tool-wrap'); wrap.dataset.g=id; card.parentNode.insertBefore(wrap,card); wrap.appendChild(card);
    const star=element('button','star',favorites.includes(id)?'★':'☆');star.type='button';star.dataset.star=id;star.setAttribute('aria-label','Toggle favorite '+id);wrap.appendChild(star);
  });
}
function toggleFavorite(id) {
  favorites = favorites.includes(id) ? favorites.filter(x=>x!==id) : [...favorites,id];
  Storage.set('ps.fav',favorites);
  const button=document.querySelector('[data-star="'+CSS.escape(id)+'"]'); if(button)button.textContent=favorites.includes(id)?'★':'☆';
  renderRecent();
}
function applyLanguage() {
  document.documentElement.lang=currentLanguage;
  $('lang').textContent=currentLanguage==='en'?'TH':'EN';
  $('systemStatus').textContent=currentLanguage==='en'?'SYSTEM ONLINE':'ระบบออนไลน์';
  $('hS')?.replaceChildren(document.createTextNode(currentLanguage==='en'?'Choose a module. Execute locally. Keep control.':'เลือกเครื่องมือ ประมวลผลภายในเครื่อง และควบคุมข้อมูลด้วยตัวเอง'));
  const meta = document.querySelectorAll('.tool-card');
  meta.forEach(card=>{
    const id=card.dataset.go, title=card.querySelector('b'), desc=card.querySelector('small');
    if(title&&TOOL_META[id])title.textContent=TOOL_META[id][0];
    if(desc&&TOOL_META[id])desc.textContent=currentLanguage==='en'?TOOL_META[id][0]+' · LOCAL TOOL':TOOL_META[id][1];
  });
  document.querySelectorAll('#nav .nav-label').forEach((span,i)=>{span.textContent=currentLanguage==='th'?NAV[i][3]:NAV[i][1];});
  renderRecent();
}
function initDashboard() {
  renderNavigation(); renderFavorites(); applyLanguage();
  document.addEventListener('click',event=>{
    const goButton=event.target.closest('[data-go]'); if(goButton){go(goButton.dataset.go);return;}
    const copyButton=event.target.closest('[data-copy]'); if(copyButton){const target=$(copyButton.dataset.copy);copyText(target ? target.textContent.trim() : '');return;}
    const star=event.target.closest('[data-star]'); if(star){event.preventDefault();event.stopPropagation();toggleFavorite(star.dataset.star);}
  });
  document.addEventListener('change',event=>{
    if(event.target.id==='recentToggle'){
      Storage.set('ps.recoff',!event.target.checked); if(!event.target.checked){recent=[];Storage.set('ps.recent',recent);} renderRecent();
    }
  });
  $('theme').addEventListener('click',()=>{const root=document.documentElement;const next=root.dataset.theme==='light'?'dark':'light';root.dataset.theme=next;Storage.set('ps.theme',next);});
  const savedTheme=Storage.get('ps.theme','dark'); if(['dark','light'].includes(savedTheme))document.documentElement.dataset.theme=savedTheme;
  $('lang').addEventListener('click',()=>{currentLanguage=currentLanguage==='en'?'th':'en';Storage.set('ps.lang',currentLanguage);applyLanguage();toast(currentLanguage==='en'?'Language: English':'ภาษา: ไทย');});
  $('srch').addEventListener('input',()=>{const query=$('srch').value.trim().toLowerCase();document.querySelectorAll('.tool-wrap').forEach(w=>{w.hidden=!!query&&!w.textContent.toLowerCase().includes(query);});});
  const section=location.hash.slice(1);go($(section)?section:'home');
  window.addEventListener('hashchange',()=>{const id=location.hash.slice(1);if($(id))go(id);});
}

/* Password and passphrase */
function strengthLabel(score){return ['VERY WEAK','WEAK','FAIR','STRONG','VERY STRONG'][Math.max(0,Math.min(4,score))];}
function renderPasswordInfo(value, isPhrase=false) {
  const bar=$('pwBar'), info=$('pwInfo');
  if(isPhrase){const count=Number($('pwWords').value);const bits=C.passphraseBits(count);bar.style.width=Math.min(100,bits/100*100)+'%';bar.style.background='var(--green)';info.textContent=`PASSPHRASE · ${count} COMPOUND TOKENS · ${bits.toFixed(1)} BITS THEORETICAL SELECTION ENTROPY`;return;}
  const estimate=C.estimatePassword(value);bar.style.width=(estimate.score*25)+'%';bar.style.background=estimate.score<=1?'var(--red)':estimate.score===2?'var(--amber)':'var(--green)';info.textContent='ESTIMATED STRENGTH: '+strengthLabel(estimate.score)+' · HEURISTIC ONLY';
}
function generateCredential(){
  const phrase=$('cP').checked;let value;
  if(phrase){value=C.generatePassphrase(Number($('pwWords').value));}
  else{value=C.generatePassword({length:Number($('pwLen').value),upper:$('cU').checked,lower:$('cL').checked,numbers:$('cN').checked,symbols:$('cS').checked});}
  setOutput('pwOut',value);renderPasswordInfo(value,phrase);$('pwPhraseInfo').textContent=phrase?`${$('pwWords').value} WORDS · ${C.WORD_A.length*C.WORD_B.length} POSSIBLE TOKENS PER WORD`:'Choose at least three character classes for stronger generated passwords.';
}
function initPassword(){
  $('pwGen').addEventListener('click',()=>{try{generateCredential();toast('New credential generated locally');}catch(e){toast(e.message);}});
  ['pwLen','cU','cL','cN','cS','cP','pwWords'].forEach(id=>$(id).addEventListener('change',()=>{if(id==='pwLen')$('pwLenV').textContent=$('pwLen').value;try{generateCredential();}catch(e){toast(e.message);}}));
  $('pwChk').addEventListener('input',()=>{
    const p=$('pwChk').value;if(!p){setOutput('pwChkOut','');return;}
    const estimate=C.estimatePassword(p);const labels=['VERY WEAK','WEAK','FAIR','STRONG','VERY STRONG'];
    const box=element('div','strength-result');const badge=element('span','pill '+(estimate.score<=1?'bad':estimate.score===2?'mid':'good'),labels[estimate.score]);box.appendChild(badge);
    const note=element('p','',estimate.reasons.length?estimate.reasons.join(' · '):'No obvious weak patterns detected by this local heuristic.');box.appendChild(note);$('pwChkOut').replaceChildren(box);
  });
  generateCredential();
}

/* AES-256-GCM text and file operations; OPS1 header remains compatible with previous releases. */
function initAES(){
  $('aEnc').addEventListener('click',event=>withBusy(event.currentTarget,async()=>{
    const password=$('aPw').value,text=$('aTx').value;if(!password)throw new Error('กรุณาใส่รหัสผ่าน');if(!text)throw new Error('กรุณาใส่ข้อความ');
    const encrypted=await C.seal(password,enc.encode(text));setOutput('aOut',C.b64(encrypted));toast('Text encrypted · local only');
  }));
  $('aDec').addEventListener('click',event=>withBusy(event.currentTarget,async()=>{
    const password=$('aPw').value,text=$('aTx').value.trim();if(!password||!text)throw new Error('กรุณาใส่รหัสผ่านและ Base64');
    const bytes=C.unb64(text),plain=await C.open(password,bytes);setOutput('aOut',dec.decode(plain));toast('Text decrypted');
  }));
  function selectedFile(maxBytes=MAX_FILE_BYTES){const file=$('aFile').files[0];if(!file)throw new Error('กรุณาเลือกไฟล์');if(file.size>maxBytes)throw new Error(`ไฟล์ใหญ่เกิน ${Math.floor(maxBytes/1024/1024)} MB เพื่อป้องกันหน่วยความจำมือถือ`);return file;}
  $('aFEnc').addEventListener('click',event=>withBusy(event.currentTarget,async()=>{
    const file=selectedFile(),password=$('aPw').value;if(!password)throw new Error('กรุณาใส่รหัสผ่าน');
    const bytes=new Uint8Array(await file.arrayBuffer());try{const encrypted=await C.seal(password,bytes);downloadFile(file.name+'.obx',encrypted);}finally{bytes.fill(0);}
  }));
  $('aFDec').addEventListener('click',event=>withBusy(event.currentTarget,async()=>{
    const file=selectedFile(MAX_FILE_BYTES+53),password=$('aPw').value;if(!password)throw new Error('กรุณาใส่รหัสผ่าน');if(!file.name.toLowerCase().endsWith('.obx'))throw new Error('เลือกไฟล์ .obx ที่เข้ารหัสไว้');
    const ciphertext=new Uint8Array(await file.arrayBuffer());let plain;try{plain=await C.open(password,ciphertext);const name=file.name.replace(/\.obx$/i,'')||'decrypted.bin';downloadFile(name,plain);}finally{ciphertext.fill(0);if(plain)plain.fill(0);}
  }));
}
function initHash(){
  $('hGo').addEventListener('click',event=>withBusy(event.currentTarget,async()=>{
    const file=$('hFile').files[0],text=$('hTx').value;if(!file&&!text)throw new Error('กรุณาใส่ข้อความหรือเลือกไฟล์');
    if(file&&file.size>100*1024*1024)throw new Error('ไฟล์ใหญ่เกิน 100 MB สำหรับการคำนวณบนมือถือ');
    const data=file?await file.arrayBuffer():enc.encode(text);const digest=new Uint8Array(await crypto.subtle.digest($('hAlg').value,data));const hex=Array.from(digest,b=>b.toString(16).padStart(2,'0')).join('');setOutput('hOut',hex);compareHash();
  }));
  $('hCmp').addEventListener('input',compareHash);
  $('hDl').addEventListener('click',()=>{const hash=$('hOut').textContent.trim();if(!hash)return toast('No digest to download');downloadFile('tuizack-hash.txt',enc.encode($('hAlg').value+': '+hash+'\n'),'text/plain');});
}
function compareHash(){const actual=$('hOut').textContent.trim().toLowerCase(),expected=$('hCmp').value.trim().toLowerCase();const output=$('hCmpOut');output.replaceChildren();if(!actual||!expected)return;output.appendChild(element('span','pill '+(actual===expected?'good':'bad'),actual===expected?'MATCH':'MISMATCH'));}
function initURL(){
  $('uGo').addEventListener('click',()=>{
    try{const result=C.inspectUrl($('uIn').value);const root=element('div','result-card');
      const head=element('h3','',`RISK LEVEL // ${result.level}`);head.className=''+(result.level==='LOW'?'green-text':result.level==='MEDIUM'?'':'danger-text');root.appendChild(head);
      root.appendChild(element('p','',`HOST: ${result.hostname}`));root.appendChild(element('p','',`RISK SIGNAL SCORE: ${result.score}`));
      if(result.schemeAssumed)root.appendChild(element('p','',`NOTICE: No scheme provided; HTTPS was assumed for analysis.`));
      const list=element('ul');if(result.signals.length)result.signals.forEach(s=>list.appendChild(element('li','',s)));else list.appendChild(element('li','','No suspicious patterns detected by these local rules.'));
      root.appendChild(list);root.appendChild(element('p','micro-help','This heuristic does not visit the URL, inspect page content, query threat intelligence, or guarantee safety. Never open an unexpected link solely because its score is low.'));$('uOut').replaceChildren(root);
    }catch(error){setOutput('uOut',error.message);}
  });
}
function initJWT(){
  $('jGo').addEventListener('click',()=>{
    try{const data=C.decodeJwt($('jIn').value);const out=$('jOut');out.replaceChildren();
      const now=Math.floor(Date.now()/1000),exp=data.payload.exp;
      if(typeof exp==='number')out.appendChild(element('p','result-text',exp<now?'TOKEN TIME CHECK: EXPIRED (signature NOT verified)':'TOKEN TIME CHECK: not expired by local clock (signature NOT verified)'));
      else out.appendChild(element('p','result-text','No numeric exp claim. Signature is NOT verified.'));
      [['HEADER',data.header],['PAYLOAD',data.payload]].forEach(([label,value])=>{out.appendChild(element('h3','eyebrow',label));const pre=element('pre','output-field multiline',JSON.stringify(value,null,2));out.appendChild(pre);});
      out.appendChild(element('p','note','Decode is not signature verification. Treat all claims as untrusted until verified by the proper issuer and key.'));
    }catch(error){setOutput('jOut',error.message);}
  });
}
function initHeaders(){
  $('xGo').addEventListener('click',()=>{
    const result=C.analyzeHeaders($('xIn').value);const root=element('div','result-card');
    result.checks.forEach(check=>{const row=element('p','');const badge=element('span','pill '+(check.ok?'good':'bad'),check.ok?'PRESENT':'MISSING');row.append(badge,document.createTextNode(' '+check.name+' — '+check.detail));root.appendChild(row);});
    if(result.cookies.length){root.appendChild(element('h3','eyebrow','COOKIE FLAGS'));result.cookies.forEach(cookie=>{root.appendChild(element('p','',`${cookie.name}: Secure ${cookie.secure?'✓':'✕'} · HttpOnly ${cookie.httpOnly?'✓':'✕'} · SameSite ${cookie.sameSite?'✓':'✕'}`));});}
    $('xOut').replaceChildren(root);
  });
}
function initQR(){
  $('qUploadBtn').addEventListener('click',()=>$('qFile').click());
  function showDecoded(value){stopCamera();const text=String(value||'').slice(0,2000);if(/^(https?:\/\/|www\.)/i.test(text)||/^[a-z0-9.-]+\.[a-z]{2,}(?:[\/?#]|$)/i.test(text)){$('uIn').value=text;go('url');$('uGo').click();toast('QR decoded · inspect the URL before opening');}else setOutput('qMsg','DECODED TEXT: '+text);}
  async function getDetector(){if(!('BarcodeDetector' in window))throw new Error('This browser does not support BarcodeDetector. Try a supported Chromium browser. No external fallback is used.');return new BarcodeDetector({formats:['qr_code']});}
  $('qCam').addEventListener('click',async()=>{
    const msg=$('qMsg');msg.textContent='';
    if(!window.isSecureContext){msg.textContent='Camera access requires HTTPS or localhost.';return;}
    if(!navigator.mediaDevices?.getUserMedia){msg.textContent='Camera API is not available in this browser.';return;}
    if(cameraStream)stopCamera();
    try{const detector=await getDetector();cameraStream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'}},audio:false});const video=$('qV');video.srcObject=cameraStream;video.style.display='block';await video.play();
      const scan=async()=>{if(!cameraStream)return;try{const codes=await detector.detect(video);if(codes.length){showDecoded(codes[0].rawValue);return;}}catch(_){}scanFrame=requestAnimationFrame(scan);};scan();
    }catch(error){stopCamera();msg.textContent=error.name==='NotAllowedError'?'Camera permission denied. Allow camera access in browser site settings.':error.name==='NotFoundError'?'No camera found on this device.':(error.message||'Unable to start camera.');}
  });
  $('qStop').addEventListener('click',()=>{stopCamera();setOutput('qMsg','SCANNER STOPPED.');});
  $('qFile').addEventListener('change',async event=>{
    const file=event.target.files?.[0];if(!file)return;
    try{if(!file.type.startsWith('image/'))throw new Error('Please select an image file.');if(file.size>10*1024*1024)throw new Error('QR image is larger than the 10 MB safety limit.');if(!('createImageBitmap' in window))throw new Error('Image decoding is not supported by this browser.');const detector=await getDetector();const bitmap=await createImageBitmap(file);try{const codes=await detector.detect(bitmap);if(!codes.length)throw new Error('No QR code found in this image.');showDecoded(codes[0].rawValue);}finally{bitmap.close();}}
    catch(error){setOutput('qMsg',error.message||'Unable to decode this image.');}
    finally{event.target.value='';}
  });
  window.addEventListener('pagehide',stopCamera);
}
function initDeveloper(){
  const dev={
    b64e:s=>C.b64(enc.encode(s)),b64d:s=>dec.decode(C.unb64(s)),ue:encodeURIComponent,ud:decodeURIComponent,he:s=>s.replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch])),
    hd:s=>s.replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos);/gi,(match,entity)=>{const key=entity.toLowerCase();if(key==='amp')return '&';if(key==='lt')return '<';if(key==='gt')return '>';if(key==='quot')return '"';if(key==='apos')return "'";const numeric=key.startsWith('#x')?parseInt(key.slice(2),16):parseInt(key.slice(1),10);try{return Number.isInteger(numeric)&&numeric>0&&numeric<=0x10ffff?String.fromCodePoint(numeric):match;}catch(_){return match;}}),js:s=>JSON.stringify(JSON.parse(s),null,2),
    ts:s=>{if(!s.trim())return `ISO: ${new Date().toISOString()}\nUNIX: ${Math.floor(Date.now()/1000)}`;if(/^-?\d+$/.test(s.trim())){const n=Number(s),date=new Date(Math.abs(n)>1e11?n:n*1000);if(Number.isNaN(date.valueOf()))throw new Error('Invalid timestamp');return `ISO: ${date.toISOString()}\nLOCAL: ${date.toLocaleString()}`;}const date=new Date(s);if(Number.isNaN(date.valueOf()))throw new Error('Invalid date');return `UNIX: ${Math.floor(date.getTime()/1000)}\nISO: ${date.toISOString()}`;},
    uuid:()=>crypto.randomUUID(),tok:()=>C.b64(crypto.getRandomValues(new Uint8Array(32))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=/g,''),
    diff:()=>{const a=$('dIn').value.split('\n'),b=$('dIn2').value.split('\n'),lines=[];for(let i=0;i<Math.max(a.length,b.length);i++){if(a[i]===b[i])lines.push('  '+(a[i]||''));else{if(a[i]!==undefined)lines.push('- '+a[i]);if(b[i]!==undefined)lines.push('+ '+b[i]);}}return lines.join('\n');},
    col:s=>{const input=s.trim();let r,g,b;const hex=/^#?([0-9a-f]{6})$/i.exec(input);if(hex){const n=parseInt(hex[1],16);r=n>>16;g=(n>>8)&255;b=n&255;}else{const values=input.split(/[\s,]+/).map(Number);if(values.length!==3||values.some(v=>!Number.isInteger(v)||v<0||v>255))throw new Error('Use #RRGGBB or R,G,B values from 0 to 255');[r,g,b]=values;}const max=Math.max(r,g,b)/255,min=Math.min(r,g,b)/255,d=max-min,l=(max+min)/2;let h=0,sat=0;if(d){sat=d/(1-Math.abs(2*l-1));if(max===r/255)h=(((g-b)/255)/d)%6;else if(max===g/255)h=((b-r)/255)/d+2;else h=((r-g)/255)/d+4;h=Math.round((h*60+360)%360);}return `#${[r,g,b].map(x=>x.toString(16).padStart(2,'0')).join('')}\nrgb(${r}, ${g}, ${b})\nhsl(${h}, ${Math.round(sat*100)}%, ${Math.round(l*100)}%)`;}
  };
  document.querySelectorAll('[data-d]').forEach(button=>button.addEventListener('click',()=>{try{setOutput('dOut',dev[button.dataset.d]($('dIn').value));}catch(error){showError('dOut',error.message||'Unable to process input');}}));
}
function initLab(){
  $('sqGo').addEventListener('click',()=>{
    const user=$('sqU').value,pass=$('sqP').value,safe=$('sqSafe').checked;
    const query=safe?'SELECT * FROM users WHERE name = ? AND pass = ?':`SELECT * FROM users WHERE name = '${user}' AND pass = '${pass}'`;
    const bypass=!safe&&(/'\s*(--|#)/.test(user)||/'\s*or\s+'?(\w+)'?\s*=\s*'?\1/i.test(user+pass));
    const valid=user==='admin'&&pass==='S3cret!';
    const output=$('sqOut');output.replaceChildren(element('pre','output-field multiline',query));
    output.appendChild(element('p','result-text',bypass?'SIMULATION: Injection changes the query logic. Use parameterized queries.':valid?'SIMULATION: demo credentials matched.':'SIMULATION: authentication failed.'));
    if(safe)output.appendChild(element('p','micro-help','Safe mode keeps user values separate from SQL statement structure.'));
  });
  $('xsGo').addEventListener('click',()=>{
    const value=$('xsI').value,safe=$('xsSafe').checked,risky=/<\s*script|<[^>]+\son\w+\s*=|javascript:/i.test(value);
    const output=$('xsOut');output.replaceChildren(element('h3','eyebrow','RENDERED AS INERT TEXT'));
    output.appendChild(element('pre','output-field multiline',safe?value.replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch])):value));
    output.appendChild(element('p','result-text',risky?'SIMULATION: input contains markup/event-handler patterns. The app displays it as text and never executes it.':'No obvious executable markup pattern detected by this simple demo.'));
  });
  $('ivGo').addEventListener('click',()=>{const value=$('ivInput').value;const valid=value.length<=254&&/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);resultCard('ivOut',valid?'INPUT PASSED SAMPLE CHECK':'INPUT REJECTED',['This is a local format demonstration only.','Validate and normalize input again on the server in real applications.'],valid?'good':'bad');});
  $('cookieGo').addEventListener('click',()=>{const value=$('cookieInput').value;const flags=[['Secure',/;\s*secure(?:;|$)/i.test(value)],['HttpOnly',/;\s*httponly(?:;|$)/i.test(value)],['SameSite',/;\s*samesite=(strict|lax|none)(?:;|$)/i.test(value)]];const output=$('cookieOut');output.replaceChildren();const card=element('div','result-card');card.appendChild(element('h3','', 'COOKIE ATTRIBUTE AUDIT'));flags.forEach(([name,ok])=>{const line=element('p','');line.append(element('span','pill '+(ok?'good':'bad'),ok?'PRESENT':'MISSING'),document.createTextNode(' '+name));card.appendChild(line);});const none=/;\s*samesite=none(?:;|$)/i.test(value);if(none&&!flags[0][1])card.appendChild(element('p','note','SameSite=None requires Secure in modern browsers.'));card.dataset.tone=flags.every(x=>x[1])?'good':'bad';output.appendChild(card);});
}
function initPrivacy(){
  $('clearLocal').addEventListener('click',()=>{if(!confirm('Clear theme, language, favorites and recent module names stored on this device?'))return;['ps.lang','ps.fav','ps.recent','ps.recoff','ps.theme'].forEach(Storage.remove);location.reload();});
}
function boot(){
  if(!C){toast('Security core failed to load');return;}
  initDashboard();initPassword();initAES();initHash();initURL();initJWT();initHeaders();initQR();initDeveloper();initLab();initPrivacy();
  if('serviceWorker' in navigator && window.isSecureContext){window.addEventListener('load',()=>navigator.serviceWorker.register('/sw.js').then(reg=>{const hadController=Boolean(navigator.serviceWorker.controller);reg.addEventListener('updatefound',()=>{const worker=reg.installing;if(!hadController||!worker)return;worker.addEventListener('statechange',()=>{if(worker.state==='installed'&&navigator.serviceWorker.controller)toast('Update available — reload after the new version installs.');});});}).catch(()=>toast('Offline mode unavailable in this browser.')));}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
