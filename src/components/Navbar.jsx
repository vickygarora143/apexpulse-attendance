import React, { useState } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { 
  ShieldCheck, 
  Users, 
  UserCheck, 
  Clock, 
  Upload, 
  Download, 
  Calendar, 
  LogOut,
  ChevronDown,
  Sparkles,
  RefreshCw,
  KeyRound
} from 'lucide-react';

export default function Navbar({ onOpenUpload, onOpenDirectAdminModal, onOpenChangePassword }) {
  const { 
    currentRole, 
    setCurrentRole, 
    currentUser, 
    setSelectedEmpId, 
    attendanceData,
    pendingRequestsCount,
    exportAttendanceCSV,
    authUser,
    logout,
    refreshFromBackend,
    isLoading
  } = useAttendance();

  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const roles = [
    { id: 'admin', label: 'Admin Console', icon: ShieldCheck, badge: pendingRequestsCount > 0 ? pendingRequestsCount : null },
    { id: 'tl', label: 'Team Leader', icon: Users },
    { id: 'hr', label: 'HR Specialist', icon: UserCheck },
    { id: 'telecaller', label: 'Telecaller / Agent', icon: Clock }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Platform Info */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-100">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-slate-900">
                  Apex<span className="text-indigo-600">Pulse</span>
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/80 rounded-full">
                  Enterprise
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">People Management & Biometric Regularization Engine</p>
            </div>
          </div>

          {/* Quick Role Switcher Pills */}
          <div className="hidden md:flex items-center p-1 bg-slate-100/80 rounded-xl border border-slate-200/80">
            {roles.map(r => {
              const Icon = r.icon;
              const isActive = currentRole === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => setCurrentRole(r.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive 
                      ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/60 font-bold' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span>{r.label}</span>
                  {r.badge && (
                    <span className="ml-1 px-1.5 py-0.2 text-[10px] font-black bg-rose-500 text-white rounded-full">
                      {r.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Action Center & Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Sync live D1 button */}
            <button
              onClick={refreshFromBackend}
              disabled={isLoading}
              className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors"
              title="Sync Live Records with Cloudflare D1"
            >
              <RefreshCw className={`w-4 h-4 text-slate-600 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            {/* Direct Admin Quick Action if in Admin role */}
            {currentRole === 'admin' && (
              <button
                onClick={onOpenDirectAdminModal}
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Regularize Any User</span>
              </button>
            )}

            {/* Upload Biometric CSV */}
            <button
              onClick={onOpenUpload}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 rounded-lg border border-slate-200 transition-all shadow-xs"
              title="Upload Biometric CSV"
            >
              <Upload className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">Upload Biometric CSV</span>
            </button>

            {/* Export CSV */}
            <button
              onClick={exportAttendanceCSV}
              className="p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 rounded-lg border border-slate-200 transition-all shadow-xs"
              title="Export Full Attendance Sheet"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden lg:inline ml-1">Export CSV</span>
            </button>

            {/* User Profile / Switcher */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 pl-2 pr-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-left shadow-xs transition-all"
              >
                <div className="w-7 h-7 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center font-black text-xs text-indigo-700">
                  {currentUser ? currentUser.name.slice(0, 2).toUpperCase() : 'US'}
                </div>
                <div className="hidden sm:block text-xs">
                  <div className="font-bold text-slate-900 leading-tight truncate max-w-[110px]">
                    {currentUser ? currentUser.name : 'User'}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    {currentUser ? currentUser.code : ''}
                  </div>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-xl p-2 z-50 max-h-96 overflow-y-auto">
                  <div className="px-2 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1">
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
                          ? 'bg-indigo-50 text-indigo-700 font-bold' 
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div>
                        <div className="font-semibold">{emp.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{emp.code} • {emp.department}</div>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                        {emp.role.toUpperCase()}
                      </span>
                    </button>
                  ))}
                  <div className="pt-2 mt-2 border-t border-slate-100 space-y-1">
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        if (onOpenChangePassword) onOpenChangePassword();
                      }}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                    >
                      <KeyRound className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Change Personal Password</span>
                    </button>
                    <button
                      onClick={() => { logout(); setUserDropdownOpen(false); }}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Switch Account / Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Logout icon button */}
            <button
              onClick={logout}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition-colors"
              title="Sign Out to Role Selection"
            >
              <LogOut className="w-4 h-4" />
            </button>

          </div>

        </div>

        {/* Mobile View Role Switcher Bar */}
        <div className="flex md:hidden items-center justify-between py-2 border-t border-slate-200 gap-1 overflow-x-auto">
          {roles.map(r => {
            const Icon = r.icon;
            const isActive = currentRole === r.id;
            return (
              <button
                key={r.id}
                onClick={() => setCurrentRole(r.id)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap ${
                  isActive ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{r.label.split(' ')[0]}</span>
                {r.badge && (
                  <span className="px-1 text-[9px] font-black bg-rose-500 text-white rounded-full">
                    {r.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

      </div>

      {/* Roster Policies Ticker Bar (Crisp Light Theme) */}
      <div className="bg-slate-100/90 border-t border-slate-200 py-1.5 px-4 text-[11px] text-slate-700">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
            <span className="font-bold text-slate-800">Company Policies:</span>
            <span className="px-2 py-0.5 rounded-md bg-white text-blue-700 font-mono font-bold border border-slate-200 shadow-2xs">
              1st Date = WO (Week Off)
            </span>
            <span className="px-2 py-0.5 rounded-md bg-white text-purple-700 font-mono font-bold border border-slate-200 shadow-2xs">
              Sundays = WO (Except Last Sunday = WORKING)
            </span>
            <span className="px-2 py-0.5 rounded-md bg-white text-amber-700 font-mono font-bold border border-slate-200 shadow-2xs">
              4 Monthly Offs Quota
            </span>
          </div>
          <div className="text-slate-500 font-mono text-[10px]">
            {attendanceData.dateRange} • {attendanceData.totalDays} Days • Cloudflare D1 Backend
          </div>
        </div>
      </div>
    </header>
  );
}
