# SNAKE168 Android (TWA)

Trusted Web Activity ที่เปิดเว็บ Next.js เดิมของเรา (ไม่มี UI แยก ไม่มี JS bridge)
แจกเป็นไฟล์ APK โดยตรงจาก `/install` (ไม่ลง Play Store / App Store — เจ้าของโปรเจกต์ตัดสินใจ 2026-11-11)

## Release 1.0.0 (2026-11-11)

- package `online.snake1168.app` (ไม่มี `.dev`) — **ห้ามเปลี่ยนอีก** ไม่งั้นเครื่องผู้ใช้จะอัปเดตทับไม่ได้
- versionName `1.0.0`, versionCode `3`, minSdk 24 (Android 7.0+), targetSdk 36, `debuggable=false`, R8 minify
- เซ็นด้วย **release key** `.keys/snake168-release.keystore` (RSA 4096, SHA384withRSA, หมดอายุ 2056) alias `snake168-release`
  - SHA-256: `F5:90:04:44:76:22:A6:21:39:56:7E:FC:A6:83:BC:05:32:E0:43:90:F1:6D:5D:A4:B0:40:E8:8C:C8:2A:B8:B6`
  - รหัสผ่านอยู่ใน `.keys/release-password.txt` เท่านั้น — `.keys/` และ `keystore.properties` ถูก .gitignore
  - **ต้อง backup keystore + รหัสผ่าน ไว้นอกเครื่อง** ถ้าหาย จะออกเวอร์ชันใหม่ที่ติดตั้งทับของเดิมไม่ได้อีกเลย (ผู้ใช้ต้องลบแอปแล้วลงใหม่)
- `apksigner verify`: v2 + v3 ผ่าน, `zipalign -c` ผ่าน
- ไฟล์ที่แจก: `public/downloads/snake168.apk` (คัดลอกจาก `app/build/outputs/apk/release/app-release.apk`)
- Digital Asset Links ของ release: `assetlinks.release.json` = `public/.well-known/assetlinks.json`

### Build release (เซ็นอัตโนมัติ)

```powershell
cd android\twa
$env:JAVA_HOME = "C:\Program Files\Microsoft\jdk-17.0.21.21-hotspot"
.\gradlew.bat clean assembleRelease --no-daemon
# ได้ app\build\outputs\apk\release\app-release.apk ที่เซ็นแล้ว (signingConfig อ่าน keystore.properties)
Copy-Item app\build\outputs\apk\release\app-release.apk ..\..\public\downloads\snake168.apk
```

ออกเวอร์ชันใหม่: เพิ่ม `versionCode` (และ `versionName`) ใน `app/build.gradle` + `twa-manifest.json` ทุกครั้ง และเซ็นด้วย key เดิมเท่านั้น
(เนื้อหาเว็บอัปเดตเองผ่าน TWA — ต้องออก APK ใหม่เฉพาะเมื่อเปลี่ยนชื่อ/ไอคอน/สี/โดเมน/package config)

## สถานะ prototype เดิม (2026-11-09)

- build debug ได้แล้ว: `app-dev-signed.apk` 2.63 MB (ไม่อยู่ใน Git) เซ็นด้วย **dev key** — `apksigner verify` ผ่าน (v2+v3)
- package `online.snake1168.app.dev`, version `0.1.0-dev` (code 1), minSdk 24, targetSdk 36
- permission: ไม่มี permission ระดับผู้ใช้เลย (มีแค่ `DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION` ภายในของ androidx) — TWA ไม่ต้องใช้ `INTERNET` เพราะ Chrome เป็นตัวโหลดเว็บ
- `allowBackup=false`, ไม่มี cleartext, intent-filter รับเฉพาะ `https`
- versionCode 2: ทดสอบบน Samsung Galaxy A16 5G (SM-A166P, Android 16) — เปิดได้ ไม่มี FATAL EXCEPTION, Chrome Custom Tab โหลด `snake1168.online` (หน้า login) ยังมีแถบ URL เพราะยังไม่มี `assetlinks.json`

## ไฟล์ในโฟลเดอร์นี้

