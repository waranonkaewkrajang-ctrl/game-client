// Offline tests for the notification bell: football alert rules, server memo, and the client store.
// No network, packages, or dev server. Run: node --test scripts/test-notifications.cjs
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
function load(file, overrides = {}) {
  const filename = path.join(root, file);
  const result = new Module(filename, module);
  result.filename = filename;
  result.paths = module.paths;
  const original = result.require.bind(result);
  result.require = id => Object.hasOwn(overrides, id) ? overrides[id] : id === 'server-only' ? {} : original(id);
  result._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, filename);
  return result.exports;
}
const alerts = load('lib/live-football/alerts.ts');
const MIN = 60_000;
const NOW = Date.parse('2026-11-11T12:00:00Z');
const iso = t => new Date(t).toISOString();
const liveRow = (id, start, state = 'live') => ({ id, home: 'A' + id, away: 'B' + id, league: 'L', startsAt: iso(start), state, clock: '', score: { home: 0, away: 0 }, missingChecks: 0, homeLogo: null, awayLogo: null });
const programme = (id, start, ended = false) => ({ id, home: 'A' + id, away: 'B' + id, league: 'L', startsAt: iso(start), homeLogo: null, awayLogo: null, ended });

test('soon alert only inside the 15-minute window before kickoff (plus grace)', () => {
  const rows = [programme('1', NOW + 15 * MIN), programme('2', NOW + 16 * MIN), programme('3', NOW - 9 * MIN), programme('4', NOW - 11 * MIN), programme('5', NOW + 5 * MIN, true)];
  const out = alerts.buildAlerts([], rows, NOW, new Map());
  assert.deepEqual(out.map(a => a.id).sort(), ['1', '3']);
  assert.ok(out.every(a => a.kind === 'soon'));
  assert.equal(out.find(a => a.id === '1').expiresAt, NOW + 25 * MIN);
});

test('live alert only for confirmed live matches, and it replaces the soon alert (no duplicates)', () => {
  const live = [liveRow('1', NOW - 2 * MIN), liveRow('2', NOW - 2 * MIN, 'checking'), liveRow('3', NOW - 2 * MIN, 'ended')];
  const out = alerts.buildAlerts(live, [programme('1', NOW - 2 * MIN), programme('3', NOW - 2 * MIN)], NOW, new Map());
  assert.deepEqual(out.map(a => `${a.id}:${a.kind}`), ['1:live'], 'checking/ended never alert; ended programme suppressed');
});

test('live alert expires 45 minutes after kickoff; unknown kickoff uses first time seen live', () => {
  assert.equal(alerts.buildAlerts([liveRow('1', NOW - 46 * MIN)], [], NOW, new Map()).length, 0);
  const first = new Map();
  const row = { ...liveRow('9', 0), startsAt: '2026-11-11 19:00' }; // no timezone → not trusted
  alerts.trackFirstLive(first, [row], NOW - 10 * MIN);
  const [alert] = alerts.buildAlerts([row], [], NOW, first);
  assert.equal(alert.at, NOW - 10 * MIN);
  alerts.trackFirstLive(first, [], NOW);
  assert.equal(first.size, 0, 'forgotten once no longer live');
});

test('parseAlerts drops malformed rows instead of throwing', () => {
  const feed = alerts.parseAlerts({ updatedAt: 1, stale: false, alerts: [{ id: '1', kind: 'live', at: 1, expiresAt: 2, home: 'x', away: 'y', league: '', startsAt: '' }, { id: 'bad', kind: 'live', at: 1, expiresAt: 2 }, { id: '2', kind: 'other', at: 1, expiresAt: 2 }, null] });
  assert.deepEqual(feed.alerts.map(a => a.id), ['1']);
  assert.equal(alerts.parseAlerts({ nope: true }), null);
});

