import React, { useState, useRef } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { RAW_CSV_DATA } from '../data/initialData';
import { Upload, FileText, CheckCircle2, AlertCircle, X, Download, RefreshCw, Sparkles } from 'lucide-react';

export default function UploadModal({ isOpen, onClose }) {
  const { uploadCSV, attendanceData } = useAttendance();
  const [dragActive, setDragActive] = useState(false);
  const [fileContent, setFileContent] = useState('');
  const [fileName, setFileName] = useState('');
  const [previewInfo, setPreviewInfo] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
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
      const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
      let count = 0;
      for (const line of lines) {
        if (line.includes('Emp. Code:')) count++;
      }
      if (count === 0) {
        setErrorMessage('File does not seem to contain "Emp. Code:" records. Please ensure it is the biometric Monthly Status Report.');
        setPreviewInfo(null);
      } else {
        setPreviewInfo({
          recordCount: count,
          lineCount: lines.length,
          hasHeader: text.includes('Monthly Status Report')
        });
        setErrorMessage('');
      }
    } catch (err) {
      setErrorMessage('Error reading CSV content: ' + err.message);
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

  const handleApply = () => {
    if (!fileContent) {
      setErrorMessage('Please select or load a CSV file first.');
      return;
    }
    const res = uploadCSV(fileContent);
    if (res.success) {
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1000);
    } else {
      setErrorMessage(res.error || 'Failed to parse CSV file.');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-100">Upload Biometric Attendance Sheet</h3>
              <p className="text-xs text-slate-400">Automated multi-department ingestion with policy rules</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
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
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
              dragActive 
                ? 'border-indigo-500 bg-indigo-500/10' 
                : 'border-slate-700 bg-slate-950/60 hover:border-slate-500 hover:bg-slate-950'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.txt"
              className="hidden"
              onChange={(e) => e.target.files && handleFile(e.target.files[0])}
            />

            <Upload className="w-10 h-10 text-indigo-400 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-200">
              {fileName ? fileName : 'Click to browse or drag & drop CSV file here'}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Supports raw biometric exported sheets (`Monthly Status Report (Basic Work Duration)`)
            </p>
          </div>

          {/* Quick Actions Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-400">Need the exact biometric format?</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={loadDefaultSample}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white font-medium transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Preload Demo CSV</span>
              </button>
              <button
                type="button"
                onClick={downloadSampleFile}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Sample</span>
              </button>
            </div>
          </div>

          {/* Preview Info */}
          {previewInfo && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs space-y-1">
              <div className="flex items-center gap-2 font-semibold text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>Valid Attendance Structure Detected</span>
              </div>
              <p className="text-slate-300">
                Found <strong className="text-white">{previewInfo.recordCount} employee blocks</strong> with In/Out timings across 30 days.
              </p>
              <p className="text-[11px] text-slate-400">
                Automatic policies will be enforced: 1st Date set to WO, and Last Sunday set to WORKING day.
              </p>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Notification */}
          {isSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-xs font-semibold text-emerald-300 text-center animate-pulse">
              Attendance sheet successfully ingested! Updating all portals...
            </div>
          )}

          {/* Footer actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              disabled={!fileContent}
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/30"
            >
              Ingest & Apply To All Dashboards
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
