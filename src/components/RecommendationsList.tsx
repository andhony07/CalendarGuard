import React from 'react';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCcw,
  Zap,
} from 'lucide-react';
import { useCalendarGuard } from '../context/CalendarGuardContext';

export const RecommendationsList: React.FC = () => {
  const { recommendations, applyRec, deadlinessMap, deadlines } = useCalendarGuard() as any;

  const appliedCount = recommendations.filter((r: any) => r.applied).length;
  const pendingCount = recommendations.filter((r: any) => !r.applied).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">
              Workload &amp; Schedule Recommendations
            </h2>
          </div>
          <p className="mt-0.5 text-xs text-slate-500">
            Deterministic rescheduling suggestions prioritizing risk reduction and calendar capacity.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
            {pendingCount} Pending Action{pendingCount === 1 ? '' : 's'}
          </span>
          {appliedCount > 0 && (
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              {appliedCount} Applied
            </span>
          )}
        </div>
      </div>

      {/* Cards List */}
      <div className="space-y-3.5">
        {recommendations.map((rec: any) => {
          return (
            <div
              key={rec.id}
              data-testid={`rec-card-${rec.id}`}
              className={`rounded-2xl border p-5 shadow-xs transition-all ${
                rec.applied
                  ? 'border-emerald-200 bg-emerald-50/20'
                  : 'border-slate-200 bg-white hover:border-indigo-200 hover:shadow-md'
              }`}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        rec.type === 'resolve_conflict'
                          ? 'bg-amber-100 text-amber-800'
                          : rec.type === 'move_flexible_event'
                          ? 'bg-sky-100 text-sky-800'
                          : 'bg-indigo-100 text-indigo-800'
                      }`}
                    >
                      <Zap className="h-3 w-3" />
                      {rec.type.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs font-semibold text-emerald-700">
                      -{rec.riskReductionScore} Risk Points
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">{rec.title}</h3>
                  <p className="text-xs leading-relaxed text-slate-600 sm:max-w-2xl">
                    {rec.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-xs text-slate-500">
                    <span className="flex items-center gap-1 text-emerald-700 font-medium">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Benefit: {rec.benefit}</span>
                    </span>
                  </div>
                </div>

                {/* Action button */}
                <div className="shrink-0 self-end sm:self-center">
                  <button
                    data-testid={`apply-rec-btn-${rec.id}`}
                    onClick={() => applyRec(rec.id)}
                    disabled={rec.applied}
                    className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
                      rec.applied
                        ? 'border border-emerald-200 bg-emerald-100 text-emerald-800 cursor-default'
                        : 'bg-indigo-600 text-white shadow-xs hover:bg-indigo-700 active:scale-98'
                    }`}
                  >
                    {rec.applied ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-emerald-700" />
                        <span>Applied ✓</span>
                      </>
                    ) : (
                      <>
                        <span>Apply Recommendation</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {recommendations.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
            <CheckCircle2 className="mx-auto h-9 w-9 text-emerald-500" />
            <h3 className="mt-2 text-sm font-bold text-slate-800">
              Your schedule is well optimized!
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              No active overlaps or severe deadline deficits detected.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
