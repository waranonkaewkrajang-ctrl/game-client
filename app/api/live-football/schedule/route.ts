import { footballProgrammes } from '@/lib/live-football/schedule-server';

export const runtime = 'nodejs';
export async function GET() {
  const headers = { 'Cache-Control': 'no-store' };
  try { return Response.json(await footballProgrammes(), { headers }); }
  catch { return Response.json({ error: 'ยังเชื่อมต่อโปรแกรมแข่งขันไม่ได้' }, { status: 503, headers }); }
}
