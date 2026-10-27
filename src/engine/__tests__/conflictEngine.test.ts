import { describe, it, expect } from 'vitest';
import { detectConflicts, calculateDailyWorkloads, countOverloadedDaysBetween } from '../conflictEngine';
import { CalendarEvent, WorkingHoursConfig } from '../../types';

describe('conflictEngine', () => {
  const config: WorkingHoursConfig = {
    startHour: 9,
    endHour: 17,
    workDays: [1, 2, 3, 4, 5],
    maxDailyCommitmentHours: 5.0,
  };

  it('detects overlapping events and calculates overlap minutes', () => {
    const events: CalendarEvent[] = [
      {
        id: 'e1',
        title: 'Meeting Alpha',
        type: 'meeting',
        startTime: '2026-10-27T10:00:00',
        endTime: '2026-10-27T11:30:00',
        flexibility: 'fixed',
      },
      {
        id: 'e2',
        title: 'Meeting Beta',
        type: 'meeting',
        startTime: '2026-10-27T11:00:00',
        endTime: '2026-10-27T12:00:00',
        flexibility: 'flexible',
      },
      {
        id: 'e3',
        title: 'Focus Time Gamma',
        type: 'focus',
        startTime: '2026-10-27T14:00:00',
        endTime: '2026-10-27T15:00:00',
        flexibility: 'flexible',
      },
    ];

    const conflicts = detectConflicts(events);
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0].overlapMinutes).toBe(30);
    expect(conflicts[0].eventA.id).toBe('e1');
    expect(conflicts[0].eventB.id).toBe('e2');
  });

  it('prevents self-conflicts and ignores non-overlapping events', () => {
    const events: CalendarEvent[] = [
      {
        id: 'single-evt',
        title: 'Solo Work',
        type: 'focus',
        startTime: '2026-10-26T10:00:00',
        endTime: '2026-10-26T11:00:00',
        flexibility: 'fixed',
      },
      {
        id: 'adjacent-evt',
        title: 'Next Meeting',
        type: 'meeting',
        startTime: '2026-10-26T11:00:00',
        endTime: '2026-10-26T12:00:00',
        flexibility: 'fixed',
      },
    ];

    const conflicts = detectConflicts(events);
    expect(conflicts).toHaveLength(0);
  });

  it('calculates daily committed workload and flags overloaded days (> 5h)', () => {
    const events: CalendarEvent[] = [
      {
        id: 'e1',
        title: 'Workshop 1',
        type: 'meeting',
        startTime: '2026-10-29T09:00:00',
        endTime: '2026-10-29T12:00:00', // 3h
        flexibility: 'fixed',
      },
      {
        id: 'e2',
        title: 'Workshop 2',
        type: 'meeting',
        startTime: '2026-10-29T13:00:00',
        endTime: '2026-10-29T15:30:00', // 2.5h
        flexibility: 'flexible',
      },
    ];

    const workloads = calculateDailyWorkloads(events, config);
    const thuData = workloads.get('2026-10-29');

    expect(thuData).toBeDefined();
    expect(thuData?.committedHours).toBe(5.5);
    expect(thuData?.isOverloaded).toBe(true);
  });

  it('counts overloaded days correctly within a date range', () => {
    const events: CalendarEvent[] = [
      {
        id: 'e1',
        title: 'Heavy Day',
        type: 'meeting',
        startTime: '2026-10-29T09:00:00',
        endTime: '2026-10-29T16:00:00', // 7h
        flexibility: 'fixed',
      },
    ];

    const workloads = calculateDailyWorkloads(events, config);
    const count = countOverloadedDaysBetween(
      new Date('2026-10-26T00:00:00'),
      new Date('2026-10-30T23:59:59'),
      workloads
    );

    expect(count).toBe(1);
  });
});
