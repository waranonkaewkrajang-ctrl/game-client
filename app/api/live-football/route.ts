import { footballFeed } from '@/lib/live-football/server';

export const runtime = 'nodejs';
export async function GET() {
  try {
    return Response.json(await footballFeed(), { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return Response.json({ error: 'ยังเชื่อมต่อรายการสดไม่ได้ กำลังลองใหม่อัตโนมัติ' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
}
