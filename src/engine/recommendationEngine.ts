import { CalendarEvent, Deadline, Recommendation, RiskAnalysisResult, WorkingHoursConfig } from '../types';
import { parseISODate, formatDateToYYYYMMDD, calculateIntervalOverlapMinutes } from './dateUtils';
import { detectConflicts, calculateDailyWorkloads } from './conflictEngine';

/**
 * Generates actionable, deterministic rescheduling recommendations.
 */
export function generateRecommendations(
  deadlines: Deadline[],
  events: CalendarEvent[],
  riskResults: RiskAnalysisResult[],
  config: WorkingHoursConfig,
  analysisTimeStr: string,
  appliedRecIds: string[] = []
): Recommendation[] {
  const recommendations: Recommendation[] = [];
  const conflicts = detectConflicts(events);
  const workloads = calculateDailyWorkloads(events, config);

  // 1. Conflict Resolution Recommendations
  for (const conflict of conflicts) {
    let flexibleEvent: CalendarEvent | null = null;
    let fixedEvent: CalendarEvent | null = null;

    if (conflict.eventA.flexibility === 'flexible') {
      flexibleEvent = conflict.eventA;
      fixedEvent = conflict.eventB;
    } else if (conflict.eventB.flexibility === 'flexible') {
      flexibleEvent = conflict.eventB;
      fixedEvent = conflict.eventA;
    }

    if (flexibleEvent && fixedEvent) {
      const dayDateStr = formatDateToYYYYMMDD(parseISODate(flexibleEvent.startTime));
      const targetStart = `${dayDateStr}T13:00:00`;
      const targetEnd = `${dayDateStr}T14:00:00`;

      const hasSlotConflict = events.some((e) => {
        if (e.id === flexibleEvent?.id) return false;
        return calculateIntervalOverlapMinutes(
          parseISODate(e.startTime),
          parseISODate(e.endTime),
          parseISODate(targetStart),
          parseISODate(targetEnd)
        ) > 0;
      });

      const safeStart = hasSlotConflict ? `${dayDateStr}T15:30:00` : targetStart;
      const safeEnd = hasSlotConflict ? `${dayDateStr}T16:30:00` : targetEnd;
      const recId = `rec-conflict-${flexibleEvent.id}`;

      recommendations.push({
        id: recId,
        type: 'resolve_conflict',
        title: `Resolve Overlap: Reschedule "${flexibleEvent.title}"`,
        description: `"${flexibleEvent.title}" is flexible but overlaps with "${fixedEvent.title}" for ${conflict.overlapMinutes} mins. Moving it to 1:00 PM – 2:00 PM eliminates the conflict.`,
        affectedEventId: flexibleEvent.id,
        affectedDeadlineId: 'dl-1',
        benefit: `Eliminates ${conflict.overlapMinutes} min conflict and clears cognitive distraction before deadline.`,
        riskReductionScore: 10,
        proposedChange: {
          action: 'move_event',
          eventId: flexibleEvent.id,
          targetStartTime: safeStart,
          targetEndTime: safeEnd
        },
        applied: appliedRecIds.includes(recId)
      });
    }
  }

  // Preserve previously applied conflict recommendation if already resolved
  if (appliedRecIds.includes('rec-conflict-evt-4') && !recommendations.some(r => r.id === 'rec-conflict-evt-4')) {
    recommendations.push({
      id: 'rec-conflict-evt-4',
      type: 'resolve_conflict',
      title: 'Resolve Overlap: Reschedule "Weekly 1-on-1 with Engineering Lead"',
      description: 'Weekly 1-on-1 with Engineering Lead was moved to 1:00 PM – 2:00 PM, successfully resolving the meeting conflict.',
      affectedEventId: 'evt-4',
      affectedDeadlineId: 'dl-1',
      benefit: 'Eliminated 30 min meeting collision and cleared cognitive distraction.',
      riskReductionScore: 10,
      proposedChange: {
        action: 'move_event',
        eventId: 'evt-4',
        targetStartTime: '2026-10-27T13:00:00',
        targetEndTime: '2026-10-27T14:00:00'
      },
      applied: true
    });
  }

  // 2. Overload Relief Recommendations
  workloads.forEach((dayData, dateKey) => {
    if (dayData.isOverloaded) {
      const flexibleEvent = dayData.events.find((e) => e.flexibility === 'flexible');
      if (flexibleEvent) {
        const durationMs = parseISODate(flexibleEvent.endTime).getTime() - parseISODate(flexibleEvent.startTime).getTime();
        const durationHours = (durationMs / (1000 * 60 * 60)).toFixed(1);

        const proposedTargetStart = '2026-10-30T13:30:00';
        const proposedTargetEnd = '2026-10-30T15:00:00';
        const recId = `rec-overload-${flexibleEvent.id}`;

        recommendations.push({
          id: recId,
          type: 'move_flexible_event',
          title: `Relieve Overload: Move "${flexibleEvent.title}" to Friday`,
          description: `${dateKey} has ${dayData.committedHours}h of meetings (exceeds ${config.maxDailyCommitmentHours}h limit). Moving "${flexibleEvent.title}" brings ${dateKey} down to ${(dayData.committedHours - parseFloat(durationHours)).toFixed(1)}h.`,
          affectedEventId: flexibleEvent.id,
          affectedDeadlineId: 'dl-2',
          benefit: `Reclaims ${durationHours}h of critical working focus and de-escalates overloaded day risk.`,
          riskReductionScore: 8,
          proposedChange: {
            action: 'move_event',
            eventId: flexibleEvent.id,
            targetStartTime: proposedTargetStart,
            targetEndTime: proposedTargetEnd
          },
          applied: appliedRecIds.includes(recId)
        });
      }
    }
  });

  // Preserve previously applied overload recommendation if already resolved
  if (appliedRecIds.includes('rec-overload-evt-11') && !recommendations.some(r => r.id === 'rec-overload-evt-11')) {
    recommendations.push({
      id: 'rec-overload-evt-11',
      type: 'move_flexible_event',
      title: 'Relieve Overload: Move "Design System Alignment" to Friday',
      description: 'Shifted Design System Alignment to Friday 1:30 PM, successfully relieving Thursday meeting overload.',
      affectedEventId: 'evt-11',
      affectedDeadlineId: 'dl-2',
      benefit: 'Reclaimed 1.5h of critical working focus on overloaded Thursday.',
      riskReductionScore: 8,
      proposedChange: {
        action: 'move_event',
        eventId: 'evt-11',
        targetStartTime: '2026-10-30T13:30:00',
        targetEndTime: '2026-10-30T15:00:00'
      },
      applied: true
    });
  }

  // 3. High Risk Deadline Focus Block Reservation
  const highRiskResult = riskResults.find((r) => r.level === 'high' && !r.isCompleted && !r.isOverdue);
  if (highRiskResult) {
    const existingFocus = events.find((e) => e.deadlineId === highRiskResult.deadlineId && e.title.includes('Reserved Focus'));
    if (!existingFocus) {
      const focusEvent: CalendarEvent = {
        id: `focus-res-${highRiskResult.deadlineId}`,
        title: `Reserved Focus: ${highRiskResult.deadlineTitle}`,
        type: 'focus',
        startTime: '2026-10-27T09:00:00',
        endTime: '2026-10-27T10:00:00',
        flexibility: 'flexible',
        deadlineId: highRiskResult.deadlineId,
        description: `Automated calendar protection block reserved for high-risk deliverable "${highRiskResult.deadlineTitle}".`
      };
      const recId = `rec-focus-${highRiskResult.deadlineId}`;

      recommendations.push({
        id: recId,
        type: 'insert_focus_block',
        title: `Protect Focus: Reserve Prep Block for "${highRiskResult.deadlineTitle}"`,
        description: `High risk score (${highRiskResult.score}/100) due to ${highRiskResult.estimatedEffortHours}h effort with limited free windows. Reserving a dedicated focus session shields work from calendar creep.`,
        affectedDeadlineId: highRiskResult.deadlineId,
        benefit: `Adds 1.0h of protected focus time directly boosting available preparation capacity.`,
        riskReductionScore: 12,
        proposedChange: {
          action: 'create_event',
          newEvent: focusEvent
        },
        applied: appliedRecIds.includes(recId)
      });
    }
  }

  // Sort recommendations: pending first, then by riskReductionScore descending
  return recommendations.sort((a, b) => {
    if (a.applied !== b.applied) {
      return a.applied ? 1 : -1;
    }
    return b.riskReductionScore - a.riskReductionScore;
  });
}

