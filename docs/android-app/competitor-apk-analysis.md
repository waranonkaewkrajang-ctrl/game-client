# วิเคราะห์ APK คู่แข่ง (Static analysis เท่านั้น)

> ไฟล์: `Downloads/lobby-app.apk` (69,576,604 bytes)
> วิธีการ: อ่านไฟล์ zip และแปลง binary XML ด้วยสคริปต์ Python (standard library) ในหน่วยความจำ — **ไม่ได้ติดตั้ง ไม่ได้รัน APK ไม่ได้รัน JavaScript หรือ native library ไม่ได้แตกไฟล์ลงดิสก์ ไม่ได้แก้ APK**
> ไม่ได้ดึง credential, API key, token หรือข้อมูลผู้ใช้ — ค่าระบุตัวตนของโปรเจกต์ Expo (`projectId`, `owner`) ถูกปิดไว้ในผลลัพธ์
> สคริปต์ที่ใช้: `apk_inventory.py`, `axml.py`, `scan.py`, `scan2.py` (อยู่ใน scratchpad ของ session ไม่ได้อยู่ใน repo)

## 1. ข้อจำกัดของการวิเคราะห์

| ข้อจำกัด | ผลกระทบ |
|---|---|
| เครื่องนี้ไม่มี aapt/aapt2, apkanalyzer, JADX, Java, Android SDK, adb, emulator | ต้องเขียนตัวแปลง AXML เอง; ไม่ได้ decompile dex เป็นโค้ด; ไม่ได้ resolve ค่า resource (`@7f…`) เช่น theme และชื่อแอป |
| JS bundle เป็น **Hermes bytecode** (magic `c61fbc03c103191f`) | อ่านได้แค่ string table ที่ต่อกันเป็นก้อน ไม่เห็นโครงสร้าง component/หน้าจอ |
| ชื่อ resource ถูก obfuscate (`res/Cp.png` …) | ระบุไม่ได้ว่ารูปไหนใช้ที่ไหน |
| ไม่ได้รันแอป (ตามข้อกำหนด) | **ยืนยันพฤติกรรมตอนรันไม่ได้** เช่น URL ที่ WebView โหลดจริง การล็อกแนวจอ จำนวนหน้าจอ native |

## 2. ข้อเท็จจริงที่ยืนยันแล้ว (Confirmed)

### 2.1 ข้อมูลแพ็กเกจ (จาก AndroidManifest.xml)

| รายการ | ค่า |
|---|---|
| package | `com.lobbyapp.tggwf` |
| versionCode / versionName | `1` / `512.926.793` |
| version ใน `assets/app.config` | `657.810.216` (ไม่ตรงกับ versionName) |
| minSdk / targetSdk / compileSdk | 23 / 34 / 34 (Android 14) |
| Android Gradle Plugin | 8.2.1 (`META-INF/.../app-metadata.properties`) |
| การเซ็น | v1 (`CERT.RSA`/`CERT.SF`) + v2 (`0x7109871a`) — ไม่พบ v3 |
| `allowBackup` | `true` |
| `usesCleartextTraffic` / `networkSecurityConfig` | ไม่ได้ประกาศ (ค่าเริ่มต้นของ targetSdk 34 = ห้าม cleartext) |
| `debuggable` | ไม่ได้ประกาศ (= false) |
| Deep link scheme | `lobbyapp://`, `com.lobbyapp.tggwf://` (custom scheme เท่านั้น ไม่มี https App Links) |
| Activity หลัก | `MainActivity` เดียว, `launchMode=singleTask`, `windowSoftInputMode=adjustResize` |

### 2.2 Permissions

| Permission | หมายเหตุ |
|---|---|
| `INTERNET` | จำเป็น |
| `VIBRATE` | ทั่วไป |
| `READ_EXTERNAL_STORAGE`, `WRITE_EXTERNAL_STORAGE` | ล้าสมัยบน Android 13+ — เกินความจำเป็นสำหรับแอปล็อบบี้ |
| `SYSTEM_ALERT_WINDOW` (วาดทับแอปอื่น) | **สิทธิ์อ่อนไหว** ไม่มีเหตุผลที่เห็นได้สำหรับแอปประเภทนี้ (มักติดมากับ dev menu ของ React Native ถ้าไม่ได้ตัดออกใน release) |
| `DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION` | สร้างโดย androidx อัตโนมัติ |

`<queries>` ประกาศ: เปิด https ด้วยเบราว์เซอร์, `OPEN_DOCUMENT_TREE`, `CustomTabsService`

### 2.3 Framework (จากชื่อ native library และ dex)

| หลักฐาน | สรุป |
|---|---|
| `libreactnativejni`, `libfabricjni`, `librninstance`, `libreact_codegen_rncore` | **React Native (New Architecture / Fabric)** |
| `libhermes`, `libhermes_executor` + bundle เป็น Hermes bytecode | **Hermes engine** |
| `libexpo-modules-core`, `assets/app.config` (`sdkVersion: 51.0.0`), plugin `expo-router`, `expo-screen-orientation` | **Expo SDK 51 + expo-router** |
| `libreanimated`, `librnscreens`, `RNGestureHandler` strings | react-native-reanimated, react-native-screens, gesture-handler |
| `RNCWebViewFileProvider` ใน manifest, `RNCWebView` 60 ครั้งใน dex, 2 ครั้งใน bundle | **ใช้ react-native-webview** (ฝั่ง JS import จริง ไม่ใช่แค่ติดมา) |
| prop ของ WebView ใน bundle: `originWhitelist`, `onShouldStartLoadWithRequest`, `injectedJavaScript`, `mixedContentMode`, `setSupportMultipleWindows`, `applicationNameForUserAgent` | มีการตั้งค่า WebView — **แต่ string เหล่านี้อาจมาจากตัวไลบรารีเอง ไม่ได้ยืนยันว่าแอปตั้งค่าอะไร** |
| `expo.modules.updates.ENABLED=false` | ปิด OTA update ของ Expo |
| okhttp3, Kotlin, androidx.browser (Custom Tabs) | ไลบรารีมาตรฐานของ RN/Expo |

