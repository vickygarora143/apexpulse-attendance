import React from 'react';
import { Clock, CheckCircle2, XCircle, Calendar, Sparkles, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function AttendanceCalendar({ employee, onRegularizeDay, isAdmin }) {
  if (!employee || !employee.attendance) {
    return <div className="p-8 text-center text-slate-400">No attendance data available.</div>;
  }

  const days = Object.values(employee.attendance).sort((a, b) => a.dayNum - b.dayNum);

  return (
    <div className="space-y-4">
      {/* Legend & Summary Info */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-xs">
        <div className="flex items-center gap-2 font-medium text-slate-300">
          <Calendar className="w-4 h-4 text-indigo-400" />
          <span>Attendance Timeline for <strong className="text-white">{employee.name}</strong> ({employee.code})</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[11px]">
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Present (P)
          </span>
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <span className="w-2 h-2 rounded-full bg-rose-400"></span> Absent (A)
          </span>
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <span className="w-2 h-2 rounded-full bg-blue-400"></span> Week Off (WO)
          </span>
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <span className="w-2 h-2 rounded-full bg-purple-400"></span> Last Sun Working
          </span>
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-teal-500/10 text-teal-400 border border-teal-500/20">
            <span className="w-2 h-2 rounded-full bg-teal-400"></span> Regularized (REG)
          </span>
        </div>
      </div>

      {/* Grid of Days */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-3">
        {days.map(day => {
          const isPresent = day.status === 'P' || day.status === 'WOP';
          const isRegularized = day.status === 'P (REG)' || day.isRegularized;
          const isAbsent = day.status === 'A';
          const isWO = day.status === 'WO';
          const isLastSunday = day.isLastSundayWorking;
          const is1stDate = day.dayNum === 1;

          // Theme based on status
          let borderClass = 'border-slate-800';
          let bgClass = 'bg-slate-900/40 hover:bg-slate-800/60';
          let badgeBg = 'bg-slate-800 text-slate-300';

          if (isRegularized) {
            borderClass = 'border-teal-500/40';
            bgClass = 'bg-teal-950/20 hover:bg-teal-950/40';
            badgeBg = 'bg-teal-500/20 text-teal-300 border border-teal-500/30';
          } else if (isPresent) {
            borderClass = 'border-emerald-500/30';
            bgClass = 'bg-emerald-950/20 hover:bg-emerald-950/40';
            badgeBg = 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
          } else if (isAbsent) {
            borderClass = 'border-rose-500/30';
            bgClass = 'bg-rose-950/20 hover:bg-rose-950/40';
            badgeBg = 'bg-rose-500/20 text-rose-300 border border-rose-500/30';
          } else if (isLastSunday) {
            borderClass = 'border-purple-500/40';
            bgClass = 'bg-purple-950/25 hover:bg-purple-950/40';
            badgeBg = 'bg-purple-500/20 text-purple-300 border border-purple-500/30';
          } else if (isWO) {
            borderClass = 'border-blue-500/30';
            bgClass = 'bg-blue-950/20 hover:bg-blue-950/40';
            badgeBg = 'bg-blue-500/20 text-blue-300 border border-blue-500/30';
          }

          return (
            <div
              key={day.dayNum}
              className={`p-3 rounded-xl border ${borderClass} ${bgClass} transition-all duration-200 flex flex-col justify-between group relative overflow-hidden`}
            >
              {/* Special Policy Tags */}
              {is1stDate && (
                <div className="absolute top-0 right-0 px-2 py-0.5 bg-blue-600 text-[9px] font-bold text-white rounded-bl-lg uppercase tracking-wider">
                  1st Date WO
                </div>
              )}
              {isLastSunday && (
                <div className="absolute top-0 right-0 px-2 py-0.5 bg-purple-600 text-[9px] font-bold text-white rounded-bl-lg uppercase tracking-wider">
                  Working Sun
                </div>
              )}

              {/* Day Header */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-base text-slate-100">{day.dayNum}</span>
                    <span className="text-[11px] font-medium text-slate-400 uppercase">{day.dayName}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${badgeBg}`}>
                    {day.status}
                  </span>
                </div>

                {/* Punch Details */}
                <div className="space-y-1 my-2 text-xs">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[10px] uppercase font-mono">In:</span>
                    <span className={`font-mono ${day.inTime !== '--:--' && day.inTime ? 'text-slate-200 font-semibold' : 'text-slate-600'}`}>
                      {day.inTime || '--:--'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[10px] uppercase font-mono">Out:</span>
                    <span className={`font-mono ${day.outTime !== '--:--' && day.outTime ? 'text-slate-200 font-semibold' : 'text-slate-600'}`}>
                      {day.outTime || '--:--'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-indigo-400" /> Total:
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-100">
                      {day.totalDuration || '00:00'}
                    </span>
                  </div>
                </div>

                {/* Regularization Note if present */}
                {day.regularizationRemarks && (
                  <div className="mt-1.5 p-1.5 rounded bg-teal-950/60 border border-teal-800/40 text-[10px] text-teal-300">
                    <span className="font-semibold">Reg: </span>
                    {day.regularizationRemarks}
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="mt-2 pt-2 border-t border-slate-800/60">
                {isAdmin ? (
                  <button
                    onClick={() => onRegularizeDay(employee, day)}
                    className="w-full py-1 px-2 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white text-[11px] font-medium transition-colors flex items-center justify-center gap-1"
                  >
                    <ShieldCheck className="w-3 h-3" />
                    <span>Admin Edit</span>
                  </button>
                ) : (
                  <button
                    onClick={() => onRegularizeDay(employee, day)}
                    className={`w-full py-1 px-2 rounded-lg text-[11px] font-medium transition-colors flex items-center justify-center gap-1 ${
                      isAbsent
                        ? 'bg-rose-600/30 hover:bg-rose-600 text-rose-300 hover:text-white'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white'
                    }`}
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>{isAbsent ? 'Fix Absent' : 'Regularize'}</span>
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
