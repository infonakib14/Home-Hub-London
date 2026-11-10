/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Job, DateFilterType } from '../types/job';
import { JobCard } from './JobCard';
import {
  Calendar,
  AlertTriangle,
  Clock,
  CheckCircle,
  Plus,
  ArrowRight,
  TrendingUp,
  Volume2,
} from 'lucide-react';
import {
  isJobToday,
  isJobTomorrow,
  isJobOverdue,
  isJobThisWeek,
  sortJobsByNextVisit,
} from '../utils/dateUtils';
import { translations } from '../utils/translations';
import { playChime } from '../utils/audio';

interface DashboardViewProps {
  jobs: Job[];
  onEdit: (job: Job) => void;
  onQuickReschedule: (job: Job) => void;
  onToggleStatus: (jobId: string) => void;
  onDelete: (jobId: string) => void;
  onOpenNewJobModal: () => void;
  onNavigateToAllJobs: () => void;
  soundEnabled: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  jobs,
  onEdit,
  onQuickReschedule,
  onToggleStatus,
  onDelete,
  onOpenNewJobModal,
  onNavigateToAllJobs,
  soundEnabled,
}) => {
  const t = translations.en;
  const [filterType, setFilterType] = useState<DateFilterType>('all');

  // Filter calculations
  const todayJobs = jobs.filter((j) => isJobToday(j.nextVisitDate) && j.status !== 'completed');
  const tomorrowJobs = jobs.filter((j) => isJobTomorrow(j.nextVisitDate) && j.status !== 'completed');
  const overdueJobs = jobs.filter((j) => isJobOverdue(j.nextVisitDate, j.status));
  const thisWeekJobs = jobs.filter((j) => isJobThisWeek(j.nextVisitDate) && j.status !== 'completed');
  const activeSchedules = jobs.filter((j) => j.status !== 'completed');

  // Next Visits list (sorted strictly chronologically)
  const sortedRemainingVisits = sortJobsByNextVisit(
    jobs.filter((j) => {
      if (filterType === 'today') return isJobToday(j.nextVisitDate);
      if (filterType === 'tomorrow') return isJobTomorrow(j.nextVisitDate);
      if (filterType === 'this-week') return isJobThisWeek(j.nextVisitDate);
      if (filterType === 'overdue') return isJobOverdue(j.nextVisitDate, j.status);
      if (filterType === 'completed') return j.status === 'completed';
      return j.status !== 'completed';
    })
  );

  const handleTestReminder = () => {
    if (soundEnabled) {
      playChime('reminder');
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* SECTION 1: Overdue Alert Banner if any overdue jobs */}
      {overdueJobs.length > 0 && (
        <div className="p-4 sm:p-5 rounded-xl bg-rose-50 border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-rose-100 rounded-lg text-rose-700 shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-rose-900">
                {overdueJobs.length} Scheduled Follow-ups Are Overdue
              </h3>
              <p className="text-xs text-rose-700 mt-0.5">
                Please contact the clients or update their next appointment date.
              </p>
            </div>
          </div>
          <button
            onClick={() => setFilterType('overdue')}
            className="self-start sm:self-auto px-3.5 py-1.5 text-xs font-bold text-rose-900 bg-white hover:bg-rose-100 border border-rose-300 rounded-lg transition-colors whitespace-nowrap"
          >
            View Overdue Jobs
          </button>
        </div>
      )}

      {/* SECTION 2: Metric Overview Strip (Single elevation, tabular figures) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Today's Visits */}
        <div
          onClick={() => setFilterType('today')}
          className={`cursor-pointer p-4 rounded-xl border transition-all ${
            filterType === 'today'
              ? 'bg-amber-50/80 border-amber-300 shadow-xs ring-1 ring-amber-500/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              {t.statsTodayCount}
            </span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            {todayJobs.length}
          </div>
          <span className="text-[11px] text-slate-500">Due for service today</span>
        </div>

        {/* Metric 2: Tomorrow & Next 7 Days */}
        <div
          onClick={() => setFilterType('this-week')}
          className={`cursor-pointer p-4 rounded-xl border transition-all ${
            filterType === 'this-week'
              ? 'bg-emerald-50 border-emerald-400 shadow-xs ring-1 ring-emerald-500/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              {t.statsUpcoming}
            </span>
            <Calendar className="w-4 h-4 text-[#14532d]" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            {thisWeekJobs.length}
          </div>
          <span className="text-[11px] text-slate-500">Next 7 days schedule</span>
        </div>

        {/* Metric 3: Overdue */}
        <div
          onClick={() => setFilterType('overdue')}
          className={`cursor-pointer p-4 rounded-xl border transition-all ${
            filterType === 'overdue'
              ? 'bg-rose-50/80 border-rose-300 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              {t.statsOverdue}
            </span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            {overdueJobs.length}
          </div>
          <span className="text-[11px] text-slate-500">Need reschedule</span>
        </div>

        {/* Metric 4: Total Active */}
        <div
          onClick={() => setFilterType('all')}
          className={`cursor-pointer p-4 rounded-xl border transition-all ${
            filterType === 'all'
              ? 'bg-emerald-50/60 border-emerald-300 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              {t.statsTotalActive}
            </span>
            <TrendingUp className="w-4 h-4 text-[#14532d]" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            {activeSchedules.length}
          </div>
          <span className="text-[11px] text-slate-500">Clients in pipeline</span>
        </div>
      </div>

      {/* SECTION 3: TODAY'S WORK & VISITS */}
      <section className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-emerald-100 text-[#14532d] rounded-lg">
                <Clock className="w-4 h-4" />
              </span>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                {t.todayHeader}
              </h2>
              {todayJobs.length > 0 && (
                <span className="font-mono text-xs font-bold px-2 py-0.5 bg-emerald-100 text-[#14532d] rounded-md tabular-nums">
                  {todayJobs.length}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">{t.todaySub}</p>
          </div>

          <div className="flex items-center gap-2">
            {soundEnabled && (
              <button
                onClick={handleTestReminder}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
                title="Play test reminder chime"
              >
                <Volume2 className="w-3.5 h-3.5 text-emerald-700" />
                <span>{t.testChime}</span>
              </button>
            )}
            <button
              onClick={onOpenNewJobModal}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-[#14532d] bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Job</span>
            </button>
          </div>
        </div>

        {todayJobs.length === 0 ? (
          <div className="py-8 text-center bg-slate-50/70 rounded-xl border border-dashed border-slate-200">
            <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-800">{t.noTodayJobs}</p>
            <p className="text-xs text-slate-500 mt-1">
              All remaining upcoming visits are shown below.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {todayJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onEdit={onEdit}
                onQuickReschedule={onQuickReschedule}
                onToggleStatus={onToggleStatus}
                onDelete={onDelete}
                highlightToday={true}
              />
            ))}
          </div>
        )}
      </section>

      {/* SECTION 4: UPCOMING NEXT VISITS */}
      <section className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              {t.nextVisitsHeader}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">{t.nextVisitsSub}</p>
          </div>

          {/* Interactive filter tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl overflow-x-auto">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                filterType === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.filterAll}
            </button>
            <button
              onClick={() => setFilterType('today')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                filterType === 'today'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.filterToday}
            </button>
            <button
              onClick={() => setFilterType('tomorrow')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                filterType === 'tomorrow'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.filterTomorrow}
            </button>
            <button
              onClick={() => setFilterType('this-week')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                filterType === 'this-week'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.filterThisWeek}
            </button>
            <button
              onClick={() => setFilterType('overdue')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                filterType === 'overdue'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.filterOverdue}
            </button>
          </div>
        </div>

        {/* Job Cards Grid */}
        {sortedRemainingVisits.length === 0 ? (
          <div className="py-12 text-center bg-slate-50/70 rounded-xl border border-dashed border-slate-200">
            <Calendar className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">{t.noJobsFound}</p>
            <p className="text-xs text-slate-500 mt-1">
              Select another filter or book a new job with a next visit date.
            </p>
            <button
              onClick={onOpenNewJobModal}
              className="mt-3 px-4 py-2 text-xs font-semibold text-white bg-[#14532d] hover:bg-[#166534] rounded-lg shadow-xs transition-colors"
            >
              {t.newBookingBtn}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedRemainingVisits.map((job) => (
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

        {/* Footer Jump to Full List */}
        <div className="pt-4 mt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing {sortedRemainingVisits.length} scheduled visits
          </span>
          <button
            onClick={onNavigateToAllJobs}
            className="flex items-center gap-1 font-semibold text-[#14532d] hover:text-[#166534] transition-colors"
          >
            <span>View all jobs table</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>
    </div>
  );
};