| ไฟล์ | หน้าที่ |
|---|---|
| `twa-manifest.json` | ค่าตั้งของ Bubblewrap |
| `app/`, `build.gradle`, `settings.gradle`, `gradle*`, `store_icon.png`, `manifest-checksum.txt` | โปรเจกต์ Gradle ที่ `bubblewrap update` สร้าง |
| `assetlinks.template.json` | แม่แบบ Digital Asset Links |
| `.keys/` | dev keystore + รหัสผ่าน (**ถูก .gitignore** ห้าม commit) |
| `.gitignore` | กัน keystore / build output / APK ไม่ให้เข้า Git |

## แก้มือหลัง `bubblewrap update` (ถ้า regenerate ต้องทำซ้ำ)

1. `app/src/main/AndroidManifest.xml`: `android:allowBackup="false"` (template ของ Bubblewrap ใส่ `true`)
2. `app/build.gradle`: `versionName "0.1.0-dev"` (template ใส่ค่าว่าง) และ `minSdkVersion 24` (androidbrowserhelper 2.7.4 ต้องการ ≥ 24)
3. ต้องมี `<activity android:name="com.google.androidbrowserhelper.trusted.ManageDataLauncherActivity">` ใน `AndroidManifest.xml` และ `enableSiteSettingsShortcut: true` — androidbrowserhelper 2.7.4 เรียก component นี้ทุกครั้งที่เปิดแอป ถ้าไม่มีจะ crash ทันที (`IllegalArgumentException: Component class ... does not exist`; พบและแก้ใน versionCode 2)

## ค่าที่เจ้าของโปรเจกต์ต้องยืนยัน

| ค่า | ค่าปัจจุบัน | ต้องตัดสินใจ |
|---|---|---|
| `host` | `snake1168.online` | เป็น `CANONICAL_BASE` ใน `app/layout.tsx` และ `app/sitemap.ts` — ยืนยันว่าโดเมนนี้เสิร์ฟ frontend นี้จริงและวาง `/.well-known/assetlinks.json` ได้ (ตอนนี้ `/manifest.webmanifest` และ `/pwa/*` บนโดเมนนี้ยังเป็น 404 เพราะยังไม่ deploy) |
| `iconUrl` / `maskableIconUrl` / `webManifestUrl` | `http://localhost:3000/...` | ใช้ dev server ตอน generate ไอคอนเท่านั้น — เปลี่ยนเป็น `https://<host>/...` หลัง deploy |
| `packageId` | `online.snake1168.app.dev` | ชื่อถาวรของแอป **เปลี่ยนไม่ได้หลังเผยแพร่** — `.dev` ใช้สำหรับ build ทดสอบ |
| version | `0.1.0-dev` / `1` | เพิ่ม code ทุกครั้งที่ build ใหม่ |
| `orientation` | `default` (หมุนตามเครื่อง) | `portrait` ถ้าต้องการล็อกแนวตั้ง |
| `display` | `standalone` (เห็น status bar) | `fullscreen` = ซ่อน status/nav bar |
| `fingerprints` | dev key: `BF:D6:E1:64:…:7D:8F` | key ทดสอบเท่านั้น — release key ต้องสร้างใหม่หลังผ่านเงื่อนไขกฎหมาย (แนะนำ Play App Signing) |

## เครื่องมือ (ติดตั้งแล้วบนเครื่องนี้ ตามที่ได้รับอนุมัติ)

| เครื่องมือ | แหล่งทางการ | ที่ติดตั้ง |
|---|---|---|
| JDK 17 (Microsoft Build of OpenJDK 17.0.21) | https://learn.microsoft.com/java/openjdk/download | `winget install Microsoft.OpenJDK.17` → `C:\Program Files\Microsoft\jdk-17.0.21.21-hotspot` |
| Android SDK cmdline-tools (15859902, ตรวจ SHA-256 แล้ว) | https://developer.android.com/studio#command-line-tools-only | `%LOCALAPPDATA%\Android\Sdk` + `platform-tools`, `platforms;android-35`, `build-tools;35.0.0` (Gradle ติดตั้ง `platforms;android-36` เพิ่มเอง) |
| Bubblewrap CLI | https://github.com/GoogleChromeLabs/bubblewrap | `npm install -g @bubblewrap/cli` (global — ไม่แตะ package.json ของ repo) |

หมายเหตุ: `bubblewrap doctor` ต้องการโฟลเดอร์ `Sdk\tools` แบบเก่า จึงคัด `cmdline-tools\latest` ไปไว้ที่ `Sdk\tools`; ค่า path อยู่ใน `%USERPROFILE%\.bubblewrap\config.json`

## Build debug อีกครั้ง

