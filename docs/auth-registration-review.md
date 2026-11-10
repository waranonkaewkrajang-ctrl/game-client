# ตรวจระบบสมัครและเข้าสู่ระบบ SNAKE168 — 10 พฤศจิกายน 2026

## ขอบเขตและข้อจำกัด

- แก้เฉพาะ frontend ใน `C:/Users/Asus/Desktop/user-frontend` และตรวจซอร์สแบบอ่านอย่างเดียวใน `C:/Users/Asus/Desktop/BACKEND`.
- ยังไม่ได้ยืนยันว่าโค้ด BACKEND ตรงกับเวอร์ชันที่ deploy บน `https://admintg289.sbs/api`.
- ไม่ส่งคำขอสมัคร/Login/OTP จริง ไม่ทดสอบเจาะ production ไม่แก้ฐานข้อมูล ไม่เปลี่ยน backend ไม่ restart server.
- การไม่มีมาตรการในซอร์สที่ตรวจ ไม่ยืนยันว่าระบบจริงไม่มี WAF/proxy หรือ middleware ชั้นอื่น.

## สิ่งที่ปรับแล้ว

- สมัครสองขั้น (บัญชีเข้าใช้งาน → ข้อมูลรับเงิน) พร้อมข้อความผิดพลาดแยกช่อง, focus, ปุ่มดูรหัส, autocomplete และแป้นตัวเลข.
- สมาชิกใหม่กรอกเบอร์แทนการตั้ง username: ส่ง `username = normalized phone` และ `phone` ไปยัง `POST /auth/register` เดิม. ไม่เปลี่ยน endpoint หรือชื่อฟิลด์.
- ไม่ย้ายหรือเปลี่ยน username/password ของสมาชิกเดิม. Login ยังเป็น input text และส่ง `{ username, password }` ตามเดิม; ข้อความหน้าจอระบุเบอร์หรือชื่อผู้ใช้เดิม.
- เบอร์เป็นชื่อเข้าใช้ได้สำหรับบัญชีใหม่ที่สร้างด้วยขั้นตอนนี้เท่านั้น. สมาชิกเดิมที่ username ต่างจาก phone ยังต้องใช้ username จนกว่าจะปรับ backend.
- คงรหัสธนาคารเดิมทั้ง 13 รายการ. เปลี่ยนตัวเลือกที่ใช้ div คลิกเป็น native select รองรับคีย์บอร์ดและมือถือ. เปลี่ยนธนาคารแล้วล้างเลขบัญชีเก่า แต่คงชื่อเจ้าของบัญชี.
- ตรวจเบอร์ไทย, รหัสผ่านขั้นต่ำ 6 ตัวตาม contract เดิม, รหัสยืนยัน, รายการธนาคาร, เลขบัญชี, ชื่อเจ้าของบัญชี และรหัสแนะนำ. การตรวจใน browser ช่วย UX เท่านั้น ต้องตรวจซ้ำที่ server.
- มี ref กัน submit ซ้ำระหว่างคำขอกำลังทำงาน; หากสมัครสำเร็จแต่บันทึก session ไม่ได้ จะไม่เปิดให้สมัครซ้ำทันที.
- เลิกใช้ global CSS ที่ฉีดด้วย `<style dangerouslySetInnerHTML>`, ลูกเต๋าเคลื่อนไหว และ dropdown state/DOM fallback เดิม. สไตล์ใหม่แยกเป็น CSS Module.
- ลบ checkbox “จำฉันไว้ในระบบ” ของ Login ซึ่งเดิมเปลี่ยนแค่ state แต่ไม่มีผลกับ session/คำขอ.

## ผลตรวจ backend ในเครื่อง (ยังไม่แก้)

| ระดับ | หลักฐานจากซอร์ส | สิ่งที่ต้องทำ |
|---|---|---|
| สูง | `app/Models/User.php:21` ซ่อนเฉพาะ password; controller คืน user model รวมใน register/login/me | ซ่อน two_factor_secret และข้อมูลลับอื่นที่ไม่จำเป็น, ใช้ API Resource allowlist; พิจารณาหมุน secret ที่เคยเปิดเผยหลังประเมินผลกระทบ |
| สูง | `routes/api.php:40` public auth group ไม่มี throttle ที่ route; bootstrap และ providers ที่ตรวจไม่พบการตั้ง auth rate limit | ตรวจ infra จริง แล้วจำกัด login ตามบัญชีและ IP, OTP ตาม challenge/บัญชีและ IP, registration ตาม IP/เบอร์; ไม่พึ่งปุ่ม disabled ฝั่ง browser |
| สูง | `verifyTwoFactor()` และ `issueToken()` ไม่ตรวจ active ซ้ำก่อนออก token; challenge เข้ารหัสมี userId/expiry แต่ไม่มีข้อมูล server-side ให้ consume | ตรวจสถานะก่อนออก tokenทุกทาง; ใช้ challenge ใช้ครั้งเดียวพร้อมวันหมดอายุ/attempt limit; ป้องกันใช้ OTP/challenge ซ้ำ |
| สูง/การทำงาน | `User::$fillable` ไม่รวม two_factor_secret/two_factor_enabled แต่ enable/confirm/disable เรียก update(array) ด้วยฟิลด์เหล่านี้; ไม่พบ cast boolean ของ enabled | ตรวจ mass-assignment configuration; ใช้ assignment ที่ควบคุมฝั่ง server และ save/casts ที่เหมาะสม. อาจถูกทิ้งเงียบหรือ throw ตาม config; ต้อง integration test ก่อนบอกว่าเปิด 2FA สำเร็จ |
| กลาง | register ตรวจ phone เพียง string length 10–20, bank_code เป็น string ไม่ใช่ allowlist; bank_account ไม่มี digits/ประเภทบัญชี | normalize phone ฝั่ง server, ตรวจรูปแบบและ unique ในฐานข้อมูลหลัง normalize, allowlist bank code และตรวจบัญชีตามประเภท; client validation ถูกข้ามได้ |
| กลาง | register สร้าง user แล้วสร้าง wallet โดยไม่มี transaction ครอบใน method นี้ | ตรวจ WalletService และเพิ่ม transaction/idempotency ที่ครอบการสร้าง user+wallet; ส่ง notification หลัง commit เพื่อไม่ให้ partial failure ทำให้ลูกค้าสมัครซ้ำ |
| กลาง | password ขั้นต่ำ 6 ตัว; register แยกข้อความชื่อ/เบอร์/บัญชีซ้ำ; Login แยกบัญชีถูกระงับ | ประเมินเพิ่ม password policy ที่ server และข้อความตอบกลับที่ไม่เปิดเผยบัญชี; เพิ่ม rate limit และ UX ติดต่อเจ้าหน้าที่ |
| กลาง | frontend เก็บ bearer token ใน localStorage | เสี่ยง token ถูกอ่านเมื่อเกิด XSS; ออกแบบ HttpOnly Secure SameSite cookie/BFF พร้อม CSRF และ token expiry/revocation โดยทดสอบทุกหน้าที่ใช้ token ก่อนย้าย |

