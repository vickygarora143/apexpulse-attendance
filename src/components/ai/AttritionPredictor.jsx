import React from 'react';
import { useAttendance } from '../../context/AttendanceContext';
import { 
  TrendingDown, 
  AlertTriangle, 
  Lock, 
  ShieldAlert, 
  CheckCircle2, 
  Users, 
  Activity,
  ArrowUpRight
} from 'lucide-react';

export default function AttritionPredictor() {
  const { attendanceData } = useAttendance();

  // Evaluate risk scores per employee
  const riskRoster = attendanceData.employees.map(emp => {
    let riskScore = 0;
    const reasons = [];

    // Factor 1: Offs consumed
    if (emp.offsUsed > 4) {
      riskScore += 45;
      reasons.push('Exceeded monthly 4-off threshold');
    } else if (emp.offsUsed === 4) {
      riskScore += 25;
      reasons.push('Exhausted full 4-off allowance');
    }

    // Factor 2: High absent count
    if (emp.stats.absent >= 4) {
      riskScore += 25;
      reasons.push(`${emp.stats.absent} recorded absences this cycle`);
    }

    // Factor 3: Average hours
    const avgH = parseFloat(emp.stats.avgHours) || 0;
    if (avgH > 0 && avgH < 8.0) {
      riskScore += 20;
      reasons.push(`Low daily engagement (${emp.stats.avgHours} avg hours)`);
    }

    let riskLevel = 'LOW';
    let badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (riskScore >= 60) {
      riskLevel = 'HIGH';
      badgeColor = 'bg-rose-50 text-rose-700 border-rose-200';
    } else if (riskScore >= 35) {
      riskLevel = 'MEDIUM';
      badgeColor = 'bg-amber-50 text-amber-700 border-amber-200';
    }

    return {
      empCode: emp.code,
      name: emp.name,
      dept: emp.department,
      offsUsed: emp.offsUsed,
      absentDays: emp.stats.absent,
      avgHours: emp.stats.avgHours,
      riskScore: Math.min(100, riskScore),
      riskLevel,
      badgeColor,
      reasons
    };
  }).sort((a, b) => b.riskScore - a.riskScore);

  const highRiskCount = riskRoster.filter(r => r.riskLevel === 'HIGH').length;
  const medRiskCount = riskRoster.filter(r => r.riskLevel === 'MEDIUM').length;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
      
      {/* Header with Private Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-base text-slate-900 tracking-tight">
                Absenteeism & Attrition Predictor
              </h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-900 text-white">
                <Lock className="w-2.5 h-2.5" />
                <span>Manager Confidential</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Machine-assisted telemetry detecting telecaller burnout, unplanned absence velocity, and disengagement
            </p>
          </div>
        </div>

        {/* Quick summary badges */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-center">
            <span className="text-[10px] text-rose-600 font-bold uppercase">High Risk</span>
            <div className="text-sm font-black text-rose-700">{highRiskCount} Agents</div>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-center">
            <span className="text-[10px] text-amber-600 font-bold uppercase">Medium Risk</span>
            <div className="text-sm font-black text-amber-700">{medRiskCount} Agents</div>
          </div>
        </div>
      </div>

      {/* Risk Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
        {riskRoster.slice(0, 6).map(r => (
          <div 
            key={r.empCode}
            className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 hover:bg-white hover:border-slate-300 transition-all flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${r.badgeColor}`}>
                  {r.riskLevel} RISK ({r.riskScore}%)
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {r.dept}
                </span>
              </div>

              <div className="font-bold text-xs text-slate-900">{r.name}</div>
              <div className="text-[10px] text-slate-500 font-mono">{r.empCode}</div>

              {/* Contributing Telemetry */}
              <div className="mt-2.5 space-y-1">
                {r.reasons.map((reason, idx) => (
                  <div key={idx} className="flex items-start gap-1.5 text-[11px] text-slate-600">
                    <span className="text-rose-500 font-bold">•</span>
                    <span>{reason}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Score Bar */}
            <div>
              <div className="flex justify-between text-[10px] text-slate-400 font-semibold mb-1">
                <span>Burnout Index</span>
                <span>{r.riskScore}/100</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    r.riskLevel === 'HIGH' ? 'bg-rose-500' : r.riskLevel === 'MEDIUM' ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${r.riskScore}%` }}
                />
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
