# เริ่มใช้งาน OBIX POCKETSHIELD v1.0.2

## นำขึ้น GitHub

1. แตกไฟล์ ZIP
2. เปิดโฟลเดอร์ `OBIX-POCKETSHIELD`
3. อัปโหลด **ไฟล์และโฟลเดอร์ภายในทั้งหมด** ไปยัง Root ของ Repository อย่าให้ซ้อนในโฟลเดอร์อีกชั้น
4. ตรวจว่ามี `index.html`, `app.js`, `core.js`, `wordlist.js`, `style.css`, `package.json` และ `vercel.json` อยู่ระดับบนสุด
5. Commit และ Push ขึ้น Branch `main` หรือเปิด Pull Request ให้ตรวจ CI ก่อน Merge

## Deploy ด้วย Vercel

- Framework Preset: `Other`
- Build Command: `npm run build`
- Output Directory: `.`
- Install Command: `npm ci` (หรือ Auto)
- Environment Variables: ไม่ต้องตั้ง

เมื่อเชื่อม GitHub แล้ว Vercel จะ Deploy ใหม่เมื่อมีการ Push หรือ Merge ไปยัง Production Branch

## ทดสอบในเครื่อง

ต้องมี Node.js 20 ขึ้นไป:

```bash
npm ci
npm test
npm run build
python3 -m http.server 8080
```

เปิด `http://localhost:8080` เครื่องมือ Web Crypto และกล้องต้องใช้ HTTPS หรือ localhost

## ข้อควรทราบ

- ใช้ AES-256-GCM และคงรูปแบบไฟล์ OPS1 v1 ให้ถอดรหัสไฟล์จากรุ่นก่อนหน้าได้
- ไฟล์เข้ารหัสจำกัด 15 MiB เพื่อจำกัดการใช้หน่วยความจำบนมือถือ
- QR Scanner ต้องใช้เบราว์เซอร์ที่รองรับ `BarcodeDetector`; รุ่นที่ไม่รองรับจะได้รับข้อความแจ้ง ไม่มีการส่งภาพไปบริการภายนอก
- ระบบตรวจรหัสผ่านเป็นการประเมินแบบ heuristic ไม่ใช่ฐานข้อมูลรหัสผ่านรั่วไหล
- เว็บไซต์ไม่ใช่ Antivirus และไม่สามารถสแกนแอปหรือไฟล์ระบบทั้งเครื่องได้
