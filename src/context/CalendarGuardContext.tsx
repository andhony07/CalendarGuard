import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import {
  CalendarEvent,
  Deadline,
  RiskAnalysisResult,
  ScheduleConflict,
  DailyWorkload,
  Recommendation,
  WorkingHoursConfig,
} from '../types';
import {
  loadStoredEvents,
  saveStoredEvents,
  loadStoredDeadlines,
  saveStoredDeadlines,
  loadStoredConfig,
  saveStoredConfig,
  loadStoredAnalysisTime,
  saveStoredAnalysisTime,
  loadStoredAppliedRecs,
  saveStoredAppliedRecs,
  resetAllStorage,
} from '../engine/storage';
import { parseISODate, getStartOfWeek } from '../engine/dateUtils';
import { detectConflicts, calculateDailyWorkloads } from '../engine/conflictEngine';
import { analyzeAllDeadlines } from '../engine/riskEngine';
import { generateRecommendations, applyRecommendation } from '../engine/recommendationEngine';

interface ToastState {
  message: string;
  type: 'success' | 'info' | 'error';
}

interface CalendarGuardContextType {
  events: CalendarEvent[];
  deadlines: Deadline[];
  config: WorkingHoursConfig;
  analysisTime: string;
  currentWeekStart: Date;
  activeTab: 'dashboard' | 'calendar' | 'deadlines' | 'recommendations' | 'settings';
  selectedDeadlineId: string | null;
  riskResults: RiskAnalysisResult[];
  conflicts: ScheduleConflict[];
  dailyWorkloads: Map<string, DailyWorkload>;
  recommendations: Recommendation[];
  toast: ToastState | null;
  lastAnalyzedAt: Date;
  setActiveTab: (tab: 'dashboard' | 'calendar' | 'deadlines' | 'recommendations' | 'settings') => void;
  setSelectedDeadlineId: (id: string | null) => void;
  nextWeek: () => void;
  prevWeek: () => void;
  resetToCurrentWeek: () => void;
  analyzeSchedule: () => void;
  applyRec: (recId: string) => boolean;
  addEvent: (event: CalendarEvent) => void;
  deleteEvent: (id: string) => void;
  addDeadline: (deadline: Deadline) => void;
  toggleDeadlineCompleted: (id: string) => void;
  deleteDeadline: (id: string) => void;
  resetDemoData: () => void;
  updateConfig: (config: WorkingHoursConfig) => void;
  setAnalysisTime: (timeStr: string) => void;
  dismissToast: () => void;
}

const CalendarGuardContext = createContext<CalendarGuardContextType | undefined>(undefined);

