/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import { Job } from '../types/job';
import {
  X,
  Database,
  Download,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  HardDrive,
  RefreshCw,
} from 'lucide-react';
import { exportJobsToCSV, exportJobsToJSON } from '../utils/storage';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobs: Job[];
  onRestoreJobs: (jobs: Job[], mode: 'replace' | 'merge') => void;
  onResetToDemo: () => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  jobs,
  onRestoreJobs,
  onResetToDemo,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [restoreStatus, setRestoreStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });
  const [restoreMode, setRestoreMode] = useState<'replace' | 'merge'>('replace');

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed) && parsed.length > 0) {
          onRestoreJobs(parsed, restoreMode);
          setRestoreStatus({
            type: 'success',
            message: `Successfully restored ${parsed.length} jobs (${restoreMode === 'replace' ? 'replaced existing' : 'merged with existing'}).`,
          });
        } else {
          setRestoreStatus({
            type: 'error',
            message: 'Invalid backup file format. Expected a list of jobs.',
          });
        }
      } catch {
        setRestoreStatus({
          type: 'error',
          message: 'Failed to read or parse the JSON backup file.',
        });
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div
        className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 text-[#14532d] rounded-lg">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Data Backup & Restore</h2>
              <p className="text-xs text-slate-500">Safeguard and transfer your Home Hub schedule records</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Storage Overview Card */}
          <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <HardDrive className="w-5 h-5 text-[#14532d]" />
              <div>
                <div className="text-xs font-bold text-slate-900">Current Storage Status</div>
                <div className="text-[11px] text-slate-600">Saved securely in browser local storage</div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xl font-bold font-mono tabular-nums text-[#14532d]">
                {jobs.length}
              </span>
              <span className="text-xs text-slate-600 ml-1">Jobs</span>
            </div>
          </div>

          {/* Status Alert */}
          {restoreStatus.type && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                restoreStatus.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}
            >
              {restoreStatus.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <span>{restoreStatus.message}</span>
            </div>
          )}

          {/* Option 1: Backup Exports */}
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
              1. Download Backup
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => exportJobsToJSON(jobs)}
                className="p-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 text-left transition-all flex flex-col justify-between group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-900 group-hover:text-[#14532d]">
                    Full JSON Backup
                  </span>
                  <Download className="w-4 h-4 text-[#14532d]" />
                </div>
                <span className="text-[11px] text-slate-500">
                  Recommended for restoring into Home Hub anytime.
                </span>
              </button>

              <button
                type="button"
                onClick={() => exportJobsToCSV(jobs)}
                className="p-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 text-left transition-all flex flex-col justify-between group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-900 group-hover:text-[#14532d]">
                    Spreadsheet (CSV)
                  </span>
                  <FileSpreadsheet className="w-4 h-4 text-[#14532d]" />
                </div>
                <span className="text-[11px] text-slate-500">
                  Open in Microsoft Excel or Google Sheets.
                </span>
              </button>
            </div>
          </div>

          {/* Option 2: Restore from Backup */}
          <div className="pt-2 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
              2. Restore from File
            </h3>

            {/* Mode selection */}
            <div className="flex items-center gap-4 mb-3 text-xs text-slate-700">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="restoreMode"
                  value="replace"
                  checked={restoreMode === 'replace'}
                  onChange={() => setRestoreMode('replace')}
                  className="text-[#14532d] focus:ring-emerald-600"
                />
                <span>Replace all current records</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="restoreMode"
                  value="merge"
                  checked={restoreMode === 'merge'}
                  onChange={() => setRestoreMode('merge')}
                  className="text-[#14532d] focus:ring-emerald-600"
                />
                <span>Merge with existing</span>
              </label>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2.5 px-4 rounded-xl border border-dashed border-slate-300 hover:border-[#14532d] hover:bg-emerald-50/30 text-slate-700 font-semibold text-xs flex items-center justify-center gap-2 transition-all"
            >
              <Upload className="w-4 h-4 text-[#14532d]" />
              <span>Select Backup File (.json) to Restore</span>
            </button>
          </div>

          {/* Option 3: Reset to sample data */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">Need to reload sample demo records?</span>
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Reset all records to sample demo data? Your current unsaved jobs will be replaced.')) {
                  onResetToDemo();
                  setRestoreStatus({
                    type: 'success',
                    message: 'Reset to standard demo records successfully.',
                  });
                }
              }}
              className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset to Demo Data</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#14532d] hover:bg-[#166534] rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
