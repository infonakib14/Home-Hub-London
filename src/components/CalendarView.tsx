/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Job } from '../types/job';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
} from 'lucide-react';
import { formatFriendlyDate, getTodayString } from '../utils/dateUtils';
import { translations } from '../utils/translations';
import { JobCard } from './JobCard';

interface CalendarViewProps {
  jobs: Job[];
  onEdit: (job: Job) => void;
  onQuickReschedule: (job: Job) => void;
  onToggleStatus: (jobId: string) => void;
  onDelete: (jobId: string) => void;
  onOpenNewJobModal: () => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  jobs,
  onEdit,
  onQuickReschedule,
  onToggleStatus,
  onDelete,
  onOpenNewJobModal,
}) => {
  const t = translations.en;
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(() => getTodayString());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // First day of month & number of days
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleTodayMonth = () => {
    const now = new Date();
    setCurrentDate(now);
    setSelectedDateStr(getTodayString());
  };

  // Group jobs by next visit date
  const jobsByDate = React.useMemo(() => {
    const map: Record<string, Job[]> = {};
    jobs.forEach((job) => {
      if (job.nextVisitDate) {
        if (!map[job.nextVisitDate]) map[job.nextVisitDate] = [];
        map[job.nextVisitDate].push(job);
      }
    });
    return map;
  }, [jobs]);

  const selectedDateJobs = jobsByDate[selectedDateStr] || [];

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const daysHeader = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthName = monthNames[month];
  const todayStr = getTodayString();

  return (
    <div className="space-y-6">
      {/* Calendar Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        {/* Month Header & Controls */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 font-mono tabular-nums">
              {monthName} {year}
            </h2>
            <button
              onClick={handleTodayMonth}
              className="px-2.5 py-1 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
            >
              Today
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              title="Previous Month"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              title="Next Month"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Days of Week Row */}
        <div className="grid grid-cols-7 gap-1 text-center font-semibold text-xs text-slate-400 mb-2">
          {daysHeader.map((d, i) => (
            <div key={i} className="py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Days Matrix */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells before month starts */}
          {Array.from({ length: firstDayIndex }).map((_, i) => (
            <div key={`empty-${i}`} className="h-20 sm:h-24 bg-slate-50/40 rounded-lg border border-transparent" />
          ))}

          {/* Month days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dayDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const isToday = dayDateStr === todayStr;
            const isSelected = dayDateStr === selectedDateStr;
            const dayJobs = jobsByDate[dayDateStr] || [];

            return (
              <button
                key={dayNum}
                onClick={() => setSelectedDateStr(dayDateStr)}
                className={`h-20 sm:h-24 p-1.5 sm:p-2 rounded-xl text-left border transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#14532d] bg-emerald-50/70 ring-2 ring-emerald-600/20 shadow-xs'
                    : isToday
                    ? 'border-amber-300 bg-amber-50/30'
                    : 'border-slate-100 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-mono tabular-nums font-bold ${
                      isToday
                        ? 'text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded-full'
                        : isSelected
                        ? 'text-[#14532d]'
                        : 'text-slate-700'
                    }`}
                  >
                    {dayNum}
                  </span>
                  {dayJobs.length > 0 && (
                    <span className="text-[10px] font-bold font-mono px-1.5 py-0.2 bg-emerald-100 text-[#14532d] rounded-md tabular-nums">
                      {dayJobs.length}
                    </span>
                  )}
                </div>

                {/* Snippets of visits */}
                <div className="space-y-1 overflow-hidden mt-1 w-full">
                  {dayJobs.slice(0, 2).map((job) => (
                    <div
                      key={job.id}
                      title={`${job.clientName} (${job.visitType}) - Tech: ${job.technicianName || 'Unassigned'}`}
                      className={`text-[10px] truncate px-1 py-0.5 rounded font-medium ${
                        job.status === 'completed'
                          ? 'bg-slate-100 text-slate-500 line-through'
                          : 'bg-emerald-100/80 text-[#14532d]'
                      }`}
                    >
                      {job.nextVisitTime && `${job.nextVisitTime} `}
                      {job.clientName}
                    </div>
                  ))}
                  {dayJobs.length > 2 && (
                    <div className="text-[9px] text-slate-500 pl-1 font-semibold">
                      +{dayJobs.length - 2} more
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Agenda */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-[#14532d]" />
              <span>
                Schedule for:{' '}
                <span className="font-mono tabular-nums">
                  {formatFriendlyDate(selectedDateStr)}
                </span>
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {selectedDateJobs.length} visits scheduled on this date
            </p>
          </div>

          <button
            onClick={onOpenNewJobModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#14532d] hover:bg-[#166534] rounded-lg shadow-xs transition-colors whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Schedule on this Day</span>
          </button>
        </div>

        {selectedDateJobs.length === 0 ? (
          <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <p className="text-xs text-slate-500">
              No visits scheduled for this selected date.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedDateJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onEdit={onEdit}
                onQuickReschedule={onQuickReschedule}
                onToggleStatus={onToggleStatus}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
