/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Job } from '../types/job';
import { X, Bell, AlertTriangle, Clock, Calendar, Phone, MessageCircle, CheckCircle2, Wrench } from 'lucide-react';
import {
  isJobToday,
  isJobTomorrow,
  isJobOverdue,
  formatFriendlyDate,
  createWhatsAppLink,
} from '../utils/dateUtils';
import { translations } from '../utils/translations';
import { playChime } from '../utils/audio';

interface ReminderDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  jobs: Job[];
  onQuickReschedule: (job: Job) => void;
  onToggleStatus: (jobId: string) => void;
  soundEnabled: boolean;
}

export const ReminderDrawer: React.FC<ReminderDrawerProps> = ({
  isOpen,
  onClose,
  jobs,
  onQuickReschedule,
  onToggleStatus,
  soundEnabled,
}) => {
  const t = translations.en;

  if (!isOpen) return null;

  const overdueJobs = jobs.filter((j) => isJobOverdue(j.nextVisitDate, j.status));
  const todayJobs = jobs.filter((j) => isJobToday(j.nextVisitDate) && j.status !== 'completed');
  const tomorrowJobs = jobs.filter((j) => isJobTomorrow(j.nextVisitDate) && j.status !== 'completed');

  const totalUrgent = overdueJobs.length + todayJobs.length;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end">
      <div
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200"
        role="dialog"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-100 text-amber-800 rounded-lg">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Reminders & Alerts
              </h2>
              <p className="text-xs text-slate-500">
                {totalUrgent} visits requiring immediate attention
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Section: Overdue alerts */}
          {overdueJobs.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700 uppercase tracking-wide mb-2">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Overdue Follow-ups</span>
                <span className="font-mono tabular-nums px-1.5 py-0.2 bg-rose-100 rounded text-rose-800">
                  {overdueJobs.length}
                </span>
              </div>
              <div className="space-y-2.5">
                {overdueJobs.map((job) => (
                  <div
                    key={job.id}
                    className="p-3 bg-rose-50/70 border border-rose-200 rounded-xl space-y-2 text-xs"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-bold text-slate-900">{job.clientName}</div>
                        <div className="text-[11px] text-slate-600">{job.address}</div>
                        <div className="text-[11px] font-semibold text-rose-700 mt-0.5">
                          {formatFriendlyDate(job.nextVisitDate, job.nextVisitTime)}
                        </div>
                        {job.technicianName && (
                          <div className="flex items-center gap-1 text-[11px] text-slate-600 mt-1 font-medium">
                            <Wrench className="w-3 h-3 text-[#14532d] shrink-0" />
                            <span>Tech: {job.technicianName}</span>
                            {job.technicianMobile && (
                              <a
                                href={`tel:${job.technicianMobile}`}
                                className="text-[#14532d] hover:underline font-mono tabular-nums ml-1"
                                title={`Call tech: ${job.technicianMobile}`}
                              >
                                ({job.technicianMobile})
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => onToggleStatus(job.id)}
                        className="px-2 py-1 bg-white border border-slate-300 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-md text-[11px] font-semibold flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Done</span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-rose-100">
                      <div className="flex items-center gap-1.5">
                        <a
                          href={`tel:${job.mobile}`}
                          className="px-2 py-1 bg-white border border-slate-200 hover:bg-slate-100 rounded text-[11px] font-medium flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3 text-[#14532d]" />
                          <span>{t.callClient}</span>
                        </a>
                        <a
                          href={createWhatsAppLink(job)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-medium flex items-center gap-1"
                        >
                          <MessageCircle className="w-3 h-3" />
                          <span>WhatsApp</span>
                        </a>
                      </div>
                      <button
                        onClick={() => onQuickReschedule(job)}
                        className="text-[11px] font-semibold text-[#14532d] hover:underline"
                      >
                        Reschedule
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: Today's visits */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 uppercase tracking-wide mb-2">
              <Clock className="w-3.5 h-3.5" />
              <span>Today's Visits</span>
              <span className="font-mono tabular-nums px-1.5 py-0.2 bg-amber-100 rounded text-amber-900">
                {todayJobs.length}
              </span>
            </div>

            {todayJobs.length === 0 ? (
              <p className="text-xs text-slate-400 bg-slate-50 p-3 rounded-lg border border-dashed border-slate-200">
                {t.noTodayJobs}
              </p>
            ) : (
              <div className="space-y-2.5">
                {todayJobs.map((job) => (
                  <div
                    key={job.id}
                    className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl space-y-2 text-xs"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-bold text-slate-900">{job.clientName}</div>
                        <div className="text-[11px] text-slate-600">{job.address}</div>
                        <div className="text-[11px] font-bold text-amber-800 mt-0.5">
                          {formatFriendlyDate(job.nextVisitDate, job.nextVisitTime)}
                        </div>
                        {job.technicianName && (
                          <div className="flex items-center gap-1 text-[11px] text-slate-600 mt-1 font-medium">
                            <Wrench className="w-3 h-3 text-[#14532d] shrink-0" />
                            <span>Tech: {job.technicianName}</span>
                            {job.technicianMobile && (
                              <a
                                href={`tel:${job.technicianMobile}`}
                                className="text-[#14532d] hover:underline font-mono tabular-nums ml-1"
                                title={`Call tech: ${job.technicianMobile}`}
                              >
                                ({job.technicianMobile})
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => onToggleStatus(job.id)}
                        className="px-2 py-1 bg-white border border-slate-300 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-md text-[11px] font-semibold flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Done</span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-amber-100">
                      <div className="flex items-center gap-1.5">
                        <a
                          href={`tel:${job.mobile}`}
                          className="px-2 py-1 bg-white border border-slate-200 hover:bg-slate-100 rounded text-[11px] font-medium flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3 text-[#14532d]" />
                          <span>{t.callClient}</span>
                        </a>
                        <a
                          href={createWhatsAppLink(job)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-medium flex items-center gap-1"
                        >
                          <MessageCircle className="w-3 h-3" />
                          <span>WhatsApp</span>
                        </a>
                      </div>
                      <button
                        onClick={() => onQuickReschedule(job)}
                        className="text-[11px] font-semibold text-[#14532d] hover:underline"
                      >
                        Reschedule
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section: Tomorrow's visits */}
          {tomorrowJobs.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 uppercase tracking-wide mb-2">
                <Calendar className="w-3.5 h-3.5" />
                <span>Tomorrow's Visits</span>
                <span className="font-mono tabular-nums px-1.5 py-0.2 bg-emerald-100 rounded text-emerald-900">
                  {tomorrowJobs.length}
                </span>
              </div>
              <div className="space-y-2">
                {tomorrowJobs.map((job) => (
                  <div
                    key={job.id}
                    className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-1.5 text-xs"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-bold text-slate-900">{job.clientName}</div>
                        <div className="text-[11px] text-slate-600">{job.address}</div>
                        <div className="text-[11px] text-emerald-800 font-medium">
                          {formatFriendlyDate(job.nextVisitDate, job.nextVisitTime)}
                        </div>
                        {job.technicianName && (
                          <div className="flex items-center gap-1 text-[11px] text-slate-600 mt-1 font-medium">
                            <Wrench className="w-3 h-3 text-[#14532d] shrink-0" />
                            <span>Tech: {job.technicianName}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 pt-1">
                      <a
                        href={createWhatsAppLink(job)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-semibold text-emerald-700 hover:underline flex items-center gap-1"
                      >
                        <MessageCircle className="w-3 h-3" />
                        <span>Send Advance WhatsApp</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
          <button
            onClick={() => playChime('reminder')}
            className="text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1"
          >
            <span>{t.testChime}</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors"
          >
            Close Panel
          </button>
        </div>
      </div>
    </div>
  );
};
