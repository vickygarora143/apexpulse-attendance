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
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden relative">
        
        {/* Header (Clean Light) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${isAdminMode ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-indigo-50 text-indigo-700 border border-indigo-200'}`}>
              {isAdminMode ? <ShieldCheck className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">
                {isAdminMode ? 'Direct Admin Attendance Regularization' : 'Request Attendance Regularization'}
              </h3>
              <p className="text-xs text-slate-500">
                {isAdminMode ? 'Direct override stored in Cloudflare D1' : 'Directly forwards to Admin for instant review'}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          
          {/* Employee Selection */}
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

          {/* Policy Notice */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-900">Policy Reminder: </span>
              Day 1 of the month is fixed as Week Off (WO). Sundays are Week Off except the last Sunday of the month which is a mandatory working day. All employee submissions are delivered directly to the Admin Dashboard for approval.
            </div>
          </div>

          {/* Actions */}
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
              className="px-5 py-2 rounded-lg font-bold text-white shadow-xs bg-indigo-600 hover:bg-indigo-700 transition-all"
            >
              {isAdminMode ? 'Apply Admin Override' : 'Send to Admin for Approval'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
