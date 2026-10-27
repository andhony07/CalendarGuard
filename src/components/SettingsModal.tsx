import React, { useState } from 'react';
import { Settings, Clock, Flame, Calendar, Save } from 'lucide-react';
import { useCalendarGuard } from '../context/CalendarGuardContext';

export const SettingsModal: React.FC = () => {
  const { config, updateConfig, analysisTime, setAnalysisTime } = useCalendarGuard();

  const [startHour, setStartHour] = useState(config.startHour);
  const [endHour, setEndHour] = useState(config.endHour);
  const [maxHours, setMaxHours] = useState(config.maxDailyCommitmentHours);
  const [clockTime, setClockTime] = useState(analysisTime);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateConfig({
      ...config,
      startHour: Number(startHour),
      endHour: Number(endHour),
      maxDailyCommitmentHours: Number(maxHours),
    });
    setAnalysisTime(clockTime);
  };

  return (
    <div className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
        <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600">
          <Settings className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Workload &amp; Capacity Configuration
          </h2>
          <p className="text-xs text-slate-500">
            Customize the deterministic parameters governing focus capacity and deadline risk scoring.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="mt-6 space-y-6">
        {/* Working Hours */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Daily Working Window
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Workday Start Hour (0–23)
              </label>
              <input
                type="number"
                min="0"
                max="23"
                value={startHour}
                onChange={(e) => setStartHour(parseInt(e.target.value) || 0)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 outline-hidden"
              />
              <span className="text-[11px] text-slate-400">Default: 9 (9:00 AM)</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Workday End Hour (0–23)
              </label>
              <input
                type="number"
                min="0"
                max="23"
                value={endHour}
                onChange={(e) => setEndHour(parseInt(e.target.value) || 0)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 outline-hidden"
              />
              <span className="text-[11px] text-slate-400">Default: 17 (5:00 PM)</span>
            </div>
          </div>
        </div>

        {/* Daily Overload Threshold */}
        <div className="space-y-2 border-t border-slate-100 pt-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Daily Overload Commitment Threshold
              </h3>
              <p className="text-xs text-slate-500">
                Days with scheduled commitments exceeding this limit are flagged as overloaded.
              </p>
            </div>
            <span className="rounded-lg bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800">
              {maxHours} Hours / Day
            </span>
          </div>
          <input
            type="range"
            min="3.0"
            max="8.0"
            step="0.5"
            value={maxHours}
            onChange={(e) => setMaxHours(parseFloat(e.target.value))}
            className="w-full accent-indigo-600"
          />
        </div>

        {/* Deterministic Simulation Clock */}
        <div className="space-y-2 border-t border-slate-100 pt-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Simulated Analysis Clock
          </h3>
          <p className="text-xs text-slate-500">
            Fixed reference timestamp used for deterministic testing and reproducible demonstration.
          </p>
          <input
            type="text"
            value={clockTime}
            onChange={(e) => setClockTime(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-mono focus:border-indigo-500 outline-hidden"
          />
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-100">
          <button
            type="submit"
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 transition-all"
          >
            <Save className="h-4 w-4" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
};
