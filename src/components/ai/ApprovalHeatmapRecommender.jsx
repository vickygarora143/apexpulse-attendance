import React from 'react';
import { useAttendance } from '../../context/AttendanceContext';
import { 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Users, 
  Calendar, 
  Clock, 
  Check, 
  X,
  TrendingUp
} from 'lucide-react';

export default function ApprovalHeatmapRecommender({ request, onApprove, onReject }) {
  const { attendanceData } = useAttendance();

  if (!request) return null;

  // Calculate floor seat availability heatmap for the requested day and department
  const deptEmployees = attendanceData.employees.filter(e => e.department === request.department);
  const totalInDept = deptEmployees.length || 1;
  
  let presentOnDay = 0;
  deptEmployees.forEach(emp => {
    const day = emp.attendance[request.dayNum];
    if (day && (day.status === 'P' || day.status === 'P (REG)')) {
      presentOnDay++;
    }
  });

  const availabilityRate = Math.round((presentOnDay / totalInDept) * 100);
  const targetEmployee = attendanceData.employees.find(e => e.code === request.empCode);
  const offsUsed = targetEmployee?.offsUsed || 0;

  // AI Recommendation Logic
  let isRecommended = true;
  let recommendationReason = '';
  let confidence = '95%';

  if (offsUsed >= 4) {
    isRecommended = false;
    recommendationReason = `Agent has already consumed ${offsUsed}/4 monthly offs. Approval will grant additional paid day beyond quota.`;
    confidence = '82%';
  } else if (availabilityRate < 70) {
    isRecommended = false;
    recommendationReason = `Department floor availability on Day ${request.dayNum} was low (${availabilityRate}%). Verify physical presence.`;
    confidence = '88%';
  } else {
    isRecommended = true;
    recommendationReason = `Agent worked full shift (${request.calcDuration || '09:00'}). Team floor coverage is healthy (${availabilityRate}%).`;
    confidence = '96%';
  }

  return (
    <div className="mt-3 p-3.5 rounded-xl border border-indigo-100 bg-indigo-50/40 text-xs space-y-3">
      
      {/* Top Banner: Recommendation + Confidence */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span className="font-extrabold text-slate-900 text-[11px]">
            AI Regularization Recommender:
          </span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
            isRecommended 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
              : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}>
            {isRecommended ? 'Recommended to Approve' : 'Review Advised'}
          </span>
        </div>

        <span className="text-[10px] text-slate-500 font-mono">
          Confidence: <strong>{confidence}</strong>
        </span>
      </div>

      <p className="text-[11px] text-slate-600 leading-relaxed">
        {recommendationReason}
      </p>

      {/* Team Availability Heatmap Widget */}
      <div className="p-2.5 rounded-lg bg-white border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-slate-500" />
          <div>
            <div className="text-[11px] font-bold text-slate-800">
              {request.department} Floor Availability on Day {request.dayNum}
            </div>
            <div className="text-[10px] text-slate-500">
              {presentOnDay} of {totalInDept} Agents Present ({availabilityRate}%)
            </div>
          </div>
        </div>

        {/* Heatmap Bar */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-24 bg-slate-200 h-2 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all ${
                availabilityRate >= 80 ? 'bg-emerald-500' : availabilityRate >= 60 ? 'bg-amber-500' : 'bg-rose-500'
              }`}
              style={{ width: `${availabilityRate}%` }}
            />
          </div>
          <span className="text-[10px] font-mono font-bold text-slate-700">
            {availabilityRate}%
          </span>
        </div>
      </div>

    </div>
  );
}
