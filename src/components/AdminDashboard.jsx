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
  FileText,
  History,
  TrendingUp,
  UserX,
  ShieldAlert,
  Activity,
  Sliders,
  BarChart2
} from 'lucide-react';

import ApprovalHeatmapRecommender from './ai/ApprovalHeatmapRecommender';
import AnomalyDetector from './ai/AnomalyDetector';
import AttritionPredictor from './ai/AttritionPredictor';
import RosterOptimizer from './ai/RosterOptimizer';
import WorkforcePlanner from './ai/WorkforcePlanner';
import ReportGenerator from './ai/ReportGenerator';

export default function AdminDashboard({ onOpenDirectRegularize, onOpenDayForRegularize }) {
  const { 
    attendanceData, 
    regularizations, 
    approveRegularization, 
    rejectRegularization,
    selectedEmpId,
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
    <div className="space-y-6">
      
      {/* Top Banner & KPI Cards (Clean Light Enterprise) */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-7 h-7 text-indigo-600" />
              Chief Admin Attendance Command Hub
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Centralized Regularization Approval Engine • Direct Employee Overrides • Policy Monitoring
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenDirectRegularize(null, null)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Direct Day Regularize</span>
            </button>
          </div>
        </div>

        {/* 4 Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Workforce */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">Total Workforce</p>
              <h3 className="text-2xl font-black text-slate-900 mt-0.5">{totalEmployees} Staff</h3>
              <p className="text-[11px] text-slate-400 mt-1">{attendanceData.departments.length} Active Departments</p>
            </div>
            <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <Users className="w-5 h-5" />
            </div>
          </div>

          {/* Pending Regularizations */}
          <div 
            onClick={() => { setActiveTab('queue'); setQueueFilter('PENDING'); }}
            className="p-4 rounded-xl bg-white border border-amber-300 hover:border-amber-400 shadow-xs cursor-pointer transition-all flex items-center justify-between group"
          >
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-bold text-amber-700">Pending Regularizations</p>
                {pendingCount > 0 && (
                  <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-ping"></span>
                )}
              </div>
              <h3 className="text-2xl font-black text-amber-900 mt-0.5">{pendingCount} Requests</h3>
              <p className="text-[11px] text-amber-600 mt-1 group-hover:underline">
                Click to review & approve &rarr;
              </p>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          {/* 4-Off Limit Alerts */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-rose-700">Over-Limit Offs (&gt;4 Offs)</p>
              <h3 className="text-2xl font-black text-rose-900 mt-0.5">{overLimitCount} Staff</h3>
              <p className="text-[11px] text-slate-500 mt-1">Exceeded 4 allowed monthly offs</p>
            </div>
            <div className="p-3 rounded-xl bg-rose-50 text-rose-600 border border-rose-200">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>

          {/* Active Policies */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-emerald-700">Roster Policies</p>
              <h3 className="text-lg font-black text-emerald-900 mt-0.5">100% Enforced</h3>
              <p className="text-[11px] text-slate-500 mt-1">1st Date WO • Last Sun Working</p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-2">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'queue'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Regularization Queue</span>
            {pendingCount > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] bg-amber-400 text-slate-950 font-black rounded-full">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('anomalies')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'anomalies'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-rose-500" />
            <span>Biometric Anomalies</span>
          </button>

          <button
            onClick={() => setActiveTab('ai_intelligence')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'ai_intelligence'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Activity className="w-4 h-4 text-indigo-500" />
            <span>Workforce & Attrition AI</span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'reports'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BarChart2 className="w-4 h-4 text-emerald-600" />
            <span>AI Reports</span>
          </button>

          <button
            onClick={() => setActiveTab('workforce')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'workforce'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Workforce Roster ({totalEmployees})</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'audit'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Audit Trail</span>
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
            className="pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 w-56 sm:w-64"
          />
        </div>
      </div>

      {/* TAB 1: REGULARIZATION REQUESTS QUEUE */}
      {activeTab === 'queue' && (
        <div className="space-y-4">
          
          {/* Sub Filters */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 text-xs shadow-2xs">
              {[
                { id: 'PENDING', label: `Pending Approval (${pendingCount})` },
                { id: 'ALL', label: `All Requests (${regularizations.length})` },
                { id: 'APPROVED', label: 'Approved' },
                { id: 'REJECTED', label: 'Rejected' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setQueueFilter(f.id)}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                    queueFilter === f.id
                      ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200/60'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <span className="text-xs text-slate-500">
              Rule: All user regularization requests arrive directly to Admin for 1-click approval or rejection.
            </span>
          </div>

          {/* Queue Cards */}
          {filteredQueue.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
              <CheckCircle2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">No Regularization Requests in this view</h3>
              <p className="text-xs text-slate-500 mt-1">
                {queueFilter === 'PENDING' ? 'Great job! All regularization requests have been processed.' : 'No records matching filters.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredQueue.map(req => {
                const isPending = req.status === 'PENDING';
                const isApproved = req.status === 'APPROVED';

                return (
                  <div
                    key={req.id}
                    className={`p-4 rounded-xl border transition-all bg-white shadow-xs ${
                      isPending 
                        ? 'border-amber-300 ring-1 ring-amber-100' 
                        : isApproved 
                          ? 'border-teal-200' 
                          : 'border-rose-200'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      
                      {/* Left: Employee info & Date */}
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-sm text-slate-900">{req.empName}</span>
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-[11px] border border-slate-200">
                            {req.empCode}
                          </span>
                          <span className="text-[11px] text-indigo-700 font-bold">
                            {req.department}
                          </span>
                          <span className="text-xs text-slate-400">• {req.id}</span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                          <div className="flex items-center gap-1 font-semibold text-indigo-700">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Target: Day {req.dayNum} ({req.dateFormatted})</span>
                          </div>
                          <div>
                            Current Status: <span className="font-bold text-rose-700">{req.currentStatus}</span> &rarr; Requested: <span className="font-bold text-emerald-700">{req.requestedStatus}</span>
                          </div>
                          <div className="font-mono text-slate-700">
                            Timings: <strong>{req.inTime}</strong> to <strong>{req.outTime}</strong> ({req.calcDuration || '09:00'} hrs)
                          </div>
                        </div>

                        {/* Reason Note */}
                        <div className="mt-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-slate-800">
                          <strong className="text-indigo-800 font-bold">Reason: </strong>
                          {req.reason}
                        </div>

                        {/* AI Heatmap & Approval Recommendation */}
                        {isPending && (
                          <ApprovalHeatmapRecommender request={req} />
                        )}

                        {/* Admin Remark if resolved */}
                        {req.adminRemark && (
                          <div className="text-[11px] text-teal-800 mt-1 font-medium">
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
                              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Approve (Mark Present)</span>
                            </button>
                            <button
                              onClick={() => setRejectingReqId(req.id)}
                              className="px-3 py-2 rounded-xl bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-700 font-semibold text-xs border border-slate-200 transition-colors flex items-center gap-1"
                            >
                              <XCircle className="w-4 h-4" />
                              <span>Reject</span>
                            </button>
                          </>
                        ) : (
                          <span className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 border ${
                            isApproved 
                              ? 'bg-teal-50 text-teal-700 border-teal-200' 
                              : 'bg-rose-50 text-rose-700 border-rose-200'
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

      {/* TAB: BIOMETRIC ANOMALIES (AI DETECTOR) */}
      {activeTab === 'anomalies' && (
        <AnomalyDetector onOpenRegularizeModal={onOpenDirectRegularize} />
      )}

      {/* TAB: WORKFORCE & ATTRITION AI INTELLIGENCE */}
      {activeTab === 'ai_intelligence' && (
        <div className="space-y-6">
          <AttritionPredictor />
          <WorkforcePlanner />
          <RosterOptimizer />
        </div>
      )}

      {/* TAB: AI REPORTS & PROMPTS */}
      {activeTab === 'reports' && (
        <ReportGenerator />
      )}

      {/* TAB 2: WORKFORCE ATTENDANCE ROSTER */}
      {activeTab === 'workforce' && (
        <div className="space-y-6">
          
          {/* Department Filter & Summary */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">Department:</span>
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 text-xs shadow-2xs">
                {['ALL', ...attendanceData.departments].map(d => (
                  <button
                    key={d}
                    onClick={() => setSelectedDept(d)}
                    className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                      selectedDept === d ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-xs text-slate-500">
              Showing {filteredWorkforce.length} of {attendanceData.employees.length} Employees
            </div>
          </div>

          {/* Master Workforce Table (Light Design) */}
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase font-mono text-[10px]">
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
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {filteredWorkforce.map(emp => {
                  const isExceeded = emp.isOffLimitExceeded;
                  const isSelected = inspectingEmpId === emp.code;

                  return (
                    <tr 
                      key={emp.code}
                      onClick={() => setInspectingEmpId(emp.code)}
                      className={`hover:bg-slate-50 cursor-pointer transition-colors ${
                        isSelected ? 'bg-indigo-50/50' : ''
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{emp.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{emp.code}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-indigo-700 font-bold text-[10px]">
                          {emp.department}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        {emp.designation}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="font-bold text-emerald-700">{emp.presentDays}</span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={`font-bold ${emp.absentDays > 4 ? 'text-rose-700' : 'text-slate-600'}`}>
                          {emp.absentDays}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center text-blue-700 font-bold">
                        {emp.weekOffDays}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {isExceeded ? (
                          <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-bold text-[10px]">
                            {emp.offsUsed}/4 (Exceeded!)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[10px]">
                            {emp.offsUsed}/4 ({emp.offsRemaining} left)
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-indigo-700">
                        {emp.totalHoursFormatted}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenDirectRegularize(emp, null);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white font-bold text-[11px] transition-colors"
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
            <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                    <span>{inspectedEmployee.name} ({inspectedEmployee.code})</span>
                    <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-xs border border-indigo-200 font-mono font-bold">
                      {inspectedEmployee.department} • {inspectedEmployee.designation}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Click any day card below to execute an immediate Admin Regularization Override.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenDirectRegularize(inspectedEmployee, null)}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5"
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
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <History className="w-5 h-5 text-indigo-600" />
                Live Attendance & Regularization Audit Trail
              </h3>
              <p className="text-xs text-slate-500">Immutable ledger of all approvals, overrides, and CSV ingestions</p>
            </div>
            <span className="text-xs text-slate-400 font-mono">{auditLogs.length} Events Logged</span>
          </div>

          <div className="space-y-2">
            {auditLogs.map(log => (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-4 text-xs font-mono"
              >
                <div>
                  <span className="font-bold text-indigo-700 uppercase tracking-wider mr-2">
                    [{log.action}]
                  </span>
                  <span className="text-slate-800">{log.details}</span>
                </div>
                <span className="text-slate-400 shrink-0 text-[11px]">{log.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rejection Modal confirmation */}
      {rejectingReqId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <XCircle className="w-5 h-5 text-rose-600" />
              Reject Regularization Request
            </h3>
            <p className="text-xs text-slate-500">
              Please provide the official reason for rejecting this regularization request. It will be reported to the employee.
            </p>
            <textarea
              rows="3"
              placeholder="e.g. Punch logs conflict with floor access data..."
              value={rejectionRemark}
              onChange={(e) => setRejectionRemark(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setRejectingReqId(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs"
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
