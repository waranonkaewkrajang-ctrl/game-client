import { NextRequest, NextResponse } from 'next/server';
import { preparePlayers, viewerSession } from '@/lib/live-football/server';

export const runtime = 'nodejs';

// Behind nginx/Cloudflare the Node server sees plain http + the proxied Host, so request.nextUrl.origin
// (e.g. http://snake1168.online) never equals the browser's Origin (https://snake1168.online).
// Rebuild the public origin from the proxy headers; still same-origin only.
function publicOrigin(request: NextRequest): string {
  const host = request.headers.get('x-forwarded-host')?.split(',')[0].trim() || request.headers.get('host') || request.nextUrl.host;
  const proto = request.headers.get('x-forwarded-proto')?.split(',')[0].trim() || request.nextUrl.protocol.replace(':', '');
  return `${proto}://${host}`;
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin');
  const sameOrigin = !origin || origin === request.nextUrl.origin || origin === publicOrigin(request);
  if (!sameOrigin || request.headers.get('sec-fetch-site') === 'cross-site') {
    return NextResponse.json({ error: 'ไม่อนุญาตคำขอข้ามเว็บไซต์' }, { status: 403 });
  }
  try {
    const { id, session } = viewerSession(request.cookies.get('snake_live_viewer')?.value);
    const response = NextResponse.json(await preparePlayers(session), { headers: { 'Cache-Control': 'private, no-store', 'Vary': 'Cookie' } });
    response.cookies.set('snake_live_viewer', id, { httpOnly: true, sameSite: 'strict', secure: publicOrigin(request).startsWith('https:'), path: '/api/live-football', maxAge: 3600 });
    return response;
  } catch {
    return NextResponse.json({ error: 'กำลังรอคิวเตรียมตัวเล่น ระบบจะลองใหม่อัตโนมัติ' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
}