## ฟังก์ชันที่ยังไม่มีหรือใช้ไม่ครบ

- ลืมรหัสผ่านใน Login เป็นเพียงแจ้งให้ติดต่อแอดมิน ไม่ใช่ระบบรีเซ็ตรหัสผ่านอัตโนมัติ. คงไว้ตามพฤติกรรมเดิม.
- ไม่พบหน้าเปิด/ยืนยัน/ปิด 2FA ใน frontend ที่ตรวจ (`app`, `components`, `lib`); มีเพียงขั้น verify ระหว่าง Login. Backend มี endpoints เหล่านี้ แต่ยังไม่ใช่หลักฐานว่าใช้งานได้จริง.
- ไม่มีขั้นส่ง/ยืนยัน SMS OTP เพื่อยืนยันเจ้าของเบอร์ในการสมัคร. รูปแบบเบอร์ถูกต้องไม่ได้แปลว่าเป็นเจ้าของเบอร์.
- referral code ที่ไม่พบใน backend จะถูกละเลยเงียบ. ควรมีการแจ้งผลให้ผู้ใช้ตามกติกาธุรกิจ.

## การเปลี่ยนให้สมาชิกเก่าใช้เบอร์ โดยไม่ทำลาย username เดิม

1. ยืนยัน repository/backend version ที่ใช้งานจริงก่อน.
2. ไม่แก้ username เดิมและไม่แตะ password hash ของลูกค้า.
3. ตรวจข้อมูล phone ซ้ำหลัง normalize และชนข้ามฟิลด์ phone ↔ username ก่อนเปิด feature.
4. เพิ่ม phone login อย่างชัดเจนที่ backend โดยคง username contract สำหรับ client/ลูกค้าเดิม. อย่าใช้ `where(username)->orWhere(phone)->first()` โดยไม่จัดการการชน: อาจเลือกบัญชีผิด.
5. หากต้องมีช่องเดียวช่วงเปลี่ยนผ่าน ให้พิจารณาทั้ง identifier+password ก่อนตัดสินบัญชี และจัดการกรณีหลายบัญชีตรงกันด้วยขั้นตอนแยกที่ปลอดภัย; ไม่เลือกบัญชีแรกตามลำดับฐานข้อมูล.
6. คง 2FA, active-account check, rate limit และ response schema เดิมทั้งสองทาง. ไม่ทำ endpoint สาธารณะเพื่อแปลงเบอร์เป็น username.
7. ทดสอบสมาชิกเก่ายูสตัวอักษร, ยูสตัวเลข, เบอร์ปกติ/+66, ข้อมูลชนกัน, รหัสผิด, บัญชีระงับ, เปิด 2FA, challenge หมดอายุ/ใช้ซ้ำ และ client เก่าก่อน deploy.

## การตรวจที่ทำได้ในรอบนี้

- TypeScript `--noEmit --incremental false` ผ่าน.
- ทดสอบ validation/payload แบบ offline: normalize เบอร์, รหัสผ่านสั้น/ยืนยันไม่ตรง, ธนาคารผิด, wallet, ชื่อผิด, referral ยาว, ชุดฟิลด์ API และรูปธนาคารครบ.
- ตรวจ CSS ด้วย PostCSS parser และตรวจ selector ซ้ำใน media context เดียวกัน; ไม่พบในทั้ง Login และ Register. Media query ที่เปลี่ยนสัดส่วนมือถือเป็น override ที่ตั้งใจ.
- ตรวจ browser desktop 1440px และ mobile 390px, ขั้นแรก/ขั้นสอง, validation, การย้าย focus, TrueWallet และ optional referral. ไม่ได้กดส่งสมัครจริง.
- `lib/api.ts` ไม่เปลี่ยน; endpoint/baseURL และ handler Login/2FA คงเดิม.

## แนวทางอ้างอิง

- https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html
- https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html
