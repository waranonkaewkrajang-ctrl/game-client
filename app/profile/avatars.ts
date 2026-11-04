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

export function saveAvatar(username: string, id: string) {
  try {
    localStorage.setItem(key(username), id);
  } catch {
    // storage blocked (private mode): the choice still applies until reload
  }
}
