import type { Metadata } from 'next';
import LiveFootball from './LiveFootball';

export const metadata: Metadata = {
  title: 'ถ่ายทอดสดฟุตบอล | SNAKE168',
  description: 'รายการฟุตบอลที่กำลังถ่ายทอดสด เลือกคู่และรับชม พร้อมอัปเดตรายการอัตโนมัติ',
  alternates: { canonical: '/live' },
  robots: { index: false, follow: false }, // Preview integration; production-domain playback still needs verification.
};

export default function LivePage() { return <LiveFootball />; }
