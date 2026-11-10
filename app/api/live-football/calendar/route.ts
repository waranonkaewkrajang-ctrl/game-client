import { footballCalendar } from '@/lib/live-football/calendar-server';
export const runtime = 'nodejs';
export async function GET() {
  const headers = { 'Cache-Control': 'no-store' };
  try { return Response.json(await footballCalendar(), { headers }); }
  catch { return Response.json({ error: 'ยังโหลดโปรแกรมเดือนนี้ไม่ได้' }, { status: 503, headers }); }
}
