# สคริปต์นำเสนอ TUIzACK v1.0.2 Hacker Edition

**ระยะเวลาแนะนำ:** 10–15 นาที
**กลุ่มผู้ฟัง:** ทีม Product, Engineering, Security และผู้เกี่ยวข้องด้านการนำไปใช้งาน
**เว็บไซต์ Production:** https://obix-pocketshield.vercel.app

---

## 1. เปิดการนำเสนอ — 45 วินาที

สวัสดีครับ/ค่ะ วันนี้ผม/ดิฉันจะนำเสนอ **TUIzACK v1.0.2 Hacker Edition** ซึ่งเป็นชุดเครื่องมือด้าน Cybersecurity, Privacy และ Developer Utilities ที่ออกแบบให้ประมวลผลภายในเบราว์เซอร์ของผู้ใช้เป็นหลัก

แนวคิดสำคัญของโปรเจกต์นี้คือ **local-first และ privacy-first** ผู้ใช้ไม่ต้องสมัครสมาชิก ไม่มีฐานข้อมูล ไม่มี API key ที่ต้องตั้งค่า และเครื่องมือหลักไม่ได้ส่ง password, encryption key, plaintext, ไฟล์ หรือรูป QR ออกไปยังบริการภายนอก

เวอร์ชันนี้ไม่ได้เป็นแค่การเปลี่ยนสีของหน้าเว็บ แต่เป็นการปรับประสบการณ์ทั้งหมดไปเป็น **Hacker/Cyber Operations Interface** พร้อมการตรวจสอบด้าน security, PWA, responsive layout และ production deployment จริง

---

## 2. ปัญหาที่โปรเจกต์แก้ — 1 นาที

ปัญหาที่เราเห็นในเครื่องมือด้านความปลอดภัยทั่วไปมีอยู่สามเรื่องหลัก

เรื่องแรกคือ ผู้ใช้ไม่แน่ใจว่าข้อมูลสำคัญถูกส่งไปที่ไหน โดยเฉพาะ password, ไฟล์ และข้อความที่นำไปเข้ารหัสหรือ hash

เรื่องที่สองคือ เครื่องมือหลายตัวแสดงผลเหมือนรับประกันความปลอดภัย ทั้งที่จริงเป็นเพียง heuristic หรือการวิเคราะห์รูปแบบเบื้องต้น

เรื่องที่สามคือประสบการณ์ใช้งานบนมือถือมักถูกมองข้าม ทั้งที่ผู้ใช้จำนวนมากต้องการตรวจ URL, สร้างรหัสผ่าน, ตรวจ hash หรือเข้ารหัสไฟล์จากโทรศัพท์

POCKETSHIELD จึงเลือกแนวทางที่ชัดเจน: ประมวลผลภายในเครื่อง แจ้งข้อจำกัดตรงไปตรงมา และออกแบบ mobile-first โดยยังคงใช้งานได้ดีบน desktop

---

## 3. ภาพรวมฟีเจอร์ — 1 นาที

ใน v1.0.2 มีโมดูลหลัก 9 กลุ่ม

1. **Password Lab** — สร้าง password ด้วย CSPRNG และสร้าง passphrase จาก vocabulary แบบ compound token จำนวน 6,400 รูปแบบ
2. **AES Encryption** — AES-256-GCM พร้อม PBKDF2-SHA256 จำนวน 600,000 รอบ และรองรับไฟล์ `.obx` แบบ OPS1 v1 เดิม
3. **Hash Engine** — SHA-256, SHA-384 และ SHA-512 สำหรับข้อความและไฟล์
4. **URL Inspector** — ตรวจ URL แบบ local heuristic เช่น HTTP, IP host, credentials, shortener, Punycode และโดเมนเลียนแบบ
5. **JWT Inspector** — decode header และ payload โดยระบุชัดว่าไม่ได้ตรวจสอบ signature
6. **Header Audit** — วิเคราะห์ HTTP Security Headers และ cookie flags จากข้อมูลที่ผู้ใช้ป้อน
7. **QR Scanner** — ใช้ browser `BarcodeDetector` หากรองรับ และไม่ส่งภาพไป third-party
8. **Safe Cyber Lab** — จำลอง SQL Injection, XSS, Input Validation, Cookie และ Session Security แบบไม่โจมตีระบบจริง
9. **Developer Toolbox** — Base64, URL encode/decode, JSON, timestamp, UUID, HTML entity, color และ text diff

---

## 4. จุดเด่นด้าน Hacker Edition Design — 1 นาที

สิ่งที่ทีมจะเห็นทันทีคือ visual language ที่เปลี่ยนเป็น Dark Cyber Interface

