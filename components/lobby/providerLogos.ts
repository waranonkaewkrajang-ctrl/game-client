// Provider logos for the lobby footer — real files in /public/images/providers/{slot,casino,table,sport}/.
// Downloaded from the URLs in design-reference/provider-logos.html (same order) and verified:
// PNG sources → lossless WebP (pixel-identical, alpha kept); sources that were already lossy WebP → original bytes.
// width/height are the files' intrinsic pixel sizes (most share the source's 300×164 padded canvas).

export type ProviderCategory = "slot" | "casino" | "table" | "sport";

export interface ProviderLogo {
  category: ProviderCategory;
  /** provider name, used as alt text */
  name: string;
  /** path under /public */
  src: string;
  /** intrinsic size of the file in px */
  width: number;
  height: number;
}

export const PROVIDER_LOGOS: ProviderLogo[] = [
  { category: "slot", name: "PG Soft", src: "/images/providers/slot/pgslot.webp", width: 300, height: 164 },
  { category: "slot", name: "Joker Gaming", src: "/images/providers/slot/joker.webp", width: 300, height: 164 },
  { category: "slot", name: "JILI", src: "/images/providers/slot/jili.webp", width: 300, height: 164 },
  { category: "slot", name: "PlayStar", src: "/images/providers/slot/playstar.webp", width: 300, height: 164 },
  { category: "slot", name: "RSG", src: "/images/providers/slot/rsg.webp", width: 300, height: 164 },
  { category: "slot", name: "AMB Slot", src: "/images/providers/slot/ambslot.webp", width: 300, height: 164 },
  { category: "slot", name: "YGR", src: "/images/providers/slot/ygr.webp", width: 300, height: 164 },
  { category: "slot", name: "Pragmatic Play", src: "/images/providers/slot/pragmaticplay.webp", width: 300, height: 164 },
  { category: "slot", name: "Sexy Gaming Slot", src: "/images/providers/slot/sexyslot.webp", width: 300, height: 164 },
  { category: "slot", name: "Octoplay", src: "/images/providers/slot/octoplay.webp", width: 1250, height: 684 },
  { category: "slot", name: "5G Games", src: "/images/providers/slot/5ggames.webp", width: 300, height: 164 },
  { category: "slot", name: "Betsoft", src: "/images/providers/slot/betsoft.webp", width: 300, height: 164 },
  { category: "slot", name: "Endorphina", src: "/images/providers/slot/endorphina.webp", width: 300, height: 164 },
  { category: "slot", name: "Hacksaw Gaming", src: "/images/providers/slot/hacksaw.webp", width: 300, height: 164 },
  { category: "slot", name: "Rich88", src: "/images/providers/slot/rich88.webp", width: 1250, height: 684 },
  { category: "slot", name: "PopOK", src: "/images/providers/slot/popok.webp", width: 300, height: 164 },
  { category: "slot", name: "FA CHAI", src: "/images/providers/slot/fachai.webp", width: 625, height: 342 },
  { category: "slot", name: "Microgaming", src: "/images/providers/slot/microgaming.webp", width: 300, height: 164 },
  { category: "slot", name: "Spade Gaming", src: "/images/providers/slot/spade.webp", width: 300, height: 164 },
  { category: "slot", name: "Blueprint Gaming", src: "/images/providers/slot/blueprint.webp", width: 300, height: 164 },
  { category: "slot", name: "Mancala Gaming", src: "/images/providers/slot/mancala.webp", width: 300, height: 164 },
  { category: "slot", name: "Yggdrasil", src: "/images/providers/slot/yggdrasil.webp", width: 300, height: 164 },
  { category: "slot", name: "Pegasus", src: "/images/providers/slot/pegasus.webp", width: 300, height: 164 },
  { category: "slot", name: "NAGA Games", src: "/images/providers/slot/naga.webp", width: 300, height: 164 },
  { category: "slot", name: "Evoplay", src: "/images/providers/slot/evoplay.webp", width: 300, height: 164 },
  { category: "slot", name: "SmartSoft", src: "/images/providers/slot/smartsoft.webp", width: 300, height: 164 },
  { category: "slot", name: "Ideal Gaming", src: "/images/providers/slot/idealgaming.webp", width: 300, height: 164 },
  { category: "casino", name: "Sexy Gaming", src: "/images/providers/casino/sexy.webp", width: 500, height: 180 },
  { category: "casino", name: "Allbet", src: "/images/providers/casino/allbet.webp", width: 300, height: 164 },
  { category: "casino", name: "SA Gaming", src: "/images/providers/casino/sa.webp", width: 300, height: 164 },
  { category: "casino", name: "On Gaming", src: "/images/providers/casino/ongaming.webp", width: 300, height: 128 },
  { category: "casino", name: "Dream Gaming", src: "/images/providers/casino/dreamgaming.webp", width: 300, height: 164 },
  { category: "casino", name: "Pretty Gaming", src: "/images/providers/casino/pretty.webp", width: 300, height: 164 },
  { category: "casino", name: "Evolution", src: "/images/providers/casino/evolution.webp", width: 300, height: 164 },
  { category: "casino", name: "Pragmatic Play Live", src: "/images/providers/casino/pragmaticplaycasino.webp", width: 300, height: 164 },
  { category: "casino", name: "WM Casino", src: "/images/providers/casino/wmcasino.webp", width: 300, height: 164 },
  { category: "casino", name: "SV388", src: "/images/providers/casino/sv388.webp", width: 300, height: 164 },
  { category: "table", name: "KA Gaming", src: "/images/providers/table/kagaming.webp", width: 300, height: 164 },
  { category: "table", name: "Play'n GO", src: "/images/providers/table/playngos.webp", width: 1250, height: 684 },
  { category: "table", name: "NextSpin", src: "/images/providers/table/nextspin.webp", width: 300, height: 164 },
  { category: "table", name: "Peter & Sons", src: "/images/providers/table/peterandsons.webp", width: 300, height: 164 },
  { category: "table", name: "Dragoon Soft", src: "/images/providers/table/dragoonsoft.webp", width: 300, height: 164 },
  { category: "table", name: "BT Gaming", src: "/images/providers/table/btgaming.webp", width: 300, height: 164 },
  { category: "table", name: "Kingmaker", src: "/images/providers/table/kingmakers.webp", width: 300, height: 164 },
  { category: "table", name: "Habanero", src: "/images/providers/table/habanero.webp", width: 300, height: 164 },
  { category: "table", name: "Red Tiger", src: "/images/providers/table/redtiger.webp", width: 1250, height: 684 },
  { category: "table", name: "Wazdan", src: "/images/providers/table/wazdan.webp", width: 300, height: 164 },
  { category: "table", name: "Relax Gaming", src: "/images/providers/table/relaxgaming.webp", width: 300, height: 164 },
  { category: "table", name: "NetEnt", src: "/images/providers/table/netent.webp", width: 300, height: 164 },
  { category: "table", name: "AdvantPlay", src: "/images/providers/table/advantplay.webp", width: 300, height: 164 },
  { category: "table", name: "CQ9", src: "/images/providers/table/cq9.webp", width: 300, height: 164 },
  { category: "sport", name: "SABA Sports", src: "/images/providers/sport/saba.webp", width: 300, height: 164 },
  { category: "sport", name: "SBOBET", src: "/images/providers/sport/sbo.webp", width: 300, height: 164 },
  { category: "sport", name: "Lalika", src: "/images/providers/sport/lalika.webp", width: 300, height: 164 },
];
