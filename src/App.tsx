import React, { useState } from 'react';
import { CalendarGuardProvider, useCalendarGuard } from './context/CalendarGuardContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { MetricsOverview } from './components/MetricsOverview';
import { WeeklyCalendar } from './components/WeeklyCalendar';
import { DeadlineList } from './components/DeadlineList';
import { DeadlineDetailModal } from './components/DeadlineDetailModal';
import { RecommendationsList } from './components/RecommendationsList';
import { AddEventModal } from './components/AddEventModal';
import { AddDeadlineModal } from './components/AddDeadlineModal';
import { SettingsModal } from './components/SettingsModal';
import { Toast } from './components/Toast';
import { Sparkles, ArrowRight, ShieldAlert, CheckCircle2 } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { activeTab, setActiveTab, recommendations, applyRec } = useCalendarGuard();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [addEventOpen, setAddEventOpen] = useState(false);
  const [addDeadlineOpen, setAddDeadlineOpen] = useState(false);

  const topRec = recommendations.find((r) => !r.applied);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans text-slate-900">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Global Header */}
        <Header
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onOpenAddEvent={() => setAddEventOpen(true)}
          onOpenAddDeadline={() => setAddDeadlineOpen(true)}
        />

        {/* Scrollable Dashboard Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Active Tab: Dashboard */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Overview Metrics Cards */}
              <MetricsOverview />

              {/* Actionable Recommendation Hero Banner (if pending) */}
              {topRec && (
                <div
                  data-testid="hero-recommendation"
                  className="flex flex-col gap-4 rounded-3xl border border-indigo-200/80 bg-gradient-to-r from-indigo-50/80 via-white to-indigo-50/40 p-5 shadow-xs sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="rounded-2xl bg-indigo-600 p-2.5 text-white shadow-sm shadow-indigo-200">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">
                          Recommended Schedule Optimization
                        </span>
                        <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                          -{topRec.riskReductionScore} RISK POINTS
                        </span>
                      </div>
                      <h2 className="mt-1 text-sm sm:text-base font-bold text-slate-900">
                        {topRec.title}
                      </h2>
                      <p className="mt-0.5 text-xs text-slate-600 max-w-2xl leading-relaxed">
                        {topRec.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => setActiveTab('recommendations')}
                      className="rounded-xl px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-white transition-colors"
                    >
                      View all ({recommendations.filter((r) => !r.applied).length})
                    </button>
                    <button
                      onClick={() => applyRec(topRec.id)}
                      className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 active:scale-98 transition-all"
                    >
                      <span>Apply Change</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Calendar Grid */}
              <WeeklyCalendar />

              {/* Deadline Summary Strip */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Key Deliverables &amp; Risk Posture</h2>
                    <p className="text-xs text-slate-500">
                      Continuous capacity vs effort evaluation for upcoming deadlines.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('deadlines')}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    View All Deadlines &rarr;
                  </button>
                </div>
                <DeadlineList onOpenAddDeadline={() => setAddDeadlineOpen(true)} />
              </div>
            </div>
          )}

          {/* Active Tab: Weekly Calendar */}
          {activeTab === 'calendar' && (
            <div className="space-y-6">
              <WeeklyCalendar />
            </div>
          )}

          {/* Active Tab: Deadline Risks */}
          {activeTab === 'deadlines' && (
            <div className="space-y-6">
              <DeadlineList onOpenAddDeadline={() => setAddDeadlineOpen(true)} />
            </div>
          )}

          {/* Active Tab: Recommendations */}
          {activeTab === 'recommendations' && (
            <div className="space-y-6">
              <RecommendationsList />
            </div>
          )}

          {/* Active Tab: Settings */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <SettingsModal />
            </div>
          )}
        </main>
      </div>

      {/* Modals & Popups */}
      <DeadlineDetailModal />
      <AddEventModal isOpen={addEventOpen} onClose={() => setAddEventOpen(false)} />
      <AddDeadlineModal isOpen={addDeadlineOpen} onClose={() => setAddDeadlineOpen(false)} />
      <Toast />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <CalendarGuardProvider>
      <MainLayout />
    </CalendarGuardProvider>
  );
};

export default App;
