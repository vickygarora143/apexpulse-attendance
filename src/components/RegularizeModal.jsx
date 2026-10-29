import React, { useState, useEffect } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { 
  X, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle,
  Zap,
  ArrowRight
} from 'lucide-react';

export default function RegularizeModal({ isOpen, onClose, targetEmployee, targetDay, isAdminMode }) {
  const { submitRegularization, directAdminRegularize, attendanceData } = useAttendance();

  const [selectedEmpCode, setSelectedEmpCode] = useState('');
  const [dayNum, setDayNum] = useState(1);
  const [status, setStatus] = useState('P');
  const [inTime, setInTime] = useState('09:30');
  const [outTime, setOutTime] = useState('18:30');
  const [reasonCategory, setReasonCategory] = useState('Biometric Sensor Malfunction');
  const [reasonText, setReasonText] = useState('');
  const [adminRemark, setAdminRemark] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    if (targetEmployee) {
      setSelectedEmpCode(targetEmployee.code);
    } else if (attendanceData.employees.length > 0) {
      setSelectedEmpCode(attendanceData.employees[0].code);
    }

    if (targetDay) {
      setDayNum(targetDay.dayNum);
      if (targetDay.inTime && targetDay.inTime !== '--:--') setInTime(targetDay.inTime);
      if (targetDay.outTime && targetDay.outTime !== '--:--') setOutTime(targetDay.outTime);
      setStatus(targetDay.status === 'A' ? 'P' : targetDay.status);
    }
  }, [targetEmployee, targetDay, attendanceData]);

  if (!isOpen) return null;

  const currentEmp = attendanceData.employees.find(e => e.code === selectedEmpCode) || targetEmployee;

  const calculateDuration = (inT, outT) => {
    if (!inT || !outT) return '09:00';
    const [ih, im] = inT.split(':').map(Number);
    const [oh, om] = outT.split(':').map(Number);
    if (!isNaN(ih) && !isNaN(oh)) {
      let diff = (oh * 60 + om) - (ih * 60 + im);
      if (diff > 0) {
        const h = Math.floor(diff / 60);
        const m = diff % 60;
        return `${h}:${m.toString().padStart(2, '0')}`;
      }
    }
    return '09:00';
  };

  const calculatedHours = calculateDuration(inTime, outTime);
  const [hStr, mStr] = calculatedHours.split(':');
  const durationTotalMinutes = (parseInt(hStr, 10) || 0) * 60 + (parseInt(mStr, 10) || 0);

  // Policy Compliance Checks
  const policyWarnings = [];
  if (dayNum === 1) {
    policyWarnings.push('Day 1 of the month is an automatic Week Off (WO) by company policy. Regularizing requires Admin override.');
  }
  if (dayNum % 7 === 6 && dayNum !== 27) { // Sunday check
    policyWarnings.push(`Day ${dayNum} is a scheduled Sunday Week Off (WO). Only Day 27 (Last Sunday) is a scheduled working day.`);
  }
  if (currentEmp && currentEmp.offsUsed >= 4 && status === 'P') {
    policyWarnings.push(`Employee has consumed ${currentEmp.offsUsed}/4 monthly offs. This regularization will be audited by Operations Admin.`);
  }
  if (durationTotalMinutes < 240) { // less than 4 hours
    policyWarnings.push('Punch duration is under 4 hours. Shifts under 4 hours require supervisor justification.');
  }

  // Quick Preset Auto-Fills (AI Guided Assistant)
  const applyPreset = (presetType) => {
    if (presetType === 'FULL_DAY') {
      setInTime('09:30');
      setOutTime('18:30');
      setReasonCategory('Biometric Sensor Malfunction');
      setReasonText('Completed full regular telecalling shift (9h). Biometric reader did not capture timestamp.');
    } else if (presetType === 'HALF_DAY') {
      setInTime('09:30');
      setOutTime('14:00');
      setReasonCategory('Shift Punch In/Out Sync Issue');
      setReasonText('Completed morning half-shift duty with Team Leader approval.');
    } else if (presetType === 'FIELD_DUTY') {
      setInTime('10:00');
      setOutTime('19:00');
      setReasonCategory('On-Duty / Client Escalation Meeting');
      setReasonText('Assigned to official on-duty operations meeting.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isAdminMode) {
      await directAdminRegularize({
        empCode: selectedEmpCode,
        dayNum: parseInt(dayNum, 10),
        status,
        inTime,
        outTime,
        totalDuration: calculatedHours,
        remarks: adminRemark || `Admin regularized to ${status}: ${reasonCategory}`
      });
      setToastMessage('Attendance successfully regularized by Admin in Cloudflare D1!');
      setTimeout(() => {
        setToastMessage('');
        onClose();
      }, 900);
    } else {
      const fullReason = `${reasonCategory}: ${reasonText.trim() || 'Punch missed during standard working shift.'}`;
      const res = await submitRegularization({
        empCode: selectedEmpCode,
        dayNum: parseInt(dayNum, 10),
        inTime,
        outTime,
        reason: fullReason
      });

      if (res.success) {
        setToastMessage('Request submitted! Sent directly to Admin Dashboard.');
        setTimeout(() => {
          setToastMessage('');
          onClose();
        }, 1100);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden relative max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${isAdminMode ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-indigo-50 text-indigo-700 border border-indigo-200'}`}>
              {isAdminMode ? <ShieldCheck className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">
                {isAdminMode ? 'Direct Admin Attendance Regularization' : 'Attendance & Regularization Assistant'}
              </h3>
              <p className="text-xs text-slate-500">
                {isAdminMode ? 'Direct override stored in Cloudflare D1' : 'Guided submission directly to Chief Admin approval queue'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toast confirmation */}
        {toastMessage && (
          <div className="m-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs overflow-y-auto">
          
          {/* AI Quick Preset Auto-Fills */}
          <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[11px] text-indigo-900 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-indigo-600" />
                <span>AI Guided Auto-Fill (1-Tap):</span>
              </span>
              <span className="text-[10px] text-indigo-600 font-mono">Assisted Fill</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => applyPreset('FULL_DAY')}
                className="px-2.5 py-1 rounded-lg bg-white hover:bg-indigo-100 border border-indigo-200 text-indigo-700 font-semibold text-[11px] transition-colors"
              >
                Standard Shift (09:30 - 18:30)
              </button>
              <button
                type="button"
                onClick={() => applyPreset('HALF_DAY')}
                className="px-2.5 py-1 rounded-lg bg-white hover:bg-indigo-100 border border-indigo-200 text-indigo-700 font-semibold text-[11px] transition-colors"
              >
                Half-Day Shift (09:30 - 14:00)
              </button>
              <button
                type="button"
                onClick={() => applyPreset('FIELD_DUTY')}
                className="px-2.5 py-1 rounded-lg bg-white hover:bg-indigo-100 border border-indigo-200 text-indigo-700 font-semibold text-[11px] transition-colors"
              >
                On-Duty Field Shift
              </button>
            </div>
          </div>

          {/* Employee & Day Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Employee</label>
              {isAdminMode ? (
                <select
                  value={selectedEmpCode}
                  onChange={(e) => setSelectedEmpCode(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                >
                  {attendanceData.employees.map(e => (
                    <option key={e.code} value={e.code}>
                      {e.name} ({e.code}) - {e.department}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-slate-900 font-bold">
                  {currentEmp ? `${currentEmp.name} (${currentEmp.code})` : 'Self'}
                </div>
              )}
            </div>

            {/* Target Day */}
            <div>
              <label className="block text-slate-700 font-bold mb-1">Day of Month</label>
              <select
                value={dayNum}
                onChange={(e) => setDayNum(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 font-mono"
              >
                {Array.from({ length: attendanceData.totalDays || 30 }, (_, i) => i + 1).map(d => {
                  const dayObj = currentEmp?.attendance[d];
                  return (
                    <option key={d} value={d}>
                      Day {d} {dayObj ? `(${dayObj.dayName}) - Current: ${dayObj.status}` : ''}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Admin Status Override Selector */}
          {isAdminMode && (
            <div>
              <label className="block text-slate-700 font-bold mb-1">Set Attendance Status</label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'P (REG)', label: 'Present (REG)', color: 'border-teal-300 bg-teal-50 text-teal-800' },
                  { id: 'P', label: 'Present (P)', color: 'border-emerald-300 bg-emerald-50 text-emerald-800' },
                  { id: 'A', label: 'Absent (A)', color: 'border-rose-300 bg-rose-50 text-rose-800' },
                  { id: 'WO', label: 'Week Off (WO)', color: 'border-blue-300 bg-blue-50 text-blue-800' }
                ].map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setStatus(item.id)}
                    className={`py-2 px-1 text-center rounded-lg border text-[11px] transition-all ${
                      status === item.id 
                        ? `${item.color} ring-2 ring-indigo-600 font-bold` 
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 font-medium'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Punch Timings */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Punch In Time</label>
              <input
                type="time"
                value={inTime}
                onChange={(e) => setInTime(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-600"
                required
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Punch Out Time</label>
              <input
                type="time"
                value={outTime}
                onChange={(e) => setOutTime(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-600"
                required
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Calculated Duration</label>
              <div className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-indigo-700 font-mono font-bold flex items-center justify-center">
                {calculatedHours} hrs
              </div>
            </div>
          </div>

          {/* Reason Category */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">Reason for Regularization</label>
            <select
              value={reasonCategory}
              onChange={(e) => setReasonCategory(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 mb-2"
            >
              <option value="Biometric Sensor Malfunction">Biometric Sensor Malfunction</option>
              <option value="Machine Fingerprint Scanner Timing Error">Machine Fingerprint Scanner Timing Error</option>
              <option value="On-Duty / Client Escalation Meeting">On-Duty / Client Escalation Meeting</option>
              <option value="Power Failure at Punch Terminal">Power Failure at Punch Terminal</option>
              <option value="Shift Punch In/Out Sync Issue">Shift Punch In/Out Sync Issue</option>
              <option value="Approved Compensatory Work">Approved Compensatory Work</option>
            </select>

            <textarea
              rows="2"
              placeholder="Additional comments / supervisor reference..."
              value={isAdminMode ? adminRemark : reasonText}
              onChange={(e) => isAdminMode ? setAdminRemark(e.target.value) : setReasonText(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 placeholder-slate-400"
            />
          </div>

          {/* Policy Compliance Checker: Real-Time Inline Warnings */}
          {policyWarnings.length > 0 && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 space-y-1.5 animate-in fade-in">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-900">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>Policy Compliance Alert:</span>
              </div>
              {policyWarnings.map((warn, i) => (
                <p key={i} className="text-[11px] text-amber-800 pl-5">
                  • {warn}
                </p>
              ))}
            </div>
          )}

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg font-bold text-white shadow-xs bg-indigo-600 hover:bg-indigo-700 transition-all cursor-pointer"
            >
              <span>{isAdminMode ? 'Apply Admin Override' : 'One-Tap Submit to Admin'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
