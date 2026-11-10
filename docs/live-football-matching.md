# ตัวเชื่อมตาราง ESPN กับสตรีม AMB

## แหล่งข้อมูล

ระบบเรียก JSON API โดยตรง ไม่ scrape HTML และไม่ดัก Network ในเบราว์เซอร์ลูกค้า การตรวจ Network ของต้นทางใช้ค้นพบ endpoint เท่านั้น

- AMB รายการสด: `https://api-streaming-channels.askmebet.live/matches-streaming-channel/soccer/live`
- ESPN ตาราง: scoreboard รายเดือนของ 5 ลีกเดิม
- ตัวเล่น: คิว `preparePlayers()` เดิม ขอ URL จาก askmebet และเปิด GLIVE iframe ตาม AMB matchId ไม่มีการเปลี่ยน mint, token, session หรือ proxy วิดีโอ

## ลำดับการทำงาน

1. `/api/live-football/links` อ่าน `footballCalendar()` และ `footballFeed()` ใช้ cache และ single-flight เดิม ไม่ยิงต้นทางแยกต่อคู่หรือค้นหาตอนคลิก
2. เปรียบเทียบลีกจากรายการชื่อที่อนุญาต ชื่ออังกฤษของเจ้าบ้านและทีมเยือน และเวลา UTC คลาดเคลื่อนไม่เกิน 30 นาที (นโยบายของเรา ไม่ใช่เงื่อนไขต้นทาง)
3. ชื่อ normalize เฉพาะตัวพิมพ์ เครื่องหมาย/ช่องว่าง และเครื่องหมายกำกับอักษร พร้อม alias ที่ตรวจทานแบบเจาะจง เช่น Manchester Utd → Manchester United ไม่ลบ United/Real/อายุ/ทีม B แบบเหมารวม
4. ต้องเป็นประเภททีมตรงกัน: ชาย/หญิง, Uxx, สำรอง/II/B และต้องตรงทิศเจ้าบ้าน–ทีมเยือน ไม่มีการสลับฝั่งอัตโนมัติ
5. ต้องพบ AMB candidate เพียงหนึ่งคู่ และ AMB ID นั้นต้องไม่ถูกอ้างโดยหลาย ESPN event ถ้ามีหลายตัวเลือกเป็น ambiguous ไม่เชื่อม
6. candidate ต้องยังอยู่ใน live feed และยืนยันจากข้อมูลสด 2 รอบที่ updatedAt ห่างกันอย่างน้อย 8 วินาที การเรียกซ้ำหลายครั้งบน snapshot เดิมไม่เพิ่มการยืนยัน
7. เก็บความสัมพันธ์ event ID → AMB matchId และ fingerprint วันเวลา/ชื่อ/รหัสทีมใน process memory หากข้อมูลเปลี่ยนเริ่มยืนยันใหม่ ไม่เอาความสัมพันธ์เก่ามาเปิดทันที
8. หน้าเว็บอ่าน links ทุก 10 วินาที เมื่อเชื่อมแล้วรวมแถว ESPN กับ AMB ไม่แสดงคู่ซ้ำ เปลี่ยนแถว ESPN เป็น LIVE และใช้ปุ่มดูถ่ายทอดสด แต่ URL หน้ารายคู่ ESPN เดิมยังใช้ได้
9. หน้ารายคู่ ESPN resolve ไป AMB ID ที่ยืนยันแล้ว ตรวจซ้ำกับตารางและ feed ล่าสุด แล้วใช้ prepared player เดิม เปิดเองเมื่อพร้อม ไม่มีการขอ mint ใน click handler
10. เมื่อเริ่มเล่นแล้ว รักษา iframe เดิมและใช้ chooseMatch/auto-next เดิม ไม่ reload วิดีโอเพราะการอัปเดต mapping หรือสกอร์

## เมื่อข้อมูลไม่พร้อม

