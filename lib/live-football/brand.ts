// โลโก้ + ข้อความที่วางทับมุมขวาบนของวิดีโอถ่ายทอดสด (ทับกล่องโลโก้ของผู้ให้บริการสตรีม)
// เปลี่ยนได้ผ่าน env ตอน build โดยไม่ต้องแก้โค้ด:
//   NEXT_PUBLIC_STREAM_LOGO     = path/URL ของรูปโลโก้ (แนะนำ webp พื้นใส กว้าง ~320px)
//   NEXT_PUBLIC_STREAM_TAGLINE  = ข้อความใต้โลโก้ (ใส่ค่าว่าง = ไม่แสดงข้อความ)
//   NEXT_PUBLIC_STREAM_BRAND_ALT = ชื่อเว็บ (ใช้เป็น alt ของรูป)
// ตำแหน่ง/ขนาดกล่องอยู่ใน live.module.css (.streamBrand) — วัดจากกล่อง cust_logo_wrap ของตัวเล่นต้นทาง
export const STREAM_BRAND = {
  logo: process.env.NEXT_PUBLIC_STREAM_LOGO || '/images/live-football/stream-logo.webp',
  tagline: process.env.NEXT_PUBLIC_STREAM_TAGLINE ?? 'ครบ จบ ที่เราที่เดียว',
  alt: process.env.NEXT_PUBLIC_STREAM_BRAND_ALT || 'SNAKE168',
};
