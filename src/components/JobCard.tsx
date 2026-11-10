/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Job } from '../types/job';
import {
  Calendar,
  MapPin,
  Phone,
  MessageCircle,
  Edit2,
  Trash2,
  CheckCircle2,
  CalendarClock,
  Wrench,
} from 'lucide-react';
import {
  formatFriendlyDate,
  isJobToday,
  isJobTomorrow,
  isJobOverdue,
  createWhatsAppLink,
} from '../utils/dateUtils';
import { translations } from '../utils/translations';

interface JobCardProps {
  job: Job;
  onEdit: (job: Job) => void;
  onQuickReschedule: (job: Job) => void;
  onToggleStatus: (jobId: string) => void;
  onDelete: (jobId: string) => void;
  highlightToday?: boolean;
}

export const JobCard: React.FC<JobCardProps> = ({
  job,
  onEdit,
  onQuickReschedule,
  onToggleStatus,
  onDelete,
}) => {
  const t = translations.en;

  const isToday = isJobToday(job.nextVisitDate);
  const isTomorrow = isJobTomorrow(job.nextVisitDate);
  const isOverdue = isJobOverdue(job.nextVisitDate, job.status);
  const isDone = job.status === 'completed';

  // Surface border treatment
  let cardBorderClass = 'border-slate-200 bg-white hover:border-slate-300';
  if (isDone) {
    cardBorderClass = 'border-slate-200 bg-slate-50/60 opacity-80';
  } else if (isOverdue) {
    cardBorderClass = 'border-rose-300 bg-rose-50/20 hover:border-rose-400';
  } else if (isToday) {
    cardBorderClass = 'border-amber-300 bg-amber-50/20 hover:border-amber-400 shadow-xs';
  } else if (isTomorrow) {
    cardBorderClass = 'border-emerald-300 bg-emerald-50/15 hover:border-emerald-400';
  }

  const friendlyDateStr = formatFriendlyDate(job.nextVisitDate, job.nextVisitTime);

  return (
    <div
      className={`rounded-xl border p-4 sm:p-5 transition-all flex flex-col justify-between ${cardBorderClass}`}
    >
      <div>
        {/* Row 1: Client Name, Visit Type, and Status indicator */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="min-w-0">
            <h3 className="text-base font-bold text-slate-900 truncate">
              {job.clientName}
            </h3>
            {/* Unboxed metadata with clean typographic separators */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-0.5">
              <span className="font-semibold text-slate-700">
                {t.visitTypes[job.visitType] || job.visitType}
              </span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="font-mono tabular-nums text-slate-700 font-medium">
                {job.currency} {job.price.toLocaleString()}
              </span>
              {job.email && (
                <>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <span className="truncate max-w-[150px]">{job.email}</span>
                </>
              )}
            </div>
          </div>

          {/* Quick Mark Complete Button */}
          <button
            onClick={() => onToggleStatus(job.id)}
            title={isDone ? 'Mark as pending' : t.markComplete}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              isDone
                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                : 'bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700'
            }`}
          >
            {isDone ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t.completedBadge}</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Mark Done</span>
              </>
            )}
          </button>
        </div>

        {/* Address */}
        <div className="flex items-start gap-1.5 text-xs text-slate-600 mb-2">
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
          <span className="line-clamp-1">{job.address}</span>
        </div>

        {/* Assigned Technician */}
        {job.technicianName && (
          <div className="flex items-center justify-between text-xs mb-3 bg-emerald-50/60 px-2.5 py-1.5 rounded-lg border border-emerald-100">
            <div className="flex items-center gap-1.5 truncate">
              <Wrench className="w-3.5 h-3.5 text-[#14532d] shrink-0" />
              <span className="text-slate-500 font-medium text-[11px]">Tech:</span>
              <span className="font-semibold text-slate-800 truncate text-[11px] sm:text-xs">
                {job.technicianName}
              </span>
            </div>
            {job.technicianMobile && (
              <a
                href={`tel:${job.technicianMobile}`}
                className="text-[11px] font-mono tabular-nums text-[#14532d] hover:text-[#166534] font-medium flex items-center gap-1 shrink-0 ml-2 hover:underline"
                title={`Call technician: ${job.technicianMobile}`}
              >
                <Phone className="w-3 h-3" />
                <span className="hidden sm:inline">{job.technicianMobile}</span>
                <span className="sm:hidden">Call</span>
              </a>
            )}
          </div>
        )}

        {/* Highlighted Next Visit reminder box */}
        <div
          className={`rounded-lg p-3 mb-3 border text-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 ${
            isDone
              ? 'bg-slate-100/70 border-slate-200 text-slate-600'
              : isOverdue
              ? 'bg-rose-100/60 border-rose-200 text-rose-900'
              : isToday
              ? 'bg-amber-100/70 border-amber-200 text-amber-950 font-medium'
              : isTomorrow
              ? 'bg-emerald-100/60 border-emerald-200 text-emerald-950'
              : 'bg-slate-50 border-slate-200 text-slate-800'
          }`}
        >
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 shrink-0 text-slate-500" />
            <div>
              <span className="text-[11px] block font-semibold uppercase tracking-wider text-slate-500">
                {t.nextVisitDate}
              </span>
              <span className="font-semibold text-xs sm:text-sm font-mono tabular-nums">
                {friendlyDateStr}
              </span>
            </div>
          </div>

          {/* Quick Reschedule button inside next visit box */}
          {!isDone && (
            <button
              onClick={() => onQuickReschedule(job)}
              className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-white hover:bg-emerald-50/70 border border-slate-300 hover:border-emerald-300 rounded-md transition-colors self-start sm:self-auto shrink-0"
              title={t.quickReschedule}
            >
              <CalendarClock className="w-3 h-3 text-[#14532d]" />
              <span>Change Date</span>
            </button>
          )}
        </div>

        {/* Service Notes if any */}
        {job.notes && (
          <p className="text-xs text-slate-600 line-clamp-2 mb-3 bg-slate-50 p-2 rounded-md border border-slate-100">
            {job.notes}
          </p>
        )}
      </div>

      {/* Row: Contact and Admin Actions */}
      <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
        {/* Direct Contact Actions (Call & WhatsApp Reminder) */}
        <div className="flex items-center gap-1.5">
          {job.mobile && (
            <>
              <a
                href={`tel:${job.mobile}`}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-emerald-50/80 rounded-lg transition-colors whitespace-nowrap"
                title={`${t.callClient}: ${job.mobile}`}
              >
                <Phone className="w-3.5 h-3.5 text-[#14532d]" />
                <span className="hidden sm:inline font-mono tabular-nums">{job.mobile}</span>
                <span className="sm:hidden">{t.callClient}</span>
              </a>

              <a
                href={createWhatsAppLink(job)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors whitespace-nowrap"
                title={t.whatsappReminder}
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>WhatsApp</span>
              </a>
            </>
          )}
        </div>

        {/* Edit and Delete Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onEdit(job)}
            className="p-1.5 text-slate-500 hover:text-[#14532d] hover:bg-emerald-50 rounded-lg transition-colors"
            title={t.editJob}
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(job.id)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title={t.deleteJob}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
