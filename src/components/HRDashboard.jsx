import React, { useState } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { 
  UserCheck, 
  Upload, 
  Download, 
  FileSpreadsheet, 
  Building2, 
  TrendingUp, 
  Calendar, 
  AlertTriangle,
  CheckCircle2,
  Search
} from 'lucide-react';

export default function HRDashboard({ onOpenUpload, onOpenRegularizeModal }) {
  const { attendanceData, exportAttendanceCSV, regularizations } = useAttendance();
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const departments = ['ALL', ...attendanceData.departments];

  // Filtered employees
  const filteredEmployees = attendanceData.employees.filter(emp => {
    if (selectedDept !== 'ALL' && emp.department !== selectedDept) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return emp.name.toLowerCase().includes(term) || emp.code.toLowerCase().includes(term);
    }
    return true;
  });

  // Aggregate stats
  const totalEmployees = attendanceData.employees.length;
  let totalPresentCount = 0;
  let totalAbsentCount = 0;
  let totalWOCount = 0;

  attendanceData.employees.forEach(e => {
    totalPresentCount += e.presentDays;
    totalAbsentCount += e.absentDays;
    totalWOCount += e.weekOffDays;
  });

  const totalPossible = (totalPresentCount + totalAbsentCount + totalWOCount) || 1;
  const attendanceRate = Math.round((totalPresentCount / (totalPresentCount + totalAbsentCount || 1)) * 100);

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* HR Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <UserCheck className="w-5 h-5" />
              </span>
              <h1 className="text-xl font-black text-white">HR People Operations & Ingestion Center</h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Biometric Sheet Ingestion • Departmental Payroll Calculations • Attendance Policy Compliance
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenUpload}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Biometric Sheet</span>
            </button>

            <button
              onClick={exportAttendanceCSV}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-medium text-xs border border-slate-700 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Export Payroll CSV</span>
            </button>
          </div>
        </div>

        {/* HR Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800">
          
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400">Total Workforce</p>
              <h4 className="text-xl font-bold text-white mt-0.5">{totalEmployees} Active</h4>
              <p className="text-[10px] text-slate-400">{attendanceData.company} Unit</p>
            </div>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Building2 className="w-5 h-5" />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs text-emerald-400">Company Attendance %</p>
              <h4 className="text-xl font-bold text-emerald-300 mt-0.5">{attendanceRate}%</h4>
              <p className="text-[10px] text-slate-400">{totalPresentCount} Total Present Days</p>
            </div>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs text-rose-400">Over-Limit Offs (&gt;4 Offs)</p>
              <h4 className="text-xl font-bold text-rose-300 mt-0.5">
                {attendanceData.employees.filter(e => e.isOffLimitExceeded).length} Staff
              </h4>
              <p className="text-[10px] text-slate-400">Affects payroll deductions</p>
            </div>
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400">Mandated Offs (WO)</p>
              <h4 className="text-xl font-bold text-blue-300 mt-0.5">{totalWOCount} Days</h4>
              <p className="text-[10px] text-slate-400">Includes 1st Date & Sundays</p>
            </div>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <Calendar className="w-5 h-5" />
            </div>
          </div>

        </div>
      </div>

      {/* Department Breakdown & Payroll Summary */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
        
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-300">Department:</span>
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              {departments.map(d => (
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

          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search employee or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Payroll Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-3">Department</th>
                <th className="py-3 px-3">Designation</th>
                <th className="py-3 px-3 text-center">Present Days</th>
                <th className="py-3 px-3 text-center">Mandated WO</th>
                <th className="py-3 px-3 text-center">Payable Days</th>
                <th className="py-3 px-3 text-center">Unplanned Offs</th>
                <th className="py-3 px-3 text-center">4-Off Quota Status</th>
                <th className="py-3 px-3 text-right">Logged Hours</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {filteredEmployees.map(emp => {
                const payableDays = emp.presentDays + emp.weekOffDays;
                const isOver = emp.isOffLimitExceeded;

                return (
                  <tr key={emp.code} className="hover:bg-slate-800/40 transition-colors">
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
                    <td className="py-3 px-3 text-center font-bold text-emerald-400">
                      {emp.presentDays}
                    </td>
                    <td className="py-3 px-3 text-center text-blue-400 font-medium">
                      {emp.weekOffDays}
                    </td>
                    <td className="py-3 px-3 text-center font-black text-indigo-300 font-mono">
                      {payableDays} / {attendanceData.totalDays}
                    </td>
                    <td className="py-3 px-3 text-center text-rose-400 font-semibold">
                      {emp.absentDays}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {isOver ? (
                        <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold">
                          {emp.offsUsed}/4 (Exceeded)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                          {emp.offsUsed}/4 Allowed
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-200">
                      {emp.totalHoursFormatted}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => onOpenRegularizeModal(emp, null)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-medium transition-colors"
                      >
                        Request Reg.
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}