export const CalendarGuardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [events, setEvents] = useState<CalendarEvent[]>(() => loadStoredEvents());
  const [deadlines, setDeadlines] = useState<Deadline[]>(() => loadStoredDeadlines());
  const [config, setConfig] = useState<WorkingHoursConfig>(() => loadStoredConfig());
  const [analysisTime, setAnalysisTimeState] = useState<string>(() => loadStoredAnalysisTime());
  const [appliedRecIds, setAppliedRecIds] = useState<string[]>(() => loadStoredAppliedRecs());
  const [activeTab, setActiveTab] = useState<'dashboard' | 'calendar' | 'deadlines' | 'recommendations' | 'settings'>('dashboard');
  const [selectedDeadlineId, setSelectedDeadlineId] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [lastAnalyzedAt, setLastAnalyzedAt] = useState<Date>(() => new Date());

  // Week navigation state
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    return getStartOfWeek(parseISODate(loadStoredAnalysisTime()));
  });

  const showToast = useCallback((message: string, type: 'success' | 'info' | 'error' = 'info') => {
    setToast({ message, type });
  }, []);

  const dismissToast = useCallback(() => {
    setToast(null);
  }, []);

  // Compute conflicts
  const conflicts = useMemo(() => {
    return detectConflicts(events);
  }, [events]);

  // Compute daily workloads
  const dailyWorkloads = useMemo(() => {
    return calculateDailyWorkloads(events, config);
  }, [events, config]);

  // Compute risk results
  const riskResults = useMemo(() => {
    return analyzeAllDeadlines(deadlines, events, config, analysisTime);
  }, [deadlines, events, config, analysisTime]);

  // Compute recommendations
  const recommendations = useMemo(() => {
    return generateRecommendations(deadlines, events, riskResults, config, analysisTime, appliedRecIds);
  }, [deadlines, events, riskResults, config, analysisTime, appliedRecIds]);

  // Week Navigation
  const nextWeek = useCallback(() => {
    setCurrentWeekStart((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() + 7);
      return d;
    });
  }, []);

  const prevWeek = useCallback(() => {
    setCurrentWeekStart((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() - 7);
      return d;
    });
  }, []);

  const resetToCurrentWeek = useCallback(() => {
    setCurrentWeekStart(getStartOfWeek(parseISODate(analysisTime)));
  }, [analysisTime]);

  // Re-run analysis
  const analyzeSchedule = useCallback(() => {
    setLastAnalyzedAt(new Date());
    showToast('Schedule re-analyzed: workload and risk metrics refreshed.', 'success');
  }, [showToast]);

  // Apply a recommendation
  const applyRec = useCallback(
    (recId: string): boolean => {
      const targetRec = recommendations.find((r) => r.id === recId);
      if (!targetRec) {
        showToast('Recommendation not found.', 'error');
        return false;
      }

      const result = applyRecommendation(targetRec, events);
      if (result.success) {
        setEvents(result.updatedEvents);
        saveStoredEvents(result.updatedEvents);
        setAppliedRecIds((prev) => {
          const next = [...prev, recId];
          saveStoredAppliedRecs(next);
          return next;
        });
        showToast(result.message, 'success');
        return true;
      } else {
        showToast(result.message, 'error');
        return false;
      }
    },
    [recommendations, events, showToast]
  );

  // Add event
  const addEvent = useCallback(
    (event: CalendarEvent) => {
      const updated = [...events, event];
      setEvents(updated);
      saveStoredEvents(updated);
      showToast(`Added event "${event.title}" to schedule.`, 'success');
    },
    [events, showToast]
  );

  // Delete event
  const deleteEvent = useCallback(
    (id: string) => {
      const updated = events.filter((e) => e.id !== id);
      setEvents(updated);
      saveStoredEvents(updated);
      showToast('Event removed from schedule.', 'info');
    },
    [events, showToast]
  );

  // Add deadline
  const addDeadline = useCallback(
    (deadline: Deadline) => {
      const updated = [...deadlines, deadline];
      setDeadlines(updated);
      saveStoredDeadlines(updated);
      showToast(`Added deadline "${deadline.title}".`, 'success');
    },
    [deadlines, showToast]
  );

  // Toggle deadline completion
  const toggleDeadlineCompleted = useCallback(
    (id: string) => {
      const updated = deadlines.map((d) => (d.id === id ? { ...d, completed: !d.completed } : d));
      setDeadlines(updated);
      saveStoredDeadlines(updated);
      const dl = updated.find((d) => d.id === id);
      showToast(
        dl?.completed
          ? `Marked "${dl.title}" as completed!`
          : `Reopened "${dl?.title}".`,
        'success'
      );
    },
    [deadlines, showToast]
  );

  // Delete deadline
  const deleteDeadline = useCallback(
    (id: string) => {
      const updated = deadlines.filter((d) => d.id !== id);
      setDeadlines(updated);
      saveStoredDeadlines(updated);
      if (selectedDeadlineId === id) {
        setSelectedDeadlineId(null);
      }
      showToast('Deadline removed.', 'info');
    },
    [deadlines, selectedDeadlineId, showToast]
  );

  // Reset to demo defaults
  const resetDemoData = useCallback(() => {
    const res = resetAllStorage();
    setEvents(res.events);
    setDeadlines(res.deadlines);
    setConfig(res.config);
    setAnalysisTimeState(res.analysisTime);
    setAppliedRecIds([]);
    setCurrentWeekStart(getStartOfWeek(parseISODate(res.analysisTime)));
    setSelectedDeadlineId(null);
    showToast('Reset complete: original demo dataset and schedule restored.', 'info');
  }, [showToast]);

  // Update Config
  const updateConfig = useCallback((newConfig: WorkingHoursConfig) => {
    setConfig(newConfig);
    saveStoredConfig(newConfig);
    showToast('Working hours and overload settings updated.', 'success');
  }, [showToast]);

  // Set Analysis Time
  const setAnalysisTime = useCallback((timeStr: string) => {
    setAnalysisTimeState(timeStr);
    saveStoredAnalysisTime(timeStr);
    showToast(`Simulated reference clock set to ${timeStr}.`, 'info');
  }, [showToast]);

  // Auto-hide toast after 4s
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  return (
    <CalendarGuardContext.Provider
      value={{
        events,
        deadlines,
        config,
        analysisTime,
        currentWeekStart,
        activeTab,
        selectedDeadlineId,
        riskResults,
        conflicts,
        dailyWorkloads,
        recommendations,
        toast,
        lastAnalyzedAt,
        setActiveTab,
        setSelectedDeadlineId,
        nextWeek,
        prevWeek,
        resetToCurrentWeek,
        analyzeSchedule,
        applyRec,
        addEvent,
        deleteEvent,
        addDeadline,
        toggleDeadlineCompleted,
        deleteDeadline,
        resetDemoData,
        updateConfig,
        setAnalysisTime,
        dismissToast,
      }}
    >
      {children}
    </CalendarGuardContext.Provider>
  );
};

export const useCalendarGuard = () => {
  const context = useContext(CalendarGuardContext);
  if (!context) {
    throw new Error('useCalendarGuard must be used within a CalendarGuardProvider');
  }
  return context;
};
