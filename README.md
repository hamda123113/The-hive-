# Case Management System

A professional case management application scaffold with frontend, backend, and PostgreSQL schema ready for use.

## Overview

The application supports:

- Landing page for login/signup
- Protected dashboard with case analytics
- Case assignment workflow with system-generated case IDs
- Department management
- Employee management
- Role management
- PostgreSQL-backed Node.js Express API

## Repository structure

- `frontend/` — React application, styled dark theme, Vite-powered
- `backend/` — Express API, PostgreSQL database access, authentication, CRUD routes
- `backend/schema.sql` — SQL schema for users, roles, departments, employees, and cases

## Backend setup

1. Create the database and user in PostgreSQL.
2. Run the SQL schema in `backend/schema.sql`.
3. Create `backend/.env` with the following values:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hive_db
DB_USER=postgres
DB_PASSWORD=123
PORT=4000
JWT_SECRET=supersecretkey
```

4. Install backend dependencies:

```bash
cd The-hive-/backend
npm install
```

5. Start the backend:

```bash
npm run dev
```

## Frontend setup

1. Install frontend dependencies:

```bash
cd The-hive-/frontend
npm install
```

2. Start the React app:

```bash
npm run dev
```

3. The frontend expects the API at `http://localhost:4000/api`. You can override this with `VITE_API_URL`.

## Core features

- `GET /api/auth/signup` and `POST /api/auth/login` for user onboarding
- `GET /api/dashboard/overview` for summary cards and charts
- `GET /api/cases`, `POST /api/cases`, `PUT /api/cases/:id`
- `GET /api/departments`, `POST /api/departments`, `PUT /api/departments/:id`
- `GET /api/employees`, `POST /api/employees`, `PUT /api/employees/:id`
- `GET /api/roles`, `POST /api/roles`

## Notes

- The frontend uses local storage for auth state and attaches JWT tokens automatically.
- The backend includes middleware for protected routes.
- The app is designed with a dark theme and professional dashboard layout.
