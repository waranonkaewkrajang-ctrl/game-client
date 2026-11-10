# AMB programmes: collection before livestream

## What changed

The earlier schedule implementation filtered AMB today/early through the current Bangkok date on the server and client. This wrongly hid overnight matches. Programmes now preserve all valid future entries returned by the provider, regardless of Thai midnight.

- `lib/live-football/schedule.ts`: `visibleProgrammes()` accepts explicitly zoned timestamps, keeps all future dates and retains entries for up to 6 hours after kickoff while waiting for signal. Finished entries are excluded. `upcomingToday` remains as a deprecated compatibility alias with the corrected semantics.
- `lib/live-football/schedule-server.ts`: shared metadata collector, single-flight and process memory. Reads today, early, the league catalogue, and the existing public search endpoint with each league's English name. Deduplicates by AMB matchId.
- `app/api/live-football/schedule/route.ts`: delegates to the collector, same URL and existing response fields, plus optional coverage counts.
- `app/live/LiveFootball.tsx`: uses the same corrected programme selector, excludes live and confirmed-ended AMB IDs, labels reached-kickoff programmes `รอสัญญาณถ่ายทอดสด` with live=false.
- `app/live/FixtureBrowser.tsx`: retains awaiting-signal rows across midnight. No new alerts or changes to buttons/design.

## Source cadence and bounds

- Shared refresh at most every 60 seconds across page viewers.
- today: 60 seconds; early/catalogue: 5 minutes; league searches: 3 minutes.
- League refresh: oldest/unseen first, up to 8 per collection cycle, at most 2 concurrent searches. Large catalogues rotate across subsequent cycles; later leagues are not discarded.
- JSON response `coverage: { leagues, checked, pending }` exposes initial coverage progress without displaying a page alert.
- A failed source retains previously observed programmes. A successful empty response also does not instantly erase announced fixtures; absent future records expire 24 hours after last seen, and started records expire 6 hours after kickoff.
- Explicit finished metadata or confirmed-ended entries from the unchanged live feed exclude the match. There is no assumption that disappearance, reaching kickoff, or an iframe onload proves a stream started or ended.
- Every collected programme comes from AMB. No fixture is invented; ESPN remains a separate supplementary calendar.

## Existing stream logic remains intact

No edits to `server.ts`/`model.ts`/`matching.ts`, existing live GET/prepare routes, Login/Register/2FA or lib/api.ts. The programme collector only reads the existing footballFeed() cache. It never mints a player URL.

A future match remains live=false. The existing live endpoint must publish the AMB matchId and the existing viewer-specific preparation queue must produce a ready URL before playback starts. Auto-next and end confirmation are unchanged. Visiting an announced AMB match page already opens its video automatically once those existing conditions become true.

## Continuous collection

New standalone worker:

```powershell
node scripts/live-football-programme-worker.mjs
```

It reads the local schedule API every minute even with no viewer. The original live worker and Next.js server are not restarted. `--once` checks one cycle and exits. Set `LIVE_FOOTBALL_APP_ORIGIN` for another deployment origin.

On this local machine the worker runs in a separate persistent execution session, verified still running after the initial collection. This does not configure production service management or Windows boot persistence. Production needs this new worker added to its normal process manager. Metadata caches are process memory, so multi-instance deployments still need a shared store/queue.

## Verification

- Real API after fix: 25 advance programmes, 5/5 leagues checked, pending 0, stale false.
- Breakdown: English Football League Trophy 17, UEFA Women's Champions League 5, Colombia Cup 2, Colombia Primera B Playoff 1.
- Includes matchId 136843479 (Colchester United vs Ipswich Town U21), absent from the observed today list but present in league search.
- No guarantee of programmes before AMB publishes them or of video for every announced match. Counts and provider catalogue change over time.
- Tests cover cross-midnight, explicit timezone validation, post-kickoff retention/expiry, finished exclusion, source deduplication, partial outage retention, bounded concurrency, source caching/single-flight, and league rotation, alongside the unchanged live/player/matching tests.
- TypeScript and targeted ESLint pass. All 15 offline tests pass. SHA256 checks confirm all 8 protected files (auth API, Login/Register, live server/model, matching and live/prepare routes) remain unchanged.
- UI checked: 119 displayed rows at the observation time (1 live + 25 AMB programmes + 93 remaining ESPN entries). Future AMB match page 136843479 shows 11 Nov 02:45 Thai time and countdown, iframe count 0 before live publication.
- A detached launch (PID 28288) printed a successful cycle but did not survive the execution environment's process cleanup. It was replaced by a persistent execution session (session 16371), which printed a successful 25-programme/5-league cycle. This execution session is not a Windows startup service or production process manager.
