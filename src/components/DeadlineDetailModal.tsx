import React from 'react';
import {
  X,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight,
  Flame,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';
import { useCalendarGuard } from '../context/CalendarGuardContext';
import { formatDisplayDate, formatTimeHHMM } from '../engine/dateUtils';

export const DeadlineDetailModal: React.FC = () => {
  const {
    selectedDeadlineId,
    setSelectedDeadlineId,
    deadlines,
    riskResults,
    recommendations,
    applyRec,
    toggleDeadlineCompleted,
    deleteDeadline,
  } = useCalendarGuard();

  if (!selectedDeadlineId) return null;

  const deadline = deadlines.find((d) => d.id === selectedDeadlineId);
  const risk = riskResults.find((r) => r.deadlineId === selectedDeadlineId);

  if (!deadline || !risk) return null;

  // Filter recommendations specifically targeting this deadline
  const relevantRecs = recommendations.filter(
    (r) => r.affectedDeadlineId === deadline.id
  );

  const isCompleted = deadline.completed;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={() => setSelectedDeadlineId(null)}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="deadline-detail-title"
        data-testid="deadline-detail-panel"
        className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase ${
                  isCompleted
                    ? 'bg-emerald-100 text-emerald-800'
                    : risk.level === 'high'
                    ? 'bg-rose-100 text-rose-800'
                    : risk.level === 'medium'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {isCompleted ? 'Completed' : `${risk.level.toUpperCase()} RISK`}
              </span>
              {deadline.category && (
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-600 font-medium">
                  {deadline.category}
                </span>
              )}
            </div>
            <h2
              id="deadline-detail-title"
              className="mt-2 text-xl font-bold tracking-tight text-slate-900"
            >
              {deadline.title}
            </h2>
          </div>
          <button
            onClick={() => setSelectedDeadlineId(null)}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Core Attributes */}
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-2xl bg-slate-50 p-3">
            <span className="text-[11px] font-semibold uppercase text-slate-500">Due Date</span>
            <div className="mt-1 font-bold text-slate-800 text-xs sm:text-sm">
              {formatDisplayDate(deadline.dueDate)}
            </div>
            <div className="text-[10px] text-slate-500">{formatTimeHHMM(deadline.dueDate)}</div>
          </div>

          <div className="rounded-2xl bg-slate-50 p-3">
            <span className="text-[11px] font-semibold uppercase text-slate-500">Est. Effort</span>
            <div className="mt-1 font-bold text-slate-800 text-xs sm:text-sm">
              {deadline.estimatedEffortHours} Hours
            </div>
            <div className="text-[10px] text-slate-500">Required focus</div>
          </div>

          <div className="rounded-2xl bg-slate-50 p-3">
            <span className="text-[11px] font-semibold uppercase text-slate-500">Available Prep</span>
            <div className="mt-1 font-bold text-slate-800 text-xs sm:text-sm">
              {risk.availablePrepHours} Hours
            </div>
            <div className="text-[10px] text-slate-500">Before deadline</div>
          </div>

          <div
            className={`rounded-2xl p-3 ${
              risk.level === 'high' && !isCompleted
                ? 'bg-rose-50 text-rose-900'
                : 'bg-indigo-50 text-indigo-900'
            }`}
          >
            <span className="text-[11px] font-semibold uppercase opacity-75">Risk Score</span>
            <div className="mt-1 font-extrabold text-xs sm:text-sm">
              {risk.score} / 100
            </div>
            <div className="text-[10px] opacity-75">{risk.level.toUpperCase()} severity</div>
          </div>
        </div>

        {/* Risk Calculation Breakdown */}
        <div className="mt-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Explainable Risk Factors
          </h3>
          <div className="mt-2.5 space-y-2">
            {risk.riskFactors.map((factor, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 rounded-xl border border-slate-100 bg-slate-50/80 p-3 text-xs text-slate-700"
              >
                <AlertTriangle
                  className={`mt-0.5 h-4 w-4 shrink-0 ${
                    risk.level === 'high' ? 'text-rose-500' : 'text-amber-500'
                  }`}
                />
                <span className="leading-relaxed">{factor}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Rescheduling Recommendations */}
        {relevantRecs.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Tailored Rescheduling Actions
              </h3>
            </div>
            <div className="mt-2.5 space-y-2">
              {relevantRecs.map((rec) => (
                <div
                  key={rec.id}
                  className="flex flex-col gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/40 p-3.5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <h4 className="text-xs font-bold text-indigo-950">{rec.title}</h4>
                    <p className="mt-1 text-xs text-indigo-900/80 leading-relaxed">
                      {rec.description}
                    </p>
                    <div className="mt-1.5 text-[11px] font-medium text-emerald-700">
                      Benefit: {rec.benefit}
                    </div>
                  </div>

                  <button
                    onClick={() => applyRec(rec.id)}
                    disabled={rec.applied}
                    className={`shrink-0 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
                      rec.applied
                        ? 'bg-emerald-100 text-emerald-800 cursor-default'
                        : 'bg-indigo-600 text-white shadow-xs hover:bg-indigo-700'
                    }`}
                  >
                    {rec.applied ? 'Applied ✓' : 'Apply Change'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <button
            onClick={() => {
              toggleDeadlineCompleted(deadline.id);
            }}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-colors ${
              isCompleted
                ? 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }`}
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>{isCompleted ? 'Mark as Incomplete' : 'Mark as Completed'}</span>
          </button>

          <button
            onClick={() => {
              deleteDeadline(deadline.id);
            }}
            className="rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
          >
            Delete Deadline
          </button>
        </div>
      </div>
    </div>
  );
};
