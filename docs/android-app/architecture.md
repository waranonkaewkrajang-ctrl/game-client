# สถาปัตยกรรมแอป Android สำหรับ SNAKE168 (ใช้ Next.js เดิม)

> สถานะ: **เอกสารออกแบบ — ยังไม่ได้ build/ทดสอบ** (เครื่องนี้ไม่มี JDK / Android SDK)
> ข้อกำหนดทางกฎหมายอยู่ในหัวข้อ 6 — ต้องผ่านก่อนเผยแพร่ใดๆ

## 1. ผลตรวจ Next.js app ของเรา (Phase 2)

| รายการ | ที่พบ | ผลต่อแอป Android |
|---|---|---|
| Framework | Next.js 16.2.10, React 19, `output: "standalone"` | เป็นเว็บ server-rendered + client — **ใช้ได้ทั้งหมดผ่าน TWA/WebView ไม่ต้อง export static** |
| หน้า (`app/**/page.tsx`) | `/`, `/login`, `/register`, `/lobby`, `/lobby/[provider]`, `/wallet`, `/history`, `/profile`, `/promotions`, `/rewards/cashback`, `/rewards/referral`, `/spin-wheel` | ไม่มีหน้า admin ใน repo นี้ ✔ (แอปต้องไม่เปิดโดเมน admin/API ใดๆ เป็นหน้า) |
| Auth | token ใน `localStorage` (`user_token`, `user_data`), axios interceptor ใส่ Bearer, 401 → `/login` (`lib/api.ts`) | ทำงานใน WebView ต้องเปิด DOM storage; ใน TWA ใช้ storage ของ Chrome |
| API | `https://admintg289.sbs/api` (hardcode ใน `lib/api.ts`, `PopupModal.tsx`) | เป็น origin ของ API (XHR) ไม่ใช่หน้าที่ต้อง navigate |
| Realtime | Laravel Echo + Pusher/Reverb (`lib/echo.ts`, env `NEXT_PUBLIC_REVERB_*`) | WebSocket ต้องเป็น `wss://` (ห้าม `ws://` เพราะห้าม cleartext) |
| เปิดเกม | `components/lobby/launchGame.ts`: มือถือ → `window.location.href = game_url`, เดสก์ท็อป → `window.open` | **ประเด็นหลัก**: URL เกมเป็นโดเมนของผู้ให้บริการเกม (ไม่คงที่) — ต้องออกแบบการนำทางข้าม origin (หัวข้อ 4) |
| ลิงก์ภายนอก | LINE / Telegram (`target="_blank"`), ActivityModal/Activities `window.open(http…)` | ต้องเปิดนอกแอป (Custom Tab / แอป LINE) |
| PWA | ไม่มี web manifest, ไม่มี service worker | ต้องเพิ่ม `app/manifest.ts` (TWA ต้องใช้) |
| `images.remotePatterns` | `hostname: '**'` | ไม่เกี่ยวกับแอปโดยตรง แต่ควรจำกัดในอนาคต |

## 2. เปรียบเทียบทางเลือก (Phase 3)

| เกณฑ์ | **PWA + TWA** | **Kotlin WebView (native)** | Capacitor | React Native + WebView |
|---|---|---|---|---|
| ขนาด APK/AAB (ประมาณ) | ~1–2 MB | ~2–5 MB | ~5–10 MB | ~15–25 MB ต่อ ABI (คู่แข่ง 69.6 MB universal) |
| ใช้ Next.js เดิม | 100% | 100% | 100% (remote URL) หรือต้อง static export | 100% ผ่าน WebView + โค้ด RN เพิ่ม |
| Engine | Chrome ของเครื่อง (อัปเดตผ่าน Play) | Android System WebView | System WebView | System WebView |
| Safe Browsing / ความปลอดภัย | ของ Chrome เต็มรูปแบบ | ต้องตั้งเอง (เปิดอยู่โดย default) | ต้องตั้งเอง | ต้องตั้งเอง |
| เต็มจอ / แนวจอ | `display: fullscreen`, `orientation` ใน manifest | ควบคุมได้ทุกอย่าง | ได้ | ได้ |
| URL เกมข้ามโดเมน | ออก scope → แสดงแถบ Custom Tab อัตโนมัติ (ปลอดภัย ใช้งานได้) | ต้องทำ allowlist เอง (provider เปลี่ยนโดเมนบ่อย) | เหมือน WebView | เหมือน WebView |
| Login/cookie | ใช้ร่วมกับ Chrome | แยก storage ของแอป | แยก | แยก |
| ข้อจำกัด | ต้องมี Chrome (หรือเบราว์เซอร์ที่รองรับ) ไม่งั้น fallback เป็น Custom Tab; ต้องวาง `assetlinks.json` | ต้องดูแล WebView security เอง | dependency ชุดใหญ่ | ซับซ้อนที่สุด, ใหญ่ที่สุด |
| เครื่องมือ build | Bubblewrap CLI (ต้องมี JDK + SDK) | Android Studio/Gradle | Node + Gradle | Node + Gradle + Expo/RN |

## 3. คำแนะนำ

**ทางเลือกหลัก: PWA + Trusted Web Activity (TWA)**
- เล็กที่สุด, reuse เว็บเดิม 100%, ความปลอดภัยเท่า Chrome, Safe Browsing ไม่ถูกปิด, ไม่มี JS bridge
- URL เกมของผู้ให้บริการภายนอกเปิดได้โดยไม่ต้องดูแล allowlist (Chrome แสดงแถบ URL เมื่อออกนอกโดเมนที่ยืนยัน — **ไม่ซ่อนคำเตือนนี้**)

