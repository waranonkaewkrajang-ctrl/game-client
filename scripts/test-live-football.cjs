// Offline behavioral tests. No upstream requests, packages, or dev-server restarts.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const directory = path.resolve(__dirname, '../lib/live-football');
function load(name, model, overrides = {}) {
  const filename = path.join(directory, name + '.ts');
  const result = new Module(filename, module);
  result.filename = filename;
  result.paths = module.paths;
  const original = result.require.bind(result);
  result.require = id => Object.hasOwn(overrides, id) ? overrides[id] : id === 'server-only' ? {} : id === './model' ? model : original(id);
  result._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, filename);
  return result.exports;
}
const model = load('model');
const schedule = load('schedule', model);
const calendar = load('calendar', model);
const matching = load('matching', model);
const bridgeEvent = (changes = {}) => ({ id: 'espn:100', home: 'Manchester United', away: 'Liverpool', league: 'พรีเมียร์ลีก อังกฤษ', leagueCode: 'eng.1', homeTeamId: '360', awayTeamId: '364', startsAt: '2026-11-10T12:00:00Z', day: '2026-11-10', status: 'ยังไม่เริ่มแข่ง', timeConfirmed: true, homeLogo: null, awayLogo: null, ...changes });
const bridgeLive = (changes = {}) => ({ id: '900', home: 'แมนเชสเตอร์ ยูไนเต็ด', away: 'ลิเวอร์พูล', homeEn: 'Manchester Utd', awayEn: 'Liverpool', league: 'อังกฤษ พรีเมียร์ลีก', leagueEn: 'English Premier League', startsAt: '2026-11-10T12:07:00Z', state: 'live', clock: "1H 5'", missingChecks: 0, score: { home: 0, away: 0 }, homeLogo: null, awayLogo: null, ...changes });
const bridgeFeed = (stamp, rows = [bridgeLive()], stale = false) => ({ matches: rows, updatedAt: stamp, stale, message: null });

