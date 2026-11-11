/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Job, ViewTab, Technician } from './types/job';
import {
  loadJobs,
  saveJobs,
  loadSettings,
  saveSettings,
  loadTechnicians,
  saveTechnicians,
  getInitialSeedJobs,
  AppSettings,
} from './utils/storage';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { JobsTableView } from './components/JobsTableView';
import { CalendarView } from './components/CalendarView';
import { JobModal } from './components/JobModal';
import { QuickRescheduleModal } from './components/QuickRescheduleModal';
import { ReminderDrawer } from './components/ReminderDrawer';
import { BackupModal } from './components/BackupModal';
import { TechniciansModal } from './components/TechniciansModal';
import { isJobToday, isJobOverdue } from './utils/dateUtils';
import { playChime } from './utils/audio';
import { translations } from './utils/translations';
import { Plus, Wrench } from 'lucide-react';

export default function App() {
  const [jobs, setJobs] = useState<Job[]>(() => loadJobs());
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());
  const [technicians, setTechnicians] = useState<Technician[]>(() => loadTechnicians());
  const [currentTab, setCurrentTab] = useState<ViewTab>('dashboard');

  // Modals state
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [reschedulingJob, setReschedulingJob] = useState<Job | null>(null);
  const [isReminderDrawerOpen, setIsReminderDrawerOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isTechniciansModalOpen, setIsTechniciansModalOpen] = useState(false);

  // Sync jobs to localStorage
  useEffect(() => {
    saveJobs(jobs);
  }, [jobs]);

  // Sync settings to localStorage
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  // Sync technicians to localStorage
  useEffect(() => {
    saveTechnicians(technicians);
  }, [technicians]);

  // Calculate urgent reminders (today + overdue)
  const urgentCount = jobs.filter(
    (j) => (isJobToday(j.nextVisitDate) || isJobOverdue(j.nextVisitDate, j.status)) && j.status !== 'completed'
  ).length;

  // Toggle sound
  const handleToggleSound = () => {
    const nextSound = !settings.soundEnabled;
    setSettings((prev) => ({ ...prev, soundEnabled: nextSound }));
    if (nextSound) {
      playChime('success');
    }
  };

  // Add or Edit Job
  const handleSaveJob = (
    jobData: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>,
    existingId?: string
  ) => {
    const now = new Date().toISOString();
    if (existingId) {
      // Edit existing
      setJobs((prev) =>
        prev.map((j) =>
          j.id === existingId
            ? {
                ...j,
                ...jobData,
                currency: '£',
                updatedAt: now,
              }
            : j
        )
      );
      if (settings.soundEnabled) playChime('success');
    } else {
      // Create new
      const newJob: Job = {
        ...jobData,
        currency: '£',
        id: `job-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        createdAt: now,
        updatedAt: now,
      };
      setJobs((prev) => [newJob, ...prev]);
      if (settings.soundEnabled) playChime('reminder');
    }
  };

  // Technician management handlers
  const handleAddTechnician = (techData: Omit<Technician, 'id' | 'createdAt'>) => {
    const newTech: Technician = {
      ...techData,
      id: `tech-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
    };
    setTechnicians((prev) => [...prev, newTech]);
    if (settings.soundEnabled) playChime('success');
  };

  const handleUpdateTechnician = (id: string, techData: Partial<Technician>) => {
    setTechnicians((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...techData } : t))
    );
    if (settings.soundEnabled) playChime('success');
  };

  const handleDeleteTechnician = (id: string) => {
    setTechnicians((prev) => prev.filter((t) => t.id !== id));
    if (settings.soundEnabled) playChime('alert');
  };

  // Open modal for editing
  const handleOpenEditModal = (job: Job) => {
    setEditingJob(job);
    setIsJobModalOpen(true);
  };

  // Open modal for adding
  const handleOpenNewJobModal = () => {
    setEditingJob(null);
    setIsJobModalOpen(true);
  };

  // Quick reschedule next visit
  const handleOpenQuickReschedule = (job: Job) => {
    setReschedulingJob(job);
  };

  const handleConfirmReschedule = (jobId: string, newDate: string, newTime: string) => {
    setJobs((prev) =>
      prev.map((j) =>
        j.id === jobId
          ? {
              ...j,
              nextVisitDate: newDate,
              nextVisitTime: newTime,
              updatedAt: new Date().toISOString(),
            }
          : j
      )
    );
    if (settings.soundEnabled) playChime('success');
  };

  // Toggle status complete / pending
  const handleToggleStatus = (jobId: string) => {
    setJobs((prev) =>
      prev.map((j) => {
        if (j.id === jobId) {
          const nextStatus = j.status === 'completed' ? 'scheduled' : 'completed';
          return {
            ...j,
            status: nextStatus,
            updatedAt: new Date().toISOString(),
          };
        }
        return j;
      })
    );
    if (settings.soundEnabled) playChime('success');
  };

  // Delete job
  const handleDeleteJob = (jobId: string) => {
    const t = translations.en;
    if (window.confirm(t.confirmDelete)) {
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
      if (settings.soundEnabled) playChime('alert');
    }
  };

  // Import / restore jobs handler
  const handleRestoreJobs = (importedJobs: Job[], mode: 'replace' | 'merge') => {
    const normalized = importedJobs.map((j) => ({ ...j, currency: '£' }));
    if (mode === 'replace') {
      setJobs(normalized);
    } else {
      setJobs((prev) => {
        const map = new Map<string, Job>();
        prev.forEach((j) => map.set(j.id, j));
        normalized.forEach((j) => map.set(j.id, j));
        return Array.from(map.values());
      });
    }
    if (settings.soundEnabled) playChime('success');
  };

  const handleResetToDemo = () => {
    const demo = getInitialSeedJobs();
    setJobs(demo);
    if (settings.soundEnabled) playChime('success');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8faf9] text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
      {/* Header */}
      <Header
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onOpenNewJobModal={handleOpenNewJobModal}
        onOpenBackupModal={() => setIsBackupModalOpen(true)}
        onOpenTechniciansModal={() => setIsTechniciansModalOpen(true)}
        reminderCount={urgentCount}
        onToggleReminderDrawer={() => setIsReminderDrawerOpen(!isReminderDrawerOpen)}
        soundEnabled={settings.soundEnabled}
        onToggleSound={handleToggleSound}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8">
        {/* Hero Banner with Prominent Centered New Job Booking CTA beneath header */}
        <div className="mb-6 sm:mb-8 rounded-2xl bg-gradient-to-r from-[#14532d] via-[#166534] to-[#14532d] p-5 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/10 text-emerald-100 text-xs font-medium backdrop-blur-xs">
              <span>Home Hub Admin</span>
              <span>•</span>
              <span>GBP (£) Active</span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight">
              Service Visit & Reminder Hub
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 max-w-xl">
              Easily manage client bookings, track next visit dates, assign field technicians, and receive instant alerts for today's jobs.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full md:w-auto justify-center">
            <button
              onClick={handleOpenNewJobModal}
              className="flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-bold text-[#14532d] bg-white hover:bg-emerald-50 active:bg-emerald-100 rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 whitespace-nowrap w-full sm:w-auto"
            >
              <Plus className="w-5 h-5 text-[#14532d]" />
              <span>+ New Job Booking</span>
            </button>
            <button
              onClick={() => setIsTechniciansModalOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-3.5 text-xs font-semibold text-white bg-white/15 hover:bg-white/25 border border-white/20 rounded-xl backdrop-blur-xs transition-colors whitespace-nowrap w-full sm:w-auto"
            >
              <Wrench className="w-4 h-4" />
              <span>Technicians Roster</span>
            </button>
          </div>
        </div>

        {currentTab === 'dashboard' && (
          <DashboardView
            jobs={jobs}
            onEdit={handleOpenEditModal}
            onQuickReschedule={handleOpenQuickReschedule}
            onToggleStatus={handleToggleStatus}
            onDelete={handleDeleteJob}
            onOpenNewJobModal={handleOpenNewJobModal}
            onNavigateToAllJobs={() => setCurrentTab('all-jobs')}
            soundEnabled={settings.soundEnabled}
          />
        )}

        {currentTab === 'all-jobs' && (
          <JobsTableView
            jobs={jobs}
            onEdit={handleOpenEditModal}
            onQuickReschedule={handleOpenQuickReschedule}
            onToggleStatus={handleToggleStatus}
            onDelete={handleDeleteJob}
            onOpenNewJobModal={handleOpenNewJobModal}
            onOpenBackupModal={() => setIsBackupModalOpen(true)}
            onOpenTechniciansModal={() => setIsTechniciansModalOpen(true)}
            onImportJobs={(imported) => handleRestoreJobs(imported, 'replace')}
          />
        )}

        {currentTab === 'calendar' && (
          <CalendarView
            jobs={jobs}
            onEdit={handleOpenEditModal}
            onQuickReschedule={handleOpenQuickReschedule}
            onToggleStatus={handleToggleStatus}
            onDelete={handleDeleteJob}
            onOpenNewJobModal={handleOpenNewJobModal}
          />
        )}
      </main>

      {/* Modals & Slide-overs */}
      <JobModal
        isOpen={isJobModalOpen}
        onClose={() => {
          setIsJobModalOpen(false);
          setEditingJob(null);
        }}
        onSave={handleSaveJob}
        initialJob={editingJob}
        technicians={technicians}
        onQuickAddTechnician={handleAddTechnician}
        onOpenTechniciansModal={() => {
          setIsJobModalOpen(false);
          setIsTechniciansModalOpen(true);
        }}
      />

      <QuickRescheduleModal
        isOpen={Boolean(reschedulingJob)}
        onClose={() => setReschedulingJob(null)}
        job={reschedulingJob}
        onConfirm={handleConfirmReschedule}
      />

      <ReminderDrawer
        isOpen={isReminderDrawerOpen}
        onClose={() => setIsReminderDrawerOpen(false)}
        jobs={jobs}
        onQuickReschedule={handleOpenQuickReschedule}
        onToggleStatus={handleToggleStatus}
        soundEnabled={settings.soundEnabled}
      />

      <BackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        jobs={jobs}
        onRestoreJobs={handleRestoreJobs}
        onResetToDemo={handleResetToDemo}
      />

      <TechniciansModal
        isOpen={isTechniciansModalOpen}
        onClose={() => setIsTechniciansModalOpen(false)}
        technicians={technicians}
        jobs={jobs}
        onAddTechnician={handleAddTechnician}
        onUpdateTechnician={handleUpdateTechnician}
        onDeleteTechnician={handleDeleteTechnician}
      />

      {/* Quiet Footer */}
      <footer className="border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#14532d]">Home Hub</span>
            <span aria-hidden="true">·</span>
            <span>Job Scheduling & Next Visit Reminder Portal</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsTechniciansModalOpen(true)}
              className="text-[#14532d] hover:underline font-semibold"
            >
              Manage Technicians
            </button>
            <button
              onClick={() => setIsBackupModalOpen(true)}
              className="text-[#14532d] hover:underline font-semibold"
            >
              Backup & Restore Data
            </button>
            <span>© {new Date().getFullYear()} Home Hub</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
