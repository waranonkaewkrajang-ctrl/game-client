"use client";

import Echo from "laravel-echo";
import Pusher from "pusher-js";

// ให้ Pusher available global (laravel-echo ต้องใช้)
if (typeof window !== "undefined") {
  (window as any).Pusher = Pusher;
}

let echoInstance: Echo<any> | null = null;

/**
 * สร้าง Echo instance สำหรับฟัง WebSocket
 * ใช้ hostname ปัจจุบันของ browser อัตโนมัติ → รองรับทุกโดเมน
 */
export function getEcho(): Echo<any> | null {
  if (typeof window === "undefined") return null;
  if (echoInstance) return echoInstance;

  const token = localStorage.getItem("user_token");
  if (!token) return null;

  echoInstance = new Echo({
    broadcaster: "reverb",
    key: process.env.NEXT_PUBLIC_REVERB_APP_KEY!,
    wsHost: window.location.hostname,        // 🎯 auto ตาม domain ที่ user เข้าอยู่
    wsPort: 443,
    wssPort: 443,
    forceTLS: window.location.protocol === "https:",
    enabledTransports: ["ws", "wss"],
    authorizer: (channel: any) => ({
      authorize: (socketId: string, callback: any) => {
        // ยิง auth ไปที่ /api/broadcasting/auth ผ่านโดเมนปัจจุบัน
        fetch(`${window.location.origin}/api/broadcasting/auth`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            socket_id: socketId,
            channel_name: channel.name,
          }),
        })
          .then((r) => {
            if (!r.ok) throw new Error(`Auth failed: ${r.status}`);
            return r.json();
          })
          .then((data) => callback(null, data))
          .catch((err) => {
            console.error("Echo auth error:", err);
            callback(err, null);
          });
      },
    }),
  });

  return echoInstance;
}

/**
 * ยกเลิกการเชื่อมต่อ WebSocket (เช่นตอน logout)
 */
export function disconnectEcho() {
  if (echoInstance) {
    echoInstance.disconnect();
    echoInstance = null;
  }
}