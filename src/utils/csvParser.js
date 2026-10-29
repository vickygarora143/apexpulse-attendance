// Utility to parse Biometric / Monthly Status Report CSV files

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const MONTH_MAP = {
  jan: { name: 'January', index: 0, num: '01' },
  feb: { name: 'February', index: 1, num: '02' },
  mar: { name: 'March', index: 2, num: '03' },
  apr: { name: 'April', index: 3, num: '04' },
  may: { name: 'May', index: 4, num: '05' },
  jun: { name: 'June', index: 5, num: '06' },
  jul: { name: 'July', index: 6, num: '07' },
  aug: { name: 'August', index: 7, num: '08' },
  sep: { name: 'September', index: 8, num: '09' },
  sept: { name: 'September', index: 8, num: '09' },
  oct: { name: 'October', index: 9, num: '10' },
  nov: { name: 'November', index: 10, num: '11' },
  dec: { name: 'December', index: 11, num: '12' }
};

/**
 * Automatically inspects and parses the biometric report header to detect:
 * Month Name, Month Key (YYYY-MM), Reporting Year, Start Date, End Date, and Total Days.
 */
export function parseBiometricPeriod(dateRangeStr) {
  if (!dateRangeStr || typeof dateRangeStr !== 'string') {
    return {
      detectedMonth: 'September',
      detectedMonthIndex: 8,
      detectedYear: 2026,
      monthKey: '2026-09',
      startDay: 1,
      endDay: 30,
      totalDays: 30,
      formattedPeriod: 'September 2026',
      isMonthVerified: true
    };
  }

  // Check English month pattern: e.g. "Sep 01 2026  To  Sep 30 2026"
  const wordRegex = /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\s+(\d{1,2})[\s,]+(\d{4})/gi;
  const matches = [...dateRangeStr.matchAll(wordRegex)];

  if (matches.length > 0) {
    const startM = matches[0];
    const key = startM[1].toLowerCase();
    const meta = MONTH_MAP[key] || { name: startM[1], index: 8, num: '09' };
    const year = parseInt(startM[3], 10);
    const startDay = parseInt(startM[2], 10);
    
    let endDay = 30;
    if (matches.length > 1) {
      endDay = parseInt(matches[1][2], 10);
    } else {
      endDay = new Date(year, meta.index + 1, 0).getDate();
    }

    return {
      detectedMonth: meta.name,
      detectedMonthIndex: meta.index,
      detectedYear: year,
      monthKey: `${year}-${meta.num}`,
      startDay,
      endDay,
      totalDays: endDay,
      formattedPeriod: `${meta.name} ${year}`,
      isMonthVerified: true
    };
  }

  // Check numeric pattern: e.g. "01/09/2026 To 30/09/2026" or "2026-09-01 To 2026-09-30"
  const numRegex = /(\d{4})[-/](\d{1,2})[-/](\d{1,2})|(\d{1,2})[-/](\d{1,2})[-/](\d{4})/g;
  const numMatches = [...dateRangeStr.matchAll(numRegex)];
  if (numMatches.length > 0) {
    const first = numMatches[0];
    let y = 2026, m = 9, d = 1;
    if (first[1]) {
      y = parseInt(first[1], 10);
      m = parseInt(first[2], 10);
      d = parseInt(first[3], 10);
    } else {
      d = parseInt(first[4], 10);
      m = parseInt(first[5], 10);
      y = parseInt(first[6], 10);
    }
    const mName = MONTH_NAMES[m - 1] || 'September';
    const mNum = String(m).padStart(2, '0');
    const totalDays = new Date(y, m, 0).getDate();
    return {
      detectedMonth: mName,
      detectedMonthIndex: m - 1,
      detectedYear: y,
      monthKey: `${y}-${mNum}`,
      startDay: d,
      endDay: totalDays,
      totalDays,
      formattedPeriod: `${mName} ${y}`,
      isMonthVerified: true
    };
  }

  return {
    detectedMonth: 'September',
    detectedMonthIndex: 8,
    detectedYear: 2026,
    monthKey: '2026-09',
    startDay: 1,
    endDay: 30,
    totalDays: 30,
    formattedPeriod: 'September 2026',
    isMonthVerified: true
  };
}

export function parseAttendanceCSV(csvText) {
  const lines = csvText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  
  let dateRange = 'Sep 01 2026 To Sep 30 2026';
  let company = 'MOHALI';
  let printedOn = '';
  let daysHeader = [];
  let dayColumnIndices = []; // Maps day number (1..31) to column index in the row
  
  const employees = [];
  let currentDepartment = 'OPERATIONS';

  // Find date range and company headers
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

  // Parse Biometric Period (Month, Year, MonthKey, Days)
  const periodMeta = parseBiometricPeriod(dateRange);

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
    const totalDaysInMonth = periodMeta.totalDays || 30;
    for (let d = 1; d <= totalDaysInMonth; d++) {
      daysHeader.push({ dayNum: d, dayName: getWeekdayInitial(periodMeta.detectedYear, periodMeta.detectedMonthIndex, d), colIdx: d });
      dayColumnIndices[d] = d;
    }
  }

  // Determine last Sunday of the detected month
  const totalDays = daysHeader.length > 0 ? Math.max(...daysHeader.map(d => d.dayNum)) : (periodMeta.totalDays || 30);
  let lastSundayNum = -1;
  for (let d = totalDays; d >= 1; d--) {
    const dayMeta = daysHeader.find(dh => dh.dayNum === d);
    if (dayMeta && (dayMeta.dayName === 'S' || dayMeta.dayName === 'Su' || dayMeta.dayName === 'Sun')) {
      lastSundayNum = d;
      break;
    }
  }

  // If lastSundayNum still not found from headers, compute mathematically
  if (lastSundayNum === -1) {
    for (let d = totalDays; d >= 1; d--) {
      const testDate = new Date(periodMeta.detectedYear, periodMeta.detectedMonthIndex, d);
      if (testDate.getDay() === 0) {
        lastSundayNum = d;
        break;
      }
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

          // Clean up corrupted characters or non-printable UTF characters
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
              // Last Sunday is a working day!
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
    detectedMonth: periodMeta.detectedMonth,
    detectedYear: periodMeta.detectedYear,
    monthKey: periodMeta.monthKey,
    formattedPeriod: periodMeta.formattedPeriod,
    startDay: periodMeta.startDay,
    endDay: periodMeta.endDay,
    isMonthVerified: true,
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