test('server: concurrent requests share one build; keeps last data when a source fails', async () => {
  delete global.__snakeAlerts;
  let liveCalls = 0, liveFails = false;
  const server = load('lib/live-football/alerts-server.ts', {
    './server': { footballFeed: async () => { liveCalls++; if (liveFails) throw new Error('down'); return { matches: [liveRow('1', Date.now() - MIN)], stale: false }; } },
    './schedule-server': { footballProgrammes: async () => ({ matches: [programme('2', Date.now() + 10 * MIN)] }) },
    './alerts': alerts,
  });
  const results = await Promise.all(Array.from({ length: 200 }, () => server.footballAlerts()));
  assert.equal(liveCalls, 1, '200 simultaneous viewers → one build');
  assert.deepEqual(results[0].alerts.map(a => `${a.id}:${a.kind}`).sort(), ['1:live', '2:soon']);
  global.__snakeAlerts.builtAt = 0; liveFails = true;
  const after = await server.footballAlerts();
  assert.equal(after.stale, true);
  assert.ok(after.alerts.some(a => a.id === '1'), 'last confirmed live data kept on upstream error');
  delete global.__snakeAlerts;
});

// ---- client store -------------------------------------------------------------------------------------------
function browser() {
  const data = new Map();
  global.localStorage = { getItem: k => data.has(k) ? data.get(k) : null, setItem: (k, v) => data.set(k, String(v)), removeItem: k => data.delete(k) };
  global.window = { addEventListener() {}, removeEventListener() {} };
  return data;
}
function storeWith(items) {
  let emit;
  const source = { id: 'football', start(e) { emit = e; e(items()); return () => {}; } };
  const store = load('lib/notifications/store.ts', { './football-source': { footballSource: source } });
  return { store, push: (failed = false) => emit(items(), failed) };
}
const note = (id, changes = {}) => ({ id, source: 'football', kind: 'football-live', title: id, body: '', href: '/live/watch/1', at: Date.now(), expiresAt: Date.now() + 10 * MIN, ...changes });

test('store: unread count, single ring per new batch, per-item read and mark-all', () => {
  browser();
  let list = [note('a'), note('b')];
  const { store, push } = storeWith(() => list);
  const stop = store.startNotifications('user1');
  let snap = store.getNotificationSnapshot();
  assert.equal(snap.unread, 2);
  assert.equal(snap.ring, 1, 'rings once for the first batch');
  push();
  assert.equal(store.getNotificationSnapshot().ring, 1, 'same items again → no ring (no continuous ringing)');
  store.markRead('a');
  snap = store.getNotificationSnapshot();
  assert.equal(snap.unread, 1);
  assert.equal(snap.isRead('a'), true);
  assert.equal(snap.items.length, 2, 'read items stay listed');
  list = [...list, note('c')];
  push();
  assert.equal(store.getNotificationSnapshot().ring, 2, 'a new notification rings once');
  store.markAllRead();
  assert.equal(store.getNotificationSnapshot().unread, 0);
  stop();
});

test('store: survives refresh (read + announced persisted per user), drops expired and duplicates, keeps list on error', () => {
  browser();
  const list = [note('a'), note('a'), note('old', { expiresAt: Date.now() - 1 })];
  let first = storeWith(() => list);
  let stop = first.store.startNotifications('user1');
  assert.equal(first.store.getNotificationSnapshot().items.length, 1, 'duplicate + expired removed');
  first.store.markRead('a');
  stop();
  const again = storeWith(() => list); // simulated page refresh: fresh module, same localStorage
  stop = again.store.startNotifications('user1');
  const snap = again.store.getNotificationSnapshot();
  assert.equal(snap.unread, 0, 'read state restored');
  assert.equal(snap.ring, 0, 'no replayed ring after refresh');
  again.push(true);
  assert.equal(again.store.getNotificationSnapshot().items.length, 1);
  assert.equal(again.store.getNotificationSnapshot().failed, true);
  stop();
  const other = storeWith(() => list);
  stop = other.store.startNotifications('user2');
  assert.equal(other.store.getNotificationSnapshot().unread, 1, 'another account on the same browser has its own state');
  stop();
});
