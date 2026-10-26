import React, { useState } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import AttendanceCalendar from './AttendanceCalendar';
import { 
  ShieldCheck, 
  Users, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Sparkles, 
  Search, 
  Filter, 
  ArrowUpRight, 
  FileText,
  History,
  TrendingUp,
  UserX
} from 'lucide-react';

export default function AdminDashboard({ onOpenDirectRegularize, onOpenDayForRegularize }) {
  const { 
    attendanceData, 
    regularizations, 
    approveRegularization, 
    rejectRegularization,
    selectedEmpId,
    setSelectedEmpId,
    auditLogs
  } = useAttendance();

  const [activeTab, setActiveTab] = useState('queue'); // 'queue' | 'workforce' | 'audit'
  const [queueFilter, setQueueFilter] = useState('PENDING'); // 'PENDING' | 'ALL' | 'APPROVED' | 'REJECTED'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [inspectingEmpId, setInspectingEmpId] = useState(selectedEmpId || 'GDSM002');
  const [rejectingReqId, setRejectingReqId] = useState(null);
  const [rejectionRemark, setRejectionRemark] = useState('');

  // Stats calculation
  const totalEmployees = attendanceData.employees.length;
  const pendingRequests = regularizations.filter(r => r.status === 'PENDING');
  const pendingCount = pendingRequests.length;
  
  const employeesOverLimit = attendanceData.employees.filter(e => e.isOffLimitExceeded);
  const overLimitCount = employeesOverLimit.length;

  // Filtered Queue
  const filteredQueue = regularizations.filter(r => {
    if (queueFilter !== 'ALL' && r.status !== queueFilter) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return r.empName.toLowerCase().includes(term) || r.empCode.toLowerCase().includes(term) || r.reason.toLowerCase().includes(term);
    }
    return true;
  });

  // Filtered Workforce
  const filteredWorkforce = attendanceData.employees.filter(e => {
    if (selectedDept !== 'ALL' && e.department !== selectedDept) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return e.name.toLowerCase().includes(term) || e.code.toLowerCase().includes(term);
    }
    return true;
  });

  const inspectedEmployee = attendanceData.employees.find(e => e.code === inspectingEmpId) || attendanceData.employees[0];

  const handleConfirmReject = () => {
    if (rejectingReqId) {
      rejectRegularization(rejectingReqId, rejectionRemark || 'Rejected as per attendance policy guidelines');
      setRejectingReqId(null);
      setRejectionRemark('');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Top Banner & KPI Cards */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-7 h-7 text-emerald-400" />
              Chief Admin Attendance Command Hub
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Centralized Regularization Approval Engine • Policy Monitoring • Real-Time Employee Overrides
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenDirectRegularize(null, null)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Direct Day Regularize</span>
            </button>
          </div>
        </div>

        {/* 4 Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Workforce */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400">Total Workforce</p>
              <h3 className="text-2xl font-extrabold text-white mt-1">{totalEmployees} Staff</h3>
              <p className="text-[11px] text-slate-400 mt-1">{attendanceData.departments.length} Active Departments</p>
            </div>
            <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Users className="w-6 h-6" />
            </div>
          </div>

          {/* Pending Regularizations */}
          <div 
            onClick={() => { setActiveTab('queue'); setQueueFilter('PENDING'); }}
            className="p-4 rounded-2xl bg-slate-900/80 border border-amber-500/30 hover:border-amber-500 shadow-xl cursor-pointer transition-all flex items-center justify-between group"
          >
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-semibold text-amber-400">Pending Regularizations</p>
                {pendingCount > 0 && (
                  <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-ping"></span>
                )}
              </div>
              <h3 className="text-2xl font-extrabold text-amber-300 mt-1">{pendingCount} Requests</h3>
              <p className="text-[11px] text-slate-400 mt-1 group-hover:text-amber-300 transition-colors">
                Click to review & approve &rarr;
              </p>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          {/* 4-Off Limit Alerts */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-rose-400">Over-Limit Offs (&gt;4 Offs)</p>
              <h3 className="text-2xl font-extrabold text-rose-300 mt-1">{overLimitCount} Staff</h3>
              <p className="text-[11px] text-slate-400 mt-1">Exceeded 4 allowed monthly offs</p>
            </div>
            <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>

          {/* Active Policies */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-emerald-400">Roster Engine Status</p>
              <h3 className="text-lg font-bold text-white mt-1">100% Enforced</h3>
              <p className="text-[11px] text-slate-400 mt-1">1st Date WO • Last Sun Working</p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>

        </div>
      </div>

      {/* Tabs Switcher: Regularization Queue vs Workforce Explorer vs Audit Trail */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'queue'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Regularization Requests Queue</span>
            {pendingCount > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] bg-amber-400 text-slate-950 font-black rounded-full">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('workforce')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'workforce'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Workforce Attendance Roster ({totalEmployees})</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'audit'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <History className="w-4 h-4" />
            <span>System Audit Trail</span>
          </button>
        </div>

        {/* Global Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search employee, code, reason..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500 w-56 sm:w-64"
          />
        </div>
      </div>

      {/* TAB 1: REGULARIZATION REQUESTS QUEUE */}
      {activeTab === 'queue' && (
        <div className="space-y-4">
          
          {/* Sub Filters */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              {[
                { id: 'PENDING', label: `Pending Approval (${pendingCount})` },
                { id: 'ALL', label: `All Requests (${regularizations.length})` },
                { id: 'APPROVED', label: 'Approved' },
                { id: 'REJECTED', label: 'Rejected' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setQueueFilter(f.id)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    queueFilter === f.id
                      ? 'bg-slate-800 text-white font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <span className="text-xs text-slate-400">
              Rule: All user regularization requests arrive directly to Admin for 1-click approval or rejection.
            </span>
          </div>

          {/* Queue Cards / Table */}
          {filteredQueue.length === 0 ? (
            <div className="p-12 text-center bg-slate-900/40 rounded-2xl border border-slate-800">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3 opacity-60" />
              <h3 className="text-base font-bold text-slate-200">No Regularization Requests in this view</h3>
              <p className="text-xs text-slate-400 mt-1">
                {queueFilter === 'PENDING' ? 'Great job! All regularization requests have been processed.' : 'No records matching filters.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredQueue.map(req => {
                const isPending = req.status === 'PENDING';
                const isApproved = req.status === 'APPROVED';
                const isRejected = req.status === 'REJECTED';

                return (
                  <div
                    key={req.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      isPending 
                        ? 'bg-slate-900/90 border-amber-500/40 shadow-lg shadow-amber-500/5' 
                        : isApproved 
                          ? 'bg-slate-900/50 border-teal-500/30' 
                          : 'bg-slate-900/50 border-rose-500/30'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      
                      {/* Left: Employee info & Date */}
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-sm text-white">{req.empName}</span>
                          <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-mono text-[11px] border border-slate-700">
                            {req.empCode}
                          </span>
                          <span className="text-[11px] text-indigo-400 font-semibold">
                            {req.department}
                          </span>
                          <span className="text-xs text-slate-400">• {req.id}</span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
                          <div className="flex items-center gap-1 font-semibold text-emerald-400">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Target: Day {req.dayNum} ({req.dateFormatted})</span>
                          </div>
                          <div>
                            Current Status: <span className="font-bold text-rose-400">{req.currentStatus}</span> &rarr; Requested: <span className="font-bold text-emerald-400">{req.requestedStatus}</span>
                          </div>
                          <div className="font-mono text-slate-300">
                            Timings: <strong>{req.inTime}</strong> to <strong>{req.outTime}</strong> ({req.calcDuration || '09:00'} hrs)
                          </div>
                        </div>

                        {/* Reason Note */}
                        <div className="mt-2 text-xs bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 text-slate-300">
                          <strong className="text-indigo-300">Reason: </strong>
                          {req.reason}
                        </div>

                        {/* Admin Remark if resolved */}
                        {req.adminRemark && (
                          <div className="text-[11px] text-teal-300 mt-1">
                            <strong>Admin Note:</strong> {req.adminRemark}
                          </div>
                        )}
                      </div>

                      {/* Right: Actions or Status Badge */}
                      <div className="flex items-center gap-2 self-end lg:self-center shrink-0">
                        {isPending ? (
                          <>
                            <button
                              onClick={() => approveRegularization(req.id, 'Approved by Chief Admin')}
                              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30 transition-all flex items-center gap-1.5"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Approve (Mark Present)</span>
                            </button>
                            <button
                              onClick={() => setRejectingReqId(req.id)}
                              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-rose-200 font-medium text-xs border border-slate-700 transition-colors flex items-center gap-1"
                            >
                              <XCircle className="w-4 h-4" />
                              <span>Reject</span>
                            </button>
                          </>
                        ) : (
                          <span className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 ${
                            isApproved 
                              ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40' 
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          }`}>
                            {isApproved ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                            <span>{req.status}</span>
                          </span>
                        )}
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* TAB 2: WORKFORCE ATTENDANCE ROSTER & DRILLDOWN */}
      {activeTab === 'workforce' && (
        <div className="space-y-6">
          
          {/* Department Filter & Summary */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-300">Department:</span>
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                {['ALL', ...attendanceData.departments].map(d => (
                  <button
                    key={d}
                    onClick={() => setSelectedDept(d)}
                    className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                      selectedDept === d ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-xs text-slate-400">
              Showing {filteredWorkforce.length} of {attendanceData.employees.length} Employees
            </div>
          </div>

          {/* Master Workforce Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/70 shadow-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase font-mono text-[10px]">
                <tr>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-3">Department</th>
                  <th className="py-3 px-3">Role</th>
                  <th className="py-3 px-3 text-center">Present Days</th>
                  <th className="py-3 px-3 text-center">Absent Days</th>
                  <th className="py-3 px-3 text-center">Week Offs</th>
                  <th className="py-3 px-3 text-center">Off Quota (4 Max)</th>
                  <th className="py-3 px-3 text-right">Total Hours</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {filteredWorkforce.map(emp => {
                  const isExceeded = emp.isOffLimitExceeded;
                  const isSelected = inspectingEmpId === emp.code;

                  return (
                    <tr 
                      key={emp.code}
                      onClick={() => setInspectingEmpId(emp.code)}
                      className={`hover:bg-slate-800/40 cursor-pointer transition-colors ${
                        isSelected ? 'bg-indigo-950/30' : ''
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="font-bold text-white">{emp.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{emp.code}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-indigo-300 font-semibold text-[10px]">
                          {emp.department}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-300">
                        {emp.designation}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="font-bold text-emerald-400">{emp.presentDays}</span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={`font-bold ${emp.absentDays > 4 ? 'text-rose-400' : 'text-slate-300'}`}>
                          {emp.absentDays}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center text-blue-400 font-medium">
                        {emp.weekOffDays}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {isExceeded ? (
                          <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold text-[10px]">
                            {emp.offsUsed}/4 (Exceeded!)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold text-[10px]">
                            {emp.offsUsed}/4 ({emp.offsRemaining} left)
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-indigo-300">
                        {emp.totalHoursFormatted}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenDirectRegularize(emp, null);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white font-medium text-[11px] transition-colors"
                        >
                          Regularize Day
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Inspected Employee Interactive Calendar View */}
          {inspectedEmployee && (
            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-2xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div>
                  <h3 className="font-bold text-base text-white flex items-center gap-2">
                    <span>{inspectedEmployee.name} ({inspectedEmployee.code})</span>
                    <span className="px-2 py-0.5 rounded-md bg-indigo-950 text-indigo-300 text-xs border border-indigo-700/60 font-mono">
                      {inspectedEmployee.department} • {inspectedEmployee.designation}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Click any day card below to execute an immediate Admin Regularization Override.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenDirectRegularize(inspectedEmployee, null)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Override Attendance</span>
                  </button>
                </div>
              </div>

              <AttendanceCalendar
                employee={inspectedEmployee}
                isAdmin={true}
                onRegularizeDay={(emp, day) => onOpenDayForRegularize(emp, day)}
              />
            </div>
          )}

        </div>
      )}

      {/* TAB 3: SYSTEM AUDIT TRAIL */}
      {activeTab === 'audit' && (
        <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <History className="w-5 h-5 text-indigo-400" />
                Live Attendance & Regularization Audit Trail
              </h3>
              <p className="text-xs text-slate-400">Immutable ledger of all approvals, overrides, and CSV ingestions</p>
            </div>
            <span className="text-xs text-slate-400 font-mono">{auditLogs.length} Events Logged</span>
          </div>

          <div className="space-y-2">
            {auditLogs.map(log => (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-start justify-between gap-4 text-xs font-mono"
              >
                <div>
                  <span className="font-bold text-indigo-400 uppercase tracking-wider mr-2">
                    [{log.action}]
                  </span>
                  <span className="text-slate-200">{log.details}</span>
                </div>
                <span className="text-slate-500 shrink-0 text-[11px]">{log.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rejection Modal confirmation */}
      {rejectingReqId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <XCircle className="w-5 h-5 text-rose-400" />
              Reject Regularization Request
            </h3>
            <p className="text-xs text-slate-400">
              Please provide the official reason for rejecting this regularization request. It will be reported to the employee.
            </p>
            <textarea
              rows="3"
              placeholder="e.g. Punch logs conflict with floor access data..."
              value={rejectionRemark}
              onChange={(e) => setRejectionRemark(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
            />
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setRejectingReqId(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/30"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
