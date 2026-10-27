import { describe, it, expect } from 'vitest';
import { generateRecommendations, applyRecommendation } from '../recommendationEngine';
import { CalendarEvent, Deadline, RiskAnalysisResult, WorkingHoursConfig, Recommendation } from '../../types';

describe('recommendationEngine', () => {
  const config: WorkingHoursConfig = {
    startHour: 9,
    endHour: 17,
    workDays: [1, 2, 3, 4, 5],
    maxDailyCommitmentHours: 5.0,
  };

  const sampleDeadlines: Deadline[] = [
    {
      id: 'dl-1',
      title: 'API Spec',
      dueDate: '2026-10-28T14:00:00',
      estimatedEffortHours: 8,
      completed: false,
    },
  ];

  const sampleEvents: CalendarEvent[] = [
    {
      id: 'evt-fixed',
      title: 'Fixed Client Call',
      type: 'meeting',
      startTime: '2026-10-27T10:00:00',
      endTime: '2026-10-27T11:30:00',
      flexibility: 'fixed',
    },
    {
      id: 'evt-flex',
      title: 'Internal Chat',
      type: 'meeting',
      startTime: '2026-10-27T11:00:00',
      endTime: '2026-10-27T12:00:00',
      flexibility: 'flexible',
    },
  ];

  const sampleRisks: RiskAnalysisResult[] = [
    {
      deadlineId: 'dl-1',
      deadlineTitle: 'API Spec',
      score: 75,
      level: 'high',
      isOverdue: false,
      isCompleted: false,
      availablePrepHours: 5,
      estimatedEffortHours: 8,
      effortRatio: 1.6,
      overloadedDaysCount: 0,
      conflictsCount: 1,
      riskFactors: ['Tight deadline'],
      summary: 'High risk',
    },
  ];

  it('generates conflict resolution recommendations for flexible events', () => {
    const recs = generateRecommendations(sampleDeadlines, sampleEvents, sampleRisks, config, '2026-10-26T09:00:00');
    const conflictRec = recs.find((r) => r.type === 'resolve_conflict');

    expect(conflictRec).toBeDefined();
    expect(conflictRec?.affectedEventId).toBe('evt-flex');
    expect(conflictRec?.proposedChange.action).toBe('move_event');
  });

  it('applies move recommendation successfully to flexible event', () => {
    const rec: Recommendation = {
      id: 'rec-test-move',
      type: 'resolve_conflict',
      title: 'Move Internal Chat',
      description: 'Moving to open afternoon slot',
      benefit: 'Eliminates overlap',
      riskReductionScore: 10,
      applied: false,
      proposedChange: {
        action: 'move_event',
        eventId: 'evt-flex',
        targetStartTime: '2026-10-27T13:00:00',
        targetEndTime: '2026-10-27T14:00:00',
      },
    };

    const result = applyRecommendation(rec, sampleEvents);
    expect(result.success).toBe(true);

    const movedEvent = result.updatedEvents.find((e) => e.id === 'evt-flex');
    expect(movedEvent?.startTime).toBe('2026-10-27T13:00:00');
    expect(movedEvent?.endTime).toBe('2026-10-27T14:00:00');
  });

  it('refuses to move fixed events', () => {
    const invalidRec: Recommendation = {
      id: 'rec-invalid',
      type: 'move_flexible_event',
      title: 'Move Fixed Call',
      description: 'Should fail',
      benefit: 'None',
      riskReductionScore: 5,
      applied: false,
      proposedChange: {
        action: 'move_event',
        eventId: 'evt-fixed', // fixed event!
        targetStartTime: '2026-10-27T13:00:00',
        targetEndTime: '2026-10-27T14:00:00',
      },
    };

    const result = applyRecommendation(invalidRec, sampleEvents);
    expect(result.success).toBe(false);
    expect(result.message).toContain('Cannot move fixed event');
  });

  it('applies focus block insertion recommendation successfully', () => {
    const newFocusEvent: CalendarEvent = {
      id: 'focus-test-1',
      title: 'Deep Focus Block',
      type: 'focus',
      startTime: '2026-10-27T08:00:00',
      endTime: '2026-10-27T09:00:00',
      flexibility: 'flexible',
    };

    const rec: Recommendation = {
      id: 'rec-test-focus',
      type: 'insert_focus_block',
      title: 'Add Focus Block',
      description: 'Protects morning time',
      benefit: 'Adds 1 hour focus',
      riskReductionScore: 12,
      applied: false,
      proposedChange: {
        action: 'create_event',
        newEvent: newFocusEvent,
      },
    };

    const result = applyRecommendation(rec, sampleEvents);
    expect(result.success).toBe(true);
    expect(result.updatedEvents).toHaveLength(sampleEvents.length + 1);
    expect(result.updatedEvents.some((e) => e.id === 'focus-test-1')).toBe(true);
  });
});
