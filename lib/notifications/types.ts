// Source-agnostic notification model for the header bell.
// Football is the first source; a future admin-message source plugs in through NotificationSource
// without touching the store or the bell UI.

export type NotificationKind = 'football-soon' | 'football-live' | 'admin';

export type AppNotification = {
  /** Globally unique and stable across refreshes: `<source>:<source-specific id>`. Read state is keyed by it. */
  id: string;
  source: string;
  kind: NotificationKind;
  /** Small context line above the title (e.g. league name). */
  context?: string;
  title: string;
  body: string;
  /** Short status chip, e.g. LIVE / ใกล้เริ่ม. */
  status?: { label: string; tone: 'live' | 'soon' | 'info' };
  /** Call-to-action text shown with the link. */
  action?: string;
  /** Optional pictures (e.g. home + away crests). null = placeholder. */
  images?: (string | null)[];
  /** In-app path opened when the notification is selected (null = nothing to open). */
  href: string | null;
  /** When the notification became relevant (ms epoch). Newest first. */
  at: number;
  /** Dropped from the list after this time (ms epoch). */
  expiresAt: number;
};

/**
 * A provider of notifications. `start` begins producing and returns a stop function.
 * Each `emit` call replaces that source's whole list; `failed` = currently disconnected and `items`
 * is the last known good list (a network error never wipes the bell).
 */
export type NotificationSource = {
  id: string;
  start(emit: (items: AppNotification[], failed?: boolean) => void): () => void;
};
