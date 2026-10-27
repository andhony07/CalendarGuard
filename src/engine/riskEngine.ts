import { CalendarEvent, Deadline, RiskAnalysisResult, RiskLevel, WorkingHoursConfig } from '../types';
import { parseISODate, formatDateToYYYYMMDD, calculateIntervalOverlapMinutes } from './dateUtils';
import { detectConflicts, calculateDailyWorkloads, countOverloadedDaysBetween } from './conflictEngine';

/**
 * Merges overlapping intervals to prevent double-subtraction of overlapping events.
 */
function mergeIntervals(intervals: { start: number; end: number }[]): { start: number; end: number }[] {
  if (intervals.length <= 1) return intervals;
  const sorted = [...intervals].sort((a, b) => a.start - b.start);
  const merged: { start: number; end: number }[] = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i];
    const prev = merged[merged.length - 1];
    if (current.start <= prev.end) {
      prev.end = Math.max(prev.end, current.end);
    } else {
      merged.push(current);
    }
  }
  return merged;
}

/**
 * Calculates available working preparation hours between analysisTime and deadline.dueDate.
 * Only considers working hours (e.g. 9am to 5pm) on configured workdays, and subtracts
 * any scheduled events falling inside that window.
 */
export function calculateAvailablePrepHours(
  analysisTime: Date,
  dueDate: Date,
  events: CalendarEvent[],
  config: WorkingHoursConfig
): number {
  if (dueDate <= analysisTime) {
    return 0;
  }

  let totalAvailableMinutes = 0;
  const curr = new Date(analysisTime);
  curr.setHours(0, 0, 0, 0);

  const targetDate = new Date(dueDate);
  targetDate.setHours(23, 59, 59, 999);

  while (curr <= targetDate) {
    const dayOfWeek = curr.getDay(); // 0 = Sun, 1 = Mon ...
    if (config.workDays.includes(dayOfWeek)) {
      // Working day window
      const workStart = new Date(curr);
      workStart.setHours(config.startHour, 0, 0, 0);

      const workEnd = new Date(curr);
      workEnd.setHours(config.endHour, 0, 0, 0);

      // Effective window start & end for this day
      const effStart = Math.max(workStart.getTime(), analysisTime.getTime());
      const effEnd = Math.min(workEnd.getTime(), dueDate.getTime());

      if (effEnd > effStart) {
        let dayAvailableMs = effEnd - effStart;

        // Find events on this day overlapping with [effStart, effEnd]
        const intervals: { start: number; end: number }[] = [];
        for (const evt of events) {
          const eStart = parseISODate(evt.startTime).getTime();
          const eEnd = parseISODate(evt.endTime).getTime();

          const overlapStart = Math.max(effStart, eStart);
          const overlapEnd = Math.min(effEnd, eEnd);

          if (overlapEnd > overlapStart) {
            intervals.push({ start: overlapStart, end: overlapEnd });
          }
        }

        const merged = mergeIntervals(intervals);
        const committedMs = merged.reduce((sum, intv) => sum + (intv.end - intv.start), 0);

        dayAvailableMs = Math.max(0, dayAvailableMs - committedMs);
        totalAvailableMinutes += Math.round(dayAvailableMs / 60000);
      }
    }

    curr.setDate(curr.getDate() + 1);
  }

  return Number((totalAvailableMinutes / 60).toFixed(1));
}

/**
 * Deterministically analyzes deadline risk.
 * Returns transparent score, classification, and explainable risk factors.
 */
