// Pure event logic for the football notification WebSocket service (no I/O — unit tested).
// Events come from the Next app's /api/live-football/alerts (built from the existing shared football cache).

export const MAX_EVENTS = 50;
const ID = /^\d{1,18}$/;
const LOGO_HOST = 'cmbi.laner220.com';

function text(value, max = 180) { return typeof value === 'string' ? value.slice(0, max) : ''; }
function logo(value) {
  if (typeof value !== 'string' || value.length > 500) return null;
  try { const url = new URL(value); return url.protocol === 'https:' && url.hostname === LOGO_HOST ? url.href : null; } catch { return null; }
}

/** Validate the alerts payload into wire events keyed by a stable event id `<matchId>:<soon|live>`. */
export function toEvents(payload) {
  if (!payload || typeof payload !== 'object' || !Array.isArray(payload.alerts)) throw new Error('invalid alerts payload');
  const events = new Map();
  for (const row of payload.alerts.slice(0, MAX_EVENTS)) {
    if (!row || typeof row !== 'object' || !ID.test(text(row.id)) || (row.kind !== 'soon' && row.kind !== 'live')) continue;
    if (!Number.isFinite(row.at) || !Number.isFinite(row.expiresAt)) continue;
    const event = {
      id: text(row.id), kind: row.kind, league: text(row.league), home: text(row.home), away: text(row.away),
      homeLogo: logo(row.homeLogo), awayLogo: logo(row.awayLogo), startsAt: text(row.startsAt, 40), at: row.at, expiresAt: row.expiresAt,
    };
    events.set(`${event.id}:${event.kind}`, event);
  }
  return events;
}

/** Changes between two event maps. Unchanged events are not re-sent. */
export function diffEvents(previous, next) {
  const upsert = [];
  const remove = [];
  for (const [key, event] of next) {
    const old = previous.get(key);
    if (!old || JSON.stringify(old) !== JSON.stringify(event)) upsert.push(event);
  }
  for (const key of previous.keys()) if (!next.has(key)) remove.push(key);
  return { upsert, remove };
}

/** Versioned event state shared by every subscriber: one diff per source refresh, one serialized message per change. */
export class EventState {
  constructor() { this.version = 0; this.events = new Map(); }
  /** Apply a fresh event map. Returns the serialized delta message, or null when nothing changed. */
  apply(next) {
    const { upsert, remove } = diffEvents(this.events, next);
    if (!upsert.length && !remove.length) return null;
    const prev = this.version;
    this.version += 1;
    this.events = next;
    return JSON.stringify({ t: 'delta', v: this.version, prev, upsert, remove });
  }
  snapshot() { return JSON.stringify({ t: 'snapshot', v: this.version, events: [...this.events.values()] }); }
}

/** Sliding per-key connection counter (per client IP). */
export class ConnectionLimiter {
  constructor(max) { this.max = max; this.counts = new Map(); }
  acquire(key) {
    const count = this.counts.get(key) ?? 0;
    if (count >= this.max) return false;
    this.counts.set(key, count + 1);
    return true;
  }
  release(key) {
    const count = (this.counts.get(key) ?? 1) - 1;
    if (count <= 0) this.counts.delete(key); else this.counts.set(key, count);
  }
}