```powershell
cd android\twa
$env:JAVA_HOME = "C:\Program Files\Microsoft\jdk-17.0.21.21-hotspot"
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
.\gradlew.bat assembleRelease --no-daemon
$bt = "$env:ANDROID_HOME\build-tools\35.0.0"
& "$bt\zipalign.exe" -f -p 4 app\build\outputs\apk\release\app-release-unsigned.apk app-release-aligned.apk
$env:SNAKE_DEV_PW = Get-Content .keys\dev-password.txt
& "$bt\apksigner.bat" sign --ks .keys\snake168-dev.keystore --ks-key-alias snake168-dev --ks-pass env:SNAKE_DEV_PW --key-pass env:SNAKE_DEV_PW --out app-dev-signed.apk app-release-aligned.apk
Remove-Item Env:SNAKE_DEV_PW
& "$bt\apksigner.bat" verify --print-certs app-dev-signed.apk
```

ติดตั้งบนเครื่องทดสอบ: `adb install -r app-dev-signed.apk`

### Digital Asset Links

`assetlinks.dev.json` = ไฟล์สำหรับ dev package สร้างจาก fingerprint ที่ `apksigner` อ่านจาก `app-dev-signed.apk` (ตรงกับ keystore และเครื่องที่ติดตั้ง) — **ไม่ได้อยู่ใน `public/`** เพื่อไม่ให้หลุดขึ้น production ตอน deploy ปกติ

ผลทดสอบ (2026-11-09, versionCode 2):
- เสิร์ฟผ่าน `next dev` ชั่วคราวที่ `http://localhost:3000/.well-known/assetlinks.json` → 200, `application/json`, ไม่มี redirect, JSON ถูกต้อง (ลบไฟล์ออกจาก `public/` หลังทดสอบ)
- `https://snake1168.online/.well-known/assetlinks.json` → 404; Google DAL API: `ERROR_CODE_FETCH_ERROR`
- Chrome บนเครื่อง: `Digital Asset Links endpoint responded with code 404` → `Target url verification has been failed` → แสดงแถบ URL (พฤติกรรมถูกต้อง)

ขั้นตอนเมื่อได้รับอนุมัติให้ deploy (โดเมนต้องตรงกับ `host` ของ APK ทุกตัวอักษร):
1. วาง `assetlinks.dev.json` เป็น `public/.well-known/assetlinks.json` **บน environment ที่ได้รับอนุมัติเท่านั้น** แล้ว deploy
2. ตรวจ: `curl -sI https://<host>/.well-known/assetlinks.json` → `200`, `content-type: application/json`, ไม่มี `location:`
3. ตรวจผ่าน Google: `https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://<host>&relation=delegate_permission/common.handle_all_urls` ต้องเห็น `online.snake1168.app.dev` + fingerprint
4. บนเครื่อง: `adb shell pm set-app-links --package online.snake1168.app.dev 0 all` แล้ว `adb shell pm verify-app-links --re-verify online.snake1168.app.dev`; `adb shell pm get-app-links online.snake1168.app.dev` ควรเป็น `verified`
5. ปิด Chrome + แอป (`am force-stop`) แล้วเปิดแอปใหม่ — logcat ต้องไม่มี `Target url verification has been failed` และหน้าเว็บต้องไม่มีแถบ URL/ปุ่ม "ปิดแท็บ"
6. ลองเปิดเกมของ provider (โดเมนอื่น) — ต้องมีแถบ URL กลับมา

ถ้าใช้โดเมน staging แยก: ต้อง build dev APK ใหม่ให้ `host` (twa-manifest.json + `hostName`/`fullScopeUrl` ใน `app/build.gradle`) เป็นโดเมนนั้น เพราะ Chrome ยืนยันเฉพาะ origin ที่ตรงกัน

**ห้ามใส่ fingerprint ของ dev key บน production โดยไม่ได้รับอนุมัติชัดเจน** — release ใช้ key/package แยก (ไม่มี `.dev`) และ assetlinks ของ production ใส่เฉพาะ fingerprint ของ release key (เช่น Play App Signing)

ไม่ได้ใช้ Chrome flag ปิดการตรวจ asset links หรือวิธีซ่อนแถบ URL อื่นใด

