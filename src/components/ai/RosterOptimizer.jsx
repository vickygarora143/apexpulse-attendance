import React, { useState } from 'react';
import { useAttendance } from '../../context/AttendanceContext';
import { 
  CalendarRange, 
  Sparkles, 
  Check, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Users,
  ArrowRight
} from 'lucide-react';

export default function RosterOptimizer() {
  const { attendanceData } = useAttendance();

  const [suggestions, setSuggestions] = useState([
    {
      id: 'sug-1',
      title: 'Enforce Mandatory 1st Day Week Off (WO)',
      scope: 'All 24 Employees • Mohali & Moneyview',
      impact: '100% Policy Compliance',
      description: 'System automatically confirms Day 1 as non-working Week Off (WO) across all rosters.',
      status: 'ACCEPTED'
    },
    {
      id: 'sug-2',
      title: 'Maximize Telecalling Floor Coverage on Day 27 (Last Working Sunday)',
      scope: 'MOHALI Floor (15 Telecallers)',
      impact: '+22% Customer Reach',
      description: 'Rebalance telecalling calling batches into two overlapping shifts (09:00-18:00 and 10:00-19:00) on the last working Sunday.',
      status: 'PENDING'
    },
    {
      id: 'sug-3',
      title: 'Backfill Mohali Telecaller Coverage for Day 14 Absenteeism',
      scope: 'Team Ashish & Team Shruti',
      impact: 'Zero Target Downtime',
      description: 'Reassign 2 reserve telecallers from non-calling queues to cover outbound collections on Day 14.',
      status: 'PENDING'
    }
  ]);

  const [notification, setNotification] = useState('');

  const handleDecision = (id, newStatus) => {
    setSuggestions(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
    setNotification(newStatus === 'ACCEPTED' ? 'Optimization suggestion applied to workforce schedule!' : 'Suggestion dismissed.');
    setTimeout(() => setNotification(''), 2500);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
            <CalendarRange className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-900 tracking-tight flex items-center gap-2">
              <span>Shift & Roster Optimizer</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-100 text-indigo-700">
                AI Powered
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Automated roster balancing, minimum floor seat occupancy forecasting, and shift adjustment suggestions
            </p>
          </div>
        </div>

        {notification && (
          <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-1.5 animate-in fade-in duration-150">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{notification}</span>
          </div>
        )}
      </div>

      {/* Suggestion Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {suggestions.map(sug => {
          const isAccepted = sug.status === 'ACCEPTED';
          const isRejected = sug.status === 'REJECTED';

          return (
            <div 
              key={sug.id}
              className={`p-4 rounded-xl border transition-all flex flex-col justify-between space-y-3 ${
                isAccepted 
                  ? 'bg-emerald-50/40 border-emerald-200' 
                  : isRejected
                  ? 'bg-slate-50/60 border-slate-200 opacity-60'
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {sug.impact}
                  </span>
                  <span className={`text-[10px] font-black ${
                    isAccepted ? 'text-emerald-700' : isRejected ? 'text-slate-400' : 'text-amber-600'
                  }`}>
                    {sug.status}
                  </span>
                </div>

                <h4 className="font-bold text-xs text-slate-900 leading-snug">
                  {sug.title}
                </h4>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                  Scope: {sug.scope}
                </div>

                <p className="text-[11px] text-slate-600 leading-relaxed mt-2">
                  {sug.description}
                </p>
              </div>

              {/* Accept / Reject Buttons */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                {!isAccepted && !isRejected && (
                  <>
                    <button
                      onClick={() => handleDecision(sug.id, 'REJECTED')}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold transition-colors flex items-center gap-1"
                    >
                      <X className="w-3.5 h-3.5 text-slate-400" />
                      <span>Reject</span>
                    </button>
                    <button
                      onClick={() => handleDecision(sug.id, 'ACCEPTED')}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors flex items-center gap-1 shadow-2xs"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Accept Suggestion</span>
                    </button>
                  </>
                )}

                {isAccepted && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Applied to Roster</span>
                  </span>
                )}

                {isRejected && (
                  <button
                    onClick={() => handleDecision(sug.id, 'PENDING')}
                    className="text-[10px] text-indigo-600 hover:underline font-semibold"
                  >
                    Reconsider
                  </button>
                )}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
