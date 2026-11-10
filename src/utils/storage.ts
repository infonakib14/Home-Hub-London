/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Job } from '../types/job';
import { getTodayString, addDays } from './dateUtils';

const STORAGE_KEY = 'home_hub_jobs_v1';
const SETTINGS_KEY = 'home_hub_settings_v1';

export interface AppSettings {
  soundEnabled: boolean;
  currency: string;
}

export const DEFAULT_SETTINGS: AppSettings = {
  soundEnabled: true,
  currency: '৳',
};

export const DEFAULT_TECHNICIANS = [
  { name: 'Sabbir Hossain', mobile: '+880 1712 345678', specialty: 'AC & Cooling' },
  { name: 'Farhan Ali', mobile: '+880 1819 876543', specialty: 'Plumbing & Gas' },
  { name: 'Kamrul Islam', mobile: '+880 1678 112233', specialty: 'Electrical & Safety' },
  { name: 'Mehedi Hasan', mobile: '+880 1914 556677', specialty: 'Pest Control & Clean' },
];

// Seed sample data for Home Hub with current dynamic dates
export function getInitialSeedJobs(): Job[] {
  const today = getTodayString();
  const tomorrow = addDays(1);
  const in3Days = addDays(3);
  const in6Days = addDays(6);
  const overdueDate = addDays(-2);

  return [
    {
      id: 'job-101',
      clientName: 'Tanvir Chowdhury',
      address: 'House 24, Road 7, Sector 3, Sylhet',
      email: 'tanvir.chowdhury@gmail.com',
      mobile: '+880 1711 452981',
      visitType: '1st',
      price: 2500,
      currency: '৳',
      jobDate: addDays(-7),
      jobTime: '10:00',
      nextVisitDate: today,
      nextVisitTime: '11:30',
      technicianName: 'Sabbir Hossain',
      technicianMobile: '+880 1712 345678',
      status: 'scheduled',
      notes: 'Initial AC deep cleaning and gas pressure measurement. Follow up required today.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'job-102',
      clientName: 'Mrs. Farzana Rahman',
      address: 'Flat 6A, Green Valley Tower, Lamabazar, Sylhet',
      email: 'farzana.r@outlook.com',
      mobile: '+880 1819 873412',
      visitType: '2nd',
      price: 1800,
      currency: '৳',
      jobDate: addDays(-14),
      jobTime: '14:00',
      nextVisitDate: today,
      nextVisitTime: '15:00',
      technicianName: 'Farhan Ali',
      technicianMobile: '+880 1819 876543',
      status: 'scheduled',
      notes: 'Plumbing leak fix re-check & secondary sealant application.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'job-103',
      clientName: 'Engr. Mahfuzur Khan',
      address: 'Plot 12, Upashahar Block D, Sylhet',
      email: 'mahfuz.engr@gmail.com',
      mobile: '+880 1675 221094',
      visitType: 'inspection',
      price: 3200,
      currency: '৳',
      jobDate: addDays(-10),
      jobTime: '11:00',
      nextVisitDate: tomorrow,
      nextVisitTime: '10:00',
      technicianName: 'Kamrul Islam',
      technicianMobile: '+880 1678 112233',
      status: 'scheduled',
      notes: 'Whole house electrical safety inspection & DB box check.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'job-104',
      clientName: 'Dr. Shahriar Alam',
      address: 'House 5, VIP Road, Zindabazar, Sylhet',
      email: 'dr.shahriar@yahoo.com',
      mobile: '+880 1912 334455',
      visitType: 'monthly',
      price: 4500,
      currency: '৳',
      jobDate: addDays(-30),
      jobTime: '16:00',
      nextVisitDate: in3Days,
      nextVisitTime: '14:30',
      technicianName: 'Farhan Ali',
      technicianMobile: '+880 1819 876543',
      status: 'scheduled',
      notes: 'Routine water filtration & RO filter replacement maintenance.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'job-105',
      clientName: 'Al-Haj Kabir Uddin',
      address: 'Shahi Eidgah Road, Sylhet',
      email: 'kabir.uddin@business.com',
      mobile: '+880 1715 998877',
      visitType: 'quarterly',
      price: 6000,
      currency: '৳',
      jobDate: addDays(-80),
      jobTime: '09:30',
      nextVisitDate: in6Days,
      nextVisitTime: '11:00',
      technicianName: 'Mehedi Hasan',
      technicianMobile: '+880 1914 556677',
      status: 'scheduled',
      notes: 'Quarterly pest control and anti-termite perimeter spray.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'job-106',
      clientName: 'Salma Begum',
      address: 'Avenue 3, Kumarpara, Sylhet',
      email: 'salma.b@gmail.com',
      mobile: '+880 1552 114477',
      visitType: 'final',
      price: 3800,
      currency: '৳',
      jobDate: addDays(-20),
      jobTime: '12:00',
      nextVisitDate: overdueDate,
      nextVisitTime: '16:00',
      technicianName: 'Sabbir Hossain',
      technicianMobile: '+880 1712 345678',
      status: 'scheduled',
      notes: 'Final handover inspection for kitchen chimney duct fitting.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'job-107',
      clientName: 'Rafiqul Islam',
      address: 'House 88, Shibganj, Sylhet',
      email: 'rafiqul.isl@gmail.com',
      mobile: '+880 1713 002233',
      visitType: '1st',
      price: 1500,
      currency: '৳',
      jobDate: addDays(-25),
      jobTime: '15:00',
      nextVisitDate: addDays(-5),
      nextVisitTime: '16:00',
      technicianName: 'Kamrul Islam',
      technicianMobile: '+880 1678 112233',
      status: 'completed',
      notes: 'Geyser installation completed and verified.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
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
      return parsed;
    }
    return getInitialSeedJobs();
  } catch {
    return getInitialSeedJobs();
  }
}

export function saveJobs(jobs: Job[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
  } catch (e) {
    console.error('Failed to save jobs to localStorage:', e);
  }
}

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
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
