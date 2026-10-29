import React, { useState, useRef } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { RAW_CSV_DATA } from '../data/initialData.js';
import { parseAttendanceCSV } from '../utils/csvParser.js';
import { 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Download, 
  Sparkles, 
  Calendar, 
  Building2, 
  Clock, 
  ShieldCheck,
  Users
} from 'lucide-react';

export default function UploadModal({ isOpen, onClose }) {
  const { setAttendanceData, refreshFromBackend } = useAttendance();
  const [dragActive, setDragActive] = useState(false);
  const [fileContent, setFileContent] = useState('');
  const [fileName, setFileName] = useState('');
  const [previewInfo, setPreviewInfo] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFile = (file) => {
    if (!file) return;
    if (!file.name.endsWith('.csv') && !file.name.endsWith('.txt')) {
      setErrorMessage('Please upload a valid CSV file (.csv)');
      return;
    }
    setFileName(file.name);
    setErrorMessage('');

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      setFileContent(text);
      validateAndPreview(text);
    };
    reader.readAsText(file);
  };

  const validateAndPreview = (text) => {
    try {
      const parsed = parseAttendanceCSV(text);
      if (!parsed.employees || parsed.employees.length === 0) {
        setErrorMessage('File does not seem to contain valid employee biometric blocks ("Emp. Code:"). Please check the CSV format.');
        setPreviewInfo(null);
      } else {
        setPreviewInfo({
          recordCount: parsed.employees.length,
          detectedMonth: parsed.detectedMonth,
          detectedYear: parsed.detectedYear,
          formattedPeriod: parsed.formattedPeriod,
          monthKey: parsed.monthKey,
          dateRange: parsed.dateRange,
          totalDays: parsed.totalDays,
          company: parsed.company || 'MOHALI',
          printedOn: parsed.printedOn || 'Biometric Print Stamp Detected',
          lastSundayNum: parsed.lastSundayNum,
          departments: parsed.departments || ['MOHALI'],
          parsedData: parsed
        });
        setErrorMessage('');
      }
    } catch (err) {
      setErrorMessage('Error parsing biometric CSV content: ' + err.message);
      setPreviewInfo(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleApply = async () => {
    if (!previewInfo || !previewInfo.parsedData) {
      setErrorMessage('Please select or load a valid CSV file first.');
      return;
    }

    setIsUploading(true);
    try {
      // Ingest live into context so all dashboards update immediately
      if (setAttendanceData) {
        setAttendanceData(previewInfo.parsedData);
      }
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setIsUploading(false);
        onClose();
      }, 1200);
    } catch (err) {
      setIsUploading(false);
      setErrorMessage(err.message || 'Failed to apply attendance sheet.');
    }
  };

  const loadDefaultSample = () => {
    setFileName('sample-biometric-attendance.csv');
    setFileContent(RAW_CSV_DATA);
    validateAndPreview(RAW_CSV_DATA);
  };

  const downloadSampleFile = () => {
    const blob = new Blob([RAW_CSV_DATA], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'sample-biometric-attendance.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">Upload Biometric Attendance Sheet</h3>
              <p className="text-xs text-slate-500">Automated month detection & policy compliance verification</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          
          {/* Dropzone */}
          <div
            onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
            onDragOver={(e) => { e.preventDefault(); }}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
              dragActive 
                ? 'border-indigo-600 bg-indigo-50/50' 
                : 'border-slate-300 bg-slate-50 hover:border-indigo-500 hover:bg-white'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.txt"
              className="hidden"
              onChange={(e) => e.target.files && handleFile(e.target.files[0])}
            />

            <Upload className="w-9 h-9 text-indigo-600 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-800">
              {fileName ? fileName : 'Click to browse or drag & drop CSV file here'}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Supports biometric export (`Monthly Status Report (Basic Work Duration)`)
            </p>
          </div>

          {/* Quick Actions Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <span className="text-slate-600 font-medium">Need the exact biometric format?</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={loadDefaultSample}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Preload Demo CSV</span>
              </button>
              <button
                type="button"
                onClick={downloadSampleFile}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 font-semibold border border-slate-200 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Sample</span>
              </button>
            </div>
          </div>

          {/* Auto-Detected Month & Header Verification Box */}
          {previewInfo && (
            <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-200 text-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-indigo-900 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Report Header & Month Auto-Detected</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-600 text-white shadow-xs">
                  {previewInfo.formattedPeriod}
                </span>
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 gap-2 text-slate-700 pt-1">
                <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-indigo-100">
                  <Calendar className="w-4 h-4 text-indigo-600 shrink-0" />
                  <div>
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">Reporting Period</div>
                    <div className="font-bold text-slate-800 text-[11px]">{previewInfo.dateRange}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-indigo-100">
                  <Building2 className="w-4 h-4 text-indigo-600 shrink-0" />
                  <div>
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">Company / Location</div>
                    <div className="font-bold text-slate-800 text-[11px]">{previewInfo.company}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-indigo-100">
                  <Users className="w-4 h-4 text-indigo-600 shrink-0" />
                  <div>
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">Staff Ingested</div>
                    <div className="font-bold text-slate-800 text-[11px]">{previewInfo.recordCount} Employees ({previewInfo.totalDays} Days)</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-indigo-100">
                  <Clock className="w-4 h-4 text-indigo-600 shrink-0" />
                  <div>
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">Biometric Printed Stamp</div>
                    <div className="font-bold text-slate-800 text-[11px] truncate max-w-[170px]" title={previewInfo.printedOn}>{previewInfo.printedOn}</div>
                  </div>
                </div>
              </div>

              {/* Policy Rules Auto-Enforced Confirmation */}
              <div className="p-2.5 rounded-lg bg-white/80 border border-indigo-100 space-y-1 text-[11px] text-slate-600">
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Company Rules Automatically Enforced For {previewInfo.formattedPeriod}:</span>
                </div>
                <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-600 pl-5">
                  <div>• <strong>1st Day</strong> = Auto Week Off (WO)</div>
                  <div>• <strong>Sundays</strong> = Auto Week Off (WO)</div>
                  <div>• <strong>Last Sunday (Day {previewInfo.lastSundayNum})</strong> = Mandatory WORKING Day</div>
                  <div>• <strong>Zero Leaves Policy</strong> = Tracking 4-Offs allowance</div>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Notification */}
          {isSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-xs font-bold text-emerald-800 text-center animate-pulse">
              Attendance sheet for {previewInfo?.formattedPeriod || 'detected period'} successfully applied! Updating all dashboards...
            </div>
          )}

          {/* Footer actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              disabled={!previewInfo || isUploading}
              className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2"
            >
              {isUploading ? 'Applying Attendance...' : `Apply & Sync ${previewInfo?.detectedMonth || 'Sheet'}`}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}

