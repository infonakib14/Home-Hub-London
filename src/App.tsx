/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Job, ViewTab } from './types/job';
import {
  loadJobs,
  saveJobs,
  loadSettings,
  saveSettings,
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
import { isJobToday, isJobOverdue } from './utils/dateUtils';
import { playChime } from './utils/audio';
import { translations } from './utils/translations';

export default function App() {
  const [jobs, setJobs] = useState<Job[]>(() => loadJobs());
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());
  const [currentTab, setCurrentTab] = useState<ViewTab>('dashboard');

  // Modals state
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [reschedulingJob, setReschedulingJob] = useState<Job | null>(null);
  const [isReminderDrawerOpen, setIsReminderDrawerOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);

  // Sync jobs to localStorage
  useEffect(() => {
    saveJobs(jobs);
  }, [jobs]);

  // Sync settings to localStorage
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

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
        id: `job-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        createdAt: now,
        updatedAt: now,
      };
      setJobs((prev) => [newJob, ...prev]);
      if (settings.soundEnabled) playChime('reminder');
    }
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
    if (mode === 'replace') {
      setJobs(importedJobs);
    } else {
      setJobs((prev) => {
        const map = new Map<string, Job>();
        prev.forEach((j) => map.set(j.id, j));
        importedJobs.forEach((j) => map.set(j.id, j));
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
      {/* Header following Frontend Design Constitution Top Bar contract */}
      <Header
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onOpenNewJobModal={handleOpenNewJobModal}
        onOpenBackupModal={() => setIsBackupModalOpen(true)}
        reminderCount={urgentCount}
        onToggleReminderDrawer={() => setIsReminderDrawerOpen(!isReminderDrawerOpen)}
        soundEnabled={settings.soundEnabled}
        onToggleSound={handleToggleSound}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
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