เราใช้พื้นหลัง OLED/dark, neon green accent, terminal panel, grid และ scanline effect รวมถึง typography แบบ technical monospace

บนมือถือจะมี bottom navigation เพื่อให้เข้าถึงโมดูลหลักได้ง่าย ส่วนบน desktop จะใช้พื้นที่หน้าจอเพื่อแสดง dashboard, status console และ module directory อย่างเป็นระบบ

การออกแบบไม่ได้ใส่ animation เพื่อความสวยงามอย่างเดียว แต่พยายามรักษาสมดุลระหว่าง identity ของ Hacker Edition กับ performance โดยเฉพาะบนมือถือ และรองรับ reduced-motion behavior ตามที่ browser ตั้งค่าไว้

**ประโยคสำหรับชี้บนหน้าจอ:**

> “หน้าตาเป็น Hacker Edition แต่หลักการทำงานยังคงเน้นความปลอดภัย ความโปร่งใส และไม่ทำให้ผู้ใช้เข้าใจผิดว่าเป็นระบบป้องกันภัยแบบสมบูรณ์”

---

## 5. Demo 1: Password และ Passphrase — 1 นาที

ตอนนี้ผม/ดิฉันจะเปิด Password Lab

กดสร้าง password ใหม่ ระบบใช้ `crypto.getRandomValues` ไม่ใช่ `Math.random` และสามารถกำหนดความยาวกับกลุ่ม character ได้

ถัดมาคือ strength checker ผลลัพธ์เป็นการประเมินแบบ conservative heuristic ระบบจะลดระดับรหัสผ่านที่มีรูปแบบซ้ำ, sequence, keyboard pattern, password ที่พบบ่อย หรือใช้ character group เดียว

จุดสำคัญคือผลลัพธ์ไม่ได้อ้างว่าเป็น entropy ที่แน่นอน และไม่ได้ query ฐานข้อมูล password ที่รั่วไหล

สำหรับ passphrase ระบบใช้ compound vocabulary 6,400 รูปแบบ สามารถเลือกจำนวน token ได้ 6 ถึง 10 token และระบุสมมติฐานทางทฤษฎีไว้อย่างชัดเจนว่าเป็นการคำนวณภายใต้ uniform selection

---

## 6. Demo 2: AES-256-GCM — 1 นาที 30 วินาที

ต่อไปคือ AES Encryption ซึ่งเป็นหนึ่งในฟีเจอร์สำคัญที่สุดของโปรเจกต์

ผู้ใช้สามารถเข้ารหัสข้อความหรือไฟล์ภายใน browser ได้ ระบบใช้ AES-256-GCM และ derive key ด้วย PBKDF2-SHA256 จำนวน 600,000 รอบ มี salt และ IV ใหม่สำหรับการเข้ารหัสแต่ละครั้ง

ผม/ดิฉันจะทดลองเข้ารหัสข้อความที่มีทั้งภาษาไทยและ emoji จากนั้นถอดรหัสกลับด้วย password เดิม เพื่อยืนยันว่าได้ข้อมูลเดิมจริง

จากนั้นจะลองใช้ password ผิด ระบบต้อง reject และไม่คืน plaintext ออกมา

ไฟล์ที่สร้างใช้รูปแบบ OPS1 v1 ซึ่งยังรองรับการถอดรหัสไฟล์จากเวอร์ชันก่อนหน้า และจำกัดขนาดไฟล์ไว้ที่ 15 MiB เพื่อควบคุม memory pressure บนอุปกรณ์มือถือ

**ข้อความที่ควรย้ำ:**

> “ตัวแอปไม่ได้ส่ง password หรือไฟล์ขึ้น server แต่ความปลอดภัยสุดท้ายยังขึ้นกับการเก็บ password ของผู้ใช้ หากลืม password ไฟล์จะไม่สามารถกู้คืนได้”

---

## 7. Demo 3: URL Inspector และ JWT — 1 นาที

URL Inspector เป็น rule-based local analysis ไม่ใช่ live threat intelligence

ผม/ดิฉันจะเริ่มจาก `https://example.com` ซึ่งควรได้ระดับความเสี่ยงต่ำ จากนั้นทดลองโดเมนลักษณะ `google.co.th.evil.example` ระบบจะตรวจพบว่าเป็นโดเมนเลียนแบบและจัดระดับสูง

ระบบยังตรวจ HTTP, IP address, credentials ใน URL, shortener, Punycode, malformed percent encoding และ unusual port ได้

สำหรับ JWT Inspector ระบบ decode ได้เฉพาะ header และ payload โดยไม่ตรวจสอบลายเซ็น ดังนั้นการเห็น payload ที่อ่านได้ไม่ได้แปลว่า token ถูกต้องหรือเชื่อถือได้

