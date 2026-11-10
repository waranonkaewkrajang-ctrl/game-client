// Resolve an API provider id (games[].product_id / the /lobby/[provider] route param) to one of the
// 54 local logo files in providerLogos.ts.
//
// Explicit alias table only — no fuzzy/string-similarity matching. Ids are normalised (upper-case,
// non-alphanumerics removed) before lookup, so "PG_SOFT", "pg-soft" and "PGSOFT" are the same key.
// Anything not listed returns null → the card shows a plain text label instead (never a wrong logo,
// never a broken URL). Ambiguous short codes (e.g. "EVO", "OG", "DS", "BT", "HB", "SG", "PS") are
// deliberately NOT mapped.

import { PROVIDER_LOGOS, type ProviderLogo } from "./providerLogos";

/** logo path (under /images/providers/) → known provider ids for it */
const ALIASES: Record<string, string[]> = {
  // ---- slot ----
  "slot/pgslot.webp": ["PGSOFT", "PG", "PGSLOT", "POCKETGAMES", "POCKETGAMESSOFT"],
  "slot/joker.webp": ["JOKER", "JOKERGAMING", "JOKER123"],
  "slot/jili.webp": ["JILI", "JILIGAMES", "JILISLOT"],
  "slot/playstar.webp": ["PLAYSTAR"],
  "slot/rsg.webp": ["RSG", "RSGSLOT"],
  "slot/ambslot.webp": ["AMBSLOT", "AMB", "AMBGAMING"],
  "slot/ygr.webp": ["YGR"],
  "slot/pragmaticplay.webp": ["PRAGMATICPLAY", "PRAGMATIC", "PP", "PPSLOT", "PRAGMATICSLOT"],
  "slot/sexyslot.webp": ["SEXYSLOT"],
  "slot/octoplay.webp": ["OCTOPLAY"],
  "slot/5ggames.webp": ["5GGAMES", "5G", "5GAMES"],
  "slot/betsoft.webp": ["BETSOFT"],
  "slot/endorphina.webp": ["ENDORPHINA"],
  "slot/hacksaw.webp": ["HACKSAW", "HACKSAWGAMING"],
  "slot/rich88.webp": ["RICH88"],
  "slot/popok.webp": ["POPOK"],
  "slot/fachai.webp": ["FACHAI", "FC", "FCGAMING"],
  "slot/microgaming.webp": ["MICROGAMING", "MG", "MICRO", "MGSLOT"],
  "slot/spade.webp": ["SPADE", "SPADEGAMING"],
  "slot/blueprint.webp": ["BLUEPRINT", "BLUEPRINTGAMING"],
  "slot/mancala.webp": ["MANCALA", "MANCALAGAMING"],
  "slot/yggdrasil.webp": ["YGGDRASIL", "YGG"],
  "slot/pegasus.webp": ["PEGASUS"],
  "slot/naga.webp": ["NAGA", "NAGAGAMES"],
  "slot/evoplay.webp": ["EVOPLAY"],
  "slot/smartsoft.webp": ["SMARTSOFT", "SMARTSOFTGAMING"],
  "slot/idealgaming.webp": ["IDEALGAMING", "IDEAL"],
  // ---- casino ----
  "casino/sexy.webp": ["SEXY", "SEXYGAMING", "SEXYBACCARAT", "AESEXY", "AECASINO"],
  "casino/allbet.webp": ["ALLBET", "AB"],
  "casino/sa.webp": ["SA", "SAGAMING", "SACASINO"],
  "casino/ongaming.webp": ["ONGAMING"],
  "casino/dreamgaming.webp": ["DREAMGAMING", "DG", "DREAM"],
  "casino/pretty.webp": ["PRETTY", "PRETTYGAMING"],
  "casino/evolution.webp": ["EVOLUTION", "EVOLUTIONGAMING"],
  "casino/pragmaticplaycasino.webp": ["PRAGMATICPLAYCASINO", "PPCASINO", "PRAGMATICCASINO", "PRAGMATICLIVE", "PPLIVE"],
  "casino/wmcasino.webp": ["WMCASINO", "WM"],
  "casino/sv388.webp": ["SV388"],
  // ---- table ----
  "table/kagaming.webp": ["KAGAMING", "KA"],
  "table/playngos.webp": ["PLAYNGO", "PLAYNGOS"],
  "table/nextspin.webp": ["NEXTSPIN"],
  "table/peterandsons.webp": ["PETERANDSONS"],
  "table/dragoonsoft.webp": ["DRAGOONSOFT"],
  "table/btgaming.webp": ["BTGAMING"],
  "table/kingmakers.webp": ["KINGMAKER", "KINGMAKERS", "KM"],
  "table/habanero.webp": ["HABANERO"],
  "table/redtiger.webp": ["REDTIGER"],
  "table/wazdan.webp": ["WAZDAN"],
  "table/relaxgaming.webp": ["RELAXGAMING", "RELAX"],
  "table/netent.webp": ["NETENT"],
  "table/advantplay.webp": ["ADVANTPLAY"],
  "table/cq9.webp": ["CQ9"],
  // ---- sport ----
  "sport/saba.webp": ["SABA", "SABASPORTS"],
  "sport/sbo.webp": ["SBO", "SBOBET"],
  "sport/lalika.webp": ["LALIKA"],
};

/** Ids whose logo depends on the game's category (same provider id for slot and live-casino games). */
const LIVE_CASINO_VARIANT: Record<string, string> = {
  PRAGMATICPLAY: "casino/pragmaticplaycasino.webp",
  PRAGMATIC: "casino/pragmaticplaycasino.webp",
  PP: "casino/pragmaticplaycasino.webp",
};
const LIVE_CATEGORIES = new Set(["LIVECASINO", "LIVE", "CASINO"]);

export const normaliseProviderId = (id: string) => id.toUpperCase().replace(/[^A-Z0-9]/g, "");

const BY_PATH = new Map(PROVIDER_LOGOS.map((l) => [l.src.replace("/images/providers/", ""), l]));
const BY_ID = new Map<string, ProviderLogo>();
for (const [path, ids] of Object.entries(ALIASES)) {
  const logo = BY_PATH.get(path);
  if (!logo) continue; // only files that exist in the manifest
  for (const id of ids) BY_ID.set(normaliseProviderId(id), logo);
}

/** Real provider logo for an API provider id, or null when there is no verified match. */
export function resolveProviderLogo(productId: string | null | undefined, category?: string | null): ProviderLogo | null {
  if (!productId) return null;
  const key = normaliseProviderId(productId);
  if (category && LIVE_CATEGORIES.has(normaliseProviderId(category)) && LIVE_CASINO_VARIANT[key]) {
    return BY_PATH.get(LIVE_CASINO_VARIANT[key]) ?? null;
  }
  return BY_ID.get(key) ?? null;
}
