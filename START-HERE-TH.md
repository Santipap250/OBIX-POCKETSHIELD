# เริ่มใช้งาน OBIX POCKETSHIELD v1.0.1

ไฟล์ชุดนี้เตรียมไว้สำหรับนำขึ้น GitHub และ Deploy ด้วย Vercel โดยเป็น Static Web App ไม่ต้องตั้งค่า API Key, Database หรือ Backend

## 1) นำไฟล์ขึ้น GitHub

1. ดาวน์โหลด ZIP แล้วแตกไฟล์
2. เปิดโฟลเดอร์ `OBIX-POCKETSHIELD`
3. เลือกไฟล์และโฟลเดอร์ **ทั้งหมดที่อยู่ภายใน** แล้วอัปโหลดไปไว้ที่ระดับบนสุด (root) ของ GitHub Repository
4. ตรวจสอบว่า `index.html`, `app.js`, `style.css`, `package.json` และ `vercel.json` อยู่ระดับเดียวกัน ไม่ได้ซ้อนอยู่ในโฟลเดอร์ชั้นในอีกชั้น
5. Commit และ Push ขึ้น Branch ที่ต้องการ Deploy

## 2) เชื่อม Vercel

1. เข้า Vercel แล้วเลือก **Add New → Project**
2. Import GitHub Repository ที่เพิ่งอัปโหลด
3. ตั้งค่า Framework Preset เป็น **Other**
4. ตั้ง Build Command เป็น `npm run build`
5. ตั้ง Output Directory เป็น `.` (จุด หมายถึง Repository root)
6. ไม่ต้องเพิ่ม Environment Variables
7. กด Deploy

หลัง Deploy สำเร็จ ให้เปิดเว็บไซต์ผ่าน HTTPS เพื่อให้ Web Crypto และสิทธิ์กล้องทำงานได้ตามข้อกำหนดของเบราว์เซอร์

## 3) ติดตั้งบนมือถือ

- Android: เปิดเว็บไซต์ด้วย Chrome → เมนู ⋮ → Install app หรือ Add to Home screen
- iPhone: เปิดเว็บไซต์ด้วย Safari → Share → Add to Home Screen
- เปิดเว็บไซต์ให้โหลดครบหนึ่งครั้งก่อนทดสอบ Offline

## 4) ทดสอบหลัง Deploy

- ทดลองสร้างและดาวน์โหลด QR Code
- ทดลองเข้ารหัส/ถอดรหัสข้อความและไฟล์ รวมถึงไฟล์เปล่า
- ทดลอง Hash, URL Scanner และ JWT Inspector
- ทดสอบเปิดกล้อง QR บน Android Chrome โดยกดอนุญาตกล้อง
- ทดสอบปิดอินเทอร์เน็ตหลังโหลดเว็บไซต์ครบแล้ว และเปิดหน้าเว็บใหม่

หมายเหตุ: QR Scanner ใช้ `BarcodeDetector` ซึ่งเบราว์เซอร์บางรุ่นอาจยังไม่รองรับ ส่วน QR Generator ทำงานภายในเครื่องและไม่ต้องเรียก API ภายนอก

## 5) ทดสอบก่อนอัปโหลด (ทางเลือก)

ต้องมี Node.js 18 ขึ้นไป:

```bash
npm test
npm run build
python3 -m http.server 8080
```

จากนั้นเปิด `http://localhost:8080`

## 6) ขอบเขตความสามารถ

OBIX POCKETSHIELD เป็นชุดเครื่องมือเว็บที่ทำงานใน Browser ไม่ใช่ Antivirus และไม่สามารถสแกนไฟล์ทั้งเครื่อง แอปที่ติดตั้ง ระบบปฏิบัติการ หรือเครือข่าย Wi-Fi ได้ เครื่องมือวิเคราะห์ลิงก์เป็นการประเมินตามรูปแบบ ไม่ใช่ฐานข้อมูลภัยคุกคามแบบเรียลไทม์
