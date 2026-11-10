/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ViewTab } from '../types/job';
import {
  Bell,
  Plus,
  Calendar,
  LayoutDashboard,
  ListTodo,
  Volume2,
  VolumeX,
  Database,
} from 'lucide-react';
import { translations } from '../utils/translations';

interface HeaderProps {
  currentTab: ViewTab;
  onTabChange: (tab: ViewTab) => void;
  onOpenNewJobModal: () => void;
  onOpenBackupModal: () => void;
  reminderCount: number;
  onToggleReminderDrawer: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  onOpenNewJobModal,
  onOpenBackupModal,
  reminderCount,
  onToggleReminderDrawer,
  soundEnabled,
  onToggleSound,
}) => {
  const t = translations.en;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-16">
          {/* Zone 1: Brand Wordmark + Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onTabChange('dashboard')}
              className="flex items-center gap-2.5 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 rounded-lg p-1"
            >
              <img
                src="/assets/aistudio/image_5f3c45ce.png"
                alt="Home Hub Logo"
                className="w-10 h-10 object-contain rounded-md border border-emerald-700/20 shadow-xs bg-white"
              />
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tight text-[#134e2a] group-hover:text-emerald-700 transition-colors whitespace-nowrap">
                  Home Hub
                </span>
                <span className="text-[11px] text-emerald-800/80 font-medium whitespace-nowrap hidden sm:inline">
                  Visit & Job Reminders
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation Links (Single-line controls) */}
          <nav className="hidden md:flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl border border-slate-200/60">
            <button
              onClick={() => onTabChange('dashboard')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                currentTab === 'dashboard'
                  ? 'bg-white text-[#134e2a] shadow-xs border border-emerald-200/60 font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutDashboard className={`w-3.5 h-3.5 ${currentTab === 'dashboard' ? 'text-[#14532d]' : ''}`} />
              <span>{t.navHome}</span>
            </button>

            <button
              onClick={() => onTabChange('all-jobs')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                currentTab === 'all-jobs'
                  ? 'bg-white text-[#134e2a] shadow-xs border border-emerald-200/60 font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ListTodo className={`w-3.5 h-3.5 ${currentTab === 'all-jobs' ? 'text-[#14532d]' : ''}`} />
              <span>{t.navJobs}</span>
            </button>

            <button
              onClick={() => onTabChange('calendar')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                currentTab === 'calendar'
                  ? 'bg-white text-[#134e2a] shadow-xs border border-emerald-200/60 font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar className={`w-3.5 h-3.5 ${currentTab === 'calendar' ? 'text-[#14532d]' : ''}`} />
              <span>{t.navCalendar}</span>
            </button>
          </nav>

          {/* Zone 3: Utility Controls & Primary Action CTA */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Data Backup Button */}
            <button
              onClick={onOpenBackupModal}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-900 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 rounded-lg transition-colors whitespace-nowrap"
              title="Backup and restore data"
            >
              <Database className="w-3.5 h-3.5 text-[#14532d]" />
              <span>Backup</span>
            </button>

            {/* Audio chime toggle */}
            <button
              onClick={onToggleSound}
              title={soundEnabled ? t.soundOn : t.soundOff}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-emerald-50/60 rounded-lg transition-colors"
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-emerald-700" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {/* Reminder Bell with Badge */}
            <button
              onClick={onToggleReminderDrawer}
              className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              title="Urgent Reminders"
            >
              <Bell className="w-4 h-4" />
              {reminderCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-4 h-4 px-1 text-[10px] font-bold text-white bg-[#14532d] rounded-full tabular-nums shadow-xs">
                  {reminderCount}
                </span>
              )}
            </button>

            {/* Primary Action Button in Forest Green */}
            <button
              onClick={onOpenNewJobModal}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#14532d] hover:bg-[#166534] active:bg-[#0f3d20] rounded-lg shadow-xs transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>{t.newBookingBtn}</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-100 text-xs">
          <button
            onClick={() => onTabChange('dashboard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium ${
              currentTab === 'dashboard' ? 'text-[#14532d] font-bold bg-emerald-50' : 'text-slate-600'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>{t.navHome}</span>
          </button>
          <button
            onClick={() => onTabChange('all-jobs')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium ${
              currentTab === 'all-jobs' ? 'text-[#14532d] font-bold bg-emerald-50' : 'text-slate-600'
            }`}
          >
            <ListTodo className="w-3.5 h-3.5" />
            <span>{t.navJobs}</span>
          </button>
          <button
            onClick={() => onTabChange('calendar')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium ${
              currentTab === 'calendar' ? 'text-[#14532d] font-bold bg-emerald-50' : 'text-slate-600'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>{t.navCalendar}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
