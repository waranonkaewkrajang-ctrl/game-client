// Metadata collector only. Runs beside the existing live worker; never requests player URLs.
const origin = new URL(process.env.LIVE_FOOTBALL_APP_ORIGIN || 'http://127.0.0.1:3000');
if (!['http:', 'https:'].includes(origin.protocol) || origin.username || origin.password) throw Error('Invalid app origin');
const endpoint = new URL('/api/live-football/schedule', origin);
const once = process.argv.includes('--once');
let stopped = false, timer, abort, previous = '';
function stop() { stopped = true; clearTimeout(timer); abort?.abort(); }
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
async function tick() {
  if (stopped) return;
  const started = Date.now();
  abort = new AbortController();
  const timeout = setTimeout(() => abort.abort(), 50_000);
  try {
    const response = await fetch(endpoint, { cache: 'no-store', redirect: 'error', signal: abort.signal });
    if (!response.ok) throw Error('Schedule unavailable');
    const data = await response.json();
    if (!Array.isArray(data.matches)) throw Error('Invalid schedule');
    const summary = JSON.stringify({ programmes: data.matches.length,
      awaiting: data.matches.filter(match => Date.parse(match.startsAt) <= Date.now()).length,
      coverage: data.coverage, stale: data.stale });
    if (summary !== previous) { console.log(new Date().toISOString(), summary); previous = summary; }
  } catch {
    if (!stopped && previous !== 'unavailable') { console.log(new Date().toISOString(), 'Programme feed unavailable; retrying.'); previous = 'unavailable'; }
    if (once) process.exitCode = 1;
  } finally {
    clearTimeout(timeout);
    if (!stopped && !once) timer = setTimeout(tick, Math.max(1000, 60_000 - (Date.now() - started)));
  }
}
console.log('Football programme worker started for', origin.origin, '(metadata only)');
await tick();