export function analyzeDeadlineRisk(
  deadline: Deadline,
  events: CalendarEvent[],
  config: WorkingHoursConfig,
  analysisTimeStr: string
): RiskAnalysisResult {
  const analysisTime = parseISODate(analysisTimeStr);
  const dueDate = parseISODate(deadline.dueDate);

  // 1. Edge Case: Completed
  if (deadline.completed) {
    return {
      deadlineId: deadline.id,
      deadlineTitle: deadline.title,
      score: 0,
      level: 'low',
      isOverdue: false,
      isCompleted: true,
      availablePrepHours: 0,
      estimatedEffortHours: deadline.estimatedEffortHours || 0,
      effortRatio: 0,
      overloadedDaysCount: 0,
      conflictsCount: 0,
      riskFactors: ['Deadline has already been completed.'],
      summary: 'Completed. No pending risk.'
    };
  }

  // 2. Edge Case: Overdue
  if (dueDate < analysisTime) {
    return {
      deadlineId: deadline.id,
      deadlineTitle: deadline.title,
      score: 100,
      level: 'high',
      isOverdue: true,
      isCompleted: false,
      availablePrepHours: 0,
      estimatedEffortHours: Math.max(0, deadline.estimatedEffortHours || 0),
      effortRatio: Infinity,
      overloadedDaysCount: 0,
      conflictsCount: 0,
      riskFactors: [
        'Deadline has passed its due date without completion.',
        `Due date: ${deadline.dueDate}, Current time: ${analysisTimeStr}`
      ],
      summary: 'Overdue! Immediate action required.'
    };
  }

  // Sanitize estimated effort (non-negative)
  const effort = Math.max(0, isNaN(deadline.estimatedEffortHours) ? 0 : deadline.estimatedEffortHours);

  // 3. Edge Case: Zero Effort
  if (effort === 0) {
    return {
      deadlineId: deadline.id,
      deadlineTitle: deadline.title,
      score: 5,
      level: 'low',
      isOverdue: false,
      isCompleted: false,
      availablePrepHours: 0,
      estimatedEffortHours: 0,
      effortRatio: 0,
      overloadedDaysCount: 0,
      conflictsCount: 0,
      riskFactors: ['No estimated effort required for this task.'],
      summary: 'Minimal effort required; low risk.'
    };
  }

  // Calculate available prep hours
  const availablePrepHours = calculateAvailablePrepHours(analysisTime, dueDate, events, config);

  // Calculate workload and conflicts
  const workloads = calculateDailyWorkloads(events, config);
  const overloadedDaysCount = countOverloadedDaysBetween(analysisTime, dueDate, workloads);

  const allConflicts = detectConflicts(events);
  // Conflicts occurring before the deadline
  const relevantConflicts = allConflicts.filter((c) => {
    const conflictStart = parseISODate(c.eventA.startTime);
    return conflictStart >= analysisTime && conflictStart <= dueDate;
  });
  const conflictsCount = relevantConflicts.length;

  const riskFactors: string[] = [];

  let baseScore = 0;
  let effortRatio = 0;

  if (availablePrepHours <= 0) {
    // Zero available hours with positive effort is critical
    effortRatio = 999;
    baseScore = 80;
    riskFactors.push(`Critical: 0 available prep hours remaining before deadline (requires ${effort}h).`);
  } else {
    effortRatio = Number((effort / availablePrepHours).toFixed(2));

    if (effortRatio <= 0.3) {
      baseScore = Math.round(effortRatio * 60); // 0 - 18
      riskFactors.push(`Comfortable buffer: estimated ${effort}h takes only ${(effortRatio * 100).toFixed(0)}% of ${availablePrepHours}h available time.`);
    } else if (effortRatio <= 0.6) {
      baseScore = Math.round(18 + ((effortRatio - 0.3) / 0.3) * 22); // 18 - 40
      riskFactors.push(`Moderate workload: requires ${effort}h out of ${availablePrepHours}h available preparation time (${(effortRatio * 100).toFixed(0)}%).`);
    } else if (effortRatio <= 1.0) {
      baseScore = Math.round(40 + ((effortRatio - 0.6) / 0.4) * 30); // 40 - 70
      riskFactors.push(`Tight schedule: requires ${effort}h of work with only ${availablePrepHours}h available before deadline.`);
    } else {
      // Deficit: requires more hours than available!
      baseScore = Math.min(85, Math.round(70 + (effortRatio - 1.0) * 20));
      riskFactors.push(`Deficit warning: requires ${effort}h, but only ${availablePrepHours}h available focus time remains!`);
    }
  }

  // Overload penalty (+8 pts per overloaded day, max 20)
  const overloadPenalty = Math.min(20, overloadedDaysCount * 8);
  if (overloadedDaysCount > 0) {
    riskFactors.push(`${overloadedDaysCount} day(s) before deadline are overloaded with >${config.maxDailyCommitmentHours}h of meetings.`);
  }

  // Conflict penalty (+10 pts per conflict, max 20)
  const conflictPenalty = Math.min(20, conflictsCount * 10);
  if (conflictsCount > 0) {
    riskFactors.push(`${conflictsCount} schedule conflict(s) overlap with focus blocks or meetings before this deadline.`);
  }

  const rawScore = baseScore + overloadPenalty + conflictPenalty;
  const clampedScore = Math.max(0, Math.min(100, Math.round(rawScore)));

  // Risk Classification: Low: 0-34, Medium: 35-64, High: 65-100
  let level: RiskLevel = 'low';
  if (clampedScore >= 65) {
    level = 'high';
  } else if (clampedScore >= 35) {
    level = 'medium';
  }

  let summary = '';
  if (level === 'high') {
    summary = `High risk (${clampedScore}/100): High likelihood of slippage without schedule intervention.`;
  } else if (level === 'medium') {
    summary = `Moderate risk (${clampedScore}/100): Manageable, but schedule buffer is limited.`;
  } else {
    summary = `Low risk (${clampedScore}/100): Adequate preparation time is available.`;
  }

  return {
    deadlineId: deadline.id,
    deadlineTitle: deadline.title,
    score: clampedScore,
    level,
    isOverdue: false,
    isCompleted: false,
    availablePrepHours,
    estimatedEffortHours: effort,
    effortRatio: isFinite(effortRatio) ? effortRatio : 999,
    overloadedDaysCount,
    conflictsCount,
    riskFactors,
    summary
  };
}

/**
 * Analyzes all deadlines and returns an array of RiskAnalysisResult.
 */
export function analyzeAllDeadlines(
  deadlines: Deadline[],
  events: CalendarEvent[],
  config: WorkingHoursConfig,
  analysisTimeStr: string
): RiskAnalysisResult[] {
  return deadlines.map((dl) => analyzeDeadlineRisk(dl, events, config, analysisTimeStr));
}
