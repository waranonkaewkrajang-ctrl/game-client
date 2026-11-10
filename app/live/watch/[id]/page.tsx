import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import LiveFootball from '../../LiveFootball';
export const metadata: Metadata = { title: 'รับชมฟุตบอล | SNAKE168', robots: { index: false, follow: false } };
export default async function WatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await params;
  let id: string;
  try { id = decodeURIComponent(rawId).replace(/^espn-/, 'espn:'); } catch { notFound(); }
  if (!/^(?:espn:)?[0-9]{1,18}$/.test(id)) notFound();
  return <LiveFootball key={id} initialMatchId={id} />;
}
