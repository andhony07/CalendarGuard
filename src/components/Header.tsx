import React, { useState } from 'react';
import {
  Menu,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Plus,
  RotateCcw,
  Sparkles,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { useCalendarGuard } from '../context/CalendarGuardContext';
import { getWeekDates, formatDisplayDate } from '../engine/dateUtils';

interface HeaderProps {
  onOpenMobileMenu: () => void;
  onOpenAddEvent: () => void;
  onOpenAddDeadline: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileMenu,
  onOpenAddEvent,
  onOpenAddDeadline,
}) => {
  const {
    currentWeekStart,
    nextWeek,
    prevWeek,
    resetToCurrentWeek,
    analyzeSchedule,
    resetDemoData,
    lastAnalyzedAt,
  } = useCalendarGuard();

  const [confirmReset, setConfirmReset] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const weekDates = getWeekDates(currentWeekStart);
  const weekStartLabel = formatDisplayDate(weekDates[0]);
  const weekEndLabel = formatDisplayDate(weekDates[6]);

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    analyzeSchedule();
    setTimeout(() => setIsAnalyzing(false), 600);
  };

  const handleReset = () => {
    if (confirmReset) {
      resetDemoData();
      setConfirmReset(false);
    } else {
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 4000);
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="flex flex-col gap-4 px-4 py-3 sm:px-6 md:flex-row md:items-center md:justify-between">
        {/* Left: Mobile trigger & Product Subtitle */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">CalendarGuard</h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                Active Engine
              </span>
            </div>
            <p className="hidden text-xs text-slate-500 sm:block">
              Workload-aware deadline risk prediction & rescheduling recommendations
            </p>
          </div>
        </div>

        {/* Center: Week Navigation Controls */}
        <div className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50/70 p-1 md:justify-center">
          <button
            onClick={prevWeek}
            className="rounded-lg p-1.5 text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-xs transition-colors"
            title="Previous Week"
            aria-label="Previous Week"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={resetToCurrentWeek}
            data-testid="header-week-label"
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-slate-800 hover:text-indigo-600 transition-colors"
            title="Jump to Reference Week"
          >
            <CalendarIcon className="h-3.5 w-3.5 text-indigo-500" />
            <span>{weekStartLabel} – {weekEndLabel}</span>
          </button>
          <button
            onClick={nextWeek}
            className="rounded-lg p-1.5 text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-xs transition-colors"
            title="Next Week"
            aria-label="Next Week"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Analyze Schedule button */}
          <button
            onClick={handleAnalyze}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-medium text-white shadow-xs hover:bg-indigo-700 active:scale-98 transition-all"
            title="Re-evaluate schedule capacity, conflicts, and deadline risk"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
            <span>Analyze Schedule</span>
          </button>

          {/* Add Deadline dropdown / button */}
          <button
            onClick={onOpenAddDeadline}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
          >
            <Plus className="h-3.5 w-3.5 text-indigo-500" />
            <span>+ Deadline</span>
          </button>

          {/* Add Event button */}
          <button
            onClick={onOpenAddEvent}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
          >
            <Plus className="h-3.5 w-3.5 text-indigo-500" />
            <span>+ Event</span>
          </button>

          {/* Reset Demo button */}
          <button
            onClick={handleReset}
            className={`flex items-center gap-1 rounded-xl px-2.5 py-2 text-xs font-medium transition-all ${
              confirmReset
                ? 'bg-rose-100 text-rose-700 ring-1 ring-rose-300'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
            }`}
            title="Reset to default synthetic scenario"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{confirmReset ? 'Confirm?' : 'Reset'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
