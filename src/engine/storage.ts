import { CalendarEvent, Deadline, WorkingHoursConfig } from '../types';
import { INITIAL_EVENTS, INITIAL_DEADLINES, DEFAULT_WORKING_CONFIG, DEFAULT_ANALYSIS_TIME } from '../data/sampleData';

const STORAGE_KEYS = {
  EVENTS: 'calendarguard_events_v1',
  DEADLINES: 'calendarguard_deadlines_v1',
  CONFIG: 'calendarguard_config_v1',
  ANALYSIS_TIME: 'calendarguard_analysis_time_v1',
  APPLIED_RECS: 'calendarguard_applied_recs_v1',
};

export function loadStoredEvents(): CalendarEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EVENTS);
    if (!raw) return INITIAL_EVENTS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].id && parsed[0].title) {
      return parsed;
    }
    return INITIAL_EVENTS;
  } catch (err) {
    console.warn('Failed to load events from storage, falling back to initial seed data.', err);
    return INITIAL_EVENTS;
  }
}

export function saveStoredEvents(events: CalendarEvent[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
  } catch (err) {
    console.error('Failed to save events to localStorage.', err);
  }
}

export function loadStoredDeadlines(): Deadline[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DEADLINES);
    if (!raw) return INITIAL_DEADLINES;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].id && parsed[0].title) {
      return parsed;
    }
    return INITIAL_DEADLINES;
  } catch (err) {
    console.warn('Failed to load deadlines from storage, falling back to initial seed data.', err);
    return INITIAL_DEADLINES;
  }
}

export function saveStoredDeadlines(deadlines: Deadline[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.DEADLINES, JSON.stringify(deadlines));
  } catch (err) {
    console.error('Failed to save deadlines to localStorage.', err);
  }
}

export function loadStoredConfig(): WorkingHoursConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CONFIG);
    if (!raw) return DEFAULT_WORKING_CONFIG;
    const parsed = JSON.parse(raw);
    if (typeof parsed.startHour === 'number' && typeof parsed.endHour === 'number') {
      return parsed;
    }
    return DEFAULT_WORKING_CONFIG;
  } catch (err) {
    return DEFAULT_WORKING_CONFIG;
  }
}

export function saveStoredConfig(config: WorkingHoursConfig): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
  } catch (err) {
    console.error('Failed to save config to localStorage.', err);
  }
}

export function loadStoredAnalysisTime(): string {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ANALYSIS_TIME);
    return raw || DEFAULT_ANALYSIS_TIME;
  } catch (err) {
    return DEFAULT_ANALYSIS_TIME;
  }
}

export function saveStoredAnalysisTime(timeStr: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ANALYSIS_TIME, timeStr);
  } catch (err) {
    console.error('Failed to save analysis time to localStorage.', err);
  }
}

export function loadStoredAppliedRecs(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.APPLIED_RECS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    return [];
  }
}

export function saveStoredAppliedRecs(ids: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.APPLIED_RECS, JSON.stringify(ids));
  } catch (err) {
    console.error('Failed to save applied recs to localStorage.', err);
  }
}

export function resetAllStorage(): {
  events: CalendarEvent[];
  deadlines: Deadline[];
  config: WorkingHoursConfig;
  analysisTime: string;
  appliedRecs: string[];
} {
  try {
    localStorage.removeItem(STORAGE_KEYS.EVENTS);
    localStorage.removeItem(STORAGE_KEYS.DEADLINES);
    localStorage.removeItem(STORAGE_KEYS.CONFIG);
    localStorage.removeItem(STORAGE_KEYS.ANALYSIS_TIME);
    localStorage.removeItem(STORAGE_KEYS.APPLIED_RECS);
  } catch (err) {
    console.warn('Error clearing localStorage keys', err);
  }
  return {
    events: [...INITIAL_EVENTS],
    deadlines: [...INITIAL_DEADLINES],
    config: { ...DEFAULT_WORKING_CONFIG },
    analysisTime: DEFAULT_ANALYSIS_TIME,
    appliedRecs: [],
  };
}
