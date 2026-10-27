import React, { useState } from 'react';
import { X, AlertTriangle, Clock, Plus } from 'lucide-react';
import { useCalendarGuard } from '../context/CalendarGuardContext';
import { Deadline, DeadlinePriority } from '../types';

interface AddDeadlineModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddDeadlineModal: React.FC<AddDeadlineModalProps> = ({ isOpen, onClose }) => {
  const { addDeadline } = useCalendarGuard();

  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('2026-10-29');
  const [dueTime, setDueTime] = useState('17:00');
  const [effortHours, setEffortHours] = useState(4.0);
  const [priority, setPriority] = useState<DeadlinePriority>('medium');
  const [category, setCategory] = useState('Engineering');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newDeadline: Deadline = {
      id: `dl-${Date.now()}`,
      title: title.trim(),
      dueDate: `${dueDate}T${dueTime}:00`,
      estimatedEffortHours: Number(effortHours) || 0,
      completed: false,
      priority,
      category: category.trim() || undefined,
      description: description.trim() || undefined,
    };

    addDeadline(newDeadline);
    onClose();
    setTitle('');
    setDescription('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-deadline-title"
        className="relative z-10 w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-rose-50 p-1.5 text-rose-600">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <h2 id="add-deadline-title" className="text-base font-bold text-slate-900">
              New Deadline Assessment
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700">Deadline Title</label>
            <input
              type="text"
              required
              placeholder="e.g. SOC2 Certification Audit Deliverable"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Category</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Engineering, Design, Legal..."
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as DeadlinePriority)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 outline-hidden"
              >
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Due Date</label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">Due Time</label>
              <input
                type="time"
                required
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 outline-hidden"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-700">
                Estimated Effort (Hours)
              </label>
              <span className="text-xs font-bold text-indigo-600">{effortHours}h</span>
            </div>
            <input
              type="number"
              step="0.5"
              min="0.5"
              max="40"
              required
              value={effortHours}
              onChange={(e) => setEffortHours(parseFloat(e.target.value) || 0)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 outline-hidden"
            />
            <p className="mt-1 text-[11px] text-slate-500">
              The risk engine compares this against your open working calendar hours before the due date.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Description (Optional)</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Scope, deliverables, or checklist..."
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 outline-hidden"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700"
            >
              Create &amp; Predict Risk
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
