import { FACTS_CHECKED_AT, providersBy } from "../site-facts";
import type { Guide } from "./types";

const slot = providersBy("slot");
const pick = (id: string) => slot.find((p) => p.id === id)!;
const line = (id: string) => {
  const p = pick(id);
  return `${p.name}: ${p.games} รายการ (${p.types}) ตัวอย่างเกม ${p.examples.slice(0, 3).join(", ")}`;
};

export const slotProviders: Guide = {
  slug: "slot-providers",
  topic: "providers",
  title: "ค่ายสล็อตบน SNAKE168 | เปรียบเทียบจำนวนเกมและจุดเด่นแต่ละค่าย",
  description: `เปรียบเทียบค่ายสล็อต ${slot.length} ค่ายบน SNAKE168 ทั้งค่ายที่มีเกมมากที่สุด ค่ายที่มีเกมยิงปลาและอาร์เคด และค่ายที่เน้นธีมเอเชีย พร้อมตัวอย่างชื่อเกมจริง`,
  h1: "ค่ายสล็อตบน SNAKE168: จำนวนเกมและจุดเด่นของแต่ละค่าย",
  answer: `SNAKE168 มีค่ายในกลุ่มสล็อต ${slot.length} ค่าย ค่ายที่มีเกมมากที่สุดคือ Pragmatic Play, KA Gaming, Yggdrasil, Evoplay, Joker Gaming และ SlotXO ถ้าต้องการเกมยิงปลาร่วมด้วย ให้ดู KA Gaming, Joker Gaming หรือ AskMeBet ส่วนผู้ที่ชอบธีมเอเชียและเกมแนวตั้งบนมือถือ PG Soft, Royal และ AskMe Slot เป็นตัวเลือกที่ตรงกว่า`,
  updated: FACTS_CHECKED_AT,
  sections: [
    {
      id: "biggest",
      title: "ค่ายที่มีเกมมากที่สุด",
      blocks: [
        { type: "p", text: "ถ้าต้องการตัวเลือกมาก ๆ ในค่ายเดียว กลุ่มนี้มีเกมมากกว่า 200 รายการต่อค่าย ตัวเลขนับจากเกมที่เปิดอยู่ ณ วันที่ตรวจสอบ" },
        { type: "ul", items: ["PRAGMATIC_SLOT", "KAGAME", "YGGDRASIL", "EVOPLAY", "JOKER", "REDTIGER"].map(line) },
        { type: "note", text: "Joker Gaming และ SlotXO มีจำนวนและชื่อเกมชุดเดียวกันหลายเกม หากหาเกมในค่ายหนึ่งไม่เจอ ลองเปิดอีกค่าย" },
      ],
    },
    {
      id: "megaways-features",
      title: "ค่ายที่เด่นด้านสล็อตฟีเจอร์และ Megaways",
      blocks: [
        { type: "p", text: "หลายค่ายจากยุโรปมีเกมที่มีฟีเจอร์ซับซ้อน เช่น วงล้อที่จำนวนสัญลักษณ์เปลี่ยนได้ (Megaways) สัญลักษณ์ตกหล่น หรือรอบโบนัสหลายชั้น เหมาะกับผู้ที่อ่านกติกาเกมก่อนเล่นและชอบลองระบบใหม่" },
        { type: "ul", items: ["RELAX", "NETENT", "PLAYNGO", "HABANERO", "BOOMING"].map(line) },
        { type: "p", text: "เกมของค่ายกลุ่มนี้มักมีหน้าข้อมูลภายในเกมที่อธิบายฟีเจอร์และค่าที่ค่ายประกาศไว้ละเอียด ควรเปิดอ่านก่อนวางเดิมพันครั้งแรก" },
      ],
    },
    {
      id: "asian",
      title: "ค่ายที่เน้นธีมเอเชียและเล่นบนมือถือ",
      blocks: [
        { type: "p", text: "ค่ายกลุ่มนี้มีเกมธีมจีนและไทยจำนวนมาก หลายเกมออกแบบให้เล่นในแนวตั้งบนมือถือ" },
        { type: "ul", items: ["PGSOFT", "ROYAL", "ASKMESLOT", "JILI", "NEXTSPIN", "FACHAI"].map(line) },
      ],
    },
    {
      id: "mixed",
      title: "ค่ายที่มีสล็อตพร้อมยิงปลาหรืออาร์เคด",
      blocks: [
        { type: "p", text: "ถ้าต้องการสลับไปเล่นเกมแบบอื่นโดยไม่เปลี่ยนค่าย ค่ายต่อไปนี้มีเกมหลายประเภทในค่ายเดียว" },
        {
          type: "table",
          caption: "ค่ายที่มีเกมมากกว่าหนึ่งประเภท",
          head: ["ค่าย", "จำนวนรายการ", "ประเภทเกม"],
          rows: slot.filter((p) => p.types.includes("·")).map((p) => [p.name, String(p.games), p.types]),
        },
      ],
    },
    {
      id: "all",
      title: "ตารางค่ายสล็อตทั้งหมด",
      blocks: [
        {
          type: "table",
          caption: "ค่ายในกลุ่มสล็อตทั้งหมด เรียงตามจำนวนเกม พร้อมตัวอย่างชื่อเกมจากรายการจริง",
          head: ["ค่าย", "จำนวนรายการ", "ตัวอย่างเกม"],
          rows: slot.map((p) => [p.name, String(p.games), p.examples.slice(0, 3).join(", ")]),
        },
        { type: "note", text: "ชื่อเกมแสดงตามที่ค่ายตั้งไว้ในระบบ บางค่ายใช้ชื่อตัวพิมพ์เล็กติดกัน เช่น thaiparadise ของ Ameba" },
      ],
    },
    {
      id: "choose",
      title: "เลือกค่ายอย่างไรให้ตรงกับที่ชอบ",
      blocks: [
        {
          type: "ol",
          items: [
            "ชอบความหลากหลาย: เริ่มที่ Pragmatic Play หรือ KA Gaming ที่มีเกมหลายร้อยรายการ",
            "ชอบฟีเจอร์ซับซ้อน: ลอง Relax Gaming, NetEnt, Play'n GO หรือ Yggdrasil",
            "เล่นบนมือถือเป็นหลัก: ลอง PG Soft, JILI หรือ AskMe Slot",
            "อยากสลับไปยิงปลา: เลือก KA Gaming, Joker Gaming หรือ AskMeBet",
            "เมื่อเจอเกมที่ชอบ กดหัวใจเก็บไว้ เพราะล็อบบี้ยังไม่มีช่องค้นหาชื่อเกม",
          ],
        },
        { type: "p", text: "ไม่ว่าเลือกค่ายใด ผลของเกมสุ่มโดยระบบของค่ายและไม่มีการรับประกันผล อ่านเพิ่มที่ [สล็อตออนไลน์บน SNAKE168](/guide/slot-games)" },
      ],
    },
  ],
  faq: [
    { q: "ค่ายสล็อตไหนมีเกมมากที่สุด?", a: "Pragmatic Play มีเกมสล็อตมากที่สุด คือ 575 เกม รองลงมาคือ KA Gaming 404 เกม" },
    { q: "ค่ายไหนมีทั้งสล็อตและยิงปลา?", a: "KA Gaming, Joker Gaming, SlotXO, AskMeBet, i8, FA CHAI, Spade Gaming, AskMe Slot และ SimplePlay มีทั้งสองประเภท" },
    { q: "ทำไมบางค่ายแสดงเป็นชื่อแทนโลโก้?", a: "ค่ายที่ไม่มีไฟล์โลโก้ที่ถูกต้องในระบบจะแสดงเป็นชื่อ เพื่อไม่ให้แสดงโลโก้ผิดค่าย" },
  ],
  summary: [
    `มีค่ายในกลุ่มสล็อต ${slot.length} ค่าย`,
    "ค่ายใหญ่สุด: Pragmatic Play, KA Gaming, Yggdrasil, Evoplay",
    "เลือกค่ายตามสไตล์: หลากหลาย ฟีเจอร์ซับซ้อน มือถือ หรือมียิงปลา",
  ],
  related: ["slot-games", "game-providers", "casino-card-providers", "lobby-guide"],
  cta: { href: "/lobby#slot", label: "เปิดหมวดสล็อต" },
};
