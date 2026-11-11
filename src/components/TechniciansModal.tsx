/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Technician, Job } from '../types/job';
import {
  X,
  Wrench,
  Plus,
  Phone,
  Mail,
  Edit2,
  Trash2,
  CheckCircle2,
  User,
  Briefcase,
  AlertCircle,
} from 'lucide-react';

interface TechniciansModalProps {
  isOpen: boolean;
  onClose: () => void;
  technicians: Technician[];
  jobs: Job[];
  onAddTechnician: (tech: Omit<Technician, 'id' | 'createdAt'>) => void;
  onUpdateTechnician: (id: string, tech: Partial<Technician>) => void;
  onDeleteTechnician: (id: string) => void;
}

export const TechniciansModal: React.FC<TechniciansModalProps> = ({
  isOpen,
  onClose,
  technicians,
  jobs,
  onAddTechnician,
  onUpdateTechnician,
  onDeleteTechnician,
}) => {
  const [isAddingOrEditing, setIsAddingOrEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const resetForm = () => {
    setName('');
    setMobile('');
    setSpecialty('');
    setEmail('');
    setNotes('');
    setErrors({});
    setEditingId(null);
    setIsAddingOrEditing(false);
  };

  const handleStartAdd = () => {
    resetForm();
    setIsAddingOrEditing(true);
  };

  const handleStartEdit = (tech: Technician) => {
    setName(tech.name);
    setMobile(tech.mobile);
    setSpecialty(tech.specialty || '');
    setEmail(tech.email || '');
    setNotes(tech.notes || '');
    setEditingId(tech.id);
    setErrors({});
    setIsAddingOrEditing(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = 'Technician name is required';
    if (!mobile.trim()) newErrors.mobile = 'Mobile number is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (editingId) {
      onUpdateTechnician(editingId, {
        name: name.trim(),
        mobile: mobile.trim(),
        specialty: specialty.trim() || undefined,
        email: email.trim() || undefined,
        notes: notes.trim() || undefined,
      });
    } else {
      onAddTechnician({
        name: name.trim(),
        mobile: mobile.trim(),
        specialty: specialty.trim() || undefined,
        email: email.trim() || undefined,
        notes: notes.trim() || undefined,
      });
    }

    resetForm();
  };

  // Quick trade suggestions
  const tradeSuggestions = [
    'Heating & Gas Safe',
    'Plumbing & Drainage',
    'Electrical & NICEIC',
    'HVAC & Air Con',
    'Roofing & Gutters',
    'General Maintenance',
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div
        className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 text-[#14532d] rounded-lg">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Technicians & Field Engineers
              </h2>
              <p className="text-xs text-slate-500">
                Manage assigned field staff, contact details, and trade specialties
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 space-y-5 max-h-[78vh] overflow-y-auto">
          {/* Top Bar with Add CTA */}
          {!isAddingOrEditing && (
            <div className="flex items-center justify-between bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-200/70">
              <div>
                <span className="text-xs font-bold text-[#14532d] uppercase tracking-wide block">
                  Staff Roster ({technicians.length})
                </span>
                <span className="text-[11px] text-slate-600">
                  Selectable when booking visits and automatically included in client reminders
                </span>
              </div>
              <button
                onClick={handleStartAdd}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#14532d] hover:bg-[#166534] rounded-lg shadow-xs transition-colors shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add Technician</span>
              </button>
            </div>
          )}

          {/* Add or Edit Form */}
          {isAddingOrEditing && (
            <form
              onSubmit={handleFormSubmit}
              className="p-4 rounded-xl border-2 border-emerald-300 bg-emerald-50/30 space-y-3.5 animate-in fade-in duration-150"
            >
              <div className="flex items-center justify-between border-b border-emerald-200/60 pb-2.5">
                <h3 className="text-xs font-bold text-[#14532d] uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-4 h-4" />
                  <span>{editingId ? 'Edit Technician Information' : 'Add New Technician'}</span>
                </h3>
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-xs text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Technician Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. David Miller"
                    className={`w-full px-3 py-2 text-xs sm:text-sm rounded-lg border bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-[#14532d] ${
                      errors.name ? 'border-rose-400' : 'border-slate-300'
                    }`}
                  />
                  {errors.name && <p className="text-[11px] text-rose-500 mt-0.5">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mobile Phone <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="e.g. +44 7700 900555"
                    className={`w-full px-3 py-2 text-xs sm:text-sm rounded-lg border bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-[#14532d] font-mono tabular-nums ${
                      errors.mobile ? 'border-rose-400' : 'border-slate-300'
                    }`}
                  />
                  {errors.mobile && <p className="text-[11px] text-rose-500 mt-0.5">{errors.mobile}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Specialty / Trade
                </label>
                <input
                  type="text"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  placeholder="e.g. Boiler Servicing & Gas Safe"
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-[#14532d]"
                />
                <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                  <span className="text-[11px] text-slate-500">Suggestions:</span>
                  {tradeSuggestions.map((trade) => (
                    <button
                      key={trade}
                      type="button"
                      onClick={() => setSpecialty(trade)}
                      className="px-2 py-0.5 text-[11px] rounded bg-white hover:bg-emerald-100 border border-slate-200 text-slate-700 transition-colors"
                    >
                      {trade}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="david@homehub.uk"
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-[#14532d]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Internal Notes (Optional)
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Gas Safe ID: 981244"
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-[#14532d]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-[#14532d] hover:bg-[#166534] rounded-lg shadow-xs transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{editingId ? 'Update Technician' : 'Save Technician'}</span>
                </button>
              </div>
            </form>
          )}

          {/* List of Registered Technicians */}
          <div className="space-y-3">
            {technicians.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <AlertCircle className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                <p className="text-xs text-slate-600 font-semibold">No technicians added yet.</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Click "Add Technician" above to create one.</p>
              </div>
            ) : (
              technicians.map((tech) => {
                const assignedJobsCount = jobs.filter(
                  (j) => j.technicianName?.toLowerCase() === tech.name.toLowerCase()
                ).length;

                return (
                  <div
                    key={tech.id}
                    className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{tech.name}</span>
                        {tech.specialty && (
                          <span className="text-[11px] font-semibold text-[#14532d] bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-md">
                            {tech.specialty}
                          </span>
                        )}
                        <span className="text-[11px] text-slate-500 font-mono tabular-nums bg-slate-100 px-1.5 py-0.5 rounded">
                          {assignedJobsCount} {assignedJobsCount === 1 ? 'visit' : 'visits'}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                        <a
                          href={`tel:${tech.mobile}`}
                          className="flex items-center gap-1 font-mono tabular-nums text-[#14532d] hover:underline font-medium"
                          title={`Call ${tech.name}`}
                        >
                          <Phone className="w-3 h-3" />
                          <span>{tech.mobile}</span>
                        </a>

                        {tech.email && (
                          <div className="flex items-center gap-1 text-slate-500">
                            <Mail className="w-3 h-3" />
                            <span>{tech.email}</span>
                          </div>
                        )}

                        {tech.notes && (
                          <div className="flex items-center gap-1 text-slate-500 italic">
                            <Briefcase className="w-3 h-3 text-slate-400" />
                            <span>{tech.notes}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                      <a
                        href={`tel:${tech.mobile}`}
                        className="p-1.5 text-[#14532d] hover:bg-emerald-50 rounded-lg transition-colors border border-emerald-200/60"
                        title="Call technician"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                      <button
                        onClick={() => handleStartEdit(tech)}
                        className="p-1.5 text-slate-500 hover:text-[#14532d] hover:bg-emerald-50 rounded-lg transition-colors border border-slate-200"
                        title="Edit technician details"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to remove ${tech.name}?`)) {
                            onDeleteTechnician(tech.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-slate-200"
                        title="Delete technician"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            Total Technicians: <strong className="font-mono tabular-nums">{technicians.length}</strong>
          </span>
          <button
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
