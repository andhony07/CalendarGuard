/**
 * Deterministic date and time utilities for CalendarGuard.
 * Avoids unexpected shifts from UTC/Local conversions by parsing ISO string parts cleanly.
 */

export function parseISODate(isoStr: string): Date {
  return new Date(isoStr);
}

export function formatDateToYYYYMMDD(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatTimeHHMM(isoStr: string | Date): string {
  const d = typeof isoStr === 'string' ? parseISODate(isoStr) : isoStr;
  const hours = d.getHours();
  const minutes = d.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  const displayMinutes = String(minutes).padStart(2, '0');
  return `${displayHours}:${displayMinutes} ${ampm}`;
}

export function formatDisplayDate(isoStr: string | Date): string {
  const d = typeof isoStr === 'string' ? parseISODate(isoStr) : isoStr;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

export function getDayName(isoStr: string | Date, short = false): string {
  const d = typeof isoStr === 'string' ? parseISODate(isoStr) : isoStr;
  const daysLong = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const daysShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return short ? daysShort[d.getDay()] : daysLong[d.getDay()];
}

/**
 * Returns Monday of the week for a given date.
 */
export function getStartOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  // We consider Monday as start of week (day 1). Sunday is 0 -> diff -6.
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Returns Sunday of the week for a given date.
 */
export function getEndOfWeek(date: Date): Date {
  const start = getStartOfWeek(date);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

/**
 * Generates an array of 7 consecutive dates representing the week starting from Monday.
 */
export function getWeekDates(weekStart: Date): Date[] {
  const dates: Date[] = [];
  const start = new Date(weekStart);
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    dates.push(d);
  }
  return dates;
}

/**
 * Calculates overlap in minutes between two intervals [startA, endA] and [startB, endB].
 */
export function calculateIntervalOverlapMinutes(
  startA: Date,
  endA: Date,
  startB: Date,
  endB: Date
): number {
  const latestStart = Math.max(startA.getTime(), startB.getTime());
  const earliestEnd = Math.min(endA.getTime(), endB.getTime());
  const diffMs = earliestEnd - latestStart;
  return diffMs > 0 ? Math.round(diffMs / 60000) : 0;
}

/**
 * Checks whether two dates fall on the exact same calendar day (ignoring time).
 */
export function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

/**
 * Creates an ISO string from date and hour/minute components.
 */
export function createDateWithTime(baseDate: Date, hour: number, minute: number): string {
  const d = new Date(baseDate);
  d.setHours(hour, minute, 0, 0);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const h = String(hour).padStart(2, '0');
  const min = String(minute).padStart(2, '0');
  return `${y}-${m}-${day}T${h}:${min}:00`;
}