**ประโยคสำคัญ:**

> “เครื่องมือช่วยให้เราเห็นสัญญาณที่ควรระวัง แต่ไม่ได้รับประกันว่า URL ปลอดภัย 100% และไม่ได้แทนที่การตรวจสอบจากระบบรักษาความปลอดภัยจริง”

---

## 8. Demo 4: QR Scanner และ Privacy — 1 นาที

QR Scanner ใช้ browser `BarcodeDetector` สำหรับกล้องและรูปภาพ

หาก browser ไม่รองรับ API นี้ ระบบจะแจ้งข้อจำกัดอย่างชัดเจน และไม่มีการส่งรูปไป third-party หรือใช้ fallback decoder ภายนอกใน release นี้

ถ้า QR ที่อ่านได้เป็น URL ระบบจะนำ URL ไปตรวจใน URL Inspector ก่อน และไม่เปิดปลายทางให้อัตโนมัติ

นี่เป็นตัวอย่างของหลักการ privacy และ safe-by-default: การสแกนไม่ได้หมายความว่าเราควรเปิดลิงก์ทันที

ใน browser ที่ผม/ดิฉันใช้สำหรับ automated test ไม่มี `BarcodeDetector` จึงทดสอบเส้นทาง unsupported-browser และตรวจว่าระบบแจ้งข้อความถูกต้อง ส่วนการเปิดกล้องจริงบน Android/iOS ยังต้องยืนยันบนอุปกรณ์จริง

---

## 9. Security และ Production Readiness — 1 นาที 30 วินาที

ในด้าน security เราตรวจสอบหลายชั้น

- Content Security Policy จำกัด script ให้มาจาก same-origin และไม่มี inline script
- Permissions Policy อนุญาตเฉพาะ camera same-origin และปิด microphone/geolocation
- มี HSTS, `X-Content-Type-Options`, `X-Frame-Options`, Referrer Policy และ Cross-Origin Resource Policy
- ไม่มี API key, token, password หรือ private key ใน repository
- Service Worker cache เฉพาะ asset ของแอป ไม่ cache URL ภายนอกหรือข้อมูลผู้ใช้
- Dynamic output ใช้ DOM construction/text nodes แทนการนำ input ไปแทรกเป็น HTML โดยตรง
- `npm audit` พบ 0 vulnerabilities

Production deployment ตรวจแล้วที่:

https://obix-pocketshield.vercel.app

response กลับด้วย HTTPS และ security headers ครบตามที่กำหนด และ browser smoke test หลัง deploy ยืนยันว่า module หลักโหลดได้และไม่มี runtime error ที่จับได้

---

## 10. ผลการทดสอบ — 1 นาที

ผลการตรวจสอบที่สำคัญมีดังนี้

- `npm test`: **23 ผ่าน, 0 ล้มเหลว**
- `npm run build`: ผ่าน
- `npm audit`: **0 vulnerabilities**
- Browser smoke test: ผ่าน
- Responsive screenshots: ตรวจที่ 320, 390, 768 และ 1440 pixels
- Production browser test: ผ่าน
- AES encrypt/decrypt และ wrong-password rejection: ผ่าน
- Service Worker registration/cache: ผ่าน
- GitHub Actions CI: ผ่าน
- Vercel preview และ production deployment: ผ่าน

หลัง production smoke test เราพบและแก้ปัญหา update toast ที่แสดงหลอกตอนติดตั้ง Service Worker ครั้งแรก แล้วรัน CI, merge และ deploy ซ้ำจนผ่านอีกครั้ง

---

## 11. สถานะ GitHub และ Release — 45 วินาที

โค้ดถูกนำขึ้น repository:

https://github.com/Santipap250/OBIX-POCKETSHIELD

PR หลักถูก merge เข้า `main` ที่ commit:

```text
3c7b3346ae34f388eb1183cc2314bcb48c2af159
```

จากนั้น hotfix เรื่อง Service Worker ถูก merge เพิ่มที่ commit:

```text
a6e3e11a568490fedb663b2bbe8cd66f38a7a994
```

ดังนั้น version ที่อยู่บน production เป็น Hacker Edition พร้อม hotfix ล่าสุด ไม่ใช่ ZIP เดิมก่อนแก้

---

## 12. ข้อจำกัดที่ควรสื่อสารอย่างตรงไปตรงมา — 1 นาที

แม้ release นี้พร้อมใช้งานบน production แต่ยังมีข้อจำกัดที่ควรเข้าใจ

