import React, { useState } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import AttendanceCalendar from './AttendanceCalendar';
import { 
  Clock, 
  Calendar, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  User, 
  Briefcase, 
  Hourglass,
  Send
} from 'lucide-react';

export default function TelecallerDashboard({ onOpenRegularizeModal }) {
  const { currentUser, regularizations, attendanceData } = useAttendance();
  const [activeTab, setActiveTab] = useState('calendar'); // 'calendar' | 'requests'

  if (!currentUser) {
    return <div className="p-8 text-center text-slate-400">Loading telecaller profile...</div>;
  }

  // Requests submitted by this user
  const myRequests = regularizations.filter(r => r.empCode === currentUser.code);
  const pendingRequests = myRequests.filter(r => r.status === 'PENDING');

  // Quota calculation (4 Offs Monthly Policy)
  const allowedOffs = 4;
  const offsUsed = currentUser.offsUsed || 0;
  const offsRemaining = currentUser.offsRemaining || 0;
  const isOverLimit = currentUser.isOffLimitExceeded;
  const percentUsed = Math.min(100, Math.round((offsUsed / allowedOffs) * 100));

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Profile Header & Off Quota Bar */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          {/* User info */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-emerald-400 flex items-center justify-center font-black text-xl text-white shadow-lg shadow-indigo-500/20">
              {currentUser.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-black text-white">{currentUser.name}</h1>
                <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-mono text-xs border border-slate-700">
                  {currentUser.code}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold text-xs">
                  {currentUser.designation}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                <span>Department: <strong className="text-slate-200">{currentUser.department}</strong></span>
                <span>•</span>
                <span>Standard Shift: <strong className="text-slate-200">09:30 - 18:30 (9h)</strong></span>
              </p>
            </div>
          </div>

          {/* Quick Action: Request Regularization */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onOpenRegularizeModal(currentUser, null)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Request Regularization</span>
            </button>
          </div>

        </div>

        {/* 4-Off Quota Tracker & Summary Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800/80">
          
          {/* 4-Off Monthly Quota */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-400 font-medium">Monthly Off Quota (4 Max)</span>
              <span className={`font-bold ${isOverLimit ? 'text-rose-400' : 'text-emerald-400'}`}>
                {offsUsed} / {allowedOffs} Used
              </span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  isOverLimit ? 'bg-rose-500' : offsUsed === 4 ? 'bg-amber-400' : 'bg-emerald-400'
                }`}
                style={{ width: `${percentUsed}%` }}
              ></div>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1.5">
              <span>{offsRemaining} Offs Available</span>
              {isOverLimit && <span className="text-rose-400 font-bold">Policy Exceeded!</span>}
            </div>
          </div>

          {/* Days Present */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Days Present</p>
              <h4 className="text-xl font-bold text-emerald-400 mt-0.5">{currentUser.presentDays} Days</h4>
            </div>
            <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          {/* Total Monthly Duration */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Total Logged Time</p>
              <h4 className="text-xl font-bold text-indigo-300 font-mono mt-0.5">{currentUser.totalHoursFormatted}</h4>
            </div>
            <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          {/* Regularizations Pending */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Submitted Requests</p>
              <h4 className="text-xl font-bold text-amber-300 mt-0.5">{myRequests.length} Total</h4>
              <p className="text-[10px] text-slate-400">{pendingRequests.length} Pending Admin Approval</p>
            </div>
            <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400">
              <Hourglass className="w-5 h-5" />
            </div>
          </div>

        </div>

      </div>

      {/* Tabs: Calendar vs Requests History */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('calendar')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'calendar'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>My Attendance Calendar ({attendanceData.dateRange})</span>
        </button>

        <button
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'requests'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Hourglass className="w-4 h-4" />
          <span>My Regularization Requests ({myRequests.length})</span>
          {pendingRequests.length > 0 && (
            <span className="px-1.5 py-0.5 text-[10px] bg-amber-400 text-slate-950 font-black rounded-full">
              {pendingRequests.length}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: CALENDAR VIEW */}
      {activeTab === 'calendar' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="font-bold text-white">How to regularize an attendance day: </span>
              Click on any day card below (e.g. marked Absent or incomplete punch) to enter your in/out times and explanation. It will be sent directly to the Admin Dashboard.
            </div>
            <div className="text-emerald-400 font-semibold font-mono text-[11px]">
              Rules: 1st Date = WO • Last Sun = Working
            </div>
          </div>

          <AttendanceCalendar
            employee={currentUser}
            isAdmin={false}
            onRegularizeDay={(emp, day) => onOpenRegularizeModal(emp, day)}
          />
        </div>
      )}

      {/* TAB 2: REQUESTS HISTORY */}
      {activeTab === 'requests' && (
        <div className="space-y-3">
          {myRequests.length === 0 ? (
            <div className="p-12 text-center bg-slate-900/40 rounded-2xl border border-slate-800">
              <CheckCircle2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-300">No Regularization Requests Yet</h3>
              <p className="text-xs text-slate-500 mt-1">
                If you ever miss a punch or have biometric issues, you can submit a regularization request directly to Admin.
              </p>
            </div>
          ) : (
            myRequests.map(req => {
              const isPending = req.status === 'PENDING';
              const isApproved = req.status === 'APPROVED';

              return (
                <div
                  key={req.id}
                  className="p-4 rounded-xl border border-slate-800 bg-slate-900/80 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">Day {req.dayNum} ({req.dateFormatted})</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isPending 
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                          : isApproved 
                            ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30' 
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}>
                        {req.status}
                      </span>
                      <span className="text-slate-400 font-mono text-[11px]">{req.id}</span>
                    </div>

                    <div className="text-slate-300">
                      Requested Timings: <strong className="font-mono text-white">{req.inTime}</strong> to <strong className="font-mono text-white">{req.outTime}</strong> ({req.calcDuration || '09:00'} hrs)
                    </div>

                    <div className="text-slate-400 bg-slate-950 p-2 rounded-lg border border-slate-800/80 mt-1">
                      <strong className="text-indigo-300">Reason:</strong> {req.reason}
                    </div>

                    {req.adminRemark && (
                      <div className="text-[11px] text-teal-300 font-medium">
                        Admin Note: {req.adminRemark}
                      </div>
                    )}
                  </div>

                  <div className="text-right text-xs text-slate-400 shrink-0">
                    <div className="font-mono text-[11px]">Submitted: {new Date(req.submittedAt).toLocaleDateString()}</div>
                    <div className="text-[10px] text-slate-400 mt-1">Routed Directly to Admin</div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

    </div>
  );
}
