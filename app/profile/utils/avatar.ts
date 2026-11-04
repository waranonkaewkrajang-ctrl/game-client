export const AVATAR_COUNT = 18;

/** Default chibi avatar for a username: a stable string hash → /avatars/01.webp … 18.webp (same user, same avatar). */
export function getAvatarPath(username: string): string {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = (hash << 5) - hash + username.charCodeAt(i);
    hash |= 0;
  }
  const id = (Math.abs(hash) % AVATAR_COUNT) + 1;
  return `/avatars/${String(id).padStart(2, "0")}.webp`;
}
