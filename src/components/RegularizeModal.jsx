import React, { useState, useEffect } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { X, Sparkles, ShieldCheck, Clock, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';

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

  // Calculate duration
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

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isAdminMode) {
      // Direct Admin override
      directAdminRegularize({
        empCode: selectedEmpCode,
        dayNum: parseInt(dayNum, 10),
        status,
        inTime,
        outTime,
        totalDuration: calculatedHours,
        remarks: adminRemark || `Admin regularized to ${status}: ${reasonCategory}`
      });
      setToastMessage('Attendance successfully regularized by Admin!');
      setTimeout(() => {
        setToastMessage('');
        onClose();
      }, 900);
    } else {
      // User request submitted directly to Admin
      const fullReason = `${reasonCategory}: ${reasonText.trim() || 'Punch missed during standard working shift.'}`;
      const res = submitRegularization({
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden relative">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${isAdminMode ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'}`}>
              {isAdminMode ? <ShieldCheck className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-100">
                {isAdminMode ? 'Direct Admin Attendance Regularization' : 'Request Attendance Regularization'}
              </h3>
              <p className="text-xs text-slate-400">
                {isAdminMode ? 'Direct override across any employee & day' : 'Directly forwards to Admin for instant review'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toast confirmation */}
        {toastMessage && (
          <div className="m-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-medium flex items-center gap-2 animate-bounce">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          
          {/* Employee Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Employee</label>
              {isAdminMode ? (
                <select
                  value={selectedEmpCode}
                  onChange={(e) => setSelectedEmpCode(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  {attendanceData.employees.map(e => (
                    <option key={e.code} value={e.code}>
                      {e.name} ({e.code}) - {e.department}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-slate-200 font-medium">
                  {currentEmp ? `${currentEmp.name} (${currentEmp.code})` : 'Self'}
                </div>
              )}
            </div>

            {/* Target Day */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Day of Month</label>
              <select
                value={dayNum}
                onChange={(e) => setDayNum(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
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
              <label className="block text-slate-300 font-semibold mb-1">Set Attendance Status</label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'P (REG)', label: 'Present (REG)', color: 'border-teal-500/50 bg-teal-500/10 text-teal-300' },
                  { id: 'P', label: 'Present (P)', color: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300' },
                  { id: 'A', label: 'Absent (A)', color: 'border-rose-500/50 bg-rose-500/10 text-rose-300' },
                  { id: 'WO', label: 'Week Off (WO)', color: 'border-blue-500/50 bg-blue-500/10 text-blue-300' }
                ].map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setStatus(item.id)}
                    className={`py-2 px-1 text-center font-semibold rounded-lg border text-[11px] transition-all ${
                      status === item.id 
                        ? `${item.color} ring-2 ring-indigo-500 font-bold` 
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:bg-slate-800'
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
              <label className="block text-slate-300 font-semibold mb-1">Punch In Time</label>
              <input
                type="time"
                value={inTime}
                onChange={(e) => setInTime(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Punch Out Time</label>
              <input
                type="time"
                value={outTime}
                onChange={(e) => setOutTime(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Calculated Duration</label>
              <div className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-2 text-emerald-400 font-mono font-bold flex items-center justify-center">
                {calculatedHours} hrs
              </div>
            </div>
          </div>

          {/* Reason Category */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Reason for Regularization</label>
            <select
              value={reasonCategory}
              onChange={(e) => setReasonCategory(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 mb-2"
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
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 placeholder-slate-600"
            />
          </div>

          {/* Policy Notice */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-300">Policy Reminder: </span>
              Day 1 of the month is fixed as Week Off (WO). Sundays are Week Off except the last Sunday of the month which is a mandatory working day. All employee submissions are delivered directly to the Admin Dashboard for approval.
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-5 py-2 rounded-lg font-bold text-white shadow-lg transition-all ${
                isAdminMode
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-500/20'
                  : 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 shadow-indigo-500/20'
              }`}
            >
              {isAdminMode ? 'Apply Admin Override' : 'Send to Admin for Approval'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
