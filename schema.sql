CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  emp_code TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('ADMIN', 'TL', 'HR', 'TELECALLER')),
  name TEXT NOT NULL,
  department TEXT NOT NULL,
  must_change_password INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS employees (
  emp_code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  department TEXT NOT NULL,
  designation TEXT NOT NULL,
  role TEXT NOT NULL,
  allowed_offs INTEGER NOT NULL DEFAULT 4,
  shift_timings TEXT DEFAULT '09:30 - 18:30'
);

CREATE TABLE IF NOT EXISTS attendance_records (
  id TEXT PRIMARY KEY,
  emp_code TEXT NOT NULL,
  date TEXT NOT NULL,
  day_num INTEGER NOT NULL,
  day_name TEXT NOT NULL,
  status TEXT NOT NULL,
  in_time TEXT,
  out_time TEXT,
  total_duration TEXT,
  is_regularized INTEGER NOT NULL DEFAULT 0,
  regularization_remarks TEXT,
  is_1st_day_wo INTEGER NOT NULL DEFAULT 0,
  is_last_sunday_working INTEGER NOT NULL DEFAULT 0,
  UNIQUE(emp_code, date)
);

CREATE TABLE IF NOT EXISTS regularization_requests (
  id TEXT PRIMARY KEY,
  emp_code TEXT NOT NULL,
  emp_name TEXT NOT NULL,
  department TEXT NOT NULL,
  date TEXT NOT NULL,
  day_num INTEGER NOT NULL,
  current_status TEXT NOT NULL,
  requested_status TEXT NOT NULL,
  requested_in TEXT NOT NULL,
  requested_out TEXT NOT NULL,
  calc_duration TEXT NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK(status IN ('PENDING', 'APPROVED', 'REJECTED')),
  admin_remarks TEXT,
  submitted_at TEXT DEFAULT CURRENT_TIMESTAMP,
  resolved_at TEXT,
  resolved_by TEXT
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  action TEXT NOT NULL,
  details TEXT NOT NULL,
  actor_code TEXT NOT NULL,
  timestamp TEXT DEFAULT CURRENT_TIMESTAMP
);
