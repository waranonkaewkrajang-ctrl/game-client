"use client";
// Game launch — moved verbatim from app/lobby/[provider]/page.tsx so the provider rooms and the lobby's
// favorites tab share one implementation (same endpoint, payload, mobile/desktop handling and error alert).
import api from "@/lib/api";
import Swal from "sweetalert2";

export async function launchGame(game: { product_id: string; game_code: string }) {
  try {
    const res = await api.post("/games/launch", { productId: game.product_id, gameCode: game.game_code, isMobile: window.innerWidth < 768 });
    if (res.data.status === "success" && res.data.data.game_url) {
      const gameUrl = res.data.data.game_url;
      if (/Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)) {
        window.location.href = gameUrl;
      } else {
        window.open(gameUrl, "_blank");
      }
    }
  } catch (err: unknown) {
    const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
    Swal.fire({ icon: "error", title: "เปิดเกมไม่สำเร็จ", text: message || "กรุณาลองใหม่", background: "#ffffff", color: "#0f172a", confirmButtonColor: "#dc2626", confirmButtonText: "ตกลง" });
  }
}

/** shown when useFavoriteGames().toggle returns false (the browser refused to save) */
export function alertFavoriteSaveFailed() {
  Swal.fire({ icon: "error", title: "บันทึกเกมโปรดไม่สำเร็จ", text: "เบราว์เซอร์ไม่อนุญาตให้บันทึกข้อมูล", background: "#ffffff", color: "#0f172a", confirmButtonColor: "#dc2626", confirmButtonText: "ตกลง" });
}
