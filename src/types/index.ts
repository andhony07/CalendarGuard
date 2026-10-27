export type EventType = 'meeting' | 'focus' | 'assignment' | 'personal';
export type FlexibilityType = 'fixed' | 'flexible';
export type RiskLevel = 'low' | 'medium' | 'high';
export type DeadlinePriority = 'high' | 'medium' | 'low';

export interface CalendarEvent {
  id: string;
  title: string;
  type: EventType;
  startTime: string; // ISO string e.g. "2026-10-26T10:00:00"
  endTime: string;   // ISO string e.g. "2026-10-26T11:00:00"
  flexibility: FlexibilityType;
  deadlineId?: string;
  description?: string;
  location?: string;
}

export interface Deadline {
  id: string;
  title: string;
  dueDate: string; // ISO string e.g. "2026-10-28T14:00:00"
  estimatedEffortHours: number;
  completed: boolean;
  priority?: DeadlinePriority;
  description?: string;
  category?: string;
}

export interface RiskAnalysisResult {
  deadlineId: string;
  deadlineTitle: string;
  score: number; // 0 - 100
  level: RiskLevel;
  isOverdue: boolean;
  isCompleted: boolean;
  availablePrepHours: number;
  estimatedEffortHours: number;
  effortRatio: number;
  overloadedDaysCount: number;
  conflictsCount: number;
  riskFactors: string[];
  summary: string;
}

export interface ScheduleConflict {
  id: string;
  eventA: CalendarEvent;
  eventB: CalendarEvent;
  date: string; // YYYY-MM-DD
  overlapMinutes: number;
  description: string;
}

export interface DailyWorkload {
  date: string; // YYYY-MM-DD
  committedMinutes: number;
  committedHours: number;
  isOverloaded: boolean;
  eventsCount: number;
  events: CalendarEvent[];
}

export type RecommendationType = 
  | 'move_flexible_event' 
  | 'insert_focus_block' 
  | 'resolve_conflict' 
  | 'start_earlier';

export interface RecommendationProposedChange {
  action: 'move_event' | 'create_event' | 'delete_event';
  eventId?: string;
  newEvent?: CalendarEvent;
  targetStartTime?: string;
  targetEndTime?: string;
}

export interface Recommendation {
  id: string;
  type: RecommendationType;
  title: string;
  description: string;
  affectedDeadlineId?: string;
  affectedEventId?: string;
  benefit: string;
  riskReductionScore: number;
  proposedChange: RecommendationProposedChange;
  applied: boolean;
}

export interface WorkingHoursConfig {
  startHour: number; // e.g. 9 (9:00 AM)
  endHour: number;   // e.g. 17 (5:00 PM)
  workDays: number[]; // [1, 2, 3, 4, 5] Mon-Fri (0=Sun, 6=Sat)
  maxDailyCommitmentHours: number; // e.g. 5.0 hours (overload threshold)
}
