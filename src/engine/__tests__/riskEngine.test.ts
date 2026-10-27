import { describe, it, expect } from 'vitest';
import { analyzeDeadlineRisk, calculateAvailablePrepHours } from '../riskEngine';
import { Deadline, CalendarEvent, WorkingHoursConfig } from '../../types';

describe('riskEngine', () => {
  const config: WorkingHoursConfig = {
    startHour: 9,
    endHour: 17,
    workDays: [1, 2, 3, 4, 5],
    maxDailyCommitmentHours: 5.0,
  };

  const sampleEvents: CalendarEvent[] = [
    {
      id: 'e1',
      title: 'Sprint Planning',
      type: 'meeting',
      startTime: '2026-10-26T10:00:00',
      endTime: '2026-10-26T12:00:00',
      flexibility: 'fixed',
    },
    {
      id: 'e2',
      title: 'Design Review',
      type: 'meeting',
      startTime: '2026-10-26T14:00:00',
      endTime: '2026-10-26T16:00:00',
      flexibility: 'flexible',
    },
  ];

  it('calculates available preparation hours accurately during work hours', () => {
    const analysisTime = new Date('2026-10-26T09:00:00'); // Mon 9am
    const dueDate = new Date('2026-10-26T17:00:00');      // Mon 5pm (8h window, minus 4h of meetings)
    const prepHours = calculateAvailablePrepHours(analysisTime, dueDate, sampleEvents, config);

    expect(prepHours).toBe(4.0);
  });

  it('marks completed deadline with 0 score and low risk', () => {
    const deadline: Deadline = {
      id: 'dl-comp',
      title: 'Shipped Feature',
      dueDate: '2026-10-26T12:00:00',
      estimatedEffortHours: 4,
      completed: true,
    };

    const result = analyzeDeadlineRisk(deadline, sampleEvents, config, '2026-10-26T09:00:00');
    expect(result.score).toBe(0);
    expect(result.level).toBe('low');
    expect(result.isCompleted).toBe(true);
  });

  it('marks overdue incomplete deadline with 100 score and high risk', () => {
    const deadline: Deadline = {
      id: 'dl-overdue',
      title: 'Missed Milestone',
      dueDate: '2026-10-25T17:00:00', // Sunday (past)
      estimatedEffortHours: 3,
      completed: false,
    };

    const result = analyzeDeadlineRisk(deadline, sampleEvents, config, '2026-10-26T09:00:00');
    expect(result.score).toBe(100);
    expect(result.level).toBe('high');
    expect(result.isOverdue).toBe(true);
  });

  it('handles zero or negative effort gracefully without crashing', () => {
    const deadline: Deadline = {
      id: 'dl-zero',
      title: 'Quick Check',
      dueDate: '2026-10-28T17:00:00',
      estimatedEffortHours: -2,
      completed: false,
    };

    const result = analyzeDeadlineRisk(deadline, sampleEvents, config, '2026-10-26T09:00:00');
    expect(result.estimatedEffortHours).toBe(0);
    expect(result.level).toBe('low');
  });

  it('handles zero available preparation hours without division by zero', () => {
    const deadline: Deadline = {
      id: 'dl-immediate',
      title: 'Immediate Hotfix',
      dueDate: '2026-10-26T09:00:00', // exact same time
      estimatedEffortHours: 5,
      completed: false,
    };

    const result = analyzeDeadlineRisk(deadline, sampleEvents, config, '2026-10-26T09:00:00');
    expect(result.availablePrepHours).toBe(0);
    expect(result.score).toBeGreaterThanOrEqual(80);
    expect(result.level).toBe('high');
    expect(Number.isFinite(result.score)).toBe(true);
  });

  it('classifies low, medium, and high risk deadlines correctly according to thresholds', () => {
    // Low risk: 2h effort with 20h available prep time
    const lowDl: Deadline = {
      id: 'dl-low',
      title: 'Future Documentation',
      dueDate: '2026-10-30T17:00:00',
      estimatedEffortHours: 2,
      completed: false,
    };
    const lowRes = analyzeDeadlineRisk(lowDl, [], config, '2026-10-26T09:00:00');
    expect(lowRes.score).toBeLessThan(35);
    expect(lowRes.level).toBe('low');

    // High risk: 14h effort with only 12h available prep time
    const highDl: Deadline = {
      id: 'dl-high',
      title: 'Heavy Refactor',
      dueDate: '2026-10-27T17:00:00',
      estimatedEffortHours: 14,
      completed: false,
    };
    const highRes = analyzeDeadlineRisk(highDl, sampleEvents, config, '2026-10-26T09:00:00');
    expect(highRes.score).toBeGreaterThanOrEqual(65);
    expect(highRes.level).toBe('high');
  });
});
