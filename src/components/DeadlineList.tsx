import React, { useState } from 'react';
import { AlertTriangle, Plus, Filter, CheckCircle2 } from 'lucide-react';
import { useCalendarGuard } from '../context/CalendarGuardContext';
import { DeadlineCard } from './DeadlineCard';

interface DeadlineListProps {
  onOpenAddDeadline: () => void;
}

export const DeadlineList: React.FC<DeadlineListProps> = ({ onOpenAddDeadline }) => {
  const {
    deadlines,
    riskResults,
    setSelectedDeadlineId,
    toggleDeadlineCompleted,
  } = useCalendarGuard();

  const [filter, setFilter] = useState<'all' | 'high' | 'active' | 'completed'>('all');

  const riskMap = React.useMemo(() => {
    const map = new Map();
    for (const r of riskResults) {
      map.set(r.deadlineId, r);
    }
    return map;
  }, [riskResults]);

  const filteredDeadlines = deadlines.filter((dl) => {
    const risk = riskMap.get(dl.id);
    if (filter === 'completed') return dl.completed;
    if (filter === 'active') return !dl.completed;
    if (filter === 'high') return !dl.completed && risk?.level === 'high';
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Control bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-indigo-600" />
          <h2 className="text-base font-bold text-slate-900">Deadline Risk Assessments</h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Filters */}
          <div className="flex rounded-xl border border-slate-200 bg-white p-1 text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`rounded-lg px-3 py-1 font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({deadlines.length})
            </button>
            <button
              onClick={() => setFilter('high')}
              className={`rounded-lg px-3 py-1 font-medium transition-colors ${
                filter === 'high'
                  ? 'bg-rose-50 text-rose-700'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              High Risk
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`rounded-lg px-3 py-1 font-medium transition-colors ${
                filter === 'active'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`rounded-lg px-3 py-1 font-medium transition-colors ${
                filter === 'completed'
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Done
            </button>
          </div>

          <button
            onClick={onOpenAddDeadline}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Deadline</span>
          </button>
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {filteredDeadlines.map((dl) => {
          const risk = riskMap.get(dl.id);
          if (!risk) return null;
          return (
            <DeadlineCard
              key={dl.id}
              deadline={dl}
              risk={risk}
              onSelect={setSelectedDeadlineId}
              onToggleComplete={toggleDeadlineCompleted}
            />
          );
        })}

        {filteredDeadlines.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center">
            <CheckCircle2 className="mx-auto h-8 w-8 text-slate-300" />
            <h3 className="mt-2 text-sm font-semibold text-slate-700">No deadlines in this view</h3>
            <p className="mt-1 text-xs text-slate-500">
              Try switching your filter or add a new deadline to analyze its schedule capacity.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