**ทางเลือกสำรอง: Kotlin WebView wrapper** — ใช้เมื่อจำเป็นต้องควบคุม UI เต็มจอทุกหน้า หรือรองรับเครื่องที่ไม่มี Chrome
ไม่แนะนำ RN+WebView แบบคู่แข่ง: ได้แค่ WebView เหมือนกันแต่ใหญ่กว่า 10–30 เท่า

## 4. การออกแบบแอป (Phase 4)

```
┌─ Android app (TWA) ───────────────────────────────┐
│ LauncherActivity (androidx.browser)                │
│   start_url = https://<โดเมนเว็บของเรา>/lobby      │
│   display = fullscreen (immersive)                 │
│   ├─ ในโดเมนที่ยืนยันด้วย assetlinks → เต็มจอ     │
│   ├─ URL เกม (โดเมน provider) → Custom Tab bar     │
│   └─ LINE/Telegram/intent → แอปภายนอก              │
└────────────────────────────────────────────────────┘
        │ HTTPS เท่านั้น
        ▼
Next.js เดิม ── axios → API (https) ── Echo → wss://
```

- **หน้าที่รวม**: เฉพาะหน้าผู้ใช้ในหัวข้อ 1 — ไม่รวมแผงจัดการ/admin ใดๆ (ไม่เพิ่มลิงก์, ไม่ใส่ใน scope/allowlist)
- **Splash / ไอคอน**: ใช้โลโก้ SNAKE168 ของเราเอง (`public/images/logo/…`) — ไม่ใช้ asset คู่แข่ง
- **แนวจอ**: `orientation: "any"` ที่ล็อบบี้; เกมของ provider จัดการแนวจอเอง
- **Back button**: TWA ย้อน history ของเว็บอัตโนมัติ; หน้าแรกกด back = ออกจากแอป
- **Offline**: แสดงหน้า offline เรียบง่ายจาก service worker (ไม่ cache ข้อมูลยอดเงิน/บัญชี)

### ถ้าใช้ Kotlin WebView (สำรอง) ต้องมีอย่างน้อย
- `usesCleartextTraffic="false"` + `network_security_config` ไม่อนุญาต cleartext, ไม่ trust user CA ใน release
- ไม่ override `onReceivedSslError` (ให้ล้มเหลวตามปกติ)
- `shouldOverrideUrlLoading`: อนุญาตเฉพาะ https ของโดเมนเราใน WebView; โดเมน provider เกม → Custom Tab; scheme อื่น (`line:`, `intent:`, `tg:`) → `Intent` ภายนอกหลังตรวจ
- ไม่มี `addJavascriptInterface`; `setAllowFileAccess(false)`, `setAllowContentAccess(false)`, `mixedContentMode = NEVER_ALLOW`
- `setWebContentsDebuggingEnabled(BuildConfig.DEBUG)` เท่านั้น; ไม่ปิด Safe Browsing
- `allowBackup="false"`, permission `INTERNET` อย่างเดียว
- ไม่ log URL ที่มี token หรือ response ใดๆ

## 5. ความปลอดภัยและการเผยแพร่ (Phase 5)

| ข้อ | การปฏิบัติ |
|---|---|
| Transport | HTTPS/WSS เท่านั้น |
| Secrets | ไม่มี secret ในแอป (token ได้จาก login ตอนรันเท่านั้น); `NEXT_PUBLIC_REVERB_APP_KEY` เป็น public key ของ Pusher protocol อยู่ในเว็บอยู่แล้ว |
| Signing | key เก็บนอก repo, ใช้ Play App Signing; **ยังไม่สร้าง production key/APK** |
| Digital Asset Links | `public/.well-known/assetlinks.json` ต้องมี SHA-256 ของ key จริง — สร้างเมื่อได้รับอนุมัติเท่านั้น |
| Permission | `INTERNET` (TWA เพิ่ม notification ได้ภายหลังถ้าจำเป็น — ไม่ใส่ตอนนี้) |
| แจกจ่าย | **ไม่ทำหน้าดาวน์โหลด APK สาธารณะ** และไม่ทำกลไกหลบ Play Protect, geo-block หรือนโยบายร้านค้า |

## 6. เงื่อนไขทางกฎหมาย (บังคับก่อนเผยแพร่)

บริการนี้เป็นการพนันด้วยเงินจริง:
- **Google Play** อนุญาตแอปพนันเงินจริงเฉพาะในประเทศที่ Google กำหนด ผู้ให้บริการต้องมีใบอนุญาตของประเทศนั้น ยื่นคำขอและผ่านการอนุมัติ และจำกัดการแสดงผลเฉพาะประเทศนั้น — ต้องตรวจนโยบายฉบับปัจจุบันกับ Play Console
- **ประเทศไทย**: การพนันออนไลน์โดยทั่วไปผิดกฎหมาย (พ.ร.บ.การพนัน พ.ศ. 2478) — ต้องมีความเห็นทางกฎหมายยืนยันว่ากลุ่มผู้ใช้เป้าหมายและเขตอำนาจที่ให้บริการถูกกฎหมาย
- การแจก APK นอก Play เพื่อเลี่ยงข้อจำกัดข้างต้น **ไม่ทำ**

จนกว่าจะยืนยันใบอนุญาต เขตอำนาจ และนโยบายร้านค้า: ทำได้แค่ debug build ภายในทีมบนเครื่องทดสอบ
