import React from 'react';
import {
  Clock,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Trash2,
  User,
  MapPin,
  Calendar as CalendarIcon,
  Sparkles,
} from 'lucide-react';
import { useCalendarGuard } from '../context/CalendarGuardContext';
import {
  getWeekDates,
  formatDateToYYYYMMDD,
  formatTimeHHMM,
  getDayName,
  isSameDay,
  parseISODate,
} from '../engine/dateUtils';
import { CalendarEvent, Deadline } from '../types';

export const WeeklyCalendar: React.FC = () => {
  const {
    events,
    deadlines,
    currentWeekStart,
    dailyWorkloads,
    conflicts,
    deleteEvent,
    setSelectedDeadlineId,
    analysisTime,
  } = useCalendarGuard();

  const weekDates = getWeekDates(currentWeekStart);
  const simulatedToday = parseISODate(analysisTime);

  // Group events by day string "YYYY-MM-DD"
  const eventsByDay = React.useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const evt of events) {
      const dateKey = formatDateToYYYYMMDD(parseISODate(evt.startTime));
      const arr = map.get(dateKey) || [];
      arr.push(evt);
      map.set(dateKey, arr);
    }
    // Sort each day's events by start time
    map.forEach((arr) => {
      arr.sort((a, b) => parseISODate(a.startTime).getTime() - parseISODate(b.startTime).getTime());
    });
    return map;
  }, [events]);

  // Group deadlines by day string "YYYY-MM-DD"
  const deadlinesByDay = React.useMemo(() => {
    const map = new Map<string, Deadline[]>();
    for (const dl of deadlines) {
      const dateKey = formatDateToYYYYMMDD(parseISODate(dl.dueDate));
      const arr = map.get(dateKey) || [];
      arr.push(dl);
      map.set(dateKey, arr);
    }
    return map;
  }, [deadlines]);

  // Set of conflicting event IDs
  const conflictingEventIds = React.useMemo(() => {
    const set = new Set<string>();
    for (const c of conflicts) {
      set.add(c.eventA.id);
      set.add(c.eventB.id);
    }
    return set;
  }, [conflicts]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-xs">
      {/* Calendar Header with Legend */}
      <div className="flex flex-col gap-3 border-b border-slate-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-indigo-600" />
          <h2 className="text-base font-bold text-slate-900">Weekly Schedule &amp; Commitments</h2>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-500"></span>
            <span>Meeting (Fixed)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-indigo-500"></span>
            <span>Focus / Flexible</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500"></span>
            <span>Deadline Due</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500"></span>
            <span>Collision / Conflict</span>
          </span>
        </div>
      </div>

      {/* 7-Day Grid */}
      <div className="grid grid-cols-1 divide-y divide-slate-200 lg:grid-cols-7 lg:divide-y-0 lg:divide-x">
        {weekDates.map((dayDate) => {
          const dayKey = formatDateToYYYYMMDD(dayDate);
          const dayEvents = eventsByDay.get(dayKey) || [];
          const dayDeadlines = deadlinesByDay.get(dayKey) || [];
          const workload = dailyWorkloads.get(dayKey);
          const isToday = isSameDay(dayDate, simulatedToday);
          const isOverloaded = !!workload?.isOverloaded;

          return (
            <div
              key={dayKey}
              data-testid={`calendar-day-${dayKey}`}
              className={`flex flex-col min-h-[380px] transition-colors ${
                isOverloaded
                  ? 'bg-amber-50/20'
                  : isToday
                  ? 'bg-indigo-50/30'
                  : 'bg-white'
              }`}
            >
              {/* Day Header */}
              <div
                className={`border-b p-3 transition-colors ${
                  isOverloaded
                    ? 'border-amber-200 bg-amber-50/50'
                    : isToday
                    ? 'border-indigo-200 bg-indigo-50/60'
                    : 'border-slate-100 bg-slate-50/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase text-slate-500">
                    {getDayName(dayDate, true)}
                  </span>
                  {isToday && (
                    <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-[10px] font-bold text-white">
                      TODAY
                    </span>
                  )}
                </div>
                <div className="mt-1 flex items-baseline justify-between">
                  <span
                    className={`text-xl font-extrabold ${
                      isToday ? 'text-indigo-600' : 'text-slate-900'
                    }`}
                  >
                    {dayDate.getDate()}
                  </span>
                  <span className="text-[11px] font-medium text-slate-500">
                    {workload ? `${workload.committedHours}h busy` : '0h busy'}
                  </span>
                </div>

                {/* Overloaded Alert Pill */}
                {isOverloaded && (
                  <div
                    data-testid="overload-badge"
                    className="mt-2 flex items-center gap-1 rounded-md bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800"
                  >
                    <Flame className="h-3 w-3 text-amber-600" />
                    <span>OVERLOADED (&gt;5h)</span>
                  </div>
                )}
              </div>

              {/* Day Body: Deadlines & Events */}
              <div className="flex-1 space-y-2 p-2.5">
                {/* Deadlines Due on this Day */}
                {dayDeadlines.map((dl) => (
                  <div
                    key={dl.id}
                    onClick={() => setSelectedDeadlineId(dl.id)}
                    className={`cursor-pointer rounded-xl border p-2.5 text-xs shadow-xs transition-all hover:shadow-sm ${
                      dl.completed
                        ? 'border-slate-200 bg-slate-50 text-slate-500 line-through'
                        : 'border-rose-200 bg-rose-50/70 text-rose-900 hover:border-rose-300'
                    }`}
                  >
                    <div className="flex items-center justify-between font-semibold">
                      <span className="flex items-center gap-1 truncate">
                        <AlertTriangle className="h-3 w-3 shrink-0 text-rose-600" />
                        <span className="truncate">{dl.title}</span>
                      </span>
                      <span className="shrink-0 text-[10px] text-rose-700">
                        {formatTimeHHMM(dl.dueDate)}
                      </span>
                    </div>
                    <div className="mt-1 text-[11px] text-rose-700">
                      Est. Effort: {dl.estimatedEffortHours}h
                    </div>
                  </div>
                ))}

                {/* Scheduled Events */}
                {dayEvents.map((evt) => {
                  const hasConflict = conflictingEventIds.has(evt.id);
                  const isFlexible = evt.flexibility === 'flexible';
                  const isFocus = evt.type === 'focus';

                  let cardBg = 'border-slate-200 bg-slate-50/70 text-slate-800';
                  if (hasConflict) {
                    cardBg = 'border-amber-300 bg-amber-50/90 text-amber-950 ring-1 ring-amber-300';
                  } else if (isFocus) {
                    cardBg = 'border-indigo-200 bg-indigo-50/70 text-indigo-900';
                  } else if (isFlexible) {
                    cardBg = 'border-sky-200 bg-sky-50/70 text-sky-900';
                  } else {
                    cardBg = 'border-blue-200 bg-blue-50/70 text-blue-950';
                  }

                  return (
                    <div
                      key={evt.id}
                      data-testid={`event-card-${evt.id}`}
                      className={`group relative rounded-xl border p-2.5 text-xs transition-all hover:shadow-xs ${cardBg}`}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <span className="font-semibold leading-tight line-clamp-2">
                          {evt.title}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteEvent(evt.id);
                          }}
                          className="opacity-0 transition-opacity group-hover:opacity-100 text-slate-400 hover:text-rose-600"
                          title="Remove event"
                          aria-label={`Remove event ${evt.title}`}
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>

                      <div className="mt-1.5 flex items-center justify-between text-[11px] opacity-80">
                        <span>
                          {formatTimeHHMM(evt.startTime)} – {formatTimeHHMM(evt.endTime)}
                        </span>
                        <span
                          className={`rounded px-1 py-0.2 text-[9px] font-semibold uppercase ${
                            isFlexible
                              ? 'bg-indigo-100/70 text-indigo-700'
                              : 'bg-slate-200/80 text-slate-700'
                          }`}
                        >
                          {isFlexible ? 'Flex' : 'Fixed'}
                        </span>
                      </div>

                      {hasConflict && (
                        <div className="mt-1.5 flex items-center gap-1 font-bold text-[10px] text-amber-700">
                          <AlertTriangle className="h-3 w-3 shrink-0" />
                          <span>COLLISION DETECTED</span>
                        </div>
                      )}
                    </div>
                  );
                })}

                {dayEvents.length === 0 && dayDeadlines.length === 0 && (
                  <div className="flex h-28 items-center justify-center text-center text-xs text-slate-400">
                    No scheduled commitments
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
