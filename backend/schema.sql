-- Database schema for The Hive case management backend

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) UNIQUE NOT NULL,
  password_hash VARCHAR(200) NOT NULL,
  role VARCHAR(80) NOT NULL DEFAULT 'analyst',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS departments (
  id SERIAL PRIMARY KEY,
  dept_name VARCHAR(140) UNIQUE NOT NULL,
  description TEXT,
  dept_head VARCHAR(160),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  role_title VARCHAR(120) NOT NULL,
  department_id INTEGER REFERENCES departments(id) ON DELETE CASCADE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE roles
  ADD COLUMN IF NOT EXISTS department_id INTEGER REFERENCES departments(id) ON DELETE CASCADE;

CREATE UNIQUE INDEX IF NOT EXISTS idx_roles_title_department ON roles (role_title, department_id);

CREATE TABLE IF NOT EXISTS employees (
  id SERIAL PRIMARY KEY,
  employee_name VARCHAR(140) NOT NULL,
  email VARCHAR(160) UNIQUE NOT NULL,
  role_id INTEGER REFERENCES roles(id) ON DELETE SET NULL,
  department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cases (
  id SERIAL PRIMARY KEY,
  case_reference VARCHAR(40) UNIQUE NOT NULL,
  title VARCHAR(220) NOT NULL,
  description TEXT,
  recommendation TEXT,
  department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
  employee_id INTEGER REFERENCES employees(id) ON DELETE SET NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'New',
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cases_department ON cases(department_id);
CREATE INDEX IF NOT EXISTS idx_cases_employee ON cases(employee_id);
CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department_id);
CREATE INDEX IF NOT EXISTS idx_employees_role ON employees(role_id);