### Option A (เจ้าของอนุมัติ 2026-11-09): dev fingerprint บน `snake1168.online`
- เตรียมแล้ว: `public/.well-known/assetlinks.json` = สำเนาตรงทุก byte ของ `assetlinks.dev.json` (ยังไม่ได้ commit / deploy)
- **ยังไม่ได้ deploy**: repo นี้ไม่มีสคริปต์ deploy / CI / webhook — production (Next.js หลัง Cloudflare) deploy จากเครื่อง server ที่ไม่ได้เข้าถึงจากที่นี่
- วิธี deploy ที่กระทบน้อยที่สุด (ทำโดยผู้ดูแล server): เพิ่มไฟล์เดียวนี้เข้า `public/.well-known/` ของ source ที่ production ใช้อยู่ **ณ commit ปัจจุบันของ production** (ไม่ใช่ branch นี้ซึ่งมีงานที่ยังไม่ commit) แล้ว build/restart ตามขั้นตอนเดิมของ server — หรือให้ Cloudflare ตอบ path นี้ด้วยไฟล์ JSON นี้ (ต้องมีสิทธิ์ Cloudflare ของโดเมน)

### Deploy จริง (2026-11-09): Cloudflare Worker เฉพาะ path เดียว
- บัญชี Cloudflare: `Waranonkaewkrajang@gmail.com's Account` (โซน `snake1168.online`, ไม่มี Worker route อื่นก่อนหน้า)
- Worker: `snake168-assetlinks-dev` — route เดียว `snake1168.online/.well-known/assetlinks.json` ตอบ JSON เดียวกับ `assetlinks.dev.json` (ไฟล์ worker อยู่นอก repo ที่ `%TEMP%\snake168-cf\`)
- ไม่ได้ build / restart / deploy Next.js; URL อื่นทุกตัวที่ตรวจ (`/`, `/lobby`, `/login`, `/logos.png`, `/robots.txt`, `/sitemap.xml`, `/.well-known/other.json`) ได้ status/type/size เท่าก่อน deploy
- `public/.well-known/assetlinks.json` ใน repo ไม่ได้ใช้ในการ deploy นี้ (ไม่ต้อง deploy ซ้ำ)

### ถอด dev fingerprint ออกหลังทดสอบ
0. ลบ Worker (ไม่ต้องมีไฟล์ worker): `npx wrangler@4.158.0 delete --name snake168-assetlinks-dev` (login บัญชี waranonkaewkrajang) แล้วตรวจว่า `/.well-known/assetlinks.json` กลับเป็น 404 หรือไฟล์ของ release
1. ลบ `public/.well-known/assetlinks.json` ออกจาก production (หรือแทนด้วยไฟล์ที่มีเฉพาะ fingerprint ของ release key) แล้ว deploy
2. ตรวจ `https://snake1168.online/.well-known/assetlinks.json` ไม่มี `online.snake1168.app.dev` แล้ว (Google DAL API cache ~10 นาที; Chrome บนเครื่องอาจ cache ผลยืนยันไว้ — `adb shell pm verify-app-links --re-verify online.snake1168.app.dev` และล้างข้อมูล Chrome หรือถอนแอป dev)
3. ถอนแอป dev ออกจากเครื่องทดสอบ: `adb uninstall online.snake1168.app.dev`

## พฤติกรรมที่คาดไว้ (ยังไม่ได้ยืนยันบนเครื่องจริง)

| สถานการณ์ | ผลที่คาด |
|---|---|
| เปิดแอป | splash พื้น `#2A1145` → `https://snake1168.online/lobby` (ไม่ login → เว็บพาไป `/login` ตามเดิม) |
| login/logout | ใช้ระบบเดิมของเว็บ (`localStorage` ใน Chrome) — ไม่มี auth ซ้ำในแอป |
| เปิดเกม (`launchGame`) | URL ของ provider อยู่นอกโดเมนที่ยืนยัน → Custom Tab มีแถบ URL; ปุ่ม back กลับล็อบบี้ |
| LINE / Telegram | Chrome ส่งต่อให้แอปนั้น หรือเปิดใน Custom Tab |
| ปุ่ม back | ย้อน history ของเว็บ; หน้าแรกสุด = ปิดแอป |
| ไม่มีเน็ต | service worker แสดง `/offline.html` (ต้องเคยเปิดเว็บสำเร็จ 1 ครั้งหลัง deploy) |
| ไม่มี Chrome ในเครื่อง | fallback เป็น Custom Tab ของเบราว์เซอร์อื่น |
