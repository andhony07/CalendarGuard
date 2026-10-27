import React from 'react';
import {
  AlertTriangle,
  Clock,
  Layers,
  CalendarCheck,
  Flame,
  AlertCircle,
  ArrowUpRight,
} from 'lucide-react';
import { useCalendarGuard } from '../context/CalendarGuardContext';

export const MetricsOverview: React.FC = () => {
  const { deadlines, riskResults, dailyWorkloads, conflicts, setActiveTab } = useCalendarGuard();

  const totalDeadlines = deadlines.length;
  const activeDeadlines = deadlines.filter((d) => !d.completed).length;
  const completedDeadlines = deadlines.filter((d) => d.completed).length;

  const highRiskCount = riskResults.filter((r) => r.level === 'high' && !r.isCompleted).length;
  const mediumRiskCount = riskResults.filter((r) => r.level === 'medium' && !r.isCompleted).length;

  // Overloaded days count
  let overloadedDaysCount = 0;
  dailyWorkloads.forEach((w) => {
    if (w.isOverloaded) overloadedDaysCount++;
  });

  const conflictsCount = conflicts.length;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Metric 1: Upcoming Deadlines */}
      <div
        onClick={() => setActiveTab('deadlines')}
        className="group relative cursor-pointer overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:border-indigo-200 hover:shadow-md"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
            Active Deadlines
          </span>
          <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600 transition-colors group-hover:bg-indigo-600 group-hover:text-white">
            <CalendarCheck className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold tracking-tight text-slate-900" data-testid="metric-active-deadlines">
            {activeDeadlines}
          </span>
          <span className="text-xs text-slate-500">
            of {totalDeadlines} total ({completedDeadlines} done)
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
          <span>{mediumRiskCount} moderate risk</span>
          <span className="flex items-center font-medium text-indigo-600 group-hover:underline">
            View risks <ArrowUpRight className="h-3 w-3" />
          </span>
        </div>
      </div>

      {/* Metric 2: High-Risk Deadlines */}
      <div
        onClick={() => setActiveTab('deadlines')}
        className={`group relative cursor-pointer overflow-hidden rounded-2xl border p-5 shadow-xs transition-all hover:shadow-md ${
          highRiskCount > 0
            ? 'border-rose-200 bg-rose-50/40 hover:border-rose-300'
            : 'border-slate-200/80 bg-white hover:border-slate-300'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold tracking-wide text-rose-700 uppercase">
            High-Risk Deliverables
          </span>
          <div
            className={`rounded-xl p-2 transition-colors ${
              highRiskCount > 0
                ? 'bg-rose-100 text-rose-600 group-hover:bg-rose-600 group-hover:text-white'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            <Flame className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold tracking-tight text-rose-700" data-testid="metric-high-risk">
            {highRiskCount}
          </span>
          <span className="text-xs font-medium text-rose-600">
            {highRiskCount > 0 ? 'Requires schedule relief' : 'All within capacity'}
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-rose-100/60 pt-3 text-xs text-rose-700">
          <span>Formula: effort &gt; free prep hours</span>
          <span className="flex items-center font-medium group-hover:underline">
            Inspect <ArrowUpRight className="h-3 w-3" />
          </span>
        </div>
      </div>

      {/* Metric 3: Overloaded Days */}
      <div
        onClick={() => setActiveTab('calendar')}
        className={`group relative cursor-pointer overflow-hidden rounded-2xl border p-5 shadow-xs transition-all hover:shadow-md ${
          overloadedDaysCount > 0
            ? 'border-amber-200 bg-amber-50/40 hover:border-amber-300'
            : 'border-slate-200/80 bg-white hover:border-slate-300'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold tracking-wide text-amber-800 uppercase">
            Overloaded Days
          </span>
          <div
            className={`rounded-xl p-2 transition-colors ${
              overloadedDaysCount > 0
                ? 'bg-amber-100 text-amber-700 group-hover:bg-amber-600 group-hover:text-white'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            <Clock className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold tracking-tight text-amber-900" data-testid="metric-overloaded-days">
            {overloadedDaysCount}
          </span>
          <span className="text-xs font-medium text-amber-700">
            {overloadedDaysCount > 0 ? 'Exceeds >5h meetings' : 'Workload balanced'}
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-amber-100/60 pt-3 text-xs text-amber-800">
          <span>Threshold: 5.0h focus limit</span>
          <span className="flex items-center font-medium group-hover:underline">
            Calendar view <ArrowUpRight className="h-3 w-3" />
          </span>
        </div>
      </div>

      {/* Metric 4: Scheduling Conflicts */}
      <div
        onClick={() => setActiveTab('calendar')}
        className={`group relative cursor-pointer overflow-hidden rounded-2xl border p-5 shadow-xs transition-all hover:shadow-md ${
          conflictsCount > 0
            ? 'border-violet-200 bg-violet-50/40 hover:border-violet-300'
            : 'border-slate-200/80 bg-white hover:border-slate-300'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold tracking-wide text-violet-800 uppercase">
            Schedule Collisions
          </span>
          <div
            className={`rounded-xl p-2 transition-colors ${
              conflictsCount > 0
                ? 'bg-violet-100 text-violet-700 group-hover:bg-violet-600 group-hover:text-white'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            <AlertCircle className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold tracking-tight text-violet-900" data-testid="metric-conflicts">
            {conflictsCount}
          </span>
          <span className="text-xs font-medium text-violet-700">
            {conflictsCount > 0 ? 'Overlapping commitments' : 'No collisions detected'}
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-violet-100/60 pt-3 text-xs text-violet-800">
          <span>{conflictsCount > 0 ? 'Reschedule flexible' : '0 overlaps'}</span>
          <span className="flex items-center font-medium group-hover:underline">
            Resolve <ArrowUpRight className="h-3 w-3" />
          </span>
        </div>
      </div>
    </div>
  );
};
