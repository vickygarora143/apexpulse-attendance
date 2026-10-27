import { writeFileSync, unlinkSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { RAW_CSV_DATA } from '../src/data/initialData.js';
import { parseAttendanceCSV } from '../src/utils/csvParser.js';

function sqlQ(val) {
  if (val === null || val === undefined) return 'NULL';
  return "'" + String(val).replace(/'/g, "''") + "'";
}

console.log('Parsing raw biometric report dataset...');
const parsed = parseAttendanceCSV(RAW_CSV_DATA);
console.log(`Parsed ${parsed.employees.length} employees with ${parsed.totalDays} days.`);

const sqlLines = [];

// 1. Seed Role-wise Users
const users = [
  { id: 'USR-001', emp_code: 'GDSM001', username: 'admin', role: 'ADMIN', name: 'Vivek Arora', dept: 'MOHALI', pw: 'Admin@123' },
  { id: 'USR-002', emp_code: 'GDSM002', username: 'tl_shruti', role: 'TL', name: 'Shruti Goswami', dept: 'MOHALI', pw: 'TL@123' },
  { id: 'USR-003', emp_code: 'GDSM004', username: 'tl_ashish', role: 'TL', name: 'Ashish', dept: 'MOHALI', pw: 'TL@123' },
  { id: 'USR-004', emp_code: 'GDSM139', username: 'hr_himani', role: 'HR', name: 'Himani Singh', dept: 'MONEYVIEW', pw: 'HR@123' },
  { id: 'USR-005', emp_code: 'GDSM092', username: 'hr_sakshi', role: 'HR', name: 'Sakshi', dept: 'MOHALI', pw: 'HR@123' },
  { id: 'USR-006', emp_code: 'GDSM065', username: 'agent_meenu', role: 'TELECALLER', name: 'Meenu', dept: 'MOHALI', pw: 'Agent@123' },
  { id: 'USR-007', emp_code: 'GDSM021', username: 'agent_shiwani', role: 'TELECALLER', name: 'Shiwani', dept: 'MOHALI', pw: 'Agent@123' },
  { id: 'USR-008', emp_code: 'GDSM012', username: 'agent_sumit', role: 'TELECALLER', name: 'Sumit', dept: 'MOHALI', pw: 'Agent@123' },
  { id: 'USR-009', emp_code: 'GDSM064', username: 'agent_rahul', role: 'TELECALLER', name: 'Rahul', dept: 'MOHALI', pw: 'Agent@123' }
];

// Add entries for remaining agents so any agent can log in with their emp_code and 'Agent@123'
parsed.employees.forEach((emp, i) => {
  if (!users.some(u => u.emp_code === emp.code)) {
    users.push({
      id: `USR-${(i + 10).toString().padStart(3, '0')}`,
      emp_code: emp.code,
      username: emp.code.toLowerCase(),
      role: 'TELECALLER',
      name: emp.name,
      dept: emp.department,
      pw: 'Agent@123'
    });
  }
});

for (const u of users) {
  sqlLines.push(`
    INSERT INTO users(id, emp_code, username, password_hash, role, name, department)
    VALUES (${sqlQ(u.id)}, ${sqlQ(u.emp_code)}, ${sqlQ(u.username)}, ${sqlQ(u.pw)}, ${sqlQ(u.role)}, ${sqlQ(u.name)}, ${sqlQ(u.dept)})
    ON CONFLICT(emp_code) DO UPDATE SET username=excluded.username, role=excluded.role, name=excluded.name, department=excluded.department;
  `);
}

// 2. Seed Employees
for (const emp of parsed.employees) {
  let role = 'TELECALLER';
  if (emp.code === 'GDSM001') role = 'ADMIN';
  else if (emp.code === 'GDSM002' || emp.code === 'GDSM004' || emp.code === 'GDSM043') role = 'TL';
  else if (emp.code === 'GDSM139' || emp.code === 'GDSM092') role = 'HR';

  sqlLines.push(`
    INSERT INTO employees(emp_code, name, department, designation, role, allowed_offs, shift_timings)
    VALUES (${sqlQ(emp.code)}, ${sqlQ(emp.name)}, ${sqlQ(emp.department)}, ${sqlQ(emp.designation)}, ${sqlQ(role)}, 4, '09:30 - 18:30')
    ON CONFLICT(emp_code) DO UPDATE SET name=excluded.name, department=excluded.department, designation=excluded.designation, role=excluded.role;
  `);

  // 3. Seed Attendance Records
  for (let d = 1; d <= parsed.totalDays; d++) {
    const dayObj = emp.attendance[d] || { dayNum: d, dayName: 'D', status: 'A', inTime: '', outTime: '', totalDuration: '00:00' };
    const dateStr = `2026-09-${String(d).padStart(2, '0')}`;
    const id = `${emp.code}-${dateStr}`;

    const is1stWO = d === 1 ? 1 : 0;
    const isLastSun = (dayObj.isLastSundayWorking || d === 27) ? 1 : 0;

    sqlLines.push(`
      INSERT INTO attendance_records(id, emp_code, date, day_num, day_name, status, in_time, out_time, total_duration, is_regularized, is_1st_day_wo, is_last_sunday_working)
      VALUES (${sqlQ(id)}, ${sqlQ(emp.code)}, ${sqlQ(dateStr)}, ${d}, ${sqlQ(dayObj.dayName)}, ${sqlQ(dayObj.status)}, ${sqlQ(dayObj.inTime || null)}, ${sqlQ(dayObj.outTime || null)}, ${sqlQ(dayObj.totalDuration || '00:00')}, 0, ${is1stWO}, ${isLastSun})
      ON CONFLICT(emp_code, date) DO UPDATE SET
        status = excluded.status,
        in_time = excluded.in_time,
        out_time = excluded.out_time,
        total_duration = excluded.total_duration,
        is_1st_day_wo = excluded.is_1st_day_wo,
        is_last_sunday_working = excluded.is_last_sunday_working;
    `);
  }
}

// 4. Seed Real Initial Regularizations
const sampleRegs = [
  {
    id: 'REG-2026-001',
    emp_code: 'GDSM002',
    emp_name: 'SHRUTI GOSWAMI',
    dept: 'MOHALI',
    date: '2026-09-04',
    day_num: 4,
    current_status: 'A',
    requested_status: 'P',
    req_in: '09:30',
    req_out: '18:35',
    calc_duration: '09:05',
    reason: 'Biometric fingerprint reader power timeout during morning shift kickoff',
    status: 'PENDING'
  },
  {
    id: 'REG-2026-002',
    emp_code: 'GDSM065',
    emp_name: 'MEENU',
    dept: 'MOHALI',
    date: '2026-09-04',
    day_num: 4,
    current_status: 'A',
    requested_status: 'P',
    req_in: '09:25',
    req_out: '18:30',
    calc_duration: '09:05',
    reason: 'Terminal scanner sync lag on entry punch',
    status: 'PENDING'
  },
  {
    id: 'REG-2026-003',
    emp_code: 'GDSM015',
    emp_name: 'BEANT KAUR',
    dept: 'MOHALI',
    date: '2026-09-15',
    day_num: 15,
    current_status: 'A',
    requested_status: 'P',
    req_in: '09:30',
    req_out: '18:45',
    calc_duration: '09:15',
    reason: 'Attended client escalation briefing with Operations Supervisor',
    status: 'PENDING'
  }
];

for (const r of sampleRegs) {
  sqlLines.push(`
    INSERT INTO regularization_requests(id, emp_code, emp_name, department, date, day_num, current_status, requested_status, requested_in, requested_out, calc_duration, reason, status)
    VALUES (${sqlQ(r.id)}, ${sqlQ(r.emp_code)}, ${sqlQ(r.emp_name)}, ${sqlQ(r.dept)}, ${sqlQ(r.date)}, ${r.day_num}, ${sqlQ(r.current_status)}, ${sqlQ(r.requested_status)}, ${sqlQ(r.req_in)}, ${sqlQ(r.req_out)}, ${sqlQ(r.calc_duration)}, ${sqlQ(r.reason)}, ${sqlQ(r.status)})
    ON CONFLICT(id) DO NOTHING;
  `);
}

// 5. Initial Audit Log
sqlLines.push(`
  INSERT INTO audit_logs(id, action, details, actor_code)
  VALUES ('AUD-001', 'SYSTEM_INIT', 'ApexPulse Database Initialized with September 2026 Biometric Data. Rules active: Day 1 WO, Last Sunday Working, 4 Monthly Offs Quota.', 'SYSTEM');
`);

const finalSql = sqlLines.join('\n');
writeFileSync('seed_data.sql', finalSql, 'utf8');
console.log(`Generated ${sqlLines.length} SQL queries in seed_data.sql. Executing on Cloudflare D1...`);

const res = spawnSync('npx', ['wrangler', 'd1', 'execute', 'apexpulse-attendance-db', '--remote', '--file=seed_data.sql'], {
  shell: true,
  stdio: 'inherit'
});

try { unlinkSync('seed_data.sql'); } catch {}

if (res.status === 0) {
  console.log('✅ Remote Cloudflare D1 Database Successfully Seeded with 100% Real Attendance Data!');
} else {
  console.error('Failed to seed D1 database.');
}
