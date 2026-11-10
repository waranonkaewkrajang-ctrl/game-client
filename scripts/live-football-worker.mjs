// Keeps the shared feed current even when nobody has /live open.
// Player URLs remain viewer-specific and are prepared before selection by the page.
const origin = new URL(process.env.LIVE_FOOTBALL_APP_ORIGIN || 'http://127.0.0.1:3000');
if (!['http:', 'https:'].includes(origin.protocol) || origin.username || origin.password) throw Error('Invalid app origin');
const endpoint = new URL('/api/live-football', origin);
let stopped = false;
let timer;
let abort;
let previous = '';
function stop() { stopped = true; clearTimeout(timer); abort?.abort(); }
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
async function tick() {
  if (stopped) return;
  const started = Date.now();
  abort = new AbortController();
  const timeout = setTimeout(() => abort.abort(), 20000);
  try {
    const response = await fetch(endpoint, { signal: abort.signal, cache: 'no-store', redirect: 'error' });
    if (!response.ok) throw Error('app HTTP ' + response.status);
    const feed = await response.json();
    const live = feed.matches.filter(match => match.state === 'live');
    const summary = JSON.stringify({ live: live.map(match => match.id).sort(), checking: feed.matches.filter(match => match.state === 'checking').length, stale: feed.stale });
    if (summary !== previous) { console.log(new Date().toISOString(), summary); previous = summary; }
  } catch {
    if (!stopped && previous !== 'unavailable') { console.log(new Date().toISOString(), 'Feed unavailable; retrying.'); previous = 'unavailable'; }
  } finally {
    clearTimeout(timeout);
    if (!stopped) timer = setTimeout(tick, Math.max(1000, 10000 - (Date.now() - started)));
  }
}
console.log('Live football feed worker started for', origin.origin, '(no media relay)');
void tick();
