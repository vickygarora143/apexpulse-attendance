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
    return <div className="p-8 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">Loading telecaller profile...</div>;
  }

  // Requests submitted by this user
  const myRequests = regularizations.filter(r => r.empCode === currentUser.code);
  const pendingRequests = myRequests.filter(r => r.status === 'PENDING');

  return (
    <div className="space-y-6">
      
      {/* Profile Header (Clean Light Enterprise Card) */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          {/* User info */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center font-black text-xl text-white shadow-md shadow-indigo-100">
              {currentUser.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-black text-slate-900">{currentUser.name}</h1>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-xs border border-slate-200">
                  {currentUser.code}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold text-xs">
                  {currentUser.designation}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                <span>Department: <strong className="text-slate-800">{currentUser.department}</strong></span>
                <span>•</span>
                <span>Standard Shift: <strong className="text-slate-800">09:30 - 18:30 (9h)</strong></span>
              </p>
            </div>
          </div>

          <div className="text-xs text-slate-500 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200">
            <span className="font-semibold text-slate-700">Need attendance correction?</span> Click on any day card below to regularize directly.
          </div>

        </div>

        {/* Attendance Summary Metrics (Off Quota & Total Logged Time Removed) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100">
          
          {/* Days Present */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-semibold">Days Present</p>
              <h4 className="text-xl font-black text-emerald-700 mt-0.5">{currentUser.presentDays} Days</h4>
            </div>
            <div className="p-2.5 rounded-lg bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          {/* Days Absent */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-semibold">Days Absent</p>
              <h4 className="text-xl font-black text-rose-700 mt-0.5">{currentUser.absentDays} Days</h4>
            </div>
            <div className="p-2.5 rounded-lg bg-rose-100 text-rose-700">
              <XCircle className="w-5 h-5" />
            </div>
          </div>

          {/* Week Offs */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-semibold">Week Offs</p>
              <h4 className="text-xl font-black text-indigo-700 mt-0.5">{currentUser.weekOffDays} Days</h4>
            </div>
            <div className="p-2.5 rounded-lg bg-indigo-100 text-indigo-700">
              <Calendar className="w-5 h-5" />
            </div>
          </div>

          {/* Regularizations Pending */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-semibold">Submitted Requests</p>
              <h4 className="text-xl font-black text-amber-700 mt-0.5">{myRequests.length} Total</h4>
              <p className="text-[10px] text-slate-500">{pendingRequests.length} Pending Admin Review</p>
            </div>
            <div className="p-2.5 rounded-lg bg-amber-100 text-amber-700">
              <Hourglass className="w-5 h-5" />
            </div>
          </div>

        </div>

      </div>

      {/* Tabs: Calendar vs Requests History */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('calendar')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'calendar'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>My Attendance Calendar ({attendanceData.dateRange})</span>
        </button>

        <button
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'requests'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
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
          <div className="p-4 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="font-bold text-slate-900">How to regularize an attendance day: </span>
              Click on any day card below (e.g. marked Absent or incomplete punch) to enter your in/out times and explanation. It will be sent directly to the Admin Dashboard.
            </div>
            <div className="text-emerald-700 font-bold font-mono text-[11px]">
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
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-xs">
              <CheckCircle2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">No Regularization Requests Yet</h3>
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
                  className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">Day {req.dayNum} ({req.dateFormatted})</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        isPending 
                          ? 'bg-amber-50 text-amber-700 border-amber-200' 
                          : isApproved 
                            ? 'bg-teal-50 text-teal-700 border-teal-200' 
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        {req.status}
                      </span>
                      <span className="text-slate-400 font-mono text-[11px]">{req.id}</span>
                    </div>

                    <div className="text-slate-700">
                      Requested Timings: <strong className="font-mono text-slate-900">{req.inTime}</strong> to <strong className="font-mono text-slate-900">{req.outTime}</strong> ({req.calcDuration || '09:00'} hrs)
                    </div>

                    <div className="text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200 mt-1">
                      <strong className="text-indigo-800 font-semibold">Reason:</strong> {req.reason}
                    </div>

                    {req.adminRemark && (
                      <div className="text-[11px] text-teal-800 font-bold mt-1">
                        Admin Note: {req.adminRemark}
                      </div>
                    )}
                  </div>

                  <div className="text-right text-xs text-slate-400 shrink-0">
                    <div className="font-mono text-[11px]">Submitted: {new Date(req.submittedAt).toLocaleDateString()}</div>
                    <div className="text-[10px] text-indigo-600 font-bold mt-1">Routed Directly to Admin</div>
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
