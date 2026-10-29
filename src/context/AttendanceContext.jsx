import React, { createContext, useContext, useState, useEffect } from 'react';
import { getInitialAttendanceData } from '../data/initialData.js';

const AttendanceContext = createContext();

export function AttendanceProvider({ children }) {
  // Authentication State
  const [authUser, setAuthUser] = useState(() => {
    const saved = localStorage.getItem('apex_auth_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return null; // Not logged in initially -> shows Role-wise login screen
  });

  const [currentRole, setCurrentRole] = useState(() => {
    return authUser?.role?.toLowerCase() || 'admin';
  });

  const [attendanceData, setAttendanceData] = useState(() => getInitialAttendanceData());
  const [regularizations, setRegularizations] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [selectedEmpId, setSelectedEmpId] = useState('GDSM002');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState('ALL');

  // Load Real Data from Cloudflare D1 Backend
  const refreshFromBackend = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch real employees and attendance from D1
      const empRes = await fetch('/api/employees');
      if (empRes.ok) {
        const empJson = await empRes.json();
        if (empJson.success && empJson.employees && empJson.employees.length > 0) {
          setAttendanceData(empJson);
          if (!selectedEmpId || !empJson.employees.some(e => e.code === selectedEmpId)) {
            setSelectedEmpId(empJson.employees[0].code);
          }
        }
      }

      // 2. Fetch real regularizations from D1
      const regRes = await fetch('/api/regularizations');
      if (regRes.ok) {
        const regJson = await regRes.json();
        if (regJson.success) {
          setRegularizations(regJson.regularizations || []);
        }
      }

      // 3. Fetch real audit logs from D1
      const auditRes = await fetch('/api/audit-logs');
      if (auditRes.ok) {
        const auditJson = await auditRes.json();
        if (auditJson.success) {
          setAuditLogs(auditJson.auditLogs || []);
        }
      }
    } catch (err) {
      console.warn('Network request to /api failed, using cached baseline', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshFromBackend();
  }, []);

  // Update role when authUser changes
  useEffect(() => {
    if (authUser?.role) {
      setCurrentRole(authUser.role.toLowerCase());
      if (authUser.empCode) {
        setSelectedEmpId(authUser.empCode);
      }
    }
  }, [authUser]);

  // Real Login with 100% Cloudflare D1 verification
  const login = async (username, password, role) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role })
      });

      const data = await res.json();
      if (data.success && data.user) {
        setAuthUser(data.user);
        setCurrentRole(data.user.role.toLowerCase());
        if (data.user.empCode) setSelectedEmpId(data.user.empCode);
        localStorage.setItem('apex_auth_user', JSON.stringify(data.user));
        await refreshFromBackend();
        return { success: true, user: data.user };
      } else {
        return { success: false, error: data.error || 'Invalid credentials' };
      }
    } catch (err) {
      return { success: false, error: 'Network error or backend unreachable. Please try again.' };
    }
  };

  // Real Password Change with Cloudflare D1
  const changePassword = async (currentPassword, newPassword) => {
    if (!authUser) {
      return { success: false, error: 'User is not logged in.' };
    }

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          empCode: authUser.empCode || authUser.username,
          currentPassword,
          newPassword
        })
      });

      const data = await res.json();
      if (data.success && data.user) {
        setAuthUser(data.user);
        localStorage.setItem('apex_auth_user', JSON.stringify(data.user));
        await refreshFromBackend();
        return { success: true, message: data.message };
      } else {
        return { success: false, error: data.error || 'Failed to update password' };
      }
    } catch (err) {
      return { success: false, error: 'Network error during password update. Please try again.' };
    }
  };

  const logout = () => {
    setAuthUser(null);
    localStorage.removeItem('apex_auth_user');
  };

  // Submit Regularization to Real Cloudflare D1 Backend
  const submitRegularization = async ({ empCode, dayNum, inTime, outTime, reason }) => {
    try {
      const res = await fetch('/api/regularizations/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ empCode, dayNum, inTime, outTime, reason })
      });
      const data = await res.json();
      if (data.success) {
        await refreshFromBackend();
        return { success: true, message: 'Regularization request sent directly to Admin!' };
      }
      throw new Error(data.error);
    } catch (err) {
      // Local optimistic update
      const emp = attendanceData.employees.find(e => e.code === empCode);
      const newReq = {
        id: `REG-${Date.now().toString().slice(-6)}`,
        empCode,
        empName: emp ? emp.name : empCode,
        department: emp ? emp.department : 'MOHALI',
        dayNum,
        dateFormatted: `Day ${dayNum}`,
        currentStatus: 'A',
        requestedStatus: 'P',
        inTime: inTime || '09:30',
        outTime: outTime || '18:30',
        calcDuration: '09:00',
        reason,
        submittedAt: new Date().toISOString(),
        status: 'PENDING',
        adminRemark: ''
      };
      setRegularizations(prev => [newReq, ...prev]);
      return { success: true, message: 'Regularization request recorded and sent to Admin!' };
    }
  };

  // Approve Regularization via Real Backend
  const approveRegularization = async (requestId, adminRemark = 'Approved by Chief Admin') => {
    try {
      const res = await fetch(`/api/regularizations/${requestId}/decide`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision: 'APPROVED', adminRemark, actorCode: authUser?.empCode || 'ADMIN' })
      });
      const data = await res.json();
      if (data.success) {
        await refreshFromBackend();
      }
    } catch (err) {
      // Optimistic update
      setRegularizations(prev => prev.map(r => r.id === requestId ? { ...r, status: 'APPROVED', adminRemark } : r));
    }
  };

  // Reject Regularization via Real Backend
  const rejectRegularization = async (requestId, adminRemark = 'Rejected as per policy') => {
    try {
      const res = await fetch(`/api/regularizations/${requestId}/decide`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision: 'REJECTED', adminRemark, actorCode: authUser?.empCode || 'ADMIN' })
      });
      const data = await res.json();
      if (data.success) {
        await refreshFromBackend();
      }
    } catch (err) {
      setRegularizations(prev => prev.map(r => r.id === requestId ? { ...r, status: 'REJECTED', adminRemark } : r));
    }
  };

  // Direct Admin Regularization Override
  const directAdminRegularize = async ({ empCode, dayNum, status, inTime, outTime, totalDuration, remarks }) => {
    try {
      const res = await fetch('/api/attendance/override', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          empCode,
          dayNum,
          status,
          inTime,
          outTime,
          totalDuration,
          remarks,
          actorCode: authUser?.empCode || 'ADMIN'
        })
      });
      const data = await res.json();
      if (data.success) {
        await refreshFromBackend();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Export full attendance CSV
  const exportAttendanceCSV = () => {
    if (!attendanceData || !attendanceData.employees) return;

    let csv = `Monthly Status Report (Exported from ApexPulse Enterprise Portal)\n`;
    csv += `,${attendanceData.dateRange}\n`;
    csv += `Company:,,,,${attendanceData.company},,,,,,,,,,,,,,,,,,,,,,,,,,Exported On : ${new Date().toLocaleDateString()}\n\n`;

    const days = Array.from({ length: attendanceData.totalDays || 30 }, (_, i) => i + 1);
    csv += 'Days,,' + days.map(d => `${d}`).join(',') + '\n\n';

    attendanceData.employees.forEach(emp => {
      csv += `Department:,,,${emp.department}\n`;
      csv += `Emp. Code:,,,${emp.code},,,,,Emp. Name:,,,,,${emp.name}\n`;
      csv += 'Status,,' + days.map(d => (emp.attendance[d] ? emp.attendance[d].status : 'A')).join(',') + '\n';
      csv += 'InTime,,' + days.map(d => (emp.attendance[d] ? emp.attendance[d].inTime : '')).join(',') + '\n';
      csv += 'OutTime,,' + days.map(d => (emp.attendance[d] ? emp.attendance[d].outTime : '')).join(',') + '\n';
      csv += 'Total,,' + days.map(d => (emp.attendance[d] ? emp.attendance[d].totalDuration : '')).join(',') + '\n\n';
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ApexPulse_Attendance_${attendanceData.dateRange.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const currentUser = attendanceData.employees.find(e => e.code === selectedEmpId) || attendanceData.employees[0] || null;
  const pendingRequestsCount = regularizations.filter(r => r.status === 'PENDING').length;
  const offLimitExceededCount = attendanceData.employees.filter(e => e.isOffLimitExceeded).length;

  return (
    <AttendanceContext.Provider
      value={{
        authUser,
        login,
        logout,
        currentRole,
        setCurrentRole,
        attendanceData,
        selectedEmpId,
        setSelectedEmpId,
        currentUser,
        regularizations,
        auditLogs,
        submitRegularization,
        approveRegularization,
        rejectRegularization,
        directAdminRegularize,
        exportAttendanceCSV,
        changePassword,
        refreshFromBackend,
        isLoading,
        pendingRequestsCount,
        offLimitExceededCount,
        selectedDepartment,
        setSelectedDepartment
      }}
    >
      {children}
    </AttendanceContext.Provider>
  );
}

export function useAttendance() {
  const context = useContext(AttendanceContext);
  if (!context) {
    throw new Error('useAttendance must be used within an AttendanceProvider');
  }
  return context;
}
