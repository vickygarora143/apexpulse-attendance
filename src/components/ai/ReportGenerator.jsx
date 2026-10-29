import React, { useState } from 'react';
import { useAttendance } from '../../context/AttendanceContext';
import { 
  Sparkles, 
  Search, 
  Download, 
  FileSpreadsheet, 
  Filter, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight,
  BarChart2
} from 'lucide-react';

export default function ReportGenerator() {
  const { attendanceData, exportAttendanceCSV } = useAttendance();
  const [prompt, setPrompt] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL'); // 'ALL' | 'OVER_LIMIT' | 'MOHALI' | 'MONEYVIEW' | 'HIGH_ATTENDANCE'

  const promptSuggestions = [
    { label: 'Agents Exceeding 4 Offs', filter: 'OVER_LIMIT' },
    { label: 'Mohali Floor Roster', filter: 'MOHALI' },
    { label: 'Moneyview Floor Roster', filter: 'MONEYVIEW' },
    { label: '90%+ Attendance Performers', filter: 'HIGH_ATTENDANCE' }
  ];

  // Filter employees according to search query or filter chips
  const filteredEmployees = attendanceData.employees.filter(emp => {
    // 1. Text Search Prompt match
    if (prompt.trim()) {
      const q = prompt.toLowerCase();
      const matchText = emp.name.toLowerCase().includes(q) || 
                        emp.code.toLowerCase().includes(q) || 
                        emp.department.toLowerCase().includes(q);
      if (!matchText) return false;
    }

    // 2. Chip filter
    if (activeFilter === 'OVER_LIMIT') return emp.isOffLimitExceeded;
    if (activeFilter === 'MOHALI') return emp.department === 'MOHALI';
    if (activeFilter === 'MONEYVIEW') return emp.department === 'MONEYVIEW';
    if (activeFilter === 'HIGH_ATTENDANCE') {
      const rate = (emp.stats.present / (emp.stats.present + emp.stats.absent || 1)) * 100;
      return rate >= 90;
    }

    return true;
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
      
      {/* Title & Description */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900 tracking-tight">
              AI Attendance & Workforce Report Generator
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Query workforce attendance using natural filters, generate payroll metrics, and export compliance reports
          </p>
        </div>

        <button
          onClick={exportAttendanceCSV}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors shrink-0"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Master CSV</span>
        </button>
      </div>

      {/* Search-style Prompt Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask or search: e.g. 'Mohali telecallers with over 3 absences' or enter employee name/code..."
          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all shadow-xs"
        />
      </div>

      {/* Suggestion Chips */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
          Quick Filters:
        </span>
        <button
          onClick={() => { setActiveFilter('ALL'); setPrompt(''); }}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
            activeFilter === 'ALL' && !prompt
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
              : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
          }`}
        >
          All ({attendanceData.employees.length})
        </button>
        {promptSuggestions.map((s, idx) => (
          <button
            key={idx}
            onClick={() => { setActiveFilter(s.filter); setPrompt(''); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              activeFilter === s.filter
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Report Results Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">Employee</th>
              <th className="py-3 px-3">Dept</th>
              <th className="py-3 px-3 text-center">Present (P)</th>
              <th className="py-3 px-3 text-center">Absent (A)</th>
              <th className="py-3 px-3 text-center">Week Offs (WO)</th>
              <th className="py-3 px-3 text-center">Offs Used / 4</th>
              <th className="py-3 px-3 text-right">Avg Daily Hours</th>
              <th className="py-3 px-4 text-center">Payroll Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredEmployees.map(emp => {
              const presentDays = emp.stats.present;
              const absentDays = emp.stats.absent;
              const woDays = emp.stats.weekOff;
              const offsUsed = emp.offsUsed;
              const isOver = emp.isOffLimitExceeded;

              return (
                <tr key={emp.code} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{emp.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{emp.code}</div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      {emp.department}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center font-bold text-emerald-700">{presentDays}</td>
                  <td className="py-3 px-3 text-center font-bold text-rose-600">{absentDays}</td>
                  <td className="py-3 px-3 text-center font-semibold text-slate-600">{woDays}</td>
                  <td className="py-3 px-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                      isOver ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {offsUsed} / 4
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-700">{emp.stats.avgHours}</td>
                  <td className="py-3 px-4 text-center">
                    {isOver ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Excess Offs</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Within Quota</span>
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
}
