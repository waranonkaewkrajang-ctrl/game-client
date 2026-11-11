import { footballAlerts } from '@/lib/live-football/alerts-server';

export const runtime = 'nodejs';
// Public match data, identical for every viewer (no user data) — a short browser cache is safe.
export async function GET() {
  try {
    return Response.json(await footballAlerts(), { headers: { 'Cache-Control': 'public, max-age=15' } });
  } catch {
    return Response.json({ error: 'ยังโหลดการแจ้งเตือนฟุตบอลไม่ได้' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
}
