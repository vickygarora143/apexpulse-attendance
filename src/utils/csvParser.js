// Utility to parse Biometric / Monthly Status Report CSV files

export function parseAttendanceCSV(csvText) {
  const lines = csvText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  
  let dateRange = 'Sep 01 2026 To Sep 30 2026';
  let company = 'MOHALI';
  let printedOn = '';
  let daysHeader = [];
  let dayColumnIndices = []; // Maps day number (1..31) to column index in the row
  
  const employees = [];
  let currentDepartment = 'OPERATIONS';

  // Find date range
  for (const line of lines) {
    if (line.includes(' To ') && (line.includes('Jan') || line.includes('Feb') || line.includes('Mar') || line.includes('Apr') || line.includes('May') || line.includes('Jun') || line.includes('Jul') || line.includes('Aug') || line.includes('Sep') || line.includes('Oct') || line.includes('Nov') || line.includes('Dec'))) {
      const parts = line.split(',').filter(p => p.trim().length > 0);
      if (parts[0]) dateRange = parts[0].trim();
    }
    if (line.includes('Company:')) {
      const parts = line.split(',');
      const compIdx = parts.findIndex(p => p.includes('Company:'));
      if (compIdx !== -1 && parts[compIdx + 4]) {
        company = parts[compIdx + 4].trim();
      }
      const printMatch = line.match(/Printed On\s*:\s*([^,]+)/);
      if (printMatch) printedOn = printMatch[1].trim();
    }
  }

  // Find Days row
  let daysRowIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('Days,') || line.includes(',1 T,') || line.includes(',1 M,') || line.includes(',1 W,')) {
      daysRowIndex = i;
      const cols = line.split(',');
      // Parse days
      cols.forEach((col, idx) => {
        const trimmed = col.trim();
        // Day pattern: e.g. "1 T", "2 W", "27 S", "30 W"
        const match = trimmed.match(/^(\d{1,2})\s*([A-Za-z]+)$/);
        if (match) {
          const dayNum = parseInt(match[1], 10);
          const dayName = match[2];
          daysHeader.push({ dayNum, dayName, colIdx: idx });
          dayColumnIndices[dayNum] = idx;
        }
      });
      break;
    }
  }

  // Fallback if Days header not detected with regex
  if (daysHeader.length === 0) {
    for (let d = 1; d <= 30; d++) {
      daysHeader.push({ dayNum: d, dayName: getWeekdayInitial(2026, 8, d), colIdx: d });
      dayColumnIndices[d] = d;
    }
  }

  // Determine last Sunday of the month
  const totalDays = daysHeader.length > 0 ? Math.max(...daysHeader.map(d => d.dayNum)) : 30;
  let lastSundayNum = -1;
  for (let d = totalDays; d >= 1; d--) {
    const dayMeta = daysHeader.find(dh => dh.dayNum === d);
    if (dayMeta && (dayMeta.dayName === 'S' || dayMeta.dayName === 'Su' || dayMeta.dayName === 'Sun')) {
      lastSundayNum = d;
      break;
    }
  }

  // Parse Employee blocks
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.includes('Department:')) {
      const parts = line.split(',');
      const deptPart = parts.find(p => p.trim() && !p.includes('Department:'));
      if (deptPart) currentDepartment = deptPart.trim();
    }

    if (line.includes('Emp. Code:')) {
      // Found employee header
      const parts = line.split(',');
      let empCode = '';
      let empName = '';
      
      for (let p = 0; p < parts.length; p++) {
        if (parts[p].includes('Emp. Code:')) {
          for (let k = p + 1; k < parts.length; k++) {
            if (parts[k].trim()) {
              empCode = parts[k].trim();
              break;
            }
          }
        }
        if (parts[p].includes('Emp. Name:')) {
          for (let k = p + 1; k < parts.length; k++) {
            if (parts[k].trim()) {
              empName = parts[k].trim();
              break;
            }
          }
        }
      }

      // Next lines should be Status, InTime, OutTime, Total
      let statusLine = '';
      let inTimeLine = '';
      let outTimeLine = '';
      let totalLine = '';

      for (let j = i + 1; j < Math.min(i + 8, lines.length); j++) {
        const nextL = lines[j];
        if (nextL.startsWith('Status,')) statusLine = nextL;
        else if (nextL.startsWith('InTime,')) inTimeLine = nextL;
        else if (nextL.startsWith('OutTime,')) outTimeLine = nextL;
        else if (nextL.startsWith('Total,')) totalLine = nextL;
        else if (nextL.includes('Emp. Code:') || nextL.includes('Department:')) break;
      }

      if (empCode && empName) {
        const statusCols = statusLine ? statusLine.split(',') : [];
        const inCols = inTimeLine ? inTimeLine.split(',') : [];
        const outCols = outTimeLine ? outTimeLine.split(',') : [];
        const totCols = totalLine ? totalLine.split(',') : [];

        const attendance = {};

        daysHeader.forEach(dh => {
          const cIdx = dh.colIdx;
          let rawStatus = (statusCols[cIdx] || '').trim();
          let inTime = (inCols[cIdx] || '').trim();
          let outTime = (outCols[cIdx] || '').trim();
          let totalTime = (totCols[cIdx] || '').trim();

          // Clean up corrupted characters or non-printable UTF characters (e.g. P -> P)
          rawStatus = rawStatus.replace(/[^\x20-\x7E]/g, '');

          // Apply Company Business Rules:
          // Rule 1: Every Month 1st Date Will be WO (Week Off)
          let finalStatus = rawStatus;
          let is1stDateWO = false;
          let isLastSundayWorking = false;

          if (dh.dayNum === 1) {
            is1stDateWO = true;
            // Mandated Week Off on 1st of month
            if (finalStatus === '' || finalStatus === 'A' || finalStatus === 'WO') {
              finalStatus = 'WO';
            }
          }

          // Rule 2: Sunday will be Week Off, BUT Last Sunday will be Working!
          const isSunday = (dh.dayName === 'S' || dh.dayName === 'Su');
          if (isSunday) {
            if (dh.dayNum === lastSundayNum) {
              isLastSundayWorking = true;
              // Last Sunday is a working day! If punched, Present (P/WOP), if not, can be marked accordingly
              if (!finalStatus || finalStatus === 'WO') {
                finalStatus = inTime ? 'P' : 'A';
              }
            } else {
              // Standard Sunday -> Week Off (WO)
              if (!finalStatus) finalStatus = 'WO';
            }
          }

          if (!finalStatus && inTime) finalStatus = 'P';
          if (!finalStatus) finalStatus = 'A';

          attendance[dh.dayNum] = {
            dayNum: dh.dayNum,
            dayName: dh.dayName,
            status: finalStatus || 'A',
            rawStatus: rawStatus || 'A',
            inTime: inTime || '--:--',
            outTime: outTime || '--:--',
            totalDuration: totalTime || '00:00',
            is1stDateWO,
            isLastSundayWorking,
            isRegularized: false,
            regularizationRemarks: null
          };
        });

        // Compute metrics
        let presentDays = 0;
        let absentDays = 0;
        let weekOffDays = 0;
        let totalWorkingHoursMinutes = 0;

        Object.values(attendance).forEach(day => {
          if (day.status === 'P' || day.status === 'WOP' || day.status === 'P (REG)') {
            presentDays++;
          } else if (day.status === 'A') {
            absentDays++;
          } else if (day.status === 'WO') {
            weekOffDays++;
          }

          if (day.totalDuration && day.totalDuration.includes(':')) {
            const [hrs, mins] = day.totalDuration.split(':').map(Number);
            if (!isNaN(hrs) && !isNaN(mins)) {
              totalWorkingHoursMinutes += (hrs * 60) + mins;
            }
          }
        });

        const totalHoursFormatted = `${Math.floor(totalWorkingHoursMinutes / 60)}h ${totalWorkingHoursMinutes % 60}m`;
        
        // Entitled Offs: 4 monthly offs.
        // Absent days beyond 4 indicate policy over-limit
        const allowedOffs = 4;
        const offsUsed = absentDays;
        const offsRemaining = Math.max(0, allowedOffs - offsUsed);
        const isOffLimitExceeded = offsUsed > allowedOffs;

        // Auto-assign designations for realistic multi-dashboard representation
        let designation = 'Telecaller';
        let role = 'telecaller';
        if (empCode === 'GDSM001') {
          designation = 'Admin / Operations Head';
          role = 'admin';
        } else if (empCode === 'GDSM002' || empCode === 'GDSM043') {
          designation = 'Team Leader';
          role = 'tl';
        } else if (empCode === 'GDSM139' || empCode === 'GDSM092') {
          designation = 'HR Specialist';
          role = 'hr';
        }

        employees.push({
          id: empCode,
          code: empCode,
          name: empName,
          department: currentDepartment,
          designation,
          role,
          allowedOffs,
          offsUsed,
          offsRemaining,
          isOffLimitExceeded,
          presentDays,
          absentDays,
          weekOffDays,
          totalHoursFormatted,
          attendance
        });
      }
    }
  }

  return {
    dateRange,
    company,
    printedOn,
    daysHeader,
    lastSundayNum,
    totalDays,
    departments: Array.from(new Set(employees.map(e => e.department))),
    employees
  };
}

function getWeekdayInitial(year, monthIndex, day) {
  const d = new Date(year, monthIndex, day);
  const initials = ['S', 'M', 'T', 'W', 'Th', 'F', 'St'];
  return initials[d.getDay()] || 'D';
}
