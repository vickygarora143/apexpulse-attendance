import React, { useState } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { 
  ShieldCheck, 
  Users, 
  UserCheck, 
  FileSpreadsheet, 
  Upload, 
  Download, 
  Calendar, 
  Clock, 
  Sparkles,
  Info,
  CheckCircle2,
  ChevronDown
} from 'lucide-react';

export default function Navbar({ onOpenUpload, onOpenDirectAdminModal }) {
  const { 
    currentRole, 
    setCurrentRole, 
    currentUser, 
    setSelectedEmpId, 
    attendanceData,
    pendingRequestsCount,
    exportAttendanceCSV
  } = useAttendance();

  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const roles = [
    { id: 'admin', label: 'Admin Dashboard', icon: ShieldCheck, badge: pendingRequestsCount > 0 ? pendingRequestsCount : null },
    { id: 'tl', label: 'Team Leader (TL)', icon: Users },
    { id: 'hr', label: 'HR Specialist', icon: UserCheck },
    { id: 'telecaller', label: 'Telecaller / Employee', icon: Clock }
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Platform Info */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-white">Apex<span className="text-emerald-400">Pulse</span></span>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-indigo-950 text-indigo-300 border border-indigo-700/50 rounded-full">Enterprise Attendance</span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">People Management & Biometric Regularization Engine</p>
            </div>
          </div>

          {/* Quick Role Switcher Pills */}
          <div className="hidden md:flex items-center p-1 bg-slate-950/80 rounded-xl border border-slate-800">
            {roles.map(r => {
              const Icon = r.icon;
              const isActive = currentRole === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => setCurrentRole(r.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive 
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/30' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{r.label}</span>
                  {r.badge && (
                    <span className="ml-1 px-1.5 py-0.2 text-[10px] font-bold bg-amber-500 text-slate-950 rounded-full animate-pulse">
                      {r.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Action Center & User Picker */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Direct Admin Quick Action if in Admin role */}
            {currentRole === 'admin' && (
              <button
                onClick={onOpenDirectAdminModal}
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-all shadow-sm shadow-emerald-500/20"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Regularize Any User</span>
              </button>
            )}

            {/* Upload Biometric CSV */}
            <button
              onClick={onOpenUpload}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg border border-slate-700 transition-all"
              title="Upload Biometric CSV"
            >
              <Upload className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Upload Biometric CSV</span>
            </button>

            {/* Export CSV */}
            <button
              onClick={exportAttendanceCSV}
              className="p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg border border-slate-700 transition-all"
              title="Export Full Attendance Sheet"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden lg:inline ml-1">Export</span>
            </button>

            {/* Active User Switcher / Impersonator */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 pl-2 pr-3 py-1 bg-slate-950/80 hover:bg-slate-800 border border-slate-800 rounded-lg text-left transition-all"
              >
                <div className="w-7 h-7 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center font-bold text-xs text-indigo-300">
                  {currentUser ? currentUser.name.slice(0, 2).toUpperCase() : 'US'}
                </div>
                <div className="hidden sm:block text-xs">
                  <div className="font-semibold text-slate-200 leading-tight truncate max-w-[110px]">
                    {currentUser ? currentUser.name : 'Select User'}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {currentUser ? currentUser.code : ''}
                  </div>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 z-50 max-h-96 overflow-y-auto">
                  <div className="px-2 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800 mb-1">
                    Select Employee / Telecaller
                  </div>
                  {attendanceData.employees.map(emp => (
                    <button
                      key={emp.code}
                      onClick={() => {
                        setSelectedEmpId(emp.code);
                        setUserDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-left transition-colors ${
                        currentUser?.code === emp.code 
                          ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30' 
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div>
                        <div className="font-medium text-slate-200">{emp.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{emp.code} • {emp.department}</div>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                        {emp.role.toUpperCase()}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Mobile Role Switcher Bar */}
        <div className="flex md:hidden items-center justify-between py-2 border-t border-slate-800/80 gap-1 overflow-x-auto">
          {roles.map(r => {
            const Icon = r.icon;
            const isActive = currentRole === r.id;
            return (
              <button
                key={r.id}
                onClick={() => setCurrentRole(r.id)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap ${
                  isActive ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{r.label.split(' ')[0]}</span>
                {r.badge && (
                  <span className="px-1 text-[9px] font-bold bg-amber-400 text-slate-900 rounded-full">
                    {r.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

      </div>

      {/* Roster & Attendance Policies Banner */}
      <div className="bg-slate-950/70 border-t border-slate-800/60 py-1.5 px-4 text-[11px] text-slate-300">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-semibold text-slate-200">Active Roster Rules:</span>
            <span className="px-1.5 py-0.5 rounded bg-slate-800/90 text-emerald-300 font-mono border border-slate-700/60">
              1st Date = WO (Week Off)
            </span>
            <span className="px-1.5 py-0.5 rounded bg-slate-800/90 text-indigo-300 font-mono border border-slate-700/60">
              Sundays = WO (Except Last Sunday = WORKING)
            </span>
            <span className="px-1.5 py-0.5 rounded bg-slate-800/90 text-amber-300 font-mono border border-slate-700/60">
              Agent Max Monthly Offs = 4
            </span>
          </div>
          <div className="text-slate-400 font-mono text-[10px]">
            {attendanceData.dateRange} • {attendanceData.totalDays} Days • Printed: {attendanceData.printedOn || 'Latest'}
          </div>
        </div>
      </div>
    </header>
  );
}
