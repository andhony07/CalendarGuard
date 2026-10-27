import { CalendarEvent, ScheduleConflict, DailyWorkload, WorkingHoursConfig } from '../types';
import { parseISODate, formatDateToYYYYMMDD, calculateIntervalOverlapMinutes } from './dateUtils';

/**
 * Detects overlapping events in the schedule.
 * - Does not flag an event as conflicting with itself.
 * - Sorts events chronologically before comparing.
 * - Deterministic output.
 */
export function detectConflicts(events: CalendarEvent[]): ScheduleConflict[] {
  const conflicts: ScheduleConflict[] = [];
  const n = events.length;

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const a = events[i];
      const b = events[j];

      // Must be distinct events
      if (a.id === b.id) continue;

      const aStart = parseISODate(a.startTime);
      const aEnd = parseISODate(a.endTime);
      const bStart = parseISODate(b.startTime);
      const bEnd = parseISODate(b.endTime);

      const overlapMinutes = calculateIntervalOverlapMinutes(aStart, aEnd, bStart, bEnd);

      if (overlapMinutes > 0) {
        const dateStr = formatDateToYYYYMMDD(aStart);
        conflicts.push({
          id: `conflict-${a.id}-${b.id}`,
          eventA: a,
          eventB: b,
          date: dateStr,
          overlapMinutes,
          description: `"${a.title}" overlaps with "${b.title}" by ${overlapMinutes} minutes on ${dateStr}.`
        });
      }
    }
  }

  return conflicts;
}

/**
 * Calculates daily committed hours and flags overloaded days where
 * total scheduled commitments exceed the configured threshold (default 5.0h).
 */
export function calculateDailyWorkloads(
  events: CalendarEvent[],
  config: WorkingHoursConfig
): Map<string, DailyWorkload> {
  const workloadMap = new Map<string, DailyWorkload>();

  for (const event of events) {
    const start = parseISODate(event.startTime);
    const end = parseISODate(event.endTime);
    const dateKey = formatDateToYYYYMMDD(start);

    // Calculate duration in minutes (positive only)
    const durationMs = Math.max(0, end.getTime() - start.getTime());
    const durationMinutes = Math.round(durationMs / 60000);

    const existing = workloadMap.get(dateKey) || {
      date: dateKey,
      committedMinutes: 0,
      committedHours: 0,
      isOverloaded: false,
      eventsCount: 0,
      events: []
    };

    existing.committedMinutes += durationMinutes;
    existing.committedHours = Number((existing.committedMinutes / 60).toFixed(1));
    existing.eventsCount += 1;
    existing.events.push(event);

    existing.isOverloaded = existing.committedHours > config.maxDailyCommitmentHours;
    workloadMap.set(dateKey, existing);
  }

  return workloadMap;
}

/**
 * Counts how many overloaded days exist between [from, to] inclusive.
 */
export function countOverloadedDaysBetween(
  from: Date,
  to: Date,
  workloads: Map<string, DailyWorkload>
): number {
  let count = 0;
  const curr = new Date(from);
  curr.setHours(0, 0, 0, 0);

  const targetEnd = new Date(to);
  targetEnd.setHours(23, 59, 59, 999);

  while (curr <= targetEnd) {
    const key = formatDateToYYYYMMDD(curr);
    const dayData = workloads.get(key);
    if (dayData && dayData.isOverloaded) {
      count++;
    }
    curr.setDate(curr.getDate() + 1);
  }

  return count;
}