### 2.4 การตั้งค่าหน้าจอ (`assets/app.config`)

- `android.statusBar.hidden: true`, `androidNavigationBar.visible: "immersive"` → **เต็มจอแบบ immersive** (ซ่อน status bar และ navigation bar)
- `expo-screen-orientation` ตั้ง `initialOrientation: "DEFAULT"` → ไม่ได้ล็อกแนวจอตอนเริ่ม (อาจล็อกตอนรันด้วยโค้ด — ยืนยันไม่ได้)
- splash พื้นดำ `#000000`, `userInterfaceStyle: automatic`
- `platforms: ["ios","android","web"]` → เป็นโปรเจกต์ Expo หลายแพลตฟอร์ม

### 2.5 ขนาด

| ส่วน | ขนาด (บีบอัด) | สัดส่วน |
|---|---|---|
| `lib/` (4 ABI × 47 libs) | 59.29 MB | **~85%** |
| — arm64-v8a / armeabi-v7a / x86 / x86_64 | 16.05 / 10.89 / 16.00 / 16.35 MB | |
| dex (3 ไฟล์) | ~6.1 MB | |
| `res/` + `resources.arsc` | ~2.6 MB | |
| JS bundle (Hermes) | 1.9 MB (ไม่บีบอัด) | |
| รูปภาพในแอปทั้งหมด | 233 ไฟล์ ใหญ่สุด 145 KB (ไอคอน/splash หลาย density) | |

## 3. ข้อสรุปที่ **ไม่แน่นอน** (Uncertain — ต้องรันแอปถึงจะยืนยันได้)

| สมมติฐาน | หลักฐานที่สนับสนุน | หลักฐานที่ขัด/ขาด |
|---|---|---|
| UI ล็อบบี้หลักเป็นเว็บที่โหลดผ่าน WebView | ใช้ react-native-webview จริง; JS bundle เล็ก (1.9 MB); ไม่มีภาพเกม/ภาพล็อบบี้ในแอปเลย; ไม่พบ `fetch(` ใน bundle; ชื่อแอป "Lobby" | มี expo-router + react-navigation + FlatList ซึ่งอาจมีหน้าจอ native บางส่วน; Hermes ทำให้นับหน้าจอไม่ได้ — **สรุปไม่ได้ว่าทั้งแอปเป็น WebView** |
| ตัวแอปถูกสร้างจาก template/ระบบสร้างแอปอัตโนมัติ | package มี suffix สุ่ม (`tggwf`), versionName เป็นเลขสุ่มและไม่ตรงกับ app.config, versionCode = 1 | ไม่มีหลักฐานตรง |
| ไม่ได้ตั้งใจเผยแพร่ผ่าน Google Play | APK แบบ universal (รวม x86/x86_64 ที่มือถือแทบไม่ใช้); มีลายเซ็น v1+v2 สำหรับติดตั้งตรง; Play ต้องใช้ AAB | อาจมีเวอร์ชัน AAB แยก |
| มีโดเมน API ฝังอยู่ | พบ hostname `api.*` หนึ่งรายการใน string table | ไม่รู้ว่าใช้ทำอะไร (ไม่ได้ตามต่อ ตามข้อกำหนด) |

## 4. ข้อสังเกตด้านความปลอดภัย/คุณภาพของคู่แข่ง (เพื่อไม่ทำซ้ำ)

1. ขอ `SYSTEM_ALERT_WINDOW` และ storage permission เดิม → ผู้ใช้เห็นคำเตือนเยอะ และ Play Protect/Play review มองว่าเสี่ยง
2. `allowBackup=true` → ข้อมูลแอป (รวม token ใน WebView storage) อาจถูก backup ออกไปได้
3. Universal APK 69.6 MB → ดาวน์โหลดหนักกว่าที่จำเป็นราว 4 เท่า (เฉพาะ arm64 ≈ 16 MB native + ส่วนกลาง ≈ 25 MB)
4. Deep link เป็น custom scheme ไม่มี App Links ที่ยืนยันโดเมน → แอปอื่นแย่ง scheme ได้
5. ไม่มี v3 signature → หมุนเปลี่ยน key ไม่ได้

## 5. โอกาสสำหรับเรา

| ด้าน | คู่แข่ง | เราทำได้ดีกว่า |
|---|---|---|
| ขนาด | 69.6 MB | TWA ~1–2 MB / Kotlin WebView ~2–5 MB (ประมาณการ ยังไม่ได้ build) |
| Permission | 5 รายการรวมสิทธิ์อ่อนไหว | `INTERNET` อย่างเดียว |
| อัปเดต | ต้องออก APK ใหม่ (OTA ปิด) | เนื้อหามาจากเว็บ deploy ครั้งเดียวได้ทุกเครื่อง |
| ความปลอดภัย | allowBackup=true, custom scheme | allowBackup=false, App Links + Digital Asset Links |
| เต็มจอ | immersive | ทำได้เหมือนกัน (TWA `display: fullscreen` / WebView immersive) |

**ไม่มีการคัดลอก** โค้ด รูป โลโก้ ชื่อ หรือ asset ใดๆ ของคู่แข่ง — ใช้เฉพาะข้อเท็จจริงเชิงเทคนิคเพื่อเปรียบเทียบ
