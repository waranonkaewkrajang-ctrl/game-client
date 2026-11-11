// Football notification WebSocket service — independent of Laravel Reverb and the wallet channels.
//
// One loop reads the Next app's /api/live-football/alerts (built from the existing shared football cache, so no
// extra upstream requests), diffs it, and broadcasts only changed events to every subscriber as ONE serialized
// message. New/reconnecting clients receive the current snapshot first (missed-event recovery).
//
// Env: FOOTBALL_WS_PORT (3102), FOOTBALL_WS_HOST (127.0.0.1), FOOTBALL_ALERTS_URL
//      (http://127.0.0.1:3001/api/live-football/alerts), FOOTBALL_WS_MAX_CONNECTIONS (25000),
//      FOOTBALL_WS_MAX_PER_IP (20), FOOTBALL_WS_POLL_MS (10000)
import http from 'node:http';
import { WebSocketServer } from 'ws';
import { ConnectionLimiter, EventState, toEvents } from './core.mjs';

const PORT = Number(process.env.FOOTBALL_WS_PORT ?? 3102);
const HOST = process.env.FOOTBALL_WS_HOST ?? '127.0.0.1';
const SOURCE = process.env.FOOTBALL_ALERTS_URL ?? 'http://127.0.0.1:3001/api/live-football/alerts';
const MAX_CONNECTIONS = Number(process.env.FOOTBALL_WS_MAX_CONNECTIONS ?? 25_000);
const MAX_PER_IP = Number(process.env.FOOTBALL_WS_MAX_PER_IP ?? 20);
const POLL_MS = Number(process.env.FOOTBALL_WS_POLL_MS ?? 10_000);
const HEARTBEAT_MS = 30_000;
const MAX_BUFFERED = 256 * 1024; // a subscriber this far behind is dropped (it will reconnect and get a snapshot)
const PATH = '/ws/football';

const state = new EventState();
const limiter = new ConnectionLimiter(MAX_PER_IP);
const stats = { lastOk: 0, lastError: null, refreshes: 0, broadcasts: 0, dropped: 0, rejected: 0 };

const server = http.createServer((request, response) => {
  if (request.url === '/healthz') {
    response.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
    response.end(JSON.stringify({ connections: wss.clients.size, version: state.version, events: state.events.size, ...stats }));
    return;
  }
  response.writeHead(404).end();
});

const wss = new WebSocketServer({ noServer: true, maxPayload: 1024, perMessageDeflate: false, clientTracking: true });

// Behind nginx the peer is 127.0.0.1, so only then trust forwarded headers for the per-IP limit.
// Production is Cloudflare → nginx (no real_ip module config), so X-Real-IP is a Cloudflare edge IP shared by many
// customers; CF-Connecting-IP carries the visitor's address and is preferred. (Same order as the Next live-football
// routes.) A direct-to-origin client could spoof it, which only weakens this soft anti-abuse limit.
function clientIp(request) {
  const peer = request.socket.remoteAddress ?? '';
  const local = peer === '127.0.0.1' || peer === '::1' || peer === '::ffff:127.0.0.1';
  const header = (name) => String(request.headers[name] ?? '').split(',')[0].trim();
  const forwarded = local ? (header('cf-connecting-ip') || header('x-real-ip') || header('x-forwarded-for')) : '';
  return forwarded.slice(0, 64) || peer;
}

server.on('upgrade', (request, socket, head) => {
  const reject = (code, reason) => { stats.rejected++; socket.end(`HTTP/1.1 ${code} ${reason}\r\nConnection: close\r\n\r\n`); };
  if (new URL(request.url ?? '/', 'http://x').pathname !== PATH) return reject(404, 'Not Found');
  if (wss.clients.size >= MAX_CONNECTIONS) return reject(503, 'Service Unavailable');
  const ip = clientIp(request);
  if (!limiter.acquire(ip)) return reject(429, 'Too Many Requests');
  wss.handleUpgrade(request, socket, head, ws => {
    ws.alive = true;
    ws.on('pong', () => { ws.alive = true; });
    ws.on('message', () => {}); // clients never need to send; maxPayload caps abuse
    ws.on('error', () => {});
    ws.once('close', () => limiter.release(ip));
    ws.send(state.snapshot()); // missed-event recovery: every (re)connection starts from the current state
  });
});

function broadcast(message) {
  stats.broadcasts++;
  for (const ws of wss.clients) {
    if (ws.readyState !== ws.OPEN) continue;
    if (ws.bufferedAmount > MAX_BUFFERED) { stats.dropped++; ws.terminate(); continue; } // backpressure
    ws.send(message);
  }
}

let refreshing = false;
async function refresh() {
  if (refreshing) return;
  refreshing = true;
  try {
    const response = await fetch(SOURCE, { cache: 'no-store', signal: AbortSignal.timeout(8000), headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error(`source HTTP ${response.status}`);
    const message = state.apply(toEvents(await response.json()));
    stats.refreshes++; stats.lastOk = Date.now(); stats.lastError = null;
    if (message) broadcast(message);
  } catch (error) {
    stats.lastError = String(error?.message ?? error).slice(0, 200); // keep the last good state; subscribers keep theirs
  } finally { refreshing = false; }
}

// Heartbeat: terminate connections that stopped answering pings (closed laptops, dead mobile networks).
const heartbeat = setInterval(() => {
  for (const ws of wss.clients) {
    if (!ws.alive) { ws.terminate(); continue; }
    ws.alive = false;
    ws.ping();
  }
}, HEARTBEAT_MS);
const poller = setInterval(refresh, POLL_MS);

server.listen(PORT, HOST, () => {
  console.log(`football-ws listening on ${HOST}:${PORT}${PATH} (source ${SOURCE})`);
  void refresh();
});

function shutdown() {
  clearInterval(heartbeat);
  clearInterval(poller);
  for (const ws of wss.clients) ws.close(1012, 'restart'); // clients reconnect with jitter
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 3000).unref();
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
