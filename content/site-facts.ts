// Verified facts used by the public landing page and the /guide articles.
// Source: the live game catalogue (active games only) and the site's own code — checked 18 Nov 2026.
// Update FACTS_CHECKED_AT and the numbers together when the catalogue changes; never round numbers up.

export const FACTS_CHECKED_AT = "2026-11-18";
export const FACTS_CHECKED_LABEL = "18 พฤศจิกายน 2569";

/** rounded down for public copy ("มากกว่า …") */
export const CATALOGUE = {
  providers: 40, // 42 active provider ids; public copy says "มากกว่า 40 ค่าย"
  games: 4000, // 4,078 active games
  slots: 3600, // 3,681 slot games
  fishing: 80, // 88 fishing games
  liveCasino: 190, // ~190 live casino tables/games
  card: 100, // ~120 card/table games from card providers
} as const;

export const FOOTBALL_LEAGUES = [
  "พรีเมียร์ลีก อังกฤษ",
  "ลาลีกา สเปน",
  "เซเรียอา อิตาลี",
  "บุนเดสลีกา เยอรมนี",
  "ยูฟ่า แชมเปียนส์ลีก",
] as const;

export const LOBBY_CATEGORIES = [
  { id: "popular", label: "ยอดนิยม", english: "HOT GAME", href: "/lobby" },
  { id: "casino", label: "คาสิโน", english: "CASINO", href: "/lobby#casino" },
  { id: "slot", label: "สล็อต", english: "SLOT", href: "/lobby#slot" },
  { id: "fishing", label: "ยิงปลา", english: "FISHING", href: "/lobby#fishing" },
  { id: "card", label: "เกมไพ่", english: "CARD", href: "/lobby#card" },
  { id: "sport", label: "กีฬา", english: "SPORT", href: "/lobby#sport" },
] as const;

export type ProviderGroup = "slot" | "live" | "card" | "sport";

export interface ProviderFact {
  id: string;
  name: string;
  group: ProviderGroup;
  games: number;
  /** game types in the catalogue, largest first (counts are exact as of FACTS_CHECKED_AT) */
  types: string;
  /** a few real titles from the catalogue */
  examples: string[];
  logo?: string;
}

