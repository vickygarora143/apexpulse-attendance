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
  KeyRound,
  User,
  Lock
} from 'lucide-react';
import SmartReminders from './ai/SmartReminders';

export default function Navbar({ onOpenUpload, onOpenDirectAdminModal, onOpenChangePassword }) {
  const { 
    currentRole, 
    currentUser, 
    attendanceData,
    pendingRequestsCount,
    exportAttendanceCSV,
    authUser,
    logout,
    refreshFromBackend,
    isLoading
  } = useAttendance();

  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Security: derive active role label & badge based strictly on authenticated session
  const roleConfig = {
    admin: {
      label: 'Chief Admin Console',
      icon: ShieldCheck,
      color: 'bg-emerald-50 text-emerald-800 border-emerald-200'
    },
    tl: {
      label: 'Team Leader Portal',
      icon: Users,
      color: 'bg-indigo-50 text-indigo-800 border-indigo-200'
    },
    hr: {
      label: 'HR Operations Console',
      icon: UserCheck,
      color: 'bg-amber-50 text-amber-800 border-amber-200'
    },
    telecaller: {
      label: 'Telecaller Portal',
      icon: Clock,
      color: 'bg-blue-50 text-blue-800 border-blue-200'
    }
  }[currentRole] || {
    label: 'Portal User',
    icon: User,
    color: 'bg-slate-50 text-slate-800 border-slate-200'
  };

  const RoleIcon = roleConfig.icon;

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

          {/* Secure Role Indicator (Read-Only: Zero Role Switching Permitted) */}
          <div className="hidden sm:flex items-center">
            <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-bold shadow-2xs ${roleConfig.color}`}>
              <RoleIcon className="w-3.5 h-3.5" />
              <span>{roleConfig.label}</span>
              {currentRole === 'admin' && pendingRequestsCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 text-[10px] font-black bg-rose-500 text-white rounded-full">
                  {pendingRequestsCount} Pending
                </span>
              )}
            </div>
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

            {/* Smart Reminders Notification Center */}
            <SmartReminders />

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

            {/* Upload Biometric CSV (Restricted strictly to Admin & HR Only) */}
            {(currentRole === 'admin' || currentRole === 'hr') && (
              <button
                onClick={onOpenUpload}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 rounded-lg border border-slate-200 transition-all shadow-xs"
                title="Upload Biometric CSV"
              >
                <Upload className="w-3.5 h-3.5 text-indigo-600" />
                <span className="hidden sm:inline">Upload Biometric CSV</span>
              </button>
            )}

            {/* Export CSV (Admin & HR only) */}
            {(currentRole === 'admin' || currentRole === 'hr') && (
              <button
                onClick={exportAttendanceCSV}
                className="p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 rounded-lg border border-slate-200 transition-all shadow-xs"
                title="Export Full Attendance Sheet"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden lg:inline ml-1">Export CSV</span>
              </button>
            )}

            {/* User Profile Menu (Secure Self-Account Details Only) */}
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
                <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl p-4 z-50 animate-in fade-in zoom-in-95 duration-100 space-y-3">
                  
                  {/* Authenticated User Badge */}
                  <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-white text-sm shadow-xs">
                      {currentUser ? currentUser.name.slice(0, 2).toUpperCase() : 'US'}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 leading-tight">
                        {currentUser?.name || authUser?.name}
                      </h4>
                      <p className="text-[10px] font-mono text-slate-500">
                        {currentUser?.code || authUser?.empCode} • {currentUser?.department || authUser?.department}
                      </p>
                      <span className={`inline-block mt-1 px-2 py-0.2 rounded-full text-[9px] font-black border ${roleConfig.color}`}>
                        {roleConfig.label}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-1.5 pt-1">
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        if (onOpenChangePassword) onOpenChangePassword();
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors cursor-pointer"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Change Password</span>
                    </button>

                    <button
                      onClick={() => { logout(); setUserDropdownOpen(false); }}
                      className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
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

      </div>

    </header>
  );
}
