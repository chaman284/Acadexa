import type { DepartmentEvent } from '../types/department';
import { departmentEvents } from '../data/collegeInfo';

// ============================================
// STUDENT SCHEDULE / REAL-TIME EVENT HELPERS
// ============================================

/** Shape returned by GET /api/dept/info before normalization. */
export interface BackendDeptEvent {
  id: string;
  type: string; // EVENT | HOLIDAY | ACHIEVEMENT
  title: string;
  date: string;
  description: string;
  targetDept?: string;
  semester?: number | null;
  timeLabel?: string | null;
  endDate?: string | null;
}

const TIME_PATTERN = /(\d{1,2}):(\d{2})\s*(AM|PM)/gi;

/** Parse the first clock time in a string like "09:30 AM - 12:30 PM". */
function firstTimeMinutes(value: string | undefined): number | null {
  if (!value) return null;
  const match = value.match(TIME_PATTERN);
  if (!match) return null;
  return clockToMinutes(match[0]);
}

function clockToMinutes(value: string): number | null {
  const match = value.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return null;
  let hours = parseInt(match[1], 10) % 12;
  if (/pm/i.test(match[3])) hours += 12;
  return hours * 60 + parseInt(match[2], 10);
}

/** Infer a semester number from text such as "[5th Sem]", "(3rd Semester)", "Sem 5". */
export function inferSemester(title: string, description = ''): number | undefined {
  const text = `${title} ${description}`;
  const patterns = [
    /\b(\d)(?:st|nd|rd|th)?\s*sem(?:ester)?\b/i,
    /\bsem(?:ester)?\s*[-:]?\s*(\d)\b/i,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const value = parseInt(match[1], 10);
      if (value >= 1 && value <= 12) return value;
    }
  }
  // Roman numerals in parentheses, e.g. "Semester (III)".
  const roman = text.match(/\b(III|IV|V|VI|VII|VIII)\b/i);
  if (roman) {
    const map: Record<string, number> = {
      iii: 3, iv: 4, v: 5, vi: 6, vii: 7, viii: 8,
    };
    return map[roman[1].toLowerCase()];
  }
  return undefined;
}

/** ISO timestamp -> local YYYY-MM-DD key, avoiding UTC date drift. */
function toLocalDateKey(value: string): string {
  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Extract a human-readable time range from a free-text description. */
function extractTimeLabel(description: string): string | undefined {
  const matches = description.match(TIME_PATTERN);
  if (!matches || matches.length === 0) return undefined;
  const unique = Array.from(new Set(matches.map(m => m.replace(/\s+/g, ' ').trim())));
  return unique.slice(0, 2).join(' – ');
}

/** Normalize a DeptInformation row into a DepartmentEvent. */
export function mapBackendEvent(raw: BackendDeptEvent): DepartmentEvent {
  const title = raw.title || 'Department Event';
  const description = raw.description || '';
  const category: DepartmentEvent['category'] =
    raw.type === 'HOLIDAY'
      ? 'holiday'
      : /exam|evaluation|CIE|SEE|test|viva/i.test(title)
      ? 'exam'
      : /deadline|last date|cutoff|withdrawal|submission/i.test(title)
      ? 'deadline'
      : 'event';

  return {
    id: raw.id,
    title,
    description,
    date: toLocalDateKey(raw.date),
    endDate: raw.endDate ? toLocalDateKey(raw.endDate) : undefined,
    time: raw.timeLabel || extractTimeLabel(description) || 'All Day',
    location: '',
    category,
    semester: raw.semester ?? inferSemester(title, description),
  };
}

function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/\[[^\]]*\]/g, '')
    .replace(/\([^)]*\)/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/** Start instant of an event, using the event's local date + first clock time. */
export function getEventStart(event: Pick<DepartmentEvent, 'date' | 'time'>): Date {
  const [year, month, day] = event.date.split('-').map(Number);
  const start = new Date(year, (month || 1) - 1, day || 1, 0, 0, 0, 0);
  const minutes = firstTimeMinutes(event.time);
  if (minutes !== null) {
    start.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
  }
  return start;
}

/** End instant of an event. Multi-day events stay "upcoming" through their last day. */
export function getEventEnd(event: Pick<DepartmentEvent, 'date' | 'endDate'>): Date {
  const [year, month, day] = (event.endDate || event.date).split('-').map(Number);
  return new Date(year, (month || 1) - 1, day || 1, 23, 59, 59, 999);
}

/** True while an event is still relevant (today or later). */
export function isUpcomingEvent(
  event: Pick<DepartmentEvent, 'date' | 'endDate'>,
  now: Date = new Date()
): boolean {
  return getEventEnd(event).getTime() >= now.getTime();
}

/** Today / Tomorrow / Yesterday / "24 Nov" label based on the real current date. */
export function formatEventDateLabel(
  event: Pick<DepartmentEvent, 'date' | 'endDate'>,
  now: Date = new Date()
): string {
  const [year, month, day] = event.date.split('-').map(Number);
  const start = new Date(year, (month || 1) - 1, day || 1);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const eventDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const diff = Math.round((eventDay.getTime() - today.getTime()) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff === -1) return 'Yesterday';
  return start.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

/** Sort chronologically by real date + time. */
export function sortEventsChronologically(events: DepartmentEvent[]): DepartmentEvent[] {
  return [...events].sort(
    (a, b) => getEventStart(a).getTime() - getEventStart(b).getTime()
  );
}

/**
 * Build the personalized schedule:
 *  - static academic calendar (full semester/time details) as the base
 *  - backend-created events added when not already present
 *  - only the student's semester + common campus/cultural events
 *  - upcoming events only, ordered by real date and time
 */
export function buildStudentSchedule(
  backendEvents: BackendDeptEvent[] = [],
  semester?: number,
  options: { upcomingOnly?: boolean; now?: Date } = {}
): DepartmentEvent[] {
  const now = options.now || new Date();
  const known = new Set(departmentEvents.map(event => normalizeTitle(event.title)));
  const extras = backendEvents
    .map(mapBackendEvent)
    .filter(event => !known.has(normalizeTitle(event.title)));

  return sortEventsChronologically([...departmentEvents, ...extras]).filter(event => {
    if (semester && event.semester !== undefined && event.semester !== semester) return false;
    if (options.upcomingOnly !== false && !isUpcomingEvent(event, now)) return false;
    return true;
  });
}
