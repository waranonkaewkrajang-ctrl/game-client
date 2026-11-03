// Shared lobby types + pure helpers.
// The predicates below are lifted verbatim from the original inline JSX in
// app/lobby/page.tsx so the provider-room filtering behaves exactly as before.

export interface Game {
  id: number;
  product_id: string;
  game_code: string;
  game_name: string;
  game_name_th: string | null;
  category: string | null;
  type: string | null;
  image_url: string | null;
  is_active: boolean;
}

export interface ProductImage {
  image_url?: string | null;
  [key: string]: unknown;
}

export interface CategoryItem {
  id: string;
  title: string;      // short English label (e.g. "SLOT")
  label: string;      // translated label
  icon: string;
  count?: number;
}

const up = (v: string | null | undefined) => (v || "").toUpperCase();

/** Does a game belong to the category as shown in the provider-room grid? */
export function gameMatchesRoomCategory(g: Game, category: string): boolean {
  if (category === "") return true;
  if (category === "SLOT") return up(g.category) === "EGAMES" && up(g.type) === "SLOT";
  if (category === "FISHING") return up(g.type) === "FISHING";
  return up(g.category) === category.toUpperCase();
}

const SLOT_KEYS = ["SLOT", "SLOTS", "EGAMES"];
/** Slot test used by the "recommended slot providers" strip (original logic). */
export function isSlotGame(g: Game): boolean {
  return SLOT_KEYS.includes(up(g.category)) || SLOT_KEYS.includes(up(g.type));
}

export function gameTitle(g: { game_name_th?: string | null; game_name: string }): string {
  return g.game_name_th || g.game_name;
}
