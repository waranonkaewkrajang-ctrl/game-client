'use client';
import { useEffect, useState } from 'react';
import { calendarDay } from '@/lib/live-football/calendar';
import type { CalendarFeed } from '@/lib/live-football/calendar';

export function useMonthlyCalendar() {
  const [feed, setFeed] = useState<CalendarFeed | null>(null);
  const [error, setError] = useState(false);
  const [today, setToday] = useState('');
  useEffect(() => {
    const abort = new AbortController();
    let active = true;
    let timer: ReturnType<typeof setTimeout>;
    async function update() {
      if (!active) return;
      if (document.visibilityState === 'hidden') { timer = setTimeout(update, 10_000); return; }
      setToday(calendarDay(Date.now()));
      try {
        const response = await fetch('/api/live-football/calendar', { cache: 'no-store', signal: abort.signal });
        if (!response.ok) throw new Error('Calendar unavailable');
        const data: CalendarFeed = await response.json();
        if (active) { setFeed(data); setError(false); }
      } catch { if (active) setError(true); }
      finally { if (active) timer = setTimeout(update, 15 * 60_000); }
    }
    void update();
    return () => { active = false; abort.abort(); clearTimeout(timer); };
  }, []);
  return { feed, error, today };
}
