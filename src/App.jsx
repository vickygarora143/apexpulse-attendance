import React, { useState } from 'react';
import { AttendanceProvider, useAttendance } from './context/AttendanceContext';
import Navbar from './components/Navbar';
import AdminDashboard from './components/AdminDashboard';
import TelecallerDashboard from './components/TelecallerDashboard';
import TeamLeaderDashboard from './components/TeamLeaderDashboard';
import HRDashboard from './components/HRDashboard';
import RegularizeModal from './components/RegularizeModal';
import UploadModal from './components/UploadModal';
import { 
  ShieldCheck, 
  Users, 
  Clock, 
  Sparkles, 
  Info, 
  X, 
  CheckCircle2, 
  Upload, 
  Calendar,
  Layers
} from 'lucide-react';

function AttendanceApp() {
  const { currentRole, setCurrentRole, attendanceData, currentUser, resetToDefault } = useAttendance();

  // Modals state
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [regularizeModalState, setRegularizeModalState] = useState({
    isOpen: false,
    employee: null,
    day: null,
    isAdminMode: false
  });

  const [showGuide, setShowGuide] = useState(true);

  // Open Direct Admin Regularize
  const handleOpenDirectAdmin = (emp = null, day = null) => {
    setRegularizeModalState({
      isOpen: true,
      employee: emp || currentUser,
      day: day || null,
      isAdminMode: true
    });
  };

  // Open User Request Regularize
  const handleOpenUserRegularize = (emp = null, day = null) => {
    setRegularizeModalState({
      isOpen: true,
      employee: emp || currentUser,
      day: day || null,
      isAdminMode: false
    });
  };

  const handleCloseRegularizeModal = () => {
    setRegularizeModalState({
      isOpen: false,
      employee: null,
      day: null,
      isAdminMode: false
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Top Navigation */}
      <Navbar 
        onOpenUpload={() => setUploadModalOpen(true)}
        onOpenDirectAdminModal={() => handleOpenDirectAdmin()}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Dynamic Role Views */}
        {currentRole === 'admin' && (
          <AdminDashboard 
            onOpenDirectRegularize={(emp, day) => handleOpenDirectAdmin(emp, day)}
            onOpenDayForRegularize={(emp, day) => handleOpenDirectAdmin(emp, day)}
          />
        )}

        {currentRole === 'telecaller' && (
          <TelecallerDashboard 
            onOpenRegularizeModal={(emp, day) => handleOpenUserRegularize(emp, day)}
          />
        )}

        {currentRole === 'tl' && (
          <TeamLeaderDashboard 
            onOpenRegularizeModal={(emp, day) => handleOpenUserRegularize(emp, day)}
          />
        )}

        {currentRole === 'hr' && (
          <HRDashboard 
            onOpenUpload={() => setUploadModalOpen(true)}
            onOpenRegularizeModal={(emp, day) => handleOpenUserRegularize(emp, day)}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="bg-slate-900/60 border-t border-slate-800/80 py-4 px-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">ApexPulse</span>
            <span>• Enterprise People Attendance & Regularization Platform</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <button 
              onClick={resetToDefault} 
              className="hover:text-slate-300 underline transition-colors"
            >
              Reset to Factory Sample Data
            </button>
            <span>•</span>
            <span className="text-slate-400 font-mono">Sep 2026 Biometric Ingestion Engine</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <RegularizeModal 
        isOpen={regularizeModalState.isOpen}
        onClose={handleCloseRegularizeModal}
        targetEmployee={regularizeModalState.employee}
        targetDay={regularizeModalState.day}
        isAdminMode={regularizeModalState.isAdminMode}
      />

      <UploadModal 
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
      />

    </div>
  );
}

export default function App() {
  return (
    <AttendanceProvider>
      <AttendanceApp />
    </AttendanceProvider>
  );
}
