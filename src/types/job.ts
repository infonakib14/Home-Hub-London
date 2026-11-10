/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type VisitType = '1st' | '2nd' | 'final' | 'monthly' | 'quarterly' | 'inspection';

export type JobStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

export interface Job {
  id: string;
  clientName: string;
  address: string;
  email: string;
  mobile: string;
  visitType: VisitType;
  price: number;
  currency: string;
  jobDate: string; // YYYY-MM-DD
  jobTime: string; // HH:mm
  nextVisitDate: string; // YYYY-MM-DD
  nextVisitTime: string; // HH:mm
  technicianName?: string;
  technicianMobile?: string;
  status: JobStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  reminderAcknowledged?: boolean;
}

export type ViewTab = 'dashboard' | 'all-jobs' | 'calendar';

export type DateFilterType = 'all' | 'today' | 'tomorrow' | 'this-week' | 'overdue' | 'completed';
