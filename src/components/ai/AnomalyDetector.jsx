import React from 'react';
import { useAttendance } from '../../context/AttendanceContext';
import { 
  AlertTriangle, 
  HelpCircle, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  Calendar, 
  ArrowRight,
  ShieldAlert
} from 'lucide-react';

export default function AnomalyDetector({ onOpenRegularizeModal }) {
  const { attendanceData, currentUser } = useAttendance();

  // Scan real attendance records for anomalies
  const anomalies = [];

  attendanceData.employees.forEach(emp => {
    // 1. Quota anomaly
    if (emp.isOffLimitExceeded) {
      anomalies.push({
        id: `anom-quota-${emp.code}`,
        empCode: emp.code,
        empName: emp.name,
        dept: emp.department,
        type: 'QUOTA_EXCEEDED',
        title: 'Monthly Off Quota Exceeded',
        badge: 'Critical Policy Flag',
        badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
        dayNum: null,
        whyFlagged: `Employee consumed ${emp.offsUsed} offs against the permitted 4 monthly allowance. Each excess absence incurs payroll deduction unless regularized with Admin approval.`,
        suggestedAction: 'Regularize Off Days'
      });
    }

    // 2. Scan daily punches
    Object.values(emp.attendance).forEach(day => {
      // Day 27 (Last Sunday) should be working
      if (day.dayNum === 27 && day.status === 'A') {
        anomalies.push({
          id: `anom-sun-${emp.code}-${day.dayNum}`,
          empCode: emp.code,
          empName: emp.name,
          dept: emp.department,
          type: 'SUNDAY_WORKING_MISSED',
          title: `Day 27 (Last Sunday Working) Absence`,
          badge: 'Roster Violation',
          badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
          dayNum: 27,
          whyFlagged: `As per ApexPulse workforce policy, the last Sunday of every month is a regular working shift. No biometric punch was recorded for this scheduled shift.`,
          suggestedAction: 'Regularize Sunday Shift'
        });
      }

      // Single punch / missing out-time
      if (day.inTime && day.inTime !== '--:--' && (!day.outTime || day.outTime === '--:--')) {
        anomalies.push({
          id: `anom-punch-${emp.code}-${day.dayNum}`,
          empCode: emp.code,
          empName: emp.name,
          dept: emp.department,
          type: 'MISSING_OUT_PUNCH',
          title: `Day ${day.dayNum}: Missing Punch-Out Timestamp`,
          badge: 'Biometric Discrepancy',
          badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          dayNum: day.dayNum,
          whyFlagged: `Punch-in detected at ${day.inTime}, but no checkout punch was registered on the biometric terminal. Working hours could not be calculated.`,
          suggestedAction: 'Contest / Fill Out-Time'
        });
      }
    });
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
      
      {/* Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-rose-50 text-rose-600 rounded-xl border border-rose-100">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-900 tracking-tight flex items-center gap-2">
              <span>Biometric & Policy Anomaly Detector</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-700">
                {anomalies.length} Flagged
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Automated discrepancy audit: missing punches, quota violations, and schedule non-compliance
            </p>
          </div>
        </div>
      </div>

      {/* Anomaly Flag Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
        {anomalies.slice(0, 6).map(anom => {
          const emp = attendanceData.employees.find(e => e.code === anom.empCode);
          return (
            <div 
              key={anom.id}
              className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition-all flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${anom.badgeColor}`}>
                    {anom.badge}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {anom.empCode} • {anom.dept}
                  </span>
                </div>

                <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                  <span>{anom.title}</span>
                  <span className="text-slate-500 font-normal">({anom.empName})</span>
                </h4>

                {/* "Why This Was Flagged" Box */}
                <div className="mt-2.5 p-2.5 rounded-lg bg-white border border-slate-200/80 text-[11px] text-slate-600 leading-relaxed flex items-start gap-2">
                  <HelpCircle className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-800">Why this was flagged: </strong>
                    <span>{anom.whyFlagged}</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-1 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 italic">
                  Requires Admin review
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenRegularizeModal) {
                      onOpenRegularizeModal(emp, anom.dayNum ? { dayNum: anom.dayNum } : null);
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold shadow-2xs transition-colors"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>{anom.suggestedAction}</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
