// Chibi avatars in public/avatars/01.webp … 18.webp (128×128).
// There is no avatar field in the API, so the choice is kept per username in this browser's localStorage.

export const AVATARS = Array.from({ length: 18 }, (_, i) => String(i + 1).padStart(2, "0"));

export const avatarSrc = (id: string) => `/avatars/${id}.webp`;

const key = (username: string) => `profile_avatar:${username}`;

export function loadAvatar(username: string): string | null {
  try {
    const id = localStorage.getItem(key(username));
    return id && AVATARS.includes(id) ? id : null;
  } catch {
    return null;
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
