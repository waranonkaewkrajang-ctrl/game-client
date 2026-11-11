// Football notifications for the bell, delivered by the dedicated football WebSocket service (football-ws/).
//
// • One WebSocket per browser: the tab holding a Web Lock owns the socket and shares state with other tabs over
//   BroadcastChannel. Without Web Locks each tab connects on its own (still no polling).
// • Every (re)connection starts with a server snapshot → missed events are recovered automatically.
// • Reconnects use exponential backoff with jitter. HTTP (/api/live-football/alerts) is used only while the socket
//   is unavailable, at most once every 5 minutes.
// • Last state is kept in localStorage so a page refresh shows the bell instantly.
import { parseAlerts } from '@/lib/live-football/alerts';
import type { FootballAlert } from '@/lib/live-football/alerts';
import type { AppNotification, NotificationSource } from './types';

const WS_PATH = '/ws/football';
const HTTP_FALLBACK = '/api/live-football/alerts';
const CHANNEL = 'snake-football-notifications';
const LOCK = 'snake-football-ws';
const CACHE_KEY = 'snake_notif_football:v2';
const CACHE_MAX_AGE = 60 * 60_000;
const FALLBACK_INTERVAL = 5 * 60_000;
const FALLBACK_AFTER_FAILURES = 3;
const MAX_BACKOFF = 30_000;

type Message = { type: 'state'; events: FootballAlert[]; connected: boolean } | { type: 'hello' };

const kickoffFormat = new Intl.DateTimeFormat('th-TH', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Bangkok' });
const key = (event: FootballAlert) => `${event.id}:${event.kind}`;

export function eventToNotification(event: FootballAlert): AppNotification {
  const live = event.kind === 'live';
  const start = Date.parse(event.startsAt);
  const time = Number.isFinite(start) ? `${kickoffFormat.format(start)} น.` : null;
  return {
    id: `football:${event.id}:${event.kind}`,
    source: 'football',
    kind: live ? 'football-live' : 'football-soon',
    context: event.league || undefined,
    title: `${event.home} VS ${event.away}`,
    body: live
      ? `เริ่มแข่งขันแล้ว${time ? ` · เตะ ${time}` : ''}`
      : time ? `เริ่มแข่งขันเวลา ${time}` : 'ใกล้เริ่มแข่งขัน',
    status: live ? { label: 'LIVE', tone: 'live' } : { label: 'ใกล้เริ่ม', tone: 'soon' },
    action: live ? 'ดูสด' : 'ดูรายละเอียด',
    images: [event.homeLogo, event.awayLogo],
    href: `/live/watch/${event.id}`,
    at: event.at,
    expiresAt: event.expiresAt,
  };
}

/** Validate wire events (same shape as the alerts API) and drop anything malformed. */
export function validEvents(value: unknown): FootballAlert[] {
  return Array.isArray(value) ? parseAlerts({ alerts: value, updatedAt: 0 })?.alerts ?? [] : [];
}

export function footballSocketUrl(): string {
  const configured = process.env.NEXT_PUBLIC_FOOTBALL_WS_URL;
  if (configured) return configured;
  return `${location.protocol === 'https:' ? 'wss:' : 'ws:'}//${location.host}${WS_PATH}`; // same origin → works on every domain
}

function readCache(): FootballAlert[] | null {
  try {
    const raw = JSON.parse(localStorage.getItem(CACHE_KEY) ?? 'null') as { savedAt?: unknown; events?: unknown } | null;
    if (!raw || typeof raw.savedAt !== 'number' || Date.now() - raw.savedAt > CACHE_MAX_AGE) return null;
    return validEvents(raw.events);
  } catch { return null; }
}
function writeCache(events: FootballAlert[]) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify({ savedAt: Date.now(), events })); } catch { /* blocked storage */ }
}

