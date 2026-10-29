import React, { useState } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { 
  ShieldCheck, 
  Users, 
  UserCheck, 
  Clock, 
  ArrowRight, 
  Lock, 
  User, 
  AlertCircle,
  Calendar,
  Eye,
  EyeOff
} from 'lucide-react';

export default function RoleLogin() {
  const { login } = useAttendance();

  const [activeRole, setActiveRole] = useState('ADMIN'); // 'ADMIN' | 'TL' | 'HR' | 'TELECALLER'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const roles = [
    {
      id: 'ADMIN',
      label: 'Chief Admin',
      icon: ShieldCheck,
      badge: 'Master Control',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      description: 'Review and approve/reject all attendance regularizations, perform direct attendance overrides, manage workforce compliance.',
      userPlaceholder: 'admin'
    },
    {
      id: 'TL',
      label: 'Team Leader (TL)',
      icon: Users,
      badge: 'Supervisory',
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      description: 'Supervise telecaller team roster, track 4-off allowance limits, submit attendance regularizations to Admin.',
      userPlaceholder: 'tl_shruti or GDSM002'
    },
    {
      id: 'HR',
      label: 'HR Operations',
      icon: UserCheck,
      badge: 'Company Wide',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
      description: 'Review departmental attendance (Mohali & Moneyview), calculate payable days & payroll summaries, upload biometric sheets.',
      userPlaceholder: 'hr_himani or GDSM139'
    },
    {
      id: 'TELECALLER',
      label: 'Telecaller / Agent',
      icon: Clock,
      badge: 'Self-Service',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
      description: 'Personal 30-day attendance calendar, track 4 monthly offs balance, request direct attendance regularizations to Admin.',
      userPlaceholder: 'agent_meenu or GDSM065'
    }
  ];

  const currentRoleConfig = roles.find(r => r.id === activeRole) || roles[0];

  const handleRoleTabChange = (roleId) => {
    setActiveRole(roleId);
    setErrorMsg('');
    setUsername('');
    setPassword('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    
    if (!username.trim() || !password.trim()) {
      setErrorMsg('Please enter both your employee code/username and password.');
      return;
    }

    setLoading(true);
    const res = await login(username.trim(), password, activeRole);
    setLoading(false);

    if (!res.success) {
      setErrorMsg(res.error || 'Authentication failed. Please verify your credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      
      {/* Top Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 shadow-md shadow-indigo-200 mb-3 text-white">
          <Calendar className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          Apex<span className="text-indigo-600">Pulse</span>
        </h2>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mt-1">
          Enterprise People Management & Attendance Portal
        </p>
        <p className="text-xs text-slate-500 mt-1">
          Select your designation below to access your role-specific dashboard
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200/80">
          
          {/* Role Selection Tabs */}
          <div className="mb-6">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Select Designation / Portal Role:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {roles.map(r => {
                const Icon = r.icon;
                const isSelected = activeRole === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => handleRoleTabChange(r.id)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 shadow-sm ring-1 ring-indigo-600 font-bold'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 font-medium'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mb-1.5 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <span className="text-[11px] leading-tight">{r.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Role Banner Description */}
          <div className="mb-6 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <currentRoleConfig.icon className="w-4 h-4 text-indigo-600" />
                <span>{currentRoleConfig.label} Authentication</span>
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${currentRoleConfig.badgeColor}`}>
                {currentRoleConfig.badge}
              </span>
            </div>
            <p className="text-slate-600 leading-relaxed mt-1">
              {currentRoleConfig.description}
            </p>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Employee Code or Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={`e.g. ${currentRoleConfig.userPlaceholder}`}
                  className="block w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Password
                </label>
                {activeRole !== 'ADMIN' && (
                  <span className="text-[10px] text-slate-500">
                    First-time temp password: <span className="font-mono font-semibold text-indigo-600">gds@123</span>
                  </span>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your confidential password"
                  className="block w-full pl-9 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Authenticating with Cloudflare D1...</span>
              ) : (
                <>
                  <span>Sign In to {currentRoleConfig.label} Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

        </div>

        {/* Policy footer callout */}
        <div className="mt-4 text-center text-[11px] text-slate-500 space-y-1">
          <p>
            Roster Policies Active: <strong>1st Day = Week Off</strong> • <strong>Sundays = Week Off (Except Last Sunday = Working)</strong> • <strong>4 Monthly Offs Quota</strong>
          </p>
          <p className="font-mono text-slate-400">
            Powered by Cloudflare D1 SQL Engine • Enterprise Live Deployment
          </p>
        </div>

      </div>

    </div>
  );
}
