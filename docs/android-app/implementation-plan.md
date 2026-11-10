# แผนการลงมือทำ (Phase 6–8)

> ทุกขั้นที่ต้องใช้ JDK/Android SDK **ยังไม่ได้ทำ** — เครื่องนี้ไม่มีเครื่องมือดังกล่าว และข้อกำหนดห้ามติดตั้ง dependency ที่ไม่จำเป็น

## ขั้นที่ 0 — Gate ทางกฎหมาย (ต้องผ่านก่อนขั้น 5)
- [ ] ความเห็นทางกฎหมายเรื่องใบอนุญาตและเขตอำนาจที่ให้บริการ
- [ ] ตรวจนโยบาย Google Play Real-Money Gambling ฉบับปัจจุบัน + ประเทศที่อนุญาต
- [ ] ผู้มีอำนาจอนุมัติการสร้าง signing key และช่องทางเผยแพร่

## ขั้นที่ 1 — เตรียมเว็บให้เป็น PWA (แก้ใน repo นี้, ไม่กระทบ logic เดิม)
1. อ่าน `node_modules/next/dist/docs/` หัวข้อ metadata/manifest ก่อน (ตาม AGENTS.md)
2. เพิ่ม `app/manifest.ts`: `name`, `short_name`, `start_url: "/lobby"`, `display: "fullscreen"`, `orientation: "any"`, `background_color`, `theme_color`, ไอคอน 192/512 + maskable จากโลโก้ของเราเอง
3. Service worker เล็กๆ สำหรับหน้า offline เท่านั้น (ไม่ cache API/ยอดเงิน)
4. ตรวจว่า Echo ใช้ `wss` บน production (`NEXT_PUBLIC_REVERB_SCHEME=https`)
5. (ไม่บังคับ) ย้าย API base URL ที่ hardcode ไปเป็น env — **ต้องขออนุมัติก่อน** เพราะแตะ API config

## ขั้นที่ 2 — โปรเจกต์ TWA (โฟลเดอร์แยก เช่น `android/`, ไม่ commit key)
1. ติดตั้ง JDK 17 + Android SDK + Bubblewrap บนเครื่อง build (ต้องได้รับอนุมัติ)
2. `bubblewrap init --manifest https://<โดเมน>/manifest.webmanifest`
3. ตั้ง `packageId` ของเราเอง, `display: fullscreen`, `fallbackType: customtabs`, ไม่ขอ permission เพิ่ม
4. ตั้ง `android:allowBackup="false"` ใน manifest ที่ generate

## ขั้นที่ 3 — Digital Asset Links
- สร้าง `public/.well-known/assetlinks.json` ด้วย SHA-256 ของ **debug key ก่อน** (ทดสอบภายใน) แล้วค่อยเปลี่ยนเป็น Play App Signing key หลังผ่านขั้น 0

## ขั้นที่ 4 — ทดสอบ (Phase 8) — ต้องรันจริงก่อนจะบอกว่าผ่าน
| การทดสอบ | วิธี | สถานะ |
|---|---|---|
| ติดตั้ง debug build บนเครื่องจริง/emulator | `adb install` | ยังไม่ได้ทำ |
| เปิดแอปแล้วไม่มีแถบ URL ในโดเมนเรา (asset links ถูกต้อง) | ตรวจด้วยตา + `adb logcat` | ยังไม่ได้ทำ |
| login → token ใน storage → ล็อบบี้แสดงยอด | manual | ยังไม่ได้ทำ |
| เปิดเกม provider → แสดง Custom Tab bar, กลับมาล็อบบี้ได้ | manual | ยังไม่ได้ทำ |
| LINE/Telegram เปิดแอปภายนอก | manual | ยังไม่ได้ทำ |
| ฝาก/ถอน และ realtime (Echo) ทำงาน | manual บนบัญชีทดสอบ | ยังไม่ได้ทำ |
| ไม่มี cleartext (`http://`) ใดๆ | network log | ยังไม่ได้ทำ |
| ขนาด AAB/APK | `bundletool` / ดูไฟล์ | ยังไม่ได้ทำ |
| Lighthouse PWA/installability | Chrome DevTools | ยังไม่ได้ทำ |

## ขั้นที่ 5 — Release (หลังผ่านขั้น 0 เท่านั้น)
- AAB (ไม่ใช่ universal APK), Play App Signing, internal testing track ก่อน
- ไม่มีหน้าดาวน์โหลด APK สาธารณะ

## แนวทางสำรอง: Kotlin WebView
ใช้เฉพาะถ้า TWA ไม่ตอบโจทย์ — ข้อกำหนดความปลอดภัยครบใน `architecture.md` หัวข้อ 4 ต้องทำ allowlist โดเมน provider เกม (ขอรายการจาก backend `game_url`) หรือส่ง URL เกมทั้งหมดไป Custom Tab