test('bridge requires both English teams, known league and a confirmed UTC kickoff', () => {
  assert.equal(matching.candidateMatches(bridgeEvent(), [bridgeLive()]).length, 1);
  assert.equal(matching.candidateMatches(bridgeEvent({ startsAt: '2026-11-10T19:00:00+07:00' }), [bridgeLive()]).length, 1);
  assert.equal(matching.candidateMatches(bridgeEvent(), [bridgeLive({ leagueEn: 'English Football League Trophy' })]).length, 0);
  assert.equal(matching.candidateMatches(bridgeEvent(), [bridgeLive({ startsAt: '2026-11-10T12:31:00Z' })]).length, 0);
  assert.equal(matching.candidateMatches(bridgeEvent({ timeConfirmed: false }), [bridgeLive()]).length, 0);
  assert.equal(matching.candidateMatches(bridgeEvent({ startsAt: '2026-11-10T12:00:00' }), [bridgeLive()]).length, 0);
  assert.equal(matching.candidateMatches(bridgeEvent(), [bridgeLive({ startsAt: '2026-11-10T12:07:00' })]).length, 0);
  assert.equal(matching.candidateMatches(bridgeEvent(), [bridgeLive({ homeEn: 'Liverpool', awayEn: 'Manchester United' })]).length, 0);
});
test('bridge never collapses youth, women, reserves, or similar first-team names', () => {
  for (const name of ['Manchester Utd U21', 'Manchester Utd Women', 'Manchester Utd II', 'Manchester Utd B', 'Manchester City', 'Manchester United Reserves']) {
    assert.equal(matching.candidateMatches(bridgeEvent(), [bridgeLive({ homeEn: name })]).length, 0, name);
  }
  assert.equal(matching.candidateMatches(bridgeEvent({ home: 'Liverpool' }), [bridgeLive({ homeEn: 'Liverpool U21' })]).length, 0);
  assert.equal(matching.candidateMatches(bridgeEvent({ home: 'Atlético Madrid', leagueCode: 'esp.1' }), [bridgeLive({ homeEn: 'Atletico de Madrid', leagueEn: 'Spanish La Liga' })]).length, 1);
});
test('bridge needs two independent fresh observations, not repeated page requests', () => {
  const memory = new Map();
  assert.equal(matching.reconcileLinks([bridgeEvent()], bridgeFeed(10000), memory, 10000).links[0].state, 'confirming');
  assert.equal(matching.reconcileLinks([bridgeEvent()], bridgeFeed(10000), memory, 19000).links[0].state, 'confirming');
  const linked = matching.reconcileLinks([bridgeEvent()], bridgeFeed(20000), memory, 20000).links[0];
  assert.equal(linked.state, 'linked'); assert.equal(linked.ambId, '900');
});
test('bridge refuses multiple candidates and multiple ESPN owners for one stream', () => {
  const duplicate = bridgeFeed(10000, [bridgeLive(), bridgeLive({ id: '901' })]);
  assert.equal(matching.reconcileLinks([bridgeEvent()], duplicate, new Map(), 10000).links[0].state, 'ambiguous');
  const result = matching.reconcileLinks([bridgeEvent(), bridgeEvent({ id: 'espn:101' })], bridgeFeed(10000), new Map(), 10000);
  assert.ok(result.links.every(link => link.state === 'ambiguous' && link.ambId === null));
});
test('watch resolver accepts only confirmed links and revalidates local calendar/feed before opening video', () => {
  const memory = new Map(), event = bridgeEvent(), live = bridgeLive();
  const first = matching.reconcileLinks([event], bridgeFeed(10000), memory, 10000);
  assert.equal(matching.resolveCalendarLink(event, first.links, [live]), undefined);
  const accepted = matching.reconcileLinks([event], bridgeFeed(20000), memory, 20000);
  assert.equal(matching.resolveCalendarLink(event, accepted.links, [live]), '900');
  assert.equal(matching.resolveCalendarLink(bridgeEvent({ startsAt: '2026-11-10T12:02:00Z' }), accepted.links, [live]), undefined);
  assert.equal(matching.resolveCalendarLink(event, accepted.links, [live, bridgeLive({ id: '901' })]), undefined);
  assert.equal(matching.resolveCalendarLink(event, accepted.links, [{ ...live, state: 'ended' }]), undefined);
  assert.equal(matching.resolveCalendarLink(event, accepted.links, [bridgeLive({ id: '901' })]), undefined);
});
test('bridge resets on rescheduling or identity changes; stale feed cannot create or confirm a link', () => {
  const memory = new Map();
  assert.equal(matching.reconcileLinks([bridgeEvent()], bridgeFeed(10000, undefined, true), memory, 10000).links[0].state, 'unmatched');
  matching.reconcileLinks([bridgeEvent()], bridgeFeed(20000), memory, 20000);
  assert.equal(matching.reconcileLinks([bridgeEvent()], bridgeFeed(30000), memory, 30000).links[0].state, 'linked');
  assert.equal(matching.reconcileLinks([bridgeEvent()], bridgeFeed(30000, undefined, true), memory, 35000).links[0].state, 'linked');
  assert.equal(matching.reconcileLinks([bridgeEvent({ startsAt: '2026-11-10T12:02:00Z' })], bridgeFeed(40000), memory, 40000).links[0].state, 'confirming');
  assert.equal(matching.reconcileLinks([bridgeEvent()], bridgeFeed(50000, []), memory, 50000).links[0].state, 'unmatched');
});
test('monthly calendar keeps real status, home/away order, Bangkok date and allowed logos', () => {
  const payload = { events: [{ id: '123', date: '2026-11-10T18:00Z', competitions: [{ timeValid: false, status: { type: { state: 'pre' } }, competitors: [
    { homeAway: 'away', team: { displayName: 'Away', logo: 'https://evil.test/logo.png' } },
    { homeAway: 'home', team: { displayName: 'Home', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/1.png' } },
  ] }] }] };
  const [match] = calendar.parseCalendar(payload, 'League', '2026-11');
  assert.equal(match.home, 'Home'); assert.equal(match.away, 'Away');
  assert.equal(match.day, '2026-11-11'); assert.equal(match.timeConfirmed, false);
  assert.equal(match.awayLogo, null); assert.equal(match.status, 'ยังไม่เริ่มแข่ง');
  assert.equal(match.id, 'espn:123');
  payload.events[0].competitions[0].status.type = { state: 'post', completed: true };
  assert.equal(calendar.parseCalendar(payload, 'League', '2026-11')[0].status, 'จบการแข่งขัน');
  assert.deepEqual(calendar.parseCalendar(payload, 'League', '2026-12'), []);
  assert.throws(() => calendar.parseCalendar({ error: 'offline' }, 'League', '2026-11'));
});
test('programmes cross Thai midnight and retain kickoff entries without inventing a live status', () => {
  const now = Date.parse('2026-11-10T16:00:00Z'); // 23:00 Bangkok
  const make = (id, startsAt) => ({ id, startsAt });
  const rows = [make('next-day', '2026-11-10T17:00:00Z'), make('late', '2026-11-10T16:45:00Z'), make('early', '2026-11-10T16:15:00Z'), make('started', '2026-11-10T16:00:00Z'), make('ambiguous', '2026-11-10T23:30:00'), make('invalid', 'invalid')];
  assert.deepEqual(schedule.visibleProgrammes(rows, now).map(m => m.id), ['started', 'early', 'late', 'next-day']);
  assert.deepEqual(schedule.visibleProgrammes(rows, Date.parse('2026-11-10T17:00:01Z')).map(m => m.id), ['started', 'early', 'late', 'next-day']);
  assert.deepEqual(schedule.visibleProgrammes(rows, Date.parse('2026-11-10T23:00:01Z')), []);
  assert.deepEqual(schedule.visibleProgrammes([{ ...rows[1], ended: true }], now), []);
  assert.deepEqual(schedule.parseSchedule({ results: [] }), []);
  assert.throws(() => schedule.parseSchedule({ error: 'offline' }));
});
const group = ids => ({ results: [{ leagueName: { en: 'Test league' }, matches: ids.map(id => ({ matchId: id, home: { en: 'Home ' + id }, away: { en: 'Away ' + id }, liveTime: "1H 20'", score: { home: 0, away: 1 } })) }] });
const matches = model.parseFeed(group([1, 2]));

test('programme collector merges league search, deduplicates, retains outage data and leaves player queue untouched', async () => {
  const savedFetch = global.fetch, savedNow = Date.now;
  let now = Date.parse('2026-11-10T16:00:00Z'), failToday = false, empty = false, fetches = 0, active = 0, maxSearch = 0;
  const start = '2026-11-10T19:00:00Z'; // 02:00 the next Thai day
  const make = ids => ({ results: [{ leagueName: { en: 'Test Cup' }, matches: ids.map(id => ({ matchId: id, startTime: id === 5 ? '2026-11-12T19:00:00Z' : start, home: { en: 'Home '+id }, away: { en: 'Away '+id }, liveTime: '' })) }] });
  Date.now = () => now;
  delete global.__snakeProgrammes;
  global.fetch = async raw => {
    const url = String(raw); fetches++;
    if (url.includes('/leagues-sort-')) return Response.json({ results: [{ id: 10, en: 'One & Cup' }, { id: 20, en: 'Two Cup' }, { id: 30, en: 'Three Cup' }] });
    if (url.includes('/soccer/today')) { if (failToday) throw Error('offline'); return Response.json(empty ? { results: [] } : make([1, 2, 4])); }
    if (url.includes('/soccer/early')) return Response.json(empty ? { results: [] } : make([2, 5]));
    assert.ok(url.includes('/search-channel/soccer?search='));
    active++; maxSearch = Math.max(maxSearch, active);
    await new Promise(resolve => setImmediate(resolve)); active--;
    assert.ok(['One & Cup', 'Two Cup', 'Three Cup'].includes(new URL(url).searchParams.get('search')));
    return Response.json(empty ? { results: [] } : make([1, 3, 4]));
  };
  try {
    const programmes = load('schedule-server', model, { './schedule': schedule, './server': { footballFeed: async () => bridgeFeed(now, [bridgeLive({ id: '1' }), bridgeLive({ id: '4', state: 'ended' })]) } });
    const [first, same] = await Promise.all([programmes.footballProgrammes(), programmes.footballProgrammes()]);
    assert.deepEqual(first.matches.map(m => m.id).sort(), ['2', '3', '5']);
    assert.deepEqual(first, same); assert.equal(fetches, 6); assert.ok(maxSearch <= 2);
    assert.deepEqual(first.coverage, { leagues: 3, checked: 3, pending: 0 });
    assert.equal(first.stale, false);
    failToday = true; now += 61_000;
    const outage = await programmes.footballProgrammes();
    assert.deepEqual(outage.matches.map(m => m.id).sort(), ['2', '3', '5']); assert.equal(outage.stale, true);
    failToday = false; empty = true; now = Date.parse('2026-11-10T19:01:00Z');
    assert.ok((await programmes.footballProgrammes()).matches.some(m => m.id === '3'));
    now = Date.parse('2026-11-11T01:00:01Z');
    assert.deepEqual((await programmes.footballProgrammes()).matches.map(m => m.id), ['5']);
  } finally { global.fetch = savedFetch; Date.now = savedNow; delete global.__snakeProgrammes; }
});

test('programme catalogue rotates past the first batch instead of silently ignoring later leagues', async () => {
  const savedFetch = global.fetch, savedNow = Date.now;
  let now = Date.parse('2026-11-10T16:00:00Z'); const searched = new Set();
  Date.now = () => now; delete global.__snakeProgrammes;
  global.fetch = async raw => {
    const url = String(raw);
    if (url.includes('/leagues-sort-')) return Response.json({ results: Array.from({ length: 10 }, (_, i) => ({ id: i+1, en: 'Cup '+(i+1) })) });
    if (url.includes('/search-channel/')) searched.add(new URL(url).searchParams.get('search'));
    return Response.json({ results: [] });
  };
  try {
    const programmes = load('schedule-server', model, { './schedule': schedule, './server': { footballFeed: async () => bridgeFeed(now, []) } });
    assert.equal((await programmes.footballProgrammes()).coverage.pending, 2);
    now += 61_000;
    assert.equal((await programmes.footballProgrammes()).coverage.pending, 0);
    assert.equal(searched.size, 10);
  } finally { global.fetch = savedFetch; Date.now = savedNow; delete global.__snakeProgrammes; }
});

test('missing match is checking, not ended; reappearing match returns to live', () => {
  const missing = model.reconcileFeed(matches, [matches[1]]);
  assert.equal(missing.find(m => m.id === '1').state, 'checking');
  assert.equal(model.chooseMatch('1', missing, new Set(['2']), true), '1');
  assert.equal(model.reconcileFeed(missing, matches).find(m => m.id === '1').missingChecks, 0);
});
test('finished match switches only to another live match', () => {
  const feed = [{ ...matches[0], state: 'ended' }, matches[1]];
  assert.equal(model.chooseMatch('1', feed, new Set(['2']), true), '2');
  assert.equal(model.chooseMatch('1', feed, new Set(), true), null);
  assert.equal(model.chooseMatch('1', feed, new Set(['2']), false), null);
  assert.equal(model.chooseMatch('1', [], new Set(['2']), true), '1');
  assert.deepEqual([...model.liveIds(feed)], ['2']);
});
test('invalid feed is rejected, empty valid feed is accepted, names and media URL hosts are validated', () => {
  assert.throws(() => model.parseFeed({ error: 'temporary outage' }));
  assert.deepEqual(model.parseFeed({ results: [] }), []);
  assert.throws(() => model.parseFeed(group(['../secret'])));
  assert.throws(() => model.validatePlayerUrl('http://www.87333378.com/livetv/1/a'));
  assert.throws(() => model.validatePlayerUrl('https://www.87333378.com.evil.test/livetv/1/a'));
  assert.throws(() => model.validatePlayerUrl('https://user:password@www.87333378.com/livetv/a'));
  assert.equal(model.validatePlayerUrl('https://www.87333378.com/livetv/1/a?fs=1'), 'https://www.87333378.com/livetv/1/a?fs=1');
  assert.equal(model.validatePlayerUrl('https://www.603124563329.com/livetv/1/a'), 'https://www.603124563329.com/livetv/1/a');
  assert.throws(() => model.validatePlayerUrl('https://www.603124563329.com.evil.test/livetv/1/a'));
  assert.throws(() => model.validatePlayerUrl('https://www.603124563329.com/other/1/a'));
});

test('server coalesces feed requests, confirms end, and preserves state on outage', async () => {
  const savedFetch = global.fetch, savedNow = Date.now;
  let now = 100000, current = group([1]), fail = false, feedCalls = 0;
  Date.now = () => now;
  delete global.__snakeFootball;
  global.fetch = async url => {
    if (fail) throw Error('offline');
    if (String(url).includes('/match/soccer/')) return Response.json({ message: 'OK' });
    feedCalls++;
    return Response.json(current);
  };
  try {
    const server = load('server', model);
    const [a, b] = await Promise.all([server.footballFeed(), server.footballFeed()]);
    assert.equal(feedCalls, 1);
    assert.equal(a, b);
    current = { results: [] }; now += 11000;
    assert.equal((await server.footballFeed()).matches[0].state, 'checking');
    fail = true; now += 11000;
    const outage = await server.footballFeed();
    assert.equal(outage.stale, true);
    assert.equal(outage.matches[0].missingChecks, 1);
    fail = false; now += 11000;
    assert.equal((await server.footballFeed()).matches[0].state, 'ended');
  } finally { global.fetch = savedFetch; Date.now = savedNow; delete global.__snakeFootball; }
});

test('openPlayer mints a fresh, per-viewer link on demand for live matches only', async () => {
  const savedFetch = global.fetch;
  delete global.__snakeFootball;
  const minted = [];
  global.fetch = async url => {
    if (String(url).includes('api-streaming-channels')) return Response.json(group([1, 2, 3]));
    minted.push(String(url));
    return Response.json({ data: 'https://www.87333378.com/livetv/1/test/' + new URL(url).searchParams.get('uid') });
  };
  try {
    const server = load('server', model);
    const a = await server.openPlayer('2', 'ip-a');
    const b = await server.openPlayer('2', 'ip-b');
    assert.equal(a.id, '2');
    assert.notEqual(a.url, b.url, 'never reuses a link: each open mints its own');
    assert.equal(minted.length, 2, 'only the opened match is minted — no background batch for every match');
    await assert.rejects(server.openPlayer('999', 'ip-a'), error => error.status === 404);
    await assert.rejects(server.openPlayer('../x', 'ip-a'), error => error.status === 400);
    assert.equal(minted.length, 2, 'rejected ids never reach upstream');
  } finally { global.fetch = savedFetch; delete global.__snakeFootball; }
});

test('openPlayer queues bursts instead of refusing them and caps parallel upstream mints', async () => {
  const savedFetch = global.fetch;
  delete global.__snakeFootball;
  let active = 0, maximum = 0;
  global.fetch = async url => {
    if (String(url).includes('api-streaming-channels')) return Response.json(group([1]));
    active++; maximum = Math.max(maximum, active);
    await new Promise(resolve => setTimeout(resolve, 10));
    active--;
    return Response.json({ data: 'https://www.87333378.com/livetv/1/test/' + new URL(url).searchParams.get('uid') });
  };
  try {
    const server = load('server', model);
    const results = await Promise.all(Array.from({ length: 60 }, (_, i) => server.openPlayer('1', 'viewer-' + i)));
    assert.equal(results.length, 60, 'all 60 simultaneous viewers get a link (queued, none refused)');
    assert.equal(new Set(results.map(r => r.url)).size, 60);
    assert.equal(maximum, 8, 'never more than 8 upstream mints in flight');
    assert.equal(global.__snakeFootball.minting, 0, 'slots are all released');
  } finally { global.fetch = savedFetch; delete global.__snakeFootball; }
});

test('openPlayer limits one client without affecting others', async () => {
  const savedFetch = global.fetch;
  delete global.__snakeFootball;
  global.fetch = async url => String(url).includes('api-streaming-channels')
    ? Response.json(group([1]))
    : Response.json({ data: 'https://www.87333378.com/livetv/1/test/' + new URL(url).searchParams.get('uid') });
  try {
    const server = load('server', model);
    for (let i = 0; i < 30; i++) await server.openPlayer('1', 'script');
    await assert.rejects(server.openPlayer('1', 'script'), error => error.status === 429);
    assert.equal((await server.openPlayer('1', 'customer')).id, '1', 'other viewers are unaffected');
  } finally { global.fetch = savedFetch; delete global.__snakeFootball; }
});
