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
    <div className="space-y-6 animate-fadeIn">
      
      {/* TL Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border border-slate-800 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <Users className="w-5 h-5" />
              </span>
              <h1 className="text-xl font-black text-white">Team Leader Operations Portal</h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Telecaller Team Supervision • Off Allowance Tracking • Direct Regularization Dispatch to Admin
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onOpenRegularizeModal(selectedAgent, null)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-1.5"
            >
              <Send className="w-4 h-4" />
              <span>Submit Regularization to Admin</span>
            </button>
          </div>
        </div>

        {/* TL Metric Widgets */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-800">
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400">Supervised Agents</p>
              <h4 className="text-xl font-bold text-white mt-0.5">{totalTeam} Telecallers</h4>
            </div>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs text-rose-400">Off Limit Alerts (&gt;4 Offs)</p>
              <h4 className="text-xl font-bold text-rose-300 mt-0.5">{teamExceededOffs.length} Agents</h4>
            </div>
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs text-amber-400">Requests with Admin</p>
              <h4 className="text-xl font-bold text-amber-300 mt-0.5">{teamPendingReqs.length} In Review</h4>
            </div>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
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
            <h3 className="font-bold text-sm text-slate-200">Telecaller Roster</h3>
            <div className="relative w-40">
              <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-7 pr-2 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
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
                      ? 'bg-indigo-950/40 border-indigo-500/50 shadow-md shadow-indigo-500/10' 
                      : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-sm text-white">{agent.name}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {agent.code}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Present: <strong className="text-emerald-400">{agent.presentDays}</strong></span>
                    <span>Absent: <strong className="text-rose-400">{agent.absentDays}</strong></span>
                    <span>
                      Offs: <strong className={isOver ? 'text-rose-400' : 'text-slate-300'}>{agent.offsUsed}/4</strong>
                    </span>
                  </div>

                  {isOver && (
                    <div className="mt-1.5 text-[10px] text-rose-300 font-semibold flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Exceeded 4 Offs Limit
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
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div>
                  <h3 className="font-bold text-base text-white flex items-center gap-2">
                    <span>{selectedAgent.name}</span>
                    <span className="font-mono text-xs px-2 py-0.5 bg-slate-800 text-indigo-300 rounded border border-slate-700">
                      {selectedAgent.code}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Dept: {selectedAgent.department} • Monthly Hours: <strong className="text-indigo-300 font-mono">{selectedAgent.totalHoursFormatted}</strong>
                  </p>
                </div>

                <button
                  onClick={() => onOpenRegularizeModal(selectedAgent, null)}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
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
            <div className="p-12 text-center text-slate-400">Select an agent to inspect attendance.</div>
          )}
        </div>

      </div>

    </div>
  );
}