// SEXY_SLOT is active in the catalogue but intentionally not described in public articles (adult-themed titles).
export const PROVIDERS: ProviderFact[] = [
  { id: "PRAGMATIC_SLOT", name: "Pragmatic Play (สล็อต)", group: "slot", games: 576, types: "สล็อต 575 · อาร์เคด 1", examples: ["Gates of Valhalla", "Big Bass Bonanza Megaways", "Extra Juicy Megaways", "Gems Megaways"], logo: "/images/providers/slot/pragmaticplay.webp" },
  { id: "KAGAME", name: "KA Gaming", group: "slot", games: 446, types: "สล็อต 404 · ยิงปลา 35 · โต๊ะ 2", examples: ["Treasure Bowl", "Space Cat", "Aladdin", "Cocorico"], logo: "/images/providers/table/kagaming.webp" },
  { id: "YGGDRASIL", name: "Yggdrasil", group: "slot", games: 267, types: "สล็อต 267", examples: ["Age of Asgard", "Alchymedes", "60 Second Heist", "Pushy Cats"], logo: "/images/providers/slot/yggdrasil.webp" },
  { id: "EVOPLAY", name: "Evoplay", group: "slot", games: 245, types: "สล็อต 208 · อาร์เคด 28 · ไพ่ 8 · โต๊ะ 1", examples: ["Egypt Gods", "Robin Hood", "Clash of Pirates", "Talismans of Fortune"], logo: "/images/providers/slot/evoplay.webp" },
  { id: "JOKER", name: "Joker Gaming", group: "slot", games: 238, types: "สล็อต 218 · ยิงปลา 15 · บิงโก 4 · โต๊ะ 1", examples: ["Respin Mania", "Black Beard Legacy", "Fat Choy Choy Sun", "Fish Haiba"], logo: "/images/providers/slot/joker.webp" },
  { id: "SLOTXO", name: "SlotXO", group: "slot", games: 238, types: "สล็อต 218 · ยิงปลา 15 · บิงโก 4 · โต๊ะ 1", examples: ["Respin Mania", "Mythical Sand", "The Four Invention", "Fish Haiba"] },
  { id: "REDTIGER", name: "Red Tiger", group: "slot", games: 225, types: "สล็อต 225", examples: ["10,001 Nights", "10,001 Nights Megaways", "1942: Sky Warrior", "777 Strike"], logo: "/images/providers/table/redtiger.webp" },
  { id: "PGSOFT", name: "PG Soft", group: "slot", games: 176, types: "สล็อต 176", examples: ["Fortune Rabbit", "Medusa II", "Anubis Wrath", "Honey Trap of Diao Chan"], logo: "/images/providers/slot/pgslot.webp" },
  { id: "HABANERO", name: "Habanero", group: "slot", games: 130, types: "สล็อต 130", examples: ["Orbs of Atlantis", "Totem Towers", "Taberna De Los Muertos Ultra", "Jellyfish Flow Ultra"], logo: "/images/providers/table/habanero.webp" },
  { id: "RELAX", name: "Relax Gaming", group: "slot", games: 117, types: "สล็อต 117", examples: ["Money Train 2", "Temple Tumble 2", "Money Cart 2", "Iron Bank"], logo: "/images/providers/table/relaxgaming.webp" },
  { id: "BOOMING", name: "Booming Games", group: "slot", games: 103, types: "สล็อต 103", examples: ["Booming Seven Deluxe", "Vegas Wins", "Paris Nights", "Wild Diamond 7x"] },
  { id: "NETENT", name: "NetEnt", group: "slot", games: 101, types: "สล็อต 101", examples: ["Blood Suckers II", "Butterfly Staxx 2", "Asgardian Stones", "Silverback Gold"], logo: "/images/providers/table/netent.webp" },
  { id: "CG", name: "CG", group: "slot", games: 95, types: "สล็อต 95", examples: ["Richman", "Amazing Circus", "JurassicWorld", "BreakAway"] },
  { id: "SPADE", name: "Spade Gaming", group: "slot", games: 78, types: "สล็อต 74 · ยิงปลา 4", examples: ["Royale House", "Tiger Dance", "Zombie Party", "Fishing War"], logo: "/images/providers/slot/spade.webp" },
  { id: "PLAYNGO", name: "Play'n GO", group: "slot", games: 72, types: "สล็อต 68 · อาร์เคด 4", examples: ["Book of Dead", "Reactoonz", "Moon Princess", "Rise of Olympus"], logo: "/images/providers/table/playngos.webp" },
  { id: "RICH88", name: "Rich88", group: "slot", games: 69, types: "สล็อต 54 · อาร์เคด 12 · โต๊ะ 2 · ไพ่ 1", examples: ["Wild Island", "Thai Sic Bo", "Three Dice", "777"], logo: "/images/providers/slot/rich88.webp" },
  { id: "ASKMESLOT", name: "AskMe Slot", group: "slot", games: 67, types: "สล็อต 54 · อาร์เคด 11 · ยิงปลา 2", examples: ["Super Ace X", "Royal Thai Dessert", "Treasure of Pirate", "Shiba Mogul"] },
  { id: "ASKMEBET", name: "AskMeBet", group: "slot", games: 67, types: "สล็อต 59 · ยิงปลา 6 · อาร์เคด 2", examples: ["Ocean Lord", "3 Gods Fishing", "Bakufu Shogun", "Diamond Mogul"] },
  { id: "FACHAI", name: "FA CHAI", group: "slot", games: 60, types: "สล็อต 55 · ยิงปลา 4 · อาร์เคด 1", examples: ["Night Market", "Three Little Pigs", "Monkey King Fishing", "Panda Dragon Boat"], logo: "/images/providers/slot/fachai.webp" },
  { id: "NINESGAME", name: "NinesGame", group: "slot", games: 59, types: "สล็อต 59", examples: ["Athena Gold", "Piggy Bank", "Beer Fortune", "Riches of India"] },
  { id: "SIMPLEPLAY", name: "SimplePlay", group: "slot", games: 58, types: "สล็อต 57 · ยิงปลา 1", examples: ["Three Musketeers", "Mystical Lamp", "Sparta's Honor", "Hoo Hey How"] },
  { id: "NEXTSPIN", name: "NextSpin", group: "slot", games: 53, types: "สล็อต 51 · อาร์เคด 2", examples: ["Buffalo King", "Big Cai Shen", "7 Dragons", "Monkey Jump"], logo: "/images/providers/table/nextspin.webp" },
  { id: "AMEBA", name: "Ameba", group: "slot", games: 50, types: "สล็อต 50", examples: ["thaiparadise", "kungfumonkey", "themyth", "fortunelion"] },
  { id: "I8", name: "i8", group: "slot", games: 50, types: "สล็อต 44 · ยิงปลา 6", examples: ["5Dragons", "Classic Fruit", "Treasure Of Caishen", "Candy Rhapsody"] },
  { id: "DRAGONGAMING", name: "Dragon Gaming", group: "slot", games: 49, types: "สล็อต 49", examples: ["Aztec Warrior", "Buffalo Bounty", "Cleopatra's Fortune", "Empire of Riches"] },
  { id: "FUNTA", name: "Funta", group: "slot", games: 48, types: "สล็อต 46 · โต๊ะ 2", examples: ["Crazy Lab", "Polar Party", "Gold Panning", "Elves Town"] },
  { id: "ROYAL", name: "Royal", group: "slot", games: 47, types: "สล็อต 47", examples: ["Fortune Thai", "Royal 777", "Gold Chicken", "Lucky Fruits"] },
  { id: "JILI", name: "JILI", group: "slot", games: 36, types: "สล็อต 36", examples: ["Fortune Tree", "Jungle King", "Night City", "Chin Shi Huang"], logo: "/images/providers/slot/jili.webp" },
  { id: "AMBGAMING", name: "AMB Gaming", group: "slot", games: 32, types: "สล็อต 32", examples: ["Roma", "Maya Adventure", "Golden Lucky Cat", "Mahjong Ways 2 Deluxe"], logo: "/images/providers/slot/ambslot.webp" },
  { id: "ALLBET", name: "Allbet", group: "live", games: 66, types: "บาคาร่า 46 · ไพ่ 6 · เสือมังกร 4 · รูเล็ต 3 · ไฮโล 2 · ป๊อกเด้ง 2 · วัวกระทิง 2 · สล็อต 1", examples: ["Baccarat", "Dragon Tiger", "Roulette", "Sic Bo"], logo: "/images/providers/casino/allbet.webp" },
  { id: "PRAGMATIC_LIVECASINO", name: "Pragmatic Play Live", group: "live", games: 37, types: "รูเล็ต 15 · แบล็กแจ็ก 12 · บาคาร่า 3 · ไพ่ 2 · วงล้อ 2 · ไฮโล 1 · อื่น ๆ 2", examples: ["Auto Mega Roulette", "Speed Roulette 2", "PowerUP Roulette", "Brazilian Roulette"], logo: "/images/providers/casino/pragmaticplaycasino.webp" },
  { id: "BETGAME", name: "BetGames", group: "live", games: 16, types: "วงล้อ 6 · รูเล็ต 3 · โต๊ะ 3 · บาคาร่า 1 · ไฮโล 1 · อื่น ๆ 2", examples: ["Wheel Of Fortune", "Lucky 7", "War Of Bets", "Dice Duel"] },
  { id: "SEXY", name: "Sexy Gaming", group: "live", games: 7, types: "บาคาร่า 4 · เสือมังกร 1 · รูเล็ต 1 · น้ำเต้าปูปลา 1", examples: ["Baccarat Classic", "DragonTiger", "Roulette", "Thai Fish Prawn Crab"], logo: "/images/providers/casino/sexy.webp" },
  { id: "PRETTY", name: "Pretty Gaming", group: "live", games: 5, types: "บาคาร่า · เสือมังกร · รูเล็ต · ไฮโล · หลายโต๊ะ", examples: ["Baccarat", "Dragon-Tiger", "Roulette", "Multi-Table"], logo: "/images/providers/casino/pretty.webp" },
  { id: "SAGAME", name: "SA Gaming", group: "live", games: 1, types: "เปิดเป็นล็อบบี้ของค่าย 1 รายการ", examples: ["SA Gaming (ล็อบบี้)"], logo: "/images/providers/casino/sa.webp" },
  { id: "KINGMAKER", name: "Kingmaker", group: "card", games: 54, types: "โต๊ะ 37 · สล็อต 17", examples: ["Thai Hi Lo 2", "Fish Prawn Crab 2", "Dragon Tiger 2", "Sic Bo"], logo: "/images/providers/table/kingmakers.webp" },
  { id: "AMBPOKER", name: "AMB Poker", group: "card", games: 19, types: "อาร์เคด 7 · ไพ่ 7 · บอร์ด 3 · สล็อต 2", examples: ["Pok Deng", "Kang", "Hilo", "Bingo"] },
  { id: "KINGPOKER", name: "King Poker", group: "card", games: 10, types: "โต๊ะ 6 · สล็อต 1 · แบล็กแจ็ก 1 · ยิงปลา 1 · ป๊อกเด้ง 1", examples: ["Pok Deng", "Bai Cao", "13 Killer", "Fish Prawn Crab"] },
  { id: "SBO", name: "SBOBET", group: "sport", games: 1, types: "เปิดเป็นหน้ากีฬา (SportsBook) 1 รายการ", examples: ["SportsBook"], logo: "/images/providers/sport/sbo.webp" },
  { id: "AMBSPORTBOOK", name: "AMB Sportsbook", group: "sport", games: 1, types: "เปิดเป็นล็อบบี้กีฬา 1 รายการ", examples: ["Lobby"] },
];

export const providersBy = (group: ProviderGroup) => PROVIDERS.filter((p) => p.group === group);
export const providerLogos = () => PROVIDERS.filter((p): p is ProviderFact & { logo: string } => !!p.logo);
