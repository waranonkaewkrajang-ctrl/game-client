// Chibi avatars in public/avatars/01.webp … 18.webp (128×128).
// The choice is kept per username in this browser's localStorage (instant, works offline) AND saved on the
// server (PUT /member/avatar → users.avatar) so other devices and the admin show the same picture.
// No choice anywhere → the default from utils/avatar.ts getAvatarPath(username) (the admin uses the same rule).
import api from "@/lib/api";
import { readStoredJSON } from "@/lib/safe-json";

export const AVATARS = Array.from({ length: 18 }, (_, i) => String(i + 1).padStart(2, "0"));

export const avatarSrc = (id: string) => `/avatars/${id}.webp`;

const key = (username: string) => `profile_avatar:${username}`;

// the value this browser last saved to (or received from) the server — differs from the local choice = not uploaded yet
const syncedKey = (username: string) => `profile_avatar_synced:${username}`;
const valid = (id: unknown): id is string => typeof id === "string" && AVATARS.includes(id);

function localChoice(username: string): string | null {
  try {
    const id = localStorage.getItem(key(username));
    return valid(id) ? id : null;
  } catch {
    return null;
  }
}

/** the server's value received at login (user_data.avatar) */
function loginAvatar(username: string): string | null {
  const u = readStoredJSON<unknown>("user_data", null);
  if (!u || typeof u !== "object") return null;
  const o = u as { username?: unknown; avatar?: unknown };
  return o.username === username && valid(o.avatar) ? o.avatar : null;
}

export function loadAvatar(username: string): string | null {
  return localChoice(username) ?? loginAvatar(username);
}

function upload(username: string, id: string) {
  api
    .put("/member/avatar", { avatar: id })
    .then(() => {
      try {
        localStorage.setItem(syncedKey(username), id);
      } catch {
        // storage blocked: uploaded again next time, harmless
      }
    })
    .catch(() => {
      // offline / logged out: the local choice stays and is uploaded on the next visit
    });
}

/**
 * Keeps this browser and the server in step (no request when they already agree):
 * - a choice made here that the server does not have yet (made before avatars were saved, or offline) → upload it
 * - otherwise the server's value wins (picked on another device) → show it here too
 * `server` = users.avatar from /auth/me; omitted → the value received at login.
 */
export function reconcileAvatar(username: string, server?: unknown) {
  if (!username) return;
  const local = localChoice(username);
  let synced: string | null = null;
  try {
    synced = localStorage.getItem(syncedKey(username));
  } catch {
    return;
  }
  if (local && synced !== local) {
    upload(username, local);
    return;
  }
  const remote = server === undefined ? loginAvatar(username) : valid(server) ? server : null;
  if (remote && remote !== local) {
    try {
      localStorage.setItem(key(username), remote);
      localStorage.setItem(syncedKey(username), remote);
    } catch {
      return;
    }
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }
}

// same-tab change signal: the browser's "storage" event only reaches OTHER tabs, and the Navbar stays mounted
// while /profile saves a new avatar
const CHANGE_EVENT = "profile-avatar-change";

export function saveAvatar(username: string, id: string) {
  try {
    localStorage.setItem(key(username), id);
  } catch {
    // storage blocked (private mode): the choice still applies until reload
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
  upload(username, id);
}

/** useSyncExternalStore subscriber for the saved avatar (this tab + other tabs). */
export function subscribeAvatar(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}
