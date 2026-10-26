import React, { createContext, useContext, useState, useEffect } from 'react';
import { getInitialAttendanceData } from '../data/initialData';
import { parseAttendanceCSV } from '../utils/csvParser';

const AttendanceContext = createContext();

export function AttendanceProvider({ children }) {
  const [attendanceData, setAttendanceData] = useState(() => {
    const saved = localStorage.getItem('attendance_portal_data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse cached attendance data', e);
      }
    }
    return getInitialAttendanceData();
  });

  const [currentRole, setCurrentRole] = useState('admin'); // 'admin' | 'tl' | 'hr' | 'telecaller'
  const [selectedEmpId, setSelectedEmpId] = useState('GDSM002'); // Default selected user for telecaller/TL views
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('ALL');

  // Regularization Requests submitted directly to Admin
  const [regularizations, setRegularizations] = useState(() => {
    const savedRegs = localStorage.getItem('attendance_portal_regularizations');
    if (savedRegs) {
      try {
        return JSON.parse(savedRegs);
      } catch (e) {
        console.error('Failed to parse cached regularizations', e);
      }
    }
    // Seed initial realistic pending regularizations so Admin has requests to approve/review right away!
    return [
      {
        id: 'REG-2026-001',
        empCode: 'GDSM002',
        empName: 'SHRUTI GOSWAMI',
        department: 'MOHALI',
        dayNum: 4,
        dateFormatted: 'Sep 04 2026 (Friday)',
        currentStatus: 'A',
        requestedStatus: 'P',
        inTime: '09:30',
        outTime: '18:35',
        reason: 'Biometric reader did not capture punch during power fluctuation. Was working on client escalations.',
        submittedAt: '2026-09-05T09:15:00.000Z',
        status: 'PENDING',
        adminRemark: ''
      },
      {
        id: 'REG-2026-002',
        empCode: 'GDSM065',
        empName: 'MEENU',
        department: 'MOHALI',
        dayNum: 4,
        dateFormatted: 'Sep 04 2026 (Friday)',
        currentStatus: 'A',
        requestedStatus: 'P',
        inTime: '09:25',
        outTime: '18:30',
        reason: 'Machine fingerprint scanner timing error. Shift completed successfully.',
        submittedAt: '2026-09-05T09:40:00.000Z',
        status: 'PENDING',
        adminRemark: ''
      },
      {
        id: 'REG-2026-003',
        empCode: 'GDSM015',
        empName: 'BEANT KAUR',
        department: 'MOHALI',
        dayNum: 15,
        dateFormatted: 'Sep 15 2026 (Tuesday)',
        currentStatus: 'A',
        requestedStatus: 'P',
        inTime: '09:30',
        outTime: '18:45',
        reason: 'Out-punch missed while attending floor briefing with TL.',
        submittedAt: '2026-09-16T10:00:00.000Z',
        status: 'PENDING',
        adminRemark: ''
      }
    ];
  });

  const [auditLogs, setAuditLogs] = useState(() => {
    const savedLogs = localStorage.getItem('attendance_portal_audit_logs');
    if (savedLogs) {
      try {
        return JSON.parse(savedLogs);
      } catch (e) {
        console.error('Failed to parse cached audit logs', e);
      }
    }
    return [
      {
        id: 'LOG-001',
        action: 'SYSTEM_BOOT',
        details: 'Attendance engine initialized with Sep 2026 Biometric sheet. Policies enforced: Day 1 WO, Last Sunday Working.',
        timestamp: new Date().toLocaleTimeString()
      }
    ];
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('attendance_portal_data', JSON.stringify(attendanceData));
  }, [attendanceData]);

  useEffect(() => {
    localStorage.setItem('attendance_portal_regularizations', JSON.stringify(regularizations));
  }, [regularizations]);

  useEffect(() => {
    localStorage.setItem('attendance_portal_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  // Active user object
  const currentUser = attendanceData.employees.find(e => e.code === selectedEmpId) || attendanceData.employees[0] || null;

  // Helper to recalculate hours and days
  const recalculateEmployeeMetrics = (employee) => {
    let presentDays = 0;
    let absentDays = 0;
    let weekOffDays = 0;
    let totalMinutes = 0;

    Object.values(employee.attendance).forEach(day => {
      if (day.status === 'P' || day.status === 'WOP' || day.status === 'P (REG)') {
        presentDays++;
      } else if (day.status === 'A') {
        absentDays++;
      } else if (day.status === 'WO') {
        weekOffDays++;
      }

      if (day.totalDuration && day.totalDuration.includes(':')) {
        const [h, m] = day.totalDuration.split(':').map(Number);
        if (!isNaN(h) && !isNaN(m)) {
          totalMinutes += (h * 60) + m;
        }
      }
    });

    const totalHoursFormatted = `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`;
    const allowedOffs = 4;
    const offsUsed = absentDays;
    const offsRemaining = Math.max(0, allowedOffs - offsUsed);
    const isOffLimitExceeded = offsUsed > allowedOffs;

    return {
      ...employee,
      presentDays,
      absentDays,
      weekOffDays,
      totalHoursFormatted,
      offsUsed,
      offsRemaining,
      isOffLimitExceeded
    };
  };

  // 1. User Submits Regularization (Direct to Admin)
  const submitRegularization = ({ empCode, dayNum, inTime, outTime, reason }) => {
    const emp = attendanceData.employees.find(e => e.code === empCode);
    if (!emp) return { success: false, message: 'Employee not found' };

    const dayRecord = emp.attendance[dayNum];
    const newId = `REG-${Date.now().toString().slice(-6)}`;

    // Calculate duration
    let calcDuration = '09:00';
    if (inTime && outTime) {
      const [ih, im] = inTime.split(':').map(Number);
      const [oh, om] = outTime.split(':').map(Number);
      if (!isNaN(ih) && !isNaN(oh)) {
        let diff = (oh * 60 + om) - (ih * 60 + im);
        if (diff > 0) {
          const dh = Math.floor(diff / 60);
          const dm = diff % 60;
          calcDuration = `${dh}:${dm.toString().padStart(2, '0')}`;
        }
      }
    }

    const newReq = {
      id: newId,
      empCode: emp.code,
      empName: emp.name,
      department: emp.department,
      dayNum,
      dateFormatted: `Day ${dayNum} (${dayRecord ? dayRecord.dayName : 'Day'})`,
      currentStatus: dayRecord ? dayRecord.status : 'A',
      requestedStatus: 'P',
      inTime: inTime || '09:30',
      outTime: outTime || '18:30',
      calcDuration,
      reason: reason || 'Punch regularized as per attendance policy',
      submittedAt: new Date().toISOString(),
      status: 'PENDING',
      adminRemark: ''
    };

    setRegularizations(prev => [newReq, ...prev]);

    // Add Audit Log
    setAuditLogs(prev => [
      {
        id: `LOG-${Date.now()}`,
        action: 'REGULARIZATION_SUBMITTED',
        details: `${emp.name} (${emp.code}) requested regularization for Day ${dayNum}. Direct sent to Admin.`,
        timestamp: new Date().toLocaleTimeString()
      },
      ...prev
    ]);

    return { success: true, message: 'Regularization request sent directly to Admin!' };
  };

  // 2. Admin Approves Regularization
  const approveRegularization = (requestId, adminRemark = 'Approved by Chief Admin') => {
    const req = regularizations.find(r => r.id === requestId);
    if (!req) return;

    // Update Attendance Record
    setAttendanceData(prev => {
      const updatedEmployees = prev.employees.map(emp => {
        if (emp.code === req.empCode) {
          const updatedAttendance = { ...emp.attendance };
          const targetDay = updatedAttendance[req.dayNum] || {
            dayNum: req.dayNum,
            dayName: 'D'
          };

          updatedAttendance[req.dayNum] = {
            ...targetDay,
            status: 'P (REG)',
            inTime: req.inTime,
            outTime: req.outTime,
            totalDuration: req.calcDuration || '09:00',
            isRegularized: true,
            regularizationRemarks: adminRemark
          };

          return recalculateEmployeeMetrics({
            ...emp,
            attendance: updatedAttendance
          });
        }
        return emp;
      });

      return {
        ...prev,
        employees: updatedEmployees
      };
    });

    // Update Regularization item
    setRegularizations(prev =>
      prev.map(r =>
        r.id === requestId
          ? { ...r, status: 'APPROVED', adminRemark, resolvedAt: new Date().toISOString() }
          : r
      )
    );

    // Audit Log
    setAuditLogs(prev => [
      {
        id: `LOG-${Date.now()}`,
        action: 'ADMIN_APPROVED',
        details: `Admin APPROVED regularization ${requestId} for ${req.empName} (Day ${req.dayNum}). Status marked Present.`,
        timestamp: new Date().toLocaleTimeString()
      },
      ...prev
    ]);
  };

  // 3. Admin Rejects Regularization
  const rejectRegularization = (requestId, adminRemark = 'Insufficient justification') => {
    const req = regularizations.find(r => r.id === requestId);
    if (!req) return;

    setRegularizations(prev =>
      prev.map(r =>
        r.id === requestId
          ? { ...r, status: 'REJECTED', adminRemark, resolvedAt: new Date().toISOString() }
          : r
      )
    );

    setAuditLogs(prev => [
      {
        id: `LOG-${Date.now()}`,
        action: 'ADMIN_REJECTED',
        details: `Admin REJECTED regularization ${requestId} for ${req.empName} (Day ${req.dayNum}). Reason: ${adminRemark}`,
        timestamp: new Date().toLocaleTimeString()
      },
      ...prev
    ]);
  };

  // 4. Admin Direct Regularization of Any User for Any Day
  const directAdminRegularize = ({ empCode, dayNum, status, inTime, outTime, totalDuration, remarks }) => {
    setAttendanceData(prev => {
      const updatedEmployees = prev.employees.map(emp => {
        if (emp.code === empCode) {
          const updatedAttendance = { ...emp.attendance };
          const targetDay = updatedAttendance[dayNum] || { dayNum, dayName: 'D' };

          updatedAttendance[dayNum] = {
            ...targetDay,
            status: status || 'P (REG)',
            inTime: inTime || targetDay.inTime || '09:30',
            outTime: outTime || targetDay.outTime || '18:30',
            totalDuration: totalDuration || targetDay.totalDuration || '09:00',
            isRegularized: true,
            regularizationRemarks: remarks || 'Direct Regularization by Admin'
          };

          return recalculateEmployeeMetrics({
            ...emp,
            attendance: updatedAttendance
          });
        }
        return emp;
      });

      return {
        ...prev,
        employees: updatedEmployees
      };
    });

    setAuditLogs(prev => [
      {
        id: `LOG-${Date.now()}`,
        action: 'ADMIN_DIRECT_OVERRIDE',
        details: `Admin directly updated attendance for ${empCode} on Day ${dayNum} to ${status}.`,
        timestamp: new Date().toLocaleTimeString()
      },
      ...prev
    ]);
  };

  // 5. Ingest / Upload new CSV File
  const uploadCSV = (csvContent) => {
    try {
      const parsed = parseAttendanceCSV(csvContent);
      if (!parsed.employees || parsed.employees.length === 0) {
        throw new Error('No valid employee attendance records found in uploaded file.');
      }
      setAttendanceData(parsed);
      setSelectedEmpId(parsed.employees[0].code);

      setAuditLogs(prev => [
        {
          id: `LOG-${Date.now()}`,
          action: 'CSV_UPLOAD_INGESTED',
          details: `Uploaded & ingested attendance report: ${parsed.employees.length} employees, Date Range: ${parsed.dateRange}. 1st Date WO & Last Sunday Working applied.`,
          timestamp: new Date().toLocaleTimeString()
        },
        ...prev
      ]);

      return { success: true, count: parsed.employees.length };
    } catch (err) {
      console.error(err);
      return { success: false, error: err.message };
    }
  };

  // 6. Reset to Default Data
  const resetToDefault = () => {
    const initial = getInitialAttendanceData();
    setAttendanceData(initial);
    localStorage.removeItem('attendance_portal_data');
    localStorage.removeItem('attendance_portal_regularizations');
    localStorage.removeItem('attendance_portal_audit_logs');
    window.location.reload();
  };

  // 7. Export CSV
  const exportAttendanceCSV = () => {
    if (!attendanceData || !attendanceData.employees) return;

    let csv = `Monthly Status Report (Exported from Portal)\n`;
    csv += `,${attendanceData.dateRange}\n`;
    csv += `Company:,,,,${attendanceData.company},,,,,,,,,,,,,,,,,,,,,,,,,,Printed On : ${new Date().toLocaleDateString()}\n\n`;

    const days = attendanceData.daysHeader || [];
    csv += 'Days,,' + days.map(d => `${d.dayNum} ${d.dayName}`).join(',') + '\n\n';

    attendanceData.employees.forEach(emp => {
      csv += `Department:,,,${emp.department}\n`;
      csv += `Emp. Code:,,,${emp.code},,,,,Emp. Name:,,,,,${emp.name}\n`;
      csv += 'Status,,' + days.map(d => (emp.attendance[d.dayNum] ? emp.attendance[d.dayNum].status : 'A')).join(',') + '\n';
      csv += 'InTime,,' + days.map(d => (emp.attendance[d.dayNum] ? emp.attendance[d.dayNum].inTime : '')).join(',') + '\n';
      csv += 'OutTime,,' + days.map(d => (emp.attendance[d.dayNum] ? emp.attendance[d.dayNum].outTime : '')).join(',') + '\n';
      csv += 'Total,,' + days.map(d => (emp.attendance[d.dayNum] ? emp.attendance[d.dayNum].totalDuration : '')).join(',') + '\n\n';
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Attendance_Report_${attendanceData.dateRange.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Stats
  const totalEmployees = attendanceData.employees.length;
  const pendingRequestsCount = regularizations.filter(r => r.status === 'PENDING').length;
  const offLimitExceededCount = attendanceData.employees.filter(e => e.isOffLimitExceeded).length;

  return (
    <AttendanceContext.Provider
      value={{
        attendanceData,
        currentRole,
        setCurrentRole,
        selectedEmpId,
        setSelectedEmpId,
        currentUser,
        searchTerm,
        setSearchTerm,
        selectedDepartment,
        setSelectedDepartment,
        regularizations,
        submitRegularization,
        approveRegularization,
        rejectRegularization,
        directAdminRegularize,
        uploadCSV,
        resetToDefault,
        exportAttendanceCSV,
        auditLogs,
        totalEmployees,
        pendingRequestsCount,
        offLimitExceededCount
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
