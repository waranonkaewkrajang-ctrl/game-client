import { footballCalendar } from '@/lib/live-football/calendar-server';
import { footballFeed } from '@/lib/live-football/server';
import { reconcileLinks } from '@/lib/live-football/matching';
import type { LinkObservation } from '@/lib/live-football/matching';
export const runtime = 'nodejs';
const shared = globalThis as typeof globalThis & { __snakeMatchLinks?: Map<string, LinkObservation> };
const observations = shared.__snakeMatchLinks ??= new Map();
export async function GET() {
  const headers = { 'Cache-Control': 'no-store' };
  try {
    const [calendar, feed] = await Promise.all([footballCalendar(), footballFeed()]);
    return Response.json(reconcileLinks(calendar.matches, feed, observations, Date.now()), { headers });
  } catch {
    return Response.json({ error: 'ยังตรวจสอบการเชื่อมคู่แข่งขันไม่ได้' }, { status: 503, headers });
  }
}
