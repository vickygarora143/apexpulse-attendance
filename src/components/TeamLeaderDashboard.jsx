import React, { useState } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import AttendanceCalendar from './AttendanceCalendar';
import { 
  Users, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  Sparkles, 
  Search, 
  Calendar,
  Send,
  UserCheck
} from 'lucide-react';

export default function TeamLeaderDashboard({ onOpenRegularizeModal }) {
  const { attendanceData, setSelectedEmpId, regularizations } = useAttendance();
  const [selectedAgentCode, setSelectedAgentCode] = useState('GDSM004'); // default agent
  const [searchTerm, setSearchTerm] = useState('');

  // Team roster: filter for calling / telecaller team members
  const teamMembers = attendanceData.employees.filter(e => {
    if (searchTerm) {
      const t = searchTerm.toLowerCase();
      return e.name.toLowerCase().includes(t) || e.code.toLowerCase().includes(t);
    }
    return true;
  });

  const selectedAgent = attendanceData.employees.find(e => e.code === selectedAgentCode) || teamMembers[0];

  // Team aggregate stats
  const totalTeam = attendanceData.employees.length;
  const teamExceededOffs = attendanceData.employees.filter(e => e.isOffLimitExceeded);
  const teamPendingReqs = regularizations.filter(r => r.status === 'PENDING');

  return (
    <div className="space-y-6">
      
      {/* TL Header (Light Corporate Card) */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200">
                <Users className="w-5 h-5" />
              </span>
              <h1 className="text-xl font-black text-slate-900">Team Leader Operations Portal</h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Telecaller Team Supervision • Off Allowance Tracking • Direct Regularization Dispatch to Admin
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onOpenRegularizeModal(selectedAgent, null)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
            >
              <Send className="w-4 h-4" />
              <span>Submit Regularization to Admin</span>
            </button>
          </div>
        </div>

        {/* TL Metric Widgets */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-100">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">Supervised Agents</p>
              <h4 className="text-xl font-black text-slate-900 mt-0.5">{totalTeam} Telecallers</h4>
            </div>
            <div className="p-2.5 rounded-lg bg-indigo-100 text-indigo-700">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-rose-700">Off Limit Alerts (&gt;4 Offs)</p>
              <h4 className="text-xl font-black text-rose-800 mt-0.5">{teamExceededOffs.length} Agents</h4>
            </div>
            <div className="p-2.5 rounded-lg bg-rose-100 text-rose-700">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-amber-700">Requests with Admin</p>
              <h4 className="text-xl font-black text-amber-800 mt-0.5">{teamPendingReqs.length} In Review</h4>
            </div>
            <div className="p-2.5 rounded-lg bg-amber-100 text-amber-700">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout: Left Roster List, Right Selected Agent Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Team Member Selector & Quick Cards */}
        <div className="space-y-3 lg:col-span-1">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-800">Telecaller Roster</h3>
            <div className="relative w-40">
              <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-7 pr-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {teamMembers.map(agent => {
              const isSelected = selectedAgent?.code === agent.code;
              const isOver = agent.isOffLimitExceeded;

              return (
                <div
                  key={agent.code}
                  onClick={() => setSelectedAgentCode(agent.code)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-indigo-50/70 border-indigo-400 shadow-xs' 
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-sm text-slate-900">{agent.name}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      {agent.code}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span>Present: <strong className="text-emerald-700 font-bold">{agent.presentDays}</strong></span>
                    <span>Absent: <strong className="text-rose-700 font-bold">{agent.absentDays}</strong></span>
                    <span>
                      Offs: <strong className={isOver ? 'text-rose-700 font-bold' : 'text-slate-800'}>{agent.offsUsed}/4</strong>
                    </span>
                  </div>

                  {isOver && (
                    <div className="mt-1.5 text-[10px] text-rose-700 font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-rose-600" /> Exceeded 4 Offs Limit
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Agent Attendance Breakdown & Calendar */}
        <div className="lg:col-span-2 space-y-4">
          {selectedAgent ? (
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                    <span>{selectedAgent.name}</span>
                    <span className="font-mono text-xs px-2 py-0.5 bg-slate-100 text-indigo-700 rounded border border-slate-200 font-bold">
                      {selectedAgent.code}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Dept: {selectedAgent.department} • Monthly Hours: <strong className="text-indigo-700 font-mono font-bold">{selectedAgent.totalHoursFormatted}</strong>
                  </p>
                </div>

                <button
                  onClick={() => onOpenRegularizeModal(selectedAgent, null)}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Request Regularization to Admin</span>
                </button>
              </div>

              {/* Calendar */}
              <AttendanceCalendar
                employee={selectedAgent}
                isAdmin={false}
                onRegularizeDay={(emp, day) => onOpenRegularizeModal(emp, day)}
              />
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
              Select an agent to inspect attendance.
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
