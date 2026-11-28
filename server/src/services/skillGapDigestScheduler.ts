import { config } from '../config';
import { runSkillGapDigest } from './skillGapNotificationService';

const getZonedTime = (timeZone: string, date: Date): { minutes: number; seconds: number } => {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).formatToParts(date);
    const value = (type: string) => Number(parts.find((p) => p.type === type)?.value || 0);
    return { minutes: value('hour') * 60 + value('minute'), seconds: value('second') };
  } catch {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'UTC',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).formatToParts(date);
    const value = (type: string) => Number(parts.find((p) => p.type === type)?.value || 0);
    return { minutes: value('hour') * 60 + value('minute'), seconds: value('second') };
  }
};

/** Schedules one daily digest at the configured wall-clock time/timezone. */
export function startSkillGapDigestScheduler(): void {
  if (!config.skillGapDigestEnabled) {
    console.log('[skill-gap] daily digest disabled');
    return;
  }

  const targetMinutes = config.skillGapDigestHour * 60 + config.skillGapDigestMinute;
  const zone = config.skillGapDigestTimeZone || 'Asia/Kolkata';

  const scheduleNext = () => {
    const now = new Date();
    const current = getZonedTime(zone, now);
    let delayMs = ((targetMinutes - current.minutes + 1440) % 1440) * 60_000 - current.seconds * 1000;
    if (delayMs <= 0) delayMs += 24 * 60 * 60 * 1000;

    setTimeout(async () => {
      try {
        await runSkillGapDigest();
      } catch (error) {
        console.warn('[skill-gap] digest run failed:', error);
      }
      scheduleNext();
    }, delayMs);

    const hh = String(config.skillGapDigestHour).padStart(2, '0');
    const mm = String(config.skillGapDigestMinute).padStart(2, '0');
    console.log(`[skill-gap] next daily digest at ${hh}:${mm} ${zone} (in ${Math.round(delayMs / 60_000)} min)`);
  };

  scheduleNext();
}
