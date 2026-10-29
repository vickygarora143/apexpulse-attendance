import React, { useState } from 'react';
import { useAttendance } from '../../context/AttendanceContext';
import { 
  Users, 
  TrendingUp, 
  Sliders, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Calendar,
  Building2
} from 'lucide-react';

export default function WorkforcePlanner() {
  const { attendanceData } = useAttendance();

  // Scenario toggles
  const [highVolumeCampaign, setHighVolumeCampaign] = useState(false);
  const [strictOccupancy, setStrictOccupancy] = useState(true);
  const [sundayOvertime, setSundayOvertime] = useState(true);

  const totalHeadcount = attendanceData.employees.length || 24;
  const mohaliCount = attendanceData.employees.filter(e => e.department === 'MOHALI').length;
  const moneyviewCount = attendanceData.employees.filter(e => e.department === 'MONEYVIEW').length;

  // Dynamic calculations based on scenario toggles
  const baseCallingSeatsNeeded = Math.round(totalHeadcount * 0.80); // 80% baseline
  let requiredHeadcount = baseCallingSeatsNeeded;
  
  if (highVolumeCampaign) requiredHeadcount += 4;
  if (strictOccupancy) requiredHeadcount += 2;

  const currentAvailableAverage = Math.round(totalHeadcount * 0.85); // 85% present rate
  const deficit = Math.max(0, requiredHeadcount - currentAvailableAverage);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-900 tracking-tight flex items-center gap-2">
              <span>Workforce & Floor Capacity Planner</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                Interactive Scenarios
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Simulate operational calling targets, floor occupancy requirements, and shift coverage
            </p>
          </div>
        </div>

        {/* Status Chip */}
        <div className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-2 ${
          deficit === 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
        }`}>
          {deficit === 0 ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-rose-600" />}
          <span>{deficit === 0 ? 'Capacity Sufficient' : `Deficit: ${deficit} Seats`}</span>
        </div>
      </div>

      {/* Scenario Toggles Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
        
        {/* Toggle 1 */}
        <button
          type="button"
          onClick={() => setHighVolumeCampaign(!highVolumeCampaign)}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            highVolumeCampaign
              ? 'bg-indigo-50/80 border-indigo-300 ring-1 ring-indigo-500 shadow-xs'
              : 'bg-slate-50 border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-xs text-slate-900">Campaign Surge</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
              highVolumeCampaign ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'
            }`}>
              {highVolumeCampaign ? 'ON (+4)' : 'OFF'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 leading-tight">
            +25% calling targets during festival recovery surge
          </p>
        </button>

        {/* Toggle 2 */}
        <button
          type="button"
          onClick={() => setStrictOccupancy(!strictOccupancy)}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            strictOccupancy
              ? 'bg-indigo-50/80 border-indigo-300 ring-1 ring-indigo-500 shadow-xs'
              : 'bg-slate-50 border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-xs text-slate-900">85% Seat Occupancy</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
              strictOccupancy ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'
            }`}>
              {strictOccupancy ? 'ON (+2)' : 'OFF'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 leading-tight">
            Strict telecalling floor threshold to prevent SLA breaches
          </p>
        </button>

        {/* Toggle 3 */}
        <button
          type="button"
          onClick={() => setSundayOvertime(!sundayOvertime)}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            sundayOvertime
              ? 'bg-indigo-50/80 border-indigo-300 ring-1 ring-indigo-500 shadow-xs'
              : 'bg-slate-50 border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-xs text-slate-900">Last Sunday Working</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
              sundayOvertime ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
            }`}>
              {sundayOvertime ? 'ACTIVE' : 'OFF'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 leading-tight">
            Mandatory working shift on Day 27 for maximum recovery
          </p>
        </button>

      </div>

      {/* Projection Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
          <div className="text-[11px] text-slate-500 font-semibold">Total Roster</div>
          <div className="text-xl font-black text-slate-900 mt-0.5">{totalHeadcount} Staff</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Mohali ({mohaliCount}) • Moneyview ({moneyviewCount})</div>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
          <div className="text-[11px] text-slate-500 font-semibold">Required Floor Seats</div>
          <div className="text-xl font-black text-indigo-700 mt-0.5">{requiredHeadcount} Agents</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Active scenario demand</div>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
          <div className="text-[11px] text-slate-500 font-semibold">Projected Available</div>
          <div className="text-xl font-black text-emerald-700 mt-0.5">{currentAvailableAverage} Agents</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Based on historical attendance</div>
        </div>

        <div className={`p-3 rounded-xl border ${deficit > 0 ? 'bg-rose-50 border-rose-200' : 'bg-emerald-50 border-emerald-200'}`}>
          <div className="text-[11px] font-semibold text-slate-600">Headcount Balance</div>
          <div className={`text-xl font-black mt-0.5 ${deficit > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
            {deficit > 0 ? `-${deficit} Shortage` : '+0 Optimal'}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            {deficit > 0 ? 'Restricting off approvals recommended' : 'Floor coverage fully secured'}
          </div>
        </div>
      </div>

    </div>
  );
}
