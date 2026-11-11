// Tests for the football notification WebSocket service. Runs the real service against a local stub source.
// No network beyond 127.0.0.1. Run: node --test scripts/test-football-ws.mjs
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { ConnectionLimiter, EventState, diffEvents, toEvents } from '../football-ws/core.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const WebSocket = createRequire(path.join(root, 'football-ws/package.json'))('ws');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const alert = (id, kind, changes = {}) => ({ id, kind, league: 'L', home: 'H' + id, away: 'A' + id, homeLogo: 'https://cmbi.laner220.com/TeamImg/t_1.png', awayLogo: 'https://evil.example/x.png', startsAt: '2026-11-11T12:00:00.000Z', at: 1, expiresAt: 2, ...changes });

test('toEvents validates rows, keys by matchId:kind and strips foreign logo hosts', () => {
  const events = toEvents({ alerts: [alert('1', 'live'), alert('1', 'soon'), alert('x', 'live'), alert('2', 'other'), { id: '3', kind: 'live' }] });
  assert.deepEqual([...events.keys()], ['1:live', '1:soon']);
  assert.equal(events.get('1:live').awayLogo, null);
  assert.throws(() => toEvents({}));
});

test('EventState sends nothing when unchanged and only the changed events otherwise', () => {
  const state = new EventState();
  const first = JSON.parse(state.apply(toEvents({ alerts: [alert('1', 'soon'), alert('2', 'live')] })));
  assert.equal(first.upsert.length, 2);
  assert.equal(state.apply(toEvents({ alerts: [alert('1', 'soon'), alert('2', 'live')] })), null, 'identical refresh → no broadcast');
  const next = JSON.parse(state.apply(toEvents({ alerts: [alert('1', 'live'), alert('2', 'live')] })));
  assert.deepEqual(next.upsert.map(e => `${e.id}:${e.kind}`), ['1:live']);
  assert.deepEqual(next.remove, ['1:soon']);
  assert.equal(next.prev, 1);
  assert.equal(next.v, 2);
  assert.deepEqual(diffEvents(new Map(), new Map()), { upsert: [], remove: [] });
});

test('ConnectionLimiter caps per key and releases', () => {
  const limiter = new ConnectionLimiter(2);
  assert.ok(limiter.acquire('a') && limiter.acquire('a'));
  assert.equal(limiter.acquire('a'), false);
  assert.ok(limiter.acquire('b'));
  limiter.release('a');
  assert.ok(limiter.acquire('a'));
});

// ---- integration: real service process + stub alerts source -------------------------------------------------
let payload = { alerts: [alert('10', 'soon')], updatedAt: 1, stale: false };
let sourceHits = 0;
const source = http.createServer((req, res) => { sourceHits++; res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(payload)); });
await new Promise(r => source.listen(0, '127.0.0.1', r));
const WS_PORT = 39000 + Math.floor(Math.random() * 1000);
const service = spawn(process.execPath, [path.join(root, 'football-ws/server.mjs')], {
  env: { ...process.env, FOOTBALL_WS_PORT: String(WS_PORT), FOOTBALL_ALERTS_URL: `http://127.0.0.1:${source.address().port}/alerts`, FOOTBALL_WS_POLL_MS: '200', FOOTBALL_WS_MAX_PER_IP: '5' },
  stdio: 'ignore',
});
after(() => { service.kill(); source.close(); });
for (let i = 0; i < 50; i++) { try { await fetch(`http://127.0.0.1:${WS_PORT}/healthz`); break; } catch { await sleep(100); } }
await sleep(400);

function client(pathname = '/ws/football', headers = {}) {
  const ws = new WebSocket(`ws://127.0.0.1:${WS_PORT}${pathname}`, { headers });
  const messages = [];
  ws.on('message', data => messages.push(JSON.parse(String(data))));
  const opened = new Promise((resolve, reject) => { ws.once('open', resolve); ws.once('error', reject); ws.once('unexpected-response', (_, res) => reject(new Error(String(res.statusCode)))); });
  return { ws, messages, opened };
}

test('every subscriber gets a snapshot, then one shared delta per change; no message when unchanged', async () => {
  const clients = [client(), client(), client()];
  await Promise.all(clients.map(c => c.opened));
  await sleep(100);
  for (const c of clients) {
    assert.equal(c.messages[0].t, 'snapshot');
    assert.deepEqual(c.messages[0].events.map(e => e.id), ['10']);
  }
  const hitsBefore = sourceHits;
  await sleep(700);
  assert.ok(sourceHits - hitsBefore <= 5, 'one source read per poll, regardless of subscriber count');
  assert.ok(clients.every(c => c.messages.length === 1), 'unchanged data → nothing broadcast');
  payload = { ...payload, alerts: [alert('10', 'live')] }; // match confirmed live
  await sleep(600);
  for (const c of clients) {
    assert.equal(c.messages.length, 2);
    assert.equal(c.messages[1].t, 'delta');
    assert.deepEqual(c.messages[1].upsert.map(e => `${e.id}:${e.kind}`), ['10:live']);
    assert.deepEqual(c.messages[1].remove, ['10:soon']);
  }
  clients.forEach(c => c.ws.close());
});

test('reconnect recovers events missed while disconnected', async () => {
  const a = client();
  await a.opened;
  a.ws.close();
  payload = { ...payload, alerts: [alert('10', 'live'), alert('11', 'soon')] }; // arrives while offline
  await sleep(600);
  const b = client();
  await b.opened;
  await sleep(100);
  assert.deepEqual(b.messages[0].events.map(e => `${e.id}:${e.kind}`).sort(), ['10:live', '11:soon']);
  b.ws.close();
});

test('rejects wrong path, enforces per-IP limit, and closes oversized client messages', async () => {
  await assert.rejects(client('/app/wallet').opened, /404/);
  const many = Array.from({ length: 5 }, () => client());
  await Promise.all(many.map(c => c.opened));
  await assert.rejects(client().opened, /429/);
  many.forEach(c => c.ws.close());
  await sleep(200);
  const big = client();
  await big.opened;
  const closed = new Promise(r => big.ws.once('close', code => r(code)));
  big.ws.send('x'.repeat(5000));
  assert.equal(await closed, 1009, 'message too big → closed');
  const health = await (await fetch(`http://127.0.0.1:${WS_PORT}/healthz`)).json();
  assert.equal(health.lastError, null);
});

test('behind Cloudflare+nginx the per-IP limit uses CF-Connecting-IP, not the shared edge X-Real-IP', async () => {
  const edge = { 'x-real-ip': '172.68.1.1' }; // one Cloudflare edge address shared by many visitors
  const visitors = Array.from({ length: 8 }, (_, i) => client('/ws/football', { ...edge, 'cf-connecting-ip': `203.0.113.${i + 1}` }));
  await Promise.all(visitors.map(c => c.opened)); // 8 > limit of 5, but they are 8 different visitors
  const same = Array.from({ length: 5 }, () => client('/ws/football', { ...edge, 'cf-connecting-ip': '198.51.100.9' }));
  await Promise.all(same.map(c => c.opened));
  await assert.rejects(client('/ws/football', { ...edge, 'cf-connecting-ip': '198.51.100.9' }).opened, /429/);
  [...visitors, ...same].forEach(c => c.ws.close());
  await sleep(200);
});
