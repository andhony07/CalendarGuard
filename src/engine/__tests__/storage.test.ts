import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadStoredEvents,
  saveStoredEvents,
  loadStoredDeadlines,
  saveStoredDeadlines,
  resetAllStorage,
} from '../storage';
import { CalendarEvent, Deadline } from '../../types';

describe('storage resilience', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('falls back to default sample events when localStorage is empty', () => {
    const events = loadStoredEvents();
    expect(events.length).toBeGreaterThan(5);
  });

  it('persists and retrieves custom events', () => {
    const customEvents: CalendarEvent[] = [
      {
        id: 'evt-custom-1',
        title: 'Custom Event',
        type: 'meeting',
        startTime: '2026-10-26T10:00:00',
        endTime: '2026-10-26T11:00:00',
        flexibility: 'fixed',
      },
    ];

    saveStoredEvents(customEvents);
    const loaded = loadStoredEvents();
    expect(loaded).toHaveLength(1);
    expect(loaded[0].title).toBe('Custom Event');
  });

  it('recovers gracefully when localStorage contains corrupted JSON', () => {
    localStorage.setItem('calendarguard_events_v1', '{invalid-json: oops');
    const recovered = loadStoredEvents();
    expect(recovered.length).toBeGreaterThan(5); // Fell back to initial seed data
  });

  it('resetAllStorage cleans keys and restores original seed data', () => {
    const customDeadlines: Deadline[] = [
      {
        id: 'dl-test',
        title: 'Test Deadline',
        dueDate: '2026-10-28T12:00:00',
        estimatedEffortHours: 3,
        completed: false,
      },
    ];
    saveStoredDeadlines(customDeadlines);

    const resetResult = resetAllStorage();
    expect(resetResult.deadlines.length).toBeGreaterThanOrEqual(4);
    expect(localStorage.getItem('calendarguard_deadlines_v1')).toBeNull();
  });
});