- AMB stale: ไม่สร้างหรือเลื่อนการยืนยันใหม่ อนุญาตใช้ link เดิมที่ยืนยันครบเฉพาะเมื่อ fingerprint ยังตรง
- candidate หาย/จบ/ambiguous: ถอน link จากการเสนอรายการใหม่ แต่การเล่นที่เริ่มแล้วใช้ logic checking/ยืนยันจบเดิมเพื่อไม่ตัดภาพทันที
- ESPN ไม่ยืนยันเวลา หรือสถานะจบ/เลื่อน/ระงับ: ไม่เชื่อมสตรีมอัตโนมัติ
- ไม่ทราบชื่ออังกฤษ/ลีก/alias: unmatched รอข้อมูล ไม่ใช้ fuzzy score หรือเลือกคู่ที่ใกล้ที่สุดแบบเดา
- API links ล่ม: ลองใหม่เบื้องหลังโดยไม่แสดงข้อความแจ้งเตือนบนหน้า ตามคำขอล่าสุดของผู้ใช้ ไม่หยุดคิว player/รายการ AMB และไม่เปลี่ยน URL ของ iframe ที่เล่นอยู่

## ไฟล์

- `lib/live-football/matching.ts`: matcher, alias registry, observation state, client resolver
- `lib/live-football/calendar-server.ts`: ย้าย cache ตารางเดิมออกจาก route เพื่อเรียกใช้ร่วมกัน โดยคง endpoint calendar เดิม
- `app/api/live-football/links/route.ts`: endpoint ผลจับคู่ ไม่ส่ง URL วิดีโอหรือ credential
- `lib/live-football/model.ts`: เพิ่ม homeEn/awayEn/leagueEn เป็น optional ไม่เปลี่ยน live/end state เดิม
- `lib/live-football/calendar.ts`: เพิ่ม optional ESPN team IDs และ leagueCode
- `app/live/LiveFootball.tsx`: background links polling, แสดงผลรวม, เริ่มรับชมผ่าน AMB ID
- `scripts/test-live-football.cjs`: เพิ่มทดสอบคู่ผิดประเภท/สลับฝั่ง/ต่างลีก/เวลา/กำกวม/ยืนยันสองรอบ/stale/reschedule/client resolver

## ผลตรวจและข้อจำกัด

- ตรวจจริง `/api/live-football/links` ตอบ 166 รายการ unmatched, stale false เพราะคู่สดปัจจุบันเป็นอินเดียซึ่งไม่มีในตาราง ESPN 5 ลีก ไม่สร้าง link ปลอมเพื่อสาธิต
- TypeScript และ ESLint ผ่าน; behavioral tests ทั้งหมด 13 รายการผ่าน รวม client resolver ที่ปฏิเสธ mapping เก่าหลังเวลาแข่งเปลี่ยนหรือเมื่อมี candidate ใหม่ซ้ำ
- ตรวจตัวเล่น AMB เดิมรหัส 137683482 หลังเพิ่มระบบ พบ iframe 1 ตัว ภาพ 960×540, readyState 4, paused false, error null, เวลาเล่นประมาณ 216 วินาที; ต่อมาผู้ใช้เปลี่ยนไปหน้ารายการจึงไม่สั่งเปิดวิดีโอซ้ำ
- ต้องรอคู่ในลีกที่ทั้งสองแหล่งมีร่วมกันเพื่อยืนยัน end-to-end ของ mapping กับวิดีโอจริง; ระหว่างนี้ทดสอบการจับคู่และการเปิดเป้าหมายด้วยข้อมูล offline แยกจากหน้าเว็บ
- Alias เป็นชุดชื่อที่ตรวจทาน ไม่ใช่โมเดล AI และไม่เรียนรู้ชื่อทีมใหม่เองโดยไม่มีการตรวจ
- observations อยู่ใน process memory และล้างเมื่อ restart; ไม่มีฐานข้อมูลถาวรหรือ cache ร่วมหลาย instance ควรเพิ่ม shared store หาก deploy หลาย instance
- การยืนยันเกิดเมื่อมีผู้ชมเรียก endpoint links หากต้องยืนยันล่วงหน้าโดยไม่มีผู้ชม ต้องเพิ่ม endpoint นี้ใน worker/deployment ภายหลัง; งานนี้ไม่ restart worker/server ที่กำลังรัน
- ขอบเขตยังเป็นตารางลีกที่เปิดใช้และสตรีมที่ AMB ให้จริง ไม่ใช่รับประกันทุกคู่หรือทุกลีก

ไม่แก้ Login/Register/2FA, `lib/api.ts`, Wallet, การเดิมพัน หรือแพ็กเกจ ไม่ commit/push/restart
