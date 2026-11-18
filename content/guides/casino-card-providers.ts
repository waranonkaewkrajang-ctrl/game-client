import { FACTS_CHECKED_AT, providersBy } from "../site-facts";
import type { Guide } from "./types";

const live = providersBy("live");
const card = providersBy("card");
const sport = providersBy("sport");

export const casinoCardProviders: Guide = {
  slug: "casino-card-providers",
  topic: "providers",
  title: "ค่ายคาสิโนสด เกมไพ่ และกีฬาบน SNAKE168 | Allbet, Pragmatic Live, Kingmaker",
  description: "รายละเอียดค่ายคาสิโนสด ค่ายเกมไพ่ และค่ายกีฬาบน SNAKE168 ว่าแต่ละค่ายมีเกมอะไร จำนวนเท่าไร และต่างกันอย่างไร",
  h1: "ค่ายคาสิโนสด เกมไพ่ และกีฬาบน SNAKE168",
  answer: `ฝั่งคาสิโนสดมี ${live.length} ค่าย โดย Allbet มีรายการมากที่สุด (บาคาร่า 46 โต๊ะ) และ Pragmatic Play Live เด่นด้านรูเล็ตและแบล็กแจ็ก ฝั่งเกมไพ่แบบกราฟิกมี ${card.length} ค่าย คือ Kingmaker, AMB Poker และ King Poker ส่วนกีฬามี SBOBET และ AMB Sportsbook ซึ่งเปิดเป็นหน้ากีฬาของค่ายโดยตรง`,
  updated: FACTS_CHECKED_AT,
  sections: [
    {
      id: "live",
      title: "ค่ายคาสิโนสด",
      blocks: [
        { type: "p", text: "ค่ายคาสิโนสดถ่ายทอดเกมจากสตูดิโอพร้อมดีลเลอร์ ตารางนี้แสดงประเภทเกมของแต่ละค่าย นับจากรายการที่เปิดอยู่ ณ วันที่ตรวจสอบ" },
        {
          type: "table",
          caption: "ค่ายคาสิโนสด จำนวนรายการ และประเภทเกม",
          head: ["ค่าย", "จำนวนรายการ", "ประเภทเกม", "ตัวอย่าง"],
          rows: live.map((p) => [p.name, String(p.games), p.types, p.examples.slice(0, 3).join(", ")]),
        },
        { type: "h3", text: "เลือกค่ายคาสิโนสดตามเกมที่ชอบ" },
        {
          type: "ul",
          items: [
            "บาคาร่าหลายโต๊ะ: Allbet มีโต๊ะบาคาร่ามากที่สุด",
            "รูเล็ตและแบล็กแจ็ก: Pragmatic Play Live มีรูเล็ต 15 รายการ และแบล็กแจ็ก 12 รายการ",
            "เกมรอบสั้นแบบวงล้อและลูกเต๋า: BetGames",
            "น้ำเต้าปูปลาแบบสด: Sexy Gaming (Thai Fish Prawn Crab)",
            "เลือกโต๊ะภายในระบบของค่ายเอง: SA Gaming ซึ่งเปิดเป็นล็อบบี้ของค่าย",
          ],
        },
      ],
    },
    {
      id: "card",
      title: "ค่ายเกมไพ่แบบกราฟิก",
      blocks: [
        { type: "p", text: "ค่ายกลุ่มนี้อยู่ในหมวดเกมไพ่ของล็อบบี้ ไม่มีดีลเลอร์สด ระบบของเกมเป็นผู้แจกไพ่หรือทอยลูกเต๋า เริ่มรอบได้ทันที" },
        {
          type: "table",
          caption: "ค่ายในหมวดเกมไพ่",
          head: ["ค่าย", "จำนวนรายการ", "ประเภทเกม", "ตัวอย่าง"],
          rows: card.map((p) => [p.name, String(p.games), p.types, p.examples.join(", ")]),
        },
        { type: "p", text: "ความต่างระหว่างเกมไพ่แบบกราฟิกกับคาสิโนสด อธิบายไว้ใน [เกมยิงปลาและเกมไพ่](/guide/fishing-and-card-games)" },
      ],
    },
    {
      id: "sport",
      title: "ค่ายกีฬา",
      blocks: [
        {
          type: "table",
          caption: "ค่ายในหมวดกีฬา",
          head: ["ค่าย", "รูปแบบ"],
          rows: sport.map((p) => [p.name, p.types]),
        },
        { type: "p", text: "รายการแข่งขัน ประเภทกีฬา และอัตราต่อรองแสดงโดยระบบของค่าย ไม่ได้อยู่ในรายการเกมของเว็บไซต์ หากต้องการดูตารางฟุตบอลลีกหลักก่อน ใช้หน้า [บอลสด](/live) อ่านวิธีใช้ที่ [โปรแกรมฟุตบอล](/guide/football-schedule)" },
      ],
    },
    {
      id: "tips",
      title: "ข้อควรรู้ก่อนเข้าเกมของค่าย",
      blocks: [
        {
          type: "ul",
          items: [
            "แต่ละค่ายมีกติกาปลีกย่อยและอัตราจ่ายของตัวเอง ให้อ่านในเมนูกติกาภายในเกม",
            "วงเงินเดิมพันขั้นต่ำและสูงสุดของโต๊ะกำหนดโดยค่าย",
            "เครดิตที่ใช้ในเกมของทุกค่ายมาจากกระเป๋าเงินเดียวกันในบัญชีของคุณ",
            "ผลของเกมมาจากระบบของค่าย SNAKE168 ไม่ได้กำหนดหรือปรับผล",
          ],
        },
      ],
    },
  ],
  faq: [
    { q: "ค่ายไหนมีบาคาร่ามากที่สุด?", a: "Allbet มีโต๊ะบาคาร่า 46 โต๊ะ มากที่สุดในเว็บไซต์" },
    { q: "ป๊อกเด้งมีในค่ายไหนบ้าง?", a: "แบบมีดีลเลอร์สดอยู่ที่ Allbet ส่วนแบบกราฟิกอยู่ที่ AMB Poker และ King Poker" },
    { q: "ค่ายกีฬามีกีฬาอะไรบ้าง?", a: "รายการกีฬาขึ้นอยู่กับระบบของ SBOBET และ AMB Sportsbook ในแต่ละช่วงเวลา ดูได้หลังเปิดหน้ากีฬาของค่าย" },
  ],
  summary: [
    `คาสิโนสด ${live.length} ค่าย: Allbet มีมากที่สุด, Pragmatic Play Live เด่นรูเล็ตและแบล็กแจ็ก`,
    `เกมไพ่แบบกราฟิก ${card.length} ค่าย: Kingmaker, AMB Poker, King Poker`,
    "กีฬา 2 ค่าย เปิดเป็นหน้ากีฬาของค่ายโดยตรง",
  ],
  related: ["live-casino", "fishing-and-card-games", "game-providers", "football-schedule"],
  cta: { href: "/lobby#casino", label: "เปิดหมวดคาสิโน" },
};