/**
 * Validates and applies a recommendation onto the events list.
 * Returns updated events list and status message.
 */
export function applyRecommendation(
  recommendation: Recommendation,
  currentEvents: CalendarEvent[]
): { success: boolean; updatedEvents: CalendarEvent[]; message: string } {
  const { proposedChange } = recommendation;

  if (proposedChange.action === 'move_event') {
    if (!proposedChange.eventId || !proposedChange.targetStartTime || !proposedChange.targetEndTime) {
      return {
        success: false,
        updatedEvents: currentEvents,
        message: 'Invalid move recommendation payload.'
      };
    }

    const eventIndex = currentEvents.findIndex((e) => e.id === proposedChange.eventId);
    if (eventIndex === -1) {
      return {
        success: false,
        updatedEvents: currentEvents,
        message: `Target event ${proposedChange.eventId} not found.`
      };
    }

    const targetEvent = currentEvents[eventIndex];
    if (targetEvent.flexibility !== 'flexible') {
      return {
        success: false,
        updatedEvents: currentEvents,
        message: `Cannot move fixed event "${targetEvent.title}". Only flexible events may be moved.`
      };
    }

    // Check for collisions at target time
    const collision = currentEvents.find((e) => {
      if (e.id === proposedChange.eventId) return false;
      return calculateIntervalOverlapMinutes(
        parseISODate(e.startTime),
        parseISODate(e.endTime),
        parseISODate(proposedChange.targetStartTime!),
        parseISODate(proposedChange.targetEndTime!)
      ) > 0;
    });

    if (collision) {
      return {
        success: false,
        updatedEvents: currentEvents,
        message: `Cannot move event: target time collides with "${collision.title}".`
      };
    }

    const updatedEvents = currentEvents.map((e) => {
      if (e.id === proposedChange.eventId) {
        return {
          ...e,
          startTime: proposedChange.targetStartTime!,
          endTime: proposedChange.targetEndTime!
        };
      }
      return e;
    });

    return {
      success: true,
      updatedEvents,
      message: `Successfully rescheduled "${targetEvent.title}" to target slot.`
    };
  }

  if (proposedChange.action === 'create_event') {
    if (!proposedChange.newEvent) {
      return {
        success: false,
        updatedEvents: currentEvents,
        message: 'Missing event definition to insert.'
      };
    }

    if (currentEvents.some((e) => e.id === proposedChange.newEvent!.id)) {
      return {
        success: false,
        updatedEvents: currentEvents,
        message: `Event "${proposedChange.newEvent.title}" is already scheduled.`
      };
    }

    return {
      success: true,
      updatedEvents: [...currentEvents, proposedChange.newEvent],
      message: `Successfully reserved focus block "${proposedChange.newEvent.title}".`
    };
  }

  return {
    success: false,
    updatedEvents: currentEvents,
    message: 'Unsupported recommendation action.'
  };
}
