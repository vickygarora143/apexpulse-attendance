import React, { useState } from 'react';
import { useAttendance } from '../../context/AttendanceContext';
import { 
  Bell, 
  X, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  ChevronRight,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

export default function SmartReminders({ onOpenRegularize }) {
  const { currentUser, regularizations, currentRole } = useAttendance();
  const [isOpen, setIsOpen] = useState(false);

  // Derive dynamic reminders based on real attendance state
  const reminders = [];

  // 1. Quota Reminder
  if (currentUser) {
    const offsUsed = currentUser.offsUsed || 0;
    if (offsUsed >= 4) {
      reminders.push({
        id: 'rem-quota-limit',
        type: 'danger',
        title: 'Monthly Off Quota Reached',
        desc: `You have consumed ${offsUsed}/4 permitted monthly offs. Any further unregularized absence will trigger operational payroll deduction.`,
        time: 'Active Notice',
        actionLabel: 'View Calendar',
        action: 'calendar'
      });
    } else if (offsUsed >= 3) {
      reminders.push({
        id: 'rem-quota-warn',
        type: 'warning',
        title: 'Approaching Off Quota',
        desc: `You have 1 off remaining out of your 4 monthly quota. Please plan attendance accordingly.`,
        time: 'Policy Tracker'
      });
    }
  }

  // 2. Working Sunday Policy Reminder
  reminders.push({
    id: 'rem-sunday-policy',
    type: 'info',
    title: 'Roster Notice: Last Sunday is Working',
    desc: 'Company policy reminder: Day 27 (Last Sunday of the month) is a mandatory working shift for all telecallers.',
    time: 'Roster Schedule'
  });

  // 3. Regularization Approvals
  const myApproved = regularizations.filter(r => r.empCode === currentUser?.code && r.status === 'APPROVED');
  if (myApproved.length > 0) {
    const latest = myApproved[0];
    reminders.push({
      id: `rem-approved-${latest.id}`,
      type: 'success',
      title: 'Regularization Approved by Admin',
      desc: `Day ${latest.dayNum} attendance has been regularized to Present (P REG) in Cloudflare D1.`,
      time: 'Verified'
    });
  }

  // 4. Pending review for Admin
  if (currentRole === 'admin') {
    const pendingCount = regularizations.filter(r => r.status === 'PENDING').length;
    if (pendingCount > 0) {
      reminders.push({
        id: 'rem-admin-pending',
        type: 'warning',
        title: `${pendingCount} Regularization Requests Pending`,
        desc: 'Review and decide pending punch corrections submitted by telecallers.',
        time: 'Immediate Action'
      });
    }
  }

  const unreadCount = reminders.length;

  return (
    <div className="relative">
      
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 transition-colors"
        title="Smart Reminders & Notifications"
      >
        <Bell className="w-4 h-4 text-slate-700" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-black flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Notification Drawer */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
          
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <h4 className="font-extrabold text-xs text-slate-900 tracking-tight">Smart Reminders</h4>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                {unreadCount} Active
              </span>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="w-6 h-6 rounded-md hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {reminders.map(r => (
              <div
                key={r.id}
                className={`p-3 rounded-xl border text-xs transition-all ${
                  r.type === 'danger'
                    ? 'bg-rose-50/70 border-rose-200 text-rose-900'
                    : r.type === 'warning'
                    ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                    : r.type === 'success'
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                    : 'bg-indigo-50/60 border-indigo-100 text-indigo-900'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {r.type === 'danger' && <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />}
                  {r.type === 'warning' && <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />}
                  {r.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />}
                  {r.type === 'info' && <Calendar className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />}

                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-bold text-[11px] leading-tight">{r.title}</span>
                      <span className="text-[9px] opacity-70 font-medium">{r.time}</span>
                    </div>
                    <p className="text-[11px] leading-relaxed opacity-90">{r.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 text-center">
            <span className="text-[10px] text-slate-400 font-medium">
              ApexPulse Real-Time Event & Compliance Telemetry
            </span>
          </div>

        </div>
      )}

    </div>
  );
}
