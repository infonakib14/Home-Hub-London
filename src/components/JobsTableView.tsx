/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef } from 'react';
import { Job, VisitType, JobStatus } from '../types/job';
import { JobCard } from './JobCard';
import {
  Search,
  Download,
  Upload,
  LayoutGrid,
  Table as TableIcon,
  Phone,
  MessageCircle,
  CalendarClock,
  Edit2,
  Trash2,
  CheckCircle2,
  MapPin,
  Calendar,
  Database,
  Plus,
  Wrench,
} from 'lucide-react';
import {
  formatFriendlyDate,
  isJobToday,
  isJobTomorrow,
  isJobOverdue,
  createWhatsAppLink,
  sortJobsByNextVisit,
} from '../utils/dateUtils';
import { exportJobsToCSV, exportJobsToJSON } from '../utils/storage';
import { translations } from '../utils/translations';

interface JobsTableViewProps {
  jobs: Job[];
  onEdit: (job: Job) => void;
  onQuickReschedule: (job: Job) => void;
  onToggleStatus: (jobId: string) => void;
  onDelete: (jobId: string) => void;
  onOpenNewJobModal: () => void;
  onOpenBackupModal: () => void;
  onImportJobs: (importedJobs: Job[]) => void;
}

export const JobsTableView: React.FC<JobsTableViewProps> = ({
  jobs,
  onEdit,
  onQuickReschedule,
  onToggleStatus,
  onDelete,
  onOpenNewJobModal,
  onOpenBackupModal,
  onImportJobs,
}) => {
  const t = translations.en;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVisitType, setSelectedVisitType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedTechnician, setSelectedTechnician] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Unique list of technicians across all jobs for the filter dropdown
  const uniqueTechnicians = useMemo(() => {
    const set = new Set<string>();
    jobs.forEach((j) => {
      if (j.technicianName?.trim()) set.add(j.technicianName.trim());
    });
    return Array.from(set).sort();
  }, [jobs]);

  // Filtered jobs
  const filteredJobs = useMemo(() => {
    let result = jobs;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (j) =>
          j.clientName.toLowerCase().includes(q) ||
          j.mobile.toLowerCase().includes(q) ||
          j.address.toLowerCase().includes(q) ||
          (j.email && j.email.toLowerCase().includes(q)) ||
          (j.technicianName && j.technicianName.toLowerCase().includes(q)) ||
          (j.technicianMobile && j.technicianMobile.toLowerCase().includes(q)) ||
          (j.notes && j.notes.toLowerCase().includes(q))
      );
    }

    if (selectedVisitType !== 'all') {
      result = result.filter((j) => j.visitType === selectedVisitType);
    }

    if (selectedStatus !== 'all') {
      result = result.filter((j) => j.status === selectedStatus);
    }

    if (selectedTechnician !== 'all') {
      result = result.filter((j) => (j.technicianName || '').trim() === selectedTechnician);
    }

    return sortJobsByNextVisit(result);
  }, [jobs, searchQuery, selectedVisitType, selectedStatus, selectedTechnician]);

  // Direct File import handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          onImportJobs(parsed);
          alert(`Successfully imported ${parsed.length} jobs!`);
        }
      } catch {
        alert('Failed to parse JSON backup file.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-5">
      {/* Top Action & Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">{t.allVisitsHeader}</h2>
            <p className="text-xs text-slate-500">{t.allVisitsSub}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center p-0.5 bg-slate-100 rounded-lg">
              <button
                onClick={() => setViewMode('table')}
                title="Table View"
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <TableIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('cards')}
                title="Grid Cards View"
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'cards' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>

            {/* Dedicated Data Backup & Restore Modal Trigger */}
            <button
              onClick={onOpenBackupModal}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-950 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition-colors whitespace-nowrap"
              title="Open full data backup and restore center"
            >
              <Database className="w-3.5 h-3.5 text-[#14532d]" />
              <span>Data Backup</span>
            </button>

            {/* Quick Export CSV */}
            <button
              onClick={() => exportJobsToCSV(jobs)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
              title="Download CSV spreadsheet"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t.exportCSV}</span>
            </button>

            {/* Quick Export JSON */}
            <button
              onClick={() => exportJobsToJSON(jobs)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
              title="Save backup file"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t.exportBackup}</span>
            </button>

            {/* Quick Import JSON */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".json"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
              title="Restore from JSON backup"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{t.importBackup}</span>
            </button>

            {/* New Job CTA */}
            <button
              onClick={onOpenNewJobModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#14532d] hover:bg-[#166534] rounded-lg shadow-xs transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>{t.newBookingBtn}</span>
            </button>
          </div>
        </div>

        {/* Search & Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2.5 pt-2 border-t border-slate-100">
          {/* Search Input */}
          <div className="lg:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-[#14532d] transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter: Technician */}
          <div className="lg:col-span-3">
            <select
              value={selectedTechnician}
              onChange={(e) => setSelectedTechnician(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 font-medium"
            >
              <option value="all">All Technicians</option>
              {uniqueTechnicians.map((tech) => (
                <option key={tech} value={tech}>
                  {tech}
                </option>
              ))}
            </select>
          </div>

          {/* Filter: Visit Type */}
          <div className="lg:col-span-3">
            <select
              value={selectedVisitType}
              onChange={(e) => setSelectedVisitType(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 font-medium"
            >
              <option value="all">All Visit Types</option>
              <option value="1st">{t.visitTypes['1st']}</option>
              <option value="2nd">{t.visitTypes['2nd']}</option>
              <option value="final">{t.visitTypes['final']}</option>
              <option value="monthly">{t.visitTypes['monthly']}</option>
              <option value="quarterly">{t.visitTypes['quarterly']}</option>
              <option value="inspection">{t.visitTypes['inspection']}</option>
            </select>
          </div>

          {/* Filter: Status */}
          <div className="lg:col-span-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 font-medium"
            >
              <option value="all">All Statuses</option>
              <option value="scheduled">{t.statusTypes.scheduled}</option>
              <option value="in_progress">{t.statusTypes.in_progress}</option>
              <option value="completed">{t.statusTypes.completed}</option>
              <option value="cancelled">{t.statusTypes.cancelled}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content: Table or Cards */}
      {filteredJobs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Search className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">{t.noJobsFound}</p>
          <p className="text-xs text-slate-500 mt-1">
            Try clearing your search query or changing filter settings.
          </p>
        </div>
      ) : viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredJobs.map((job) => (
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
      ) : (
        /* High-Density Data Grid */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">{t.clientName}</th>
                  <th className="py-3 px-3">{t.visitType}</th>
                  <th className="py-3 px-3">{t.nextVisitDate} (Reminder)</th>
                  <th className="py-3 px-3">Technician</th>
                  <th className="py-3 px-3 text-right">{t.price}</th>
                  <th className="py-3 px-3">{t.mobile}</th>
                  <th className="py-3 px-3">{t.status}</th>
                  <th className="py-3 px-4 text-right">{t.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredJobs.map((job) => {
                  const isToday = isJobToday(job.nextVisitDate);
                  const isTomorrow = isJobTomorrow(job.nextVisitDate);
                  const isOverdue = isJobOverdue(job.nextVisitDate, job.status);
                  const isDone = job.status === 'completed';

                  let rowBg = 'hover:bg-slate-50/80';
                  if (isDone) rowBg = 'bg-slate-50/40 text-slate-400 hover:bg-slate-50';
                  else if (isOverdue) rowBg = 'bg-rose-50/30 hover:bg-rose-50/60';
                  else if (isToday) rowBg = 'bg-amber-50/30 hover:bg-amber-50/60 font-medium';

                  return (
                    <tr key={job.id} className={`transition-colors ${rowBg}`}>
                      {/* Client info */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{job.clientName}</div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[200px] flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{job.address}</span>
                        </div>
                      </td>

                      {/* Visit Type */}
                      <td className="py-3 px-3">
                        <span className="font-semibold text-slate-800">
                          {t.visitTypes[job.visitType] || job.visitType}
                        </span>
                      </td>

                      {/* Next Visit Date & Time */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-mono tabular-nums font-semibold">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span
                            className={
                              isDone
                                ? 'text-slate-500'
                                : isOverdue
                                ? 'text-rose-600 font-bold'
                                : isToday
                                ? 'text-amber-700 font-bold'
                                : isTomorrow
                                ? 'text-emerald-700 font-bold'
                                : 'text-slate-800'
                            }
                          >
                            {formatFriendlyDate(job.nextVisitDate, job.nextVisitTime)}
                          </span>
                        </div>
                      </td>

                      {/* Technician */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {job.technicianName ? (
                          <div>
                            <div className="font-semibold text-slate-800 flex items-center gap-1">
                              <Wrench className="w-3 h-3 text-[#14532d] shrink-0" />
                              <span className="truncate max-w-[130px]">{job.technicianName}</span>
                            </div>
                            {job.technicianMobile && (
                              <a
                                href={`tel:${job.technicianMobile}`}
                                title={`Call ${job.technicianName}`}
                                className="text-[11px] text-[#14532d] hover:underline font-mono tabular-nums flex items-center gap-1 mt-0.5"
                              >
                                <Phone className="w-2.5 h-2.5" />
                                <span>{job.technicianMobile}</span>
                              </a>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Unassigned</span>
                        )}
                      </td>

                      {/* Price (Tabular nums) */}
                      <td className="py-3 px-3 text-right font-mono tabular-nums font-semibold text-slate-800">
                        {job.currency} {job.price.toLocaleString()}
                      </td>

                      {/* Mobile & Direct actions */}
                      <td className="py-3 px-3 whitespace-nowrap font-mono tabular-nums">
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-700">{job.mobile}</span>
                          <a
                            href={`tel:${job.mobile}`}
                            title={t.callClient}
                            className="p-1 text-[#14532d] hover:bg-emerald-50 rounded"
                          >
                            <Phone className="w-3 h-3" />
                          </a>
                          <a
                            href={createWhatsAppLink(job)}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={t.whatsappReminder}
                            className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                          >
                            <MessageCircle className="w-3 h-3" />
                          </a>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <button
                          onClick={() => onToggleStatus(job.id)}
                          className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                            isDone
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          <CheckCircle2 className={`w-3 h-3 ${isDone ? 'text-emerald-600' : 'text-slate-400'}`} />
                          <span>{isDone ? t.completedBadge : t.statusTypes[job.status]}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onQuickReschedule(job)}
                            className="p-1.5 text-slate-500 hover:text-[#14532d] hover:bg-emerald-50 rounded transition-colors"
                            title={t.quickReschedule}
                          >
                            <CalendarClock className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onEdit(job)}
                            className="p-1.5 text-slate-500 hover:text-[#14532d] hover:bg-emerald-50 rounded transition-colors"
                            title={t.editJob}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDelete(job.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                            title={t.deleteJob}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span>
              Total listed jobs: {filteredJobs.length}
            </span>
            <span className="font-mono tabular-nums">
              Home Hub Admin Console
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