1. QR Scanner ต้องพึ่งพา browser `BarcodeDetector` และยังต้องทดสอบกล้องจริงบนอุปกรณ์เป้าหมาย
2. ยังไม่ได้อ้างว่า PWA offline install ผ่านการทดสอบบน Android/iOS ทุกอุปกรณ์
3. การเข้ารหัสไฟล์ขนาด 15 MiB บนอุปกรณ์ low-memory ควรทดสอบบนเครื่องจริงก่อนใช้งานเป็นวงกว้าง
4. Password strength เป็น heuristic ไม่ใช่ breach database หรือ entropy calculator แบบสมบูรณ์
5. URL Inspector ไม่ใช่ antivirus, phishing blocklist หรือ real-time reputation service
6. Cyber Lab เป็นสื่อการเรียนรู้แบบจำลอง ไม่ได้โจมตีระบบภายนอก

การระบุข้อจำกัดเหล่านี้เป็นส่วนหนึ่งของ security posture ไม่ใช่จุดอ่อนของการนำเสนอ

---

## 13. ปิดการนำเสนอ — 30 วินาที

สรุปแล้ว TUIzACK v1.0.2 Hacker Edition มีเป้าหมายสามอย่าง

หนึ่ง ทำให้เครื่องมือด้านความปลอดภัยที่ใช้บ่อยเข้าถึงง่ายบนมือถือและ desktop

สอง ประมวลผลข้อมูลสำคัญภายในเครื่อง และสื่อสารข้อจำกัดอย่างโปร่งใส

สาม ส่งมอบ production release ที่ผ่าน automated tests, browser checks, security header validation และ deployment verification จริง

เว็บไซต์พร้อมให้ทีมทดลองใช้งานได้ที่:

https://obix-pocketshield.vercel.app

ขอบคุณครับ/ค่ะ ยินดีรับคำถามและข้อเสนอแนะจากทีม

---

# Demo Checklist สำหรับผู้นำเสนอ

ก่อนเริ่ม demo ให้เปิดแท็บต่อไปนี้ไว้:

1. Production: `https://obix-pocketshield.vercel.app`
2. GitHub repository: `https://github.com/Santipap250/OBIX-POCKETSHIELD`
3. README หรือ Verification Report สำหรับอ้างอิงผลทดสอบ

ลำดับ demo ที่แนะนำ:

1. หน้า Home และ visual identity
2. Password Lab
3. Passphrase generation
4. AES text encryption/decryption
5. URL Inspector: URL ปกติและ lookalike domain
6. JWT Inspector พร้อมย้ำว่าไม่ verify signature
7. Header Audit และ Cookie Analyzer
8. QR Scanner unsupported-browser behavior
9. Language toggle และ search/filter
10. Privacy Protocol และ clear local preferences

## คำถามที่ทีมอาจถาม

### ข้อมูลถูกส่งออกไปหรือไม่?

เครื่องมือหลักประมวลผลใน browser และไม่มี backend/API สำหรับรับ password, plaintext, encryption key, ไฟล์ หรือ QR image การเชื่อมต่อที่เห็นในการใช้งาน production เป็นการโหลด static assets และ Service Worker ของเว็บไซต์เท่านั้น

### AES ใช้มาตรฐานอะไร?

ใช้ AES-256-GCM พร้อม PBKDF2-SHA256 จำนวน 600,000 รอบ, random salt 16 bytes และ random IV 12 bytes โดยคงความเข้ากันได้กับ OPS1 v1

### ทำไม QR Scanner บางเครื่องใช้ไม่ได้?

เพราะ `BarcodeDetector` ไม่รองรับในทุก browser release นี้จึงแจ้งข้อจำกัดตรงไปตรงมา และไม่อัปโหลดรูปไป third-party เพื่อแก้ข้อจำกัดดังกล่าว

### URL Inspector เชื่อถือได้แค่ไหน?

เป็น heuristic สำหรับชี้สัญญาณที่ควรตรวจสอบต่อ ไม่ใช่ระบบ reputation หรือ antivirus และไม่ควรใช้ผล LOW เป็นการรับประกันความปลอดภัย

### ทำไมไม่มี backend?

เพราะเป้าหมายของโปรเจกต์คือ local-first privacy model ลดพื้นผิวการโจมตี ลดความเสี่ยงจากข้อมูลรั่วไหล และลดความจำเป็นในการเก็บข้อมูลผู้ใช้

### พร้อมใช้งานจริงหรือยัง?

พร้อมใช้งานในฐานะ static web/PWA production release และผ่าน automated/production smoke tests แล้ว ส่วนกล้องจริง, PWA installation และ performance บนอุปกรณ์เฉพาะรุ่นควรทำ device validation เพิ่มก่อนประกาศรองรับอย่างเป็นทางการ
