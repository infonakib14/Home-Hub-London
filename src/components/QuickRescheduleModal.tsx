/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Job } from '../types/job';
import { X, Calendar, Clock, CheckCircle } from 'lucide-react';
import { addDays } from '../utils/dateUtils';
import { translations } from '../utils/translations';

interface QuickRescheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: Job | null;
  onConfirm: (jobId: string, newDate: string, newTime: string) => void;
}

export const QuickRescheduleModal: React.FC<QuickRescheduleModalProps> = ({
  isOpen,
  onClose,
  job,
  onConfirm,
}) => {
  const t = translations.en;
  const [date, setDate] = useState('');
  const [time, setTime] = useState('11:00');

  useEffect(() => {
    if (job) {
      setDate(job.nextVisitDate || addDays(7));
      setTime(job.nextVisitTime || '11:00');
    }
  }, [job, isOpen]);

  if (!isOpen || !job) return null;

  const handleApplyPreset = (days: number) => {
    setDate(addDays(days));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) return;
    onConfirm(job.id, date, time);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50/70">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              Change Next Visit Date
            </h3>
            <p className="text-xs text-slate-500 font-medium truncate max-w-xs">
              {job.clientName}{job.technicianName ? ` · Tech: ${job.technicianName}` : ''}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-5 space-y-4">
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{t.nextVisitDate}</span>
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 text-sm font-mono font-semibold rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-[#14532d]"
            />
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{t.nextVisitTime}</span>
            </label>
            <input
              type="time"
              required
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-3 py-2 text-sm font-mono font-semibold rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-[#14532d]"
            />
          </div>

          <div className="pt-1">
            <span className="block text-[11px] font-semibold text-slate-600 mb-1.5">
              Quick Select:
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => handleApplyPreset(7)}
                className="px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-emerald-50 hover:text-[#14532d] rounded-md transition-colors"
              >
                {t.quickPreset7}
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset(14)}
                className="px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-emerald-50 hover:text-[#14532d] rounded-md transition-colors"
              >
                {t.quickPreset14}
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset(30)}
                className="px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-emerald-50 hover:text-[#14532d] rounded-md transition-colors"
              >
                {t.quickPreset30}
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset(90)}
                className="px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-emerald-50 hover:text-[#14532d] rounded-md transition-colors"
              >
                {t.quickPreset90}
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#14532d] hover:bg-[#166534] rounded-lg shadow-xs transition-colors"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Update Next Visit</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
