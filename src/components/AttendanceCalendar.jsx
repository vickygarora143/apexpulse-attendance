import React, { useState } from 'react';
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  Sparkles, 
  AlertTriangle, 
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  CalendarDays
} from 'lucide-react';

export default function AttendanceCalendar({ employee, onRegularizeDay, isAdmin }) {
  const [selectedMonthKey, setSelectedMonthKey] = useState('2026-09'); // Default baseline month from D1

  if (!employee || !employee.attendance) {
    return <div className="p-8 text-center text-slate-500 bg-white rounded-xl border border-slate-200">No attendance data available.</div>;
  }

  const monthsList = [
    { key: '2026-07', label: 'July 2026', days: 31, year: 2026, monthIdx: 6 },
    { key: '2026-08', label: 'August 2026', days: 31, year: 2026, monthIdx: 7 },
    { key: '2026-09', label: 'September 2026 (Live D1)', days: 30, year: 2026, monthIdx: 8, hasRealData: true },
    { key: '2026-10', label: 'October 2026', days: 31, year: 2026, monthIdx: 9 },
    { key: '2026-11', label: 'November 2026', days: 30, year: 2026, monthIdx: 10 },
    { key: '2026-12', label: 'December 2026', days: 31, year: 2026, monthIdx: 11 }
  ];

  const currentMonthConfig = monthsList.find(m => m.key === selectedMonthKey) || monthsList[2];

  // Helper: Find all Sundays and last Sunday of selected month
  const getMonthDays = (year, monthIdx, daysInMonth, hasRealData) => {
    if (hasRealData) {
      return Object.values(employee.attendance).sort((a, b) => a.dayNum - b.dayNum);
    }

    // Generate dynamic roster applying exact company policies:
    // 1st Day = WO, Sundays = WO except Last Sunday = Working
    const dayNames = ['S', 'M', 'T', 'W', 'Th', 'F', 'Sa']; // 0 is Sunday
    const result = [];
    let lastSundayDayNum = 0;

    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(year, monthIdx, d);
      if (dateObj.getDay() === 0) {
        lastSundayDayNum = d;
      }
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(year, monthIdx, d);
      const dayOfWeek = dateObj.getDay();
      const dayName = dayNames[dayOfWeek];
      const is1stDayWO = d === 1;
      const isSunday = dayOfWeek === 0;
      const isLastSundayWorking = d === lastSundayDayNum;

      let status = 'P';
      let inTime = '09:30';
      let outTime = '18:30';
      let totalDuration = '09:00';

      if (is1stDayWO) {
        status = 'WO';
        inTime = '--:--';
        outTime = '--:--';
        totalDuration = '00:00';
      } else if (isSunday) {
        if (isLastSundayWorking) {
          status = 'P'; // Working Sunday
          inTime = '09:30';
          outTime = '18:30';
          totalDuration = '09:00';
        } else {
          status = 'WO';
          inTime = '--:--';
          outTime = '--:--';
          totalDuration = '00:00';
        }
      }

      result.push({
        dayNum: d,
        dayName,
        status,
        inTime,
        outTime,
        totalDuration,
        is1stDateWO: is1stDayWO,
        isLastSundayWorking,
        isSimulated: true
      });
    }

    return result;
  };

  const days = getMonthDays(
    currentMonthConfig.year,
    currentMonthConfig.monthIdx,
    currentMonthConfig.days,
    currentMonthConfig.hasRealData
  );

  const handlePrevMonth = () => {
    const idx = monthsList.findIndex(m => m.key === selectedMonthKey);
    if (idx > 0) setSelectedMonthKey(monthsList[idx - 1].key);
  };

  const handleNextMonth = () => {
    const idx = monthsList.findIndex(m => m.key === selectedMonthKey);
    if (idx < monthsList.length - 1) setSelectedMonthKey(monthsList[idx + 1].key);
  };

  return (
    <div className="space-y-4">
      
      {/* Month-Wise Selector & Legend Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
        
        {/* Month Navigation Controls */}
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-50 text-indigo-700 rounded-xl border border-indigo-100">
            <CalendarDays className="w-4 h-4" />
          </div>

          <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={handlePrevMonth}
              disabled={selectedMonthKey === monthsList[0].key}
              className="p-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-white disabled:opacity-30 transition-colors"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <select
              value={selectedMonthKey}
              onChange={(e) => setSelectedMonthKey(e.target.value)}
              className="bg-transparent font-bold text-xs text-slate-800 px-2 py-0.5 focus:outline-none cursor-pointer"
            >
              {monthsList.map(m => (
                <option key={m.key} value={m.key}>
                  {m.label}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleNextMonth}
              disabled={selectedMonthKey === monthsList[monthsList.length - 1].key}
              className="p-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-white disabled:opacity-30 transition-colors"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <span className="text-[11px] text-slate-400 font-mono hidden md:inline">
            ({currentMonthConfig.days} Days)
          </span>
        </div>

        {/* Legend Badges */}
        <div className="flex flex-wrap items-center gap-2 text-[11px]">
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Present (P)
          </span>
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Absent (A)
          </span>
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Week Off (WO)
          </span>
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span> Last Sun Working
          </span>
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 border border-teal-200 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span> Regularized (REG)
          </span>
        </div>

      </div>

      {/* Grid of Days (Crisp Clean Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-3">
        {days.map(day => {
          const isPresent = day.status === 'P' || day.status === 'WOP';
          const isRegularized = day.status === 'P (REG)' || day.isRegularized;
          const isAbsent = day.status === 'A';
          const isWO = day.status === 'WO';
          const isLastSunday = day.isLastSundayWorking || (day.dayNum === 27 && day.dayName === 'S');
          const is1stDate = day.dayNum === 1;

          // Theme based on status
          let borderClass = 'border-slate-200';
          let bgClass = 'bg-white hover:border-slate-300';
          let badgeBg = 'bg-slate-100 text-slate-700 border-slate-200';

          if (isRegularized) {
            borderClass = 'border-teal-300';
            bgClass = 'bg-teal-50/40 hover:bg-teal-50/80';
            badgeBg = 'bg-teal-50 text-teal-700 border-teal-200';
          } else if (isPresent) {
            borderClass = 'border-emerald-200';
            bgClass = 'bg-white hover:bg-emerald-50/20';
            badgeBg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
          } else if (isAbsent) {
            borderClass = 'border-rose-200';
            bgClass = 'bg-white hover:bg-rose-50/20';
            badgeBg = 'bg-rose-50 text-rose-700 border-rose-200';
          } else if (isLastSunday) {
            borderClass = 'border-purple-300';
            bgClass = 'bg-purple-50/30 hover:bg-purple-50/60';
            badgeBg = 'bg-purple-50 text-purple-700 border-purple-200';
          } else if (isWO) {
            borderClass = 'border-blue-200';
            bgClass = 'bg-blue-50/20 hover:bg-blue-50/40';
            badgeBg = 'bg-blue-50 text-blue-700 border-blue-200';
          }

          return (
            <div
              key={day.dayNum}
              className={`p-3.5 rounded-xl border ${borderClass} ${bgClass} shadow-xs transition-all flex flex-col justify-between group relative overflow-hidden`}
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
                    <span className="font-extrabold text-base text-slate-900">{day.dayNum}</span>
                    <span className="text-[11px] font-bold text-slate-400 uppercase">{day.dayName}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${badgeBg}`}>
                    {day.status}
                  </span>
                </div>

                {/* Punch Details */}
                <div className="space-y-1 my-2 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase font-mono">In:</span>
                    <span className={`font-mono text-xs ${day.inTime !== '--:--' && day.inTime ? 'text-slate-900 font-bold' : 'text-slate-400'}`}>
                      {day.inTime || '--:--'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase font-mono">Out:</span>
                    <span className={`font-mono text-xs ${day.outTime !== '--:--' && day.outTime ? 'text-slate-900 font-bold' : 'text-slate-400'}`}>
                      {day.outTime || '--:--'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                    <span className="text-[10px] font-semibold text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-indigo-600" /> Total:
                    </span>
                    <span className="font-mono text-xs font-black text-slate-900">
                      {day.totalDuration || '00:00'}
                    </span>
                  </div>
                </div>

                {/* Regularization Note if present */}
                {day.regularizationRemarks && (
                  <div className="mt-1.5 p-1.5 rounded-lg bg-teal-50 border border-teal-200 text-[10px] text-teal-800">
                    <span className="font-bold">Reg: </span>
                    {day.regularizationRemarks}
                  </div>
                )}
              </div>

              {/* Day-Wise Regularization Action Button */}
              <div className="mt-2 pt-2 border-t border-slate-100">
                {isAdmin ? (
                  <button
                    onClick={() => onRegularizeDay(employee, day)}
                    className="w-full py-1 px-2 rounded-lg bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <ShieldCheck className="w-3 h-3" />
                    <span>Admin Edit</span>
                  </button>
                ) : (
                  <button
                    onClick={() => onRegularizeDay(employee, day)}
                    className={`w-full py-1 px-2 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                      isAbsent
                        ? 'bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border border-rose-200 hover:border-transparent'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
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
