import React from 'react';
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  ChevronRight,
  Flame,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import { Deadline, RiskAnalysisResult } from '../types';
import { formatDisplayDate, formatTimeHHMM } from '../engine/dateUtils';

interface DeadlineCardProps {
  deadline: Deadline;
  risk: RiskAnalysisResult;
  onSelect: (id: string) => void;
  onToggleComplete: (id: string) => void;
}

export const DeadlineCard: React.FC<DeadlineCardProps> = ({
  deadline,
  risk,
  onSelect,
  onToggleComplete,
}) => {
  const isCompleted = deadline.completed;

  // Badge styles
  let badgeColor = 'bg-slate-100 text-slate-700 border-slate-200';
  let badgeText = 'Low Risk';
  let progressColor = 'bg-emerald-500';

  if (isCompleted) {
    badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    badgeText = 'Completed';
    progressColor = 'bg-emerald-500';
  } else if (risk.isOverdue) {
    badgeColor = 'bg-rose-100 text-rose-800 border-rose-300';
    badgeText = 'Overdue';
    progressColor = 'bg-rose-600';
  } else if (risk.level === 'high') {
    badgeColor = 'bg-rose-100 text-rose-800 border-rose-200';
    badgeText = 'High Risk';
    progressColor = 'bg-rose-500';
  } else if (risk.level === 'medium') {
    badgeColor = 'bg-amber-100 text-amber-800 border-amber-200';
    badgeText = 'Medium Risk';
    progressColor = 'bg-amber-500';
  } else {
    badgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-200';
    badgeText = 'Low Risk';
    progressColor = 'bg-emerald-500';
  }

  return (
    <div
      data-testid={`deadline-card-${deadline.id}`}
      onClick={() => onSelect(deadline.id)}
      className={`group relative cursor-pointer rounded-2xl border p-5 shadow-xs transition-all hover:shadow-md ${
        isCompleted
          ? 'border-slate-200 bg-slate-50/50 opacity-75'
          : risk.level === 'high'
          ? 'border-rose-200 bg-white hover:border-rose-300'
          : 'border-slate-200 bg-white hover:border-indigo-200'
      }`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        {/* Left: Checkbox + Title + Category */}
        <div className="flex items-start gap-3">
          <button
            type="button"
            data-testid={`toggle-complete-${deadline.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleComplete(deadline.id);
            }}
            className="mt-0.5 rounded-lg text-slate-400 hover:text-emerald-600 transition-colors"
            title={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
            aria-label={`Toggle complete for ${deadline.title}`}
          >
            <CheckCircle2
              className={`h-5 w-5 ${isCompleted ? 'fill-emerald-500 text-white' : ''}`}
            />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h3
                className={`text-base font-bold tracking-tight ${
                  isCompleted ? 'text-slate-500 line-through' : 'text-slate-900'
                }`}
              >
                {deadline.title}
              </h3>
              {deadline.category && (
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                  {deadline.category}
                </span>
              )}
            </div>

            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                <span>Due: {formatDisplayDate(deadline.dueDate)} at {formatTimeHHMM(deadline.dueDate)}</span>
              </span>
              <span>&bull;</span>
              <span>Effort: <strong className="font-semibold text-slate-700">{deadline.estimatedEffortHours}h</strong></span>
              <span>&bull;</span>
              <span>Available Prep: <strong className="font-semibold text-slate-700">{risk.availablePrepHours}h</strong></span>
            </div>
          </div>
        </div>

        {/* Right: Risk Badge & Score */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <div className="flex flex-col items-end">
            <span
              data-testid={`risk-badge-${deadline.id}`}
              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-bold ${badgeColor}`}
            >
              {risk.level === 'high' && <Flame className="h-3 w-3 text-rose-600" />}
              {badgeText}
            </span>
            <span className="mt-1 text-[11px] font-semibold text-slate-500">
              Score: <strong className="text-slate-800">{risk.score}</strong>/100
            </span>
          </div>
          <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>

      {/* Risk Score Progress Bar */}
      <div className="mt-4">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full transition-all duration-500 ${progressColor}`}
            style={{ width: `${Math.min(100, Math.max(5, risk.score))}%` }}
          />
        </div>
      </div>

      {/* Main Risk Explanation */}
      <div className="mt-3 flex items-start gap-2 rounded-xl bg-slate-50 p-2.5 text-xs text-slate-600">
        <span className="mt-0.5 shrink-0 text-slate-400">&bull;</span>
        <span className="line-clamp-2">
          {risk.riskFactors[0] || risk.summary}
        </span>
      </div>
    </div>
  );
};
