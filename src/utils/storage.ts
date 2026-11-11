/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Job, Technician } from '../types/job';
import { getTodayString, addDays } from './dateUtils';

const STORAGE_KEY = 'home_hub_jobs_v1';
const SETTINGS_KEY = 'home_hub_settings_v1';
const TECHNICIANS_STORAGE_KEY = 'home_hub_technicians_v1';

export interface AppSettings {
  soundEnabled: boolean;
  currency: string;
}

export const DEFAULT_SETTINGS: AppSettings = {
  soundEnabled: true,
  currency: '£',
};

export const DEFAULT_TECHNICIANS: Technician[] = [
  { id: 'tech-1', name: 'Sabbir Hossain', mobile: '+44 7700 900123', specialty: 'Heating & Gas Safe', email: 'sabbir@homehub.uk' },
  { id: 'tech-2', name: 'Farhan Ali', mobile: '+44 7700 900456', specialty: 'Plumbing & Drainage', email: 'farhan@homehub.uk' },
  { id: 'tech-3', name: 'Kamrul Islam', mobile: '+44 7700 900789', specialty: 'Electrical & NICEIC Safety', email: 'kamrul@homehub.uk' },
  { id: 'tech-4', name: 'Mehedi Hasan', mobile: '+44 7700 900321', specialty: 'HVAC & Ventilation', email: 'mehedi@homehub.uk' },
];

export function loadTechnicians(): Technician[] {
  try {
    const raw = localStorage.getItem(TECHNICIANS_STORAGE_KEY);
    if (!raw) {
      saveTechnicians(DEFAULT_TECHNICIANS);
      return DEFAULT_TECHNICIANS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return DEFAULT_TECHNICIANS;
  } catch {
    return DEFAULT_TECHNICIANS;
  }
}

export function saveTechnicians(technicians: Technician[]): void {
  try {
    localStorage.setItem(TECHNICIANS_STORAGE_KEY, JSON.stringify(technicians));
  } catch (e) {
    console.error('Failed to save technicians to localStorage:', e);
  }
}

// Seed sample data for Home Hub with current dynamic dates & GBP pricing
export function getInitialSeedJobs(): Job[] {
  return [];
}

export function loadJobs(): Job[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getInitialSeedJobs();
      saveJobs(initial);
      return initial;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Normalize currency strictly to GBP (£) as per user instruction
      const normalized = parsed.map((j: Job) => ({
        ...j,
        currency: '£',
      }));
      return normalized;
    }
    return getInitialSeedJobs();
  } catch {
    return getInitialSeedJobs();
  }
}

export function saveJobs(jobs: Job[]): void {
  try {
    // Strictly enforce GBP currency
    const normalized = jobs.map((j) => ({ ...j, currency: '£' }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  } catch (e) {
    console.error('Failed to save jobs to localStorage:', e);
  }
}

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw), currency: '£' };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...settings, currency: '£' }));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
}

// Export jobs to CSV
export function exportJobsToCSV(jobs: Job[]): void {
  const headers = [
    'Client Name',
    'Address',
    'Mobile',
    'Email',
    'Visit Type',
    'Price',
    'Currency',
    'Job Date',
    'Job Time',
    'Next Visit Date',
    'Next Visit Time',
    'Technician Name',
    'Technician Mobile',
    'Status',
    'Notes',
  ];

  const rows = jobs.map((j) => [
    `"${(j.clientName || '').replace(/"/g, '""')}"`,
    `"${(j.address || '').replace(/"/g, '""')}"`,
    `"${(j.mobile || '').replace(/"/g, '""')}"`,
    `"${(j.email || '').replace(/"/g, '""')}"`,
    `"${j.visitType}"`,
    j.price,
    `"${j.currency}"`,
    `"${j.jobDate}"`,
    `"${j.jobTime}"`,
    `"${j.nextVisitDate}"`,
    `"${j.nextVisitTime}"`,
    `"${(j.technicianName || '').replace(/"/g, '""')}"`,
    `"${(j.technicianMobile || '').replace(/"/g, '""')}"`,
    `"${j.status}"`,
    `"${(j.notes || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `home_hub_jobs_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Export jobs to JSON backup
export function exportJobsToJSON(jobs: Job[]): void {
  const jsonStr = JSON.stringify(jobs, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `home_hub_backup_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
