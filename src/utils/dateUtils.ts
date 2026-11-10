/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Job } from '../types/job';

// Normalizes a date to YYYY-MM-DD
export function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getTomorrowString(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const year = tomorrow.getFullYear();
  const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
  const day = String(tomorrow.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addDays(days: number): string {
  const target = new Date();
  target.setDate(target.getDate() + days);
  const year = target.getFullYear();
  const month = String(target.getMonth() + 1).padStart(2, '0');
  const day = String(target.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Difference in calendar days between targetDate and today
export function getDaysDiff(targetDateStr: string): number {
  if (!targetDateStr) return 999;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [y, m, d] = targetDateStr.split('-').map(Number);
  const target = new Date(y, m - 1, d);
  target.setHours(0, 0, 0, 0);

  const diffTime = target.getTime() - today.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

export function isJobToday(dateStr: string): boolean {
  return getDaysDiff(dateStr) === 0;
}

export function isJobTomorrow(dateStr: string): boolean {
  return getDaysDiff(dateStr) === 1;
}

export function isJobOverdue(dateStr: string, status?: string): boolean {
  if (status === 'completed' || status === 'cancelled') return false;
  return getDaysDiff(dateStr) < 0;
}

export function isJobThisWeek(dateStr: string): boolean {
  const diff = getDaysDiff(dateStr);
  return diff >= 0 && diff <= 7;
}

// Format friendly date
export function formatFriendlyDate(dateStr: string, timeStr?: string): string {
  if (!dateStr) return '—';
  const diff = getDaysDiff(dateStr);

  const [y, m, d] = dateStr.split('-').map(Number);
  const dateObj = new Date(y, m - 1, d);

  let prefix = '';
  if (diff < 0) {
    prefix = `${Math.abs(diff)}d overdue`;
  } else if (diff === 0) {
    prefix = 'Today';
  } else if (diff === 1) {
    prefix = 'Tomorrow';
  } else if (diff === 2) {
    prefix = 'In 2 days';
  } else if (diff <= 7) {
    prefix = `In ${diff} days`;
  }

  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
  const formattedStandard = dateObj.toLocaleDateString('en-US', options);

  let timeFormatted = '';
  if (timeStr) {
    const [h, min] = timeStr.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 || 12;
    timeFormatted = ` ${displayH}:${String(min).padStart(2, '0')} ${period}`;
  }

  if (prefix && (diff <= 1 && diff >= 0)) {
    return `${prefix}${timeFormatted ? ` • ${timeFormatted}` : ''}`;
  }

  return `${formattedStandard}${timeFormatted ? ` • ${timeFormatted}` : ''}`;
}

// Generate pre-filled WhatsApp link
export function createWhatsAppLink(job: Job): string {
  const cleanNumber = job.mobile.replace(/[^0-9]/g, '');
  if (!cleanNumber) return '#';

  const dateText = formatFriendlyDate(job.nextVisitDate, job.nextVisitTime);
  const techText = job.technicianName
    ? ` Assigned Technician: ${job.technicianName}${job.technicianMobile ? ` (${job.technicianMobile})` : ''}.`
    : '';

  const text = `Hello ${job.clientName}, this is a gentle reminder from Home Hub regarding your scheduled visit (${job.visitType} visit) on ${dateText} at ${job.address}.${techText} Thank you!`;

  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(text)}`;
}

// Sort jobs by next visit date ascending
export function sortJobsByNextVisit(jobs: Job[]): Job[] {
  return [...jobs].sort((a, b) => {
    // If one is completed and one is pending, keep pending on top
    if (a.status === 'completed' && b.status !== 'completed') return 1;
    if (a.status !== 'completed' && b.status === 'completed') return -1;

    // Compare date + time
    const aDateTime = `${a.nextVisitDate || '9999-99-99'}T${a.nextVisitTime || '00:00'}`;
    const bDateTime = `${b.nextVisitDate || '9999-99-99'}T${b.nextVisitTime || '00:00'}`;
    return aDateTime.localeCompare(bDateTime);
  });
}
