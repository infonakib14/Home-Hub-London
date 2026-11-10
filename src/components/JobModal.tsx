/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Job, VisitType, JobStatus } from '../types/job';
import {
  X,
  Calendar,
  Clock,
  DollarSign,
  User,
  Phone,
  Mail,
  MapPin,
  FileText,
  CheckCircle2,
  Wrench,
} from 'lucide-react';
import { getTodayString, addDays } from '../utils/dateUtils';
import { DEFAULT_TECHNICIANS } from '../utils/storage';
import { translations } from '../utils/translations';

interface JobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (jobData: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>, id?: string) => void;
  initialJob?: Job | null;
}

const VISIT_TYPES: VisitType[] = ['1st', '2nd', 'final', 'monthly', 'quarterly', 'inspection'];

export const JobModal: React.FC<JobModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialJob,
}) => {
  const t = translations.en;

  const [clientName, setClientName] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [visitType, setVisitType] = useState<VisitType>('1st');
  const [price, setPrice] = useState<string>('2000');
  const [currency, setCurrency] = useState('৳');
  const [jobDate, setJobDate] = useState(getTodayString());
  const [jobTime, setJobTime] = useState('10:00');
  const [nextVisitDate, setNextVisitDate] = useState(addDays(7));
  const [nextVisitTime, setNextVisitTime] = useState('11:00');
  const [technicianName, setTechnicianName] = useState('Sabbir Hossain');
  const [technicianMobile, setTechnicianMobile] = useState('+880 1712 345678');
  const [status, setStatus] = useState<JobStatus>('scheduled');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialJob) {
      setClientName(initialJob.clientName || '');
      setAddress(initialJob.address || '');
      setEmail(initialJob.email || '');
      setMobile(initialJob.mobile || '');
      setVisitType(initialJob.visitType || '1st');
      setPrice(initialJob.price ? String(initialJob.price) : '0');
      setCurrency(initialJob.currency || '৳');
      setJobDate(initialJob.jobDate || getTodayString());
      setJobTime(initialJob.jobTime || '10:00');
      setNextVisitDate(initialJob.nextVisitDate || addDays(7));
      setNextVisitTime(initialJob.nextVisitTime || '11:00');
      setTechnicianName(initialJob.technicianName || '');
      setTechnicianMobile(initialJob.technicianMobile || '');
      setStatus(initialJob.status || 'scheduled');
      setNotes(initialJob.notes || '');
    } else {
      // Default reset
      setClientName('');
      setAddress('');
      setEmail('');
      setMobile('');
      setVisitType('1st');
      setPrice('2000');
      setCurrency('৳');
      setJobDate(getTodayString());
      setJobTime('10:00');
      setNextVisitDate(addDays(7));
      setNextVisitTime('11:00');
      setTechnicianName('Sabbir Hossain');
      setTechnicianMobile('+880 1712 345678');
      setStatus('scheduled');
      setNotes('');
    }
    setErrors({});
  }, [initialJob, isOpen]);

  if (!isOpen) return null;

  const handleApplyPreset = (days: number) => {
    setNextVisitDate(addDays(days));
  };

  const handleSelectTech = (tech: { name: string; mobile: string }) => {
    setTechnicianName(tech.name);
    setTechnicianMobile(tech.mobile);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!clientName.trim()) {
      newErrors.clientName = 'Client name is required';
    }
    if (!mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
    }
    if (!address.trim()) {
      newErrors.address = 'Address is required';
    }
    if (!nextVisitDate) {
      newErrors.nextVisitDate = 'Next visit date is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave(
      {
        clientName: clientName.trim(),
        address: address.trim(),
        email: email.trim(),
        mobile: mobile.trim(),
        visitType,
        price: parseFloat(price) || 0,
        currency,
        jobDate,
        jobTime,
        nextVisitDate,
        nextVisitTime,
        technicianName: technicianName.trim(),
        technicianMobile: technicianMobile.trim(),
        status,
        notes: notes.trim(),
      },
      initialJob?.id
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div
        className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/70">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              {initialJob ? 'Edit Job & Visit' : 'New Job Booking & Visit Schedule'}
            </h2>
            <p className="text-xs text-slate-500">
              Enter client details, visit type, technician, and next reminder date
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[78vh] overflow-y-auto">
          {/* Row 1: Client Name & Mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>{t.clientName}</span>
                <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g. Tanvir Ahmed"
                className={`w-full px-3 py-2 text-sm rounded-lg border bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-[#14532d] transition-colors ${
                  errors.clientName ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                }`}
              />
              {errors.clientName && <p className="text-[11px] text-rose-500 mt-0.5">{errors.clientName}</p>}
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{t.mobile}</span>
                <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="e.g. +880 1711 234567"
                className={`w-full px-3 py-2 text-sm rounded-lg border bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-[#14532d] transition-colors ${
                  errors.mobile ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                }`}
              />
              {errors.mobile && <p className="text-[11px] text-rose-500 mt-0.5">{errors.mobile}</p>}
            </div>
          </div>

          {/* Row 2: Address & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{t.address}</span>
                <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Flat 4B, Road 12, Upashahar"
                className={`w-full px-3 py-2 text-sm rounded-lg border bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-[#14532d] transition-colors ${
                  errors.address ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                }`}
              />
              {errors.address && <p className="text-[11px] text-rose-500 mt-0.5">{errors.address}</p>}
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{t.email}</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="client@example.com (optional)"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-[#14532d] transition-colors"
              />
            </div>
          </div>

          {/* Row 3: Assigned Technician Info */}
          <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-[#14532d]" />
                <h4 className="text-xs font-bold text-[#14532d] uppercase tracking-wide">
                  Assigned Technician
                </h4>
              </div>
              <span className="text-[11px] text-emerald-800">Field visit staff</span>
            </div>

            {/* Quick selector chips */}
            <div className="flex flex-wrap items-center gap-1.5 mb-3">
              <span className="text-[11px] font-semibold text-slate-600 mr-1">Quick Select:</span>
              {DEFAULT_TECHNICIANS.map((tech) => (
                <button
                  key={tech.name}
                  type="button"
                  onClick={() => handleSelectTech(tech)}
                  className={`px-2.5 py-1 text-xs rounded-md border transition-all ${
                    technicianName === tech.name
                      ? 'bg-[#14532d] text-white border-[#14532d] font-semibold shadow-xs'
                      : 'bg-white text-slate-700 border-emerald-300 hover:bg-emerald-100/60'
                  }`}
                >
                  {tech.name}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Technician Name
                </label>
                <input
                  type="text"
                  value={technicianName}
                  onChange={(e) => setTechnicianName(e.target.value)}
                  placeholder="e.g. Sabbir Hossain"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-[#14532d] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Technician Mobile
                </label>
                <input
                  type="tel"
                  value={technicianMobile}
                  onChange={(e) => setTechnicianMobile(e.target.value)}
                  placeholder="e.g. +880 1712 345678"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-[#14532d] transition-colors font-mono tabular-nums"
                />
              </div>
            </div>
          </div>

          {/* Row 4: Visit Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              <span>{t.visitType}</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {VISIT_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setVisitType(type)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all text-left flex items-center justify-between ${
                    visitType === type
                      ? 'bg-emerald-50 border-[#14532d] text-[#14532d] shadow-xs'
                      : 'border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <span>{t.visitTypes[type]}</span>
                  {visitType === type && <CheckCircle2 className="w-3.5 h-3.5 text-[#14532d]" />}
                </button>
              ))}
            </div>
          </div>

          {/* Row 5: Price & Currency & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1">
                <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                <span>{t.price}</span>
              </label>
              <div className="flex gap-2">
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="px-2.5 py-2 text-sm font-semibold border border-slate-300 rounded-lg bg-slate-50"
                >
                  <option value="৳">৳ (BDT)</option>
                  <option value="$">$ (USD)</option>
                  <option value="£">£ (GBP)</option>
                  <option value="€">€ (EUR)</option>
                </select>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="2500"
                  className="flex-1 px-3 py-2 text-sm font-mono tabular-nums rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-[#14532d] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.status}
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as JobStatus)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-[#14532d] transition-colors"
              >
                <option value="scheduled">{t.statusTypes.scheduled}</option>
                <option value="in_progress">{t.statusTypes.in_progress}</option>
                <option value="completed">{t.statusTypes.completed}</option>
                <option value="cancelled">{t.statusTypes.cancelled}</option>
              </select>
            </div>
          </div>

          {/* Row 6: Job Date & Job Time */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Current Job Schedule
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="flex items-center gap-1.5 text-xs text-slate-600 mb-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{t.jobDate}</span>
                </label>
                <input
                  type="date"
                  value={jobDate}
                  onChange={(e) => setJobDate(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
                />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-xs text-slate-600 mb-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{t.jobTime}</span>
                </label>
                <input
                  type="time"
                  value={jobTime}
                  onChange={(e) => setJobTime(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
                />
              </div>
            </div>
          </div>

          {/* Row 7: NEXT VISIT DATE & TIME */}
          <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-700" />
                <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                  {t.nextVisitDate} & {t.nextVisitTime} (Reminder)
                </h4>
              </div>
              <span className="text-[11px] text-amber-700 font-medium">
                Triggers Smart Reminder
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2.5">
              <div>
                <input
                  type="date"
                  value={nextVisitDate}
                  onChange={(e) => setNextVisitDate(e.target.value)}
                  className={`w-full px-3 py-2 text-sm font-mono font-semibold rounded-lg border bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 ${
                    errors.nextVisitDate ? 'border-rose-400' : 'border-amber-300'
                  }`}
                />
                {errors.nextVisitDate && <p className="text-[11px] text-rose-500 mt-0.5">{errors.nextVisitDate}</p>}
              </div>

              <div>
                <input
                  type="time"
                  value={nextVisitTime}
                  onChange={(e) => setNextVisitTime(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-mono font-semibold rounded-lg border border-amber-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                />
              </div>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] font-semibold text-amber-800 mr-1">
                Quick Presets:
              </span>
              <button
                type="button"
                onClick={() => handleApplyPreset(7)}
                className="px-2.5 py-1 text-xs font-medium text-amber-900 bg-white hover:bg-amber-100/60 border border-amber-300 rounded-md transition-colors"
              >
                {t.quickPreset7}
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset(14)}
                className="px-2.5 py-1 text-xs font-medium text-amber-900 bg-white hover:bg-amber-100/60 border border-amber-300 rounded-md transition-colors"
              >
                {t.quickPreset14}
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset(30)}
                className="px-2.5 py-1 text-xs font-medium text-amber-900 bg-white hover:bg-amber-100/60 border border-amber-300 rounded-md transition-colors"
              >
                {t.quickPreset30}
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset(90)}
                className="px-2.5 py-1 text-xs font-medium text-amber-900 bg-white hover:bg-amber-100/60 border border-amber-300 rounded-md transition-colors"
              >
                {t.quickPreset90}
              </button>
            </div>
          </div>

          {/* Row 8: Notes */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>{t.notes}</span>
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Needs 1.5 ton AC outdoor coil washing, check gas leakage..."
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-[#14532d] transition-colors resize-none"
            />
          </div>

          {/* Footer Buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-[#14532d] hover:bg-[#166534] active:bg-[#0f3d20] rounded-lg shadow-xs transition-colors"
            >
              {t.saveJob}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
