import { NextRequest, NextResponse } from 'next/server';
import { openPlayer, PlayerError } from '@/lib/live-football/server';

export const runtime = 'nodejs';

// Behind nginx/Cloudflare the Node server sees plain http + the proxied Host, so request.nextUrl.origin
// (e.g. http://snake1168.online) never equals the browser's Origin (https://snake1168.online).
// Rebuild the public origin from the proxy headers; still same-origin only.
function publicOrigin(request: NextRequest): string {
  const host = request.headers.get('x-forwarded-host')?.split(',')[0].trim() || request.headers.get('host') || request.nextUrl.host;
  const proto = request.headers.get('x-forwarded-proto')?.split(',')[0].trim() || request.nextUrl.protocol.replace(':', '');
  return `${proto}://${host}`;
}

// Real viewer IP for the per-client limit: Cloudflare → nginx → Next.
function clientKey(request: NextRequest): string {
  return request.headers.get('cf-connecting-ip')?.trim()
    || request.headers.get('x-real-ip')?.trim()
    || request.headers.get('x-forwarded-for')?.split(',')[0].trim()
    || 'local';
}

const noStore = { 'Cache-Control': 'private, no-store' };

/** POST {id} → a freshly minted player link for that live match (load it immediately). */
export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin');
  const sameOrigin = !origin || origin === request.nextUrl.origin || origin === publicOrigin(request);
  if (!sameOrigin || request.headers.get('sec-fetch-site') === 'cross-site') {
    return NextResponse.json({ error: 'ไม่อนุญาตคำขอข้ามเว็บไซต์' }, { status: 403, headers: noStore });
  }
  let id = '';
  try { id = String((await request.json() as { id?: unknown }).id ?? ''); } catch { /* validated below */ }
  try {
    return NextResponse.json(await openPlayer(id, clientKey(request)), { headers: noStore });
  } catch (error) {
    const status = error instanceof PlayerError ? error.status : 503;
    const message = error instanceof PlayerError ? error.message : 'ยังเชื่อมต่อรายการสดไม่ได้ ระบบจะลองใหม่อัตโนมัติ';
    return NextResponse.json({ error: message }, { status, headers: noStore });
  }
}