export const footballSource: NotificationSource = {
  id: 'football',
  start(emit) {
    let stopped = false;
    let leader = false;
    let events = new Map<string, FootballAlert>();
    let connected = false;
    let version = -1;
    let socket: WebSocket | undefined;
    let failures = 0;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    let fallbackTimer: ReturnType<typeof setTimeout> | undefined;
    let releaseLock: (() => void) | undefined;
    const lockAbort = new AbortController();
    const channel = typeof BroadcastChannel === 'function' ? new BroadcastChannel(CHANNEL) : null;

    const publish = () => emit([...events.values()].map(eventToNotification), !connected);
    const share = () => channel?.postMessage({ type: 'state', events: [...events.values()], connected } satisfies Message);
    const replace = (list: FootballAlert[], isConnected: boolean) => {
      events = new Map(list.map(event => [key(event), event]));
      connected = isConnected;
      writeCache(list);
      publish();
      share();
    };

    // ---- follower side: receive state from the tab that owns the socket ----
    if (channel) channel.onmessage = (message: MessageEvent<Message>) => {
      const data = message.data;
      if (data?.type === 'hello') { if (leader) share(); return; }
      if (data?.type === 'state' && !leader) {
        events = new Map(validEvents(data.events).map(event => [key(event), event]));
        connected = data.connected === true;
        publish();
      }
    };

    // ---- leader side: own the WebSocket ----
    function scheduleReconnect() {
      if (stopped) return;
      failures++;
      const delay = Math.min(MAX_BACKOFF, 1000 * 2 ** Math.min(failures - 1, 5)) * (0.5 + Math.random()); // jitter spreads reconnect storms
      clearTimeout(retryTimer);
      retryTimer = setTimeout(connect, delay);
      if (failures === FALLBACK_AFTER_FAILURES) void httpFallback();
    }
    async function httpFallback() {
      clearTimeout(fallbackTimer);
      if (stopped || connected) return;
      try {
        const response = await fetch(HTTP_FALLBACK, { signal: AbortSignal.timeout(10_000) });
        const feed = response.ok ? parseAlerts(await response.json()) : null;
        if (feed && !stopped && !connected) replace(feed.alerts, false);
      } catch { /* keep the last known list */ }
      if (!stopped && !connected) fallbackTimer = setTimeout(httpFallback, FALLBACK_INTERVAL);
    }
    function connect() {
      if (stopped || socket) return;
      let ws: WebSocket;
      try { ws = new WebSocket(footballSocketUrl()); } catch { scheduleReconnect(); return; }
      socket = ws;
      ws.onmessage = (message: MessageEvent) => {
        let data: { t?: unknown; v?: unknown; prev?: unknown; events?: unknown; upsert?: unknown; remove?: unknown };
        try { data = JSON.parse(String(message.data)); } catch { return; }
        if (data.t === 'snapshot' && typeof data.v === 'number') {
          failures = 0;
          clearTimeout(fallbackTimer);
          version = data.v;
          replace(validEvents(data.events), true);
        } else if (data.t === 'delta' && typeof data.v === 'number') {
          if (data.prev !== version) { ws.close(); return; } // gap → reconnect and resync from a snapshot
          version = data.v;
          const next = new Map(events);
          if (Array.isArray(data.remove)) for (const id of data.remove) if (typeof id === 'string') next.delete(id);
          for (const event of validEvents(data.upsert)) next.set(key(event), event);
          replace([...next.values()], true);
        }
      };
      ws.onclose = () => {
        if (socket === ws) socket = undefined;
        if (stopped) return;
        if (connected) { connected = false; publish(); share(); }
        scheduleReconnect();
      };
    }
    const onOnline = () => { if (leader && !socket) { failures = 0; clearTimeout(retryTimer); connect(); } };
    function becomeLeader() {
      leader = true;
      window.addEventListener('online', onOnline);
      connect();
    }

    const cached = readCache();
    if (cached) { events = new Map(cached.map(event => [key(event), event])); publish(); }
    if (typeof navigator !== 'undefined' && navigator.locks?.request) {
      navigator.locks.request(LOCK, { signal: lockAbort.signal }, () => new Promise<void>(resolve => {
        if (stopped) { resolve(); return; }
        releaseLock = resolve;
        becomeLeader();
      })).catch(() => { /* aborted on stop */ });
      channel?.postMessage({ type: 'hello' } satisfies Message); // get the current state from the leader tab
    } else {
      becomeLeader();
    }

    return () => {
      stopped = true;
      clearTimeout(retryTimer);
      clearTimeout(fallbackTimer);
      window.removeEventListener('online', onOnline);
      if (socket) { socket.onclose = null; socket.close(); socket = undefined; }
      lockAbort.abort();
      releaseLock?.();       // hand the socket role to another open tab
      channel?.close();
    };
  },
};
