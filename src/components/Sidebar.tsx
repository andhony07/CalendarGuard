import React, { useState } from 'react';
import {
  Shield,
  LayoutDashboard,
  Calendar as CalendarIcon,
  AlertTriangle,
  Sparkles,
  RotateCcw,
  Settings,
  X,
  Clock,
} from 'lucide-react';
import { useCalendarGuard } from '../context/CalendarGuardContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const {
    activeTab,
    setActiveTab,
    resetDemoData,
    config,
    riskResults,
    conflicts,
    recommendations,
  } = useCalendarGuard();

  const [confirmReset, setConfirmReset] = useState(false);

  const highRiskCount = riskResults.filter((r) => r.level === 'high' && !r.isCompleted).length;
  const pendingRecsCount = recommendations.filter((r) => !r.applied).length;

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'calendar',
      label: 'Weekly Calendar',
      icon: CalendarIcon,
      badge: conflicts.length > 0 ? `${conflicts.length} conflict` : null,
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    {
      id: 'deadlines',
      label: 'Deadline Risks',
      icon: AlertTriangle,
      badge: highRiskCount > 0 ? `${highRiskCount} high` : null,
      badgeColor: 'bg-rose-100 text-rose-800',
    },
    {
      id: 'recommendations',
      label: 'Recommendations',
      icon: Sparkles,
      badge: pendingRecsCount > 0 ? `${pendingRecsCount} new` : null,
      badgeColor: 'bg-indigo-100 text-indigo-800',
    },
    {
      id: 'settings',
      label: 'Working Hours',
      icon: Settings,
      badge: null,
    },
  ] as const;

  const handleTabClick = (tab: typeof activeTab) => {
    setActiveTab(tab);
    onClose();
  };

  const handleResetClick = () => {
    if (confirmReset) {
      resetDemoData();
      setConfirmReset(false);
    } else {
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 5000);
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Sidebar Navigation"
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-100 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-100">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold tracking-tight text-slate-900">CalendarGuard</span>
                <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-700">
                  PROTOTYPE
                </span>
              </div>
              <p className="text-xs text-slate-600">Deadline Risk Predictor</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-600">
            Workspace Views
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-4 w-4 ${isActive ? 'text-indigo-600' : 'text-slate-600'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${item.badgeColor || 'bg-slate-100 text-slate-600'}`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Working hours banner */}
          <div className="mt-8 rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <Clock className="h-3.5 w-3.5 text-indigo-500" />
              <span>Working Hours Profile</span>
            </div>
            <p className="mt-1 text-xs text-slate-600">
              {config.startHour}:00 AM – {config.endHour > 12 ? config.endHour - 12 : config.endHour}:00 PM
            </p>
            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-600">
              <span>Overload threshold:</span>
              <span className="font-semibold text-slate-700">&gt;{config.maxDailyCommitmentHours}h/day</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-slate-100 p-4">
          <button
            onClick={handleResetClick}
            className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-medium transition-all ${
              confirmReset
                ? 'bg-rose-600 text-white shadow-md shadow-rose-200'
                : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <RotateCcw className={`h-3.5 w-3.5 ${confirmReset ? 'animate-spin' : ''}`} />
            <span>{confirmReset ? 'Click to Confirm Reset' : 'Restore Demo Data'}</span>
          </button>
          <p className="mt-2 text-center text-[11px] text-slate-600">
            Local browser storage &bull; Deterministic engine
          </p>
        </div>
      </aside>
    </>
  );
};
