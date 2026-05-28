# Mini Case Tracker — Backend API

Node.js + Express + TypeScript + MongoDB (Mongoose) REST API for the **Mini Case Tracker** MERN take-home task.

## Features

- **JWT authentication** with role-based access (`manager` | `agent`), **registration**, and optional **password reset** flow
- **Case lifecycle** with server-enforced status transitions:
  `new` → `assigned` → `in_progress` → `submitted` → `cleared` | `discrepant`
- **Audit log** for every status change and key actions
- **Documents** — local file upload (images, PDF, Word, text)
- **Comments** — notes on cases
- **List API** — search, status filter, agent filter, pagination
- **Standardized JSON responses** (`success`, `message`, `data`, `meta`)
- **Swagger / OpenAPI** at `/api-docs`

## Project structure (MVC)

```
src/
├── config/          # env, database, swagger
├── controllers/     # HTTP handlers
├── middleware/      # auth, roles, validation, upload, errors
├── models/          # Mongoose schemas
├── routes/          # Express routers + OpenAPI annotations
├── services/        # business logic
├── validation/      # Zod schemas
├── utils/           # ApiResponse, ApiError, JWT, transitions
├── scripts/         # seed
├── app.ts
└── server.ts
```

## Quick start (< 10 minutes)

### Prerequisites

- Node.js 18+
- MongoDB connection string (Atlas recommended for deployment)

> **Note:** The provided Atlas SQL-style URI may require a standard `mongodb+srv://` connection string for Mongoose. If connection fails, replace `MONGODB_URI` in `.env` with your Atlas cluster URI.

### Setup

```bash
cd backend
cp .env.example .env   # edit MONGODB_URI and JWT_SECRET if needed
npm install
npm run seed           # creates test users + sample case
npm run dev
```

- API: `http://localhost:5000`
- Health: `GET /health`
- Swagger UI: `http://localhost:5000/api-docs`

### Test credentials (after seed)

| Role    | Email                 | Password     |
|---------|-----------------------|--------------|
| Manager | manager@minicase.com  | password123  |
| Agent   | agent@minicase.com    | password123  |
| Agent 2 | agent2@minicase.com   | password123  |

## API overview

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/auth/login` | Public | Login |
| POST | `/api/v1/auth/register` | Public | Register as manager or agent |
| POST | `/api/v1/auth/forgot-password` | Public | Request password reset |
| POST | `/api/v1/auth/reset-password` | Public | Complete password reset |
| GET | `/api/v1/auth/me` | Auth | Current user |
| GET | `/api/v1/users/agents` | Manager | List agents |
| GET | `/api/v1/cases` | Auth | List cases (filtered by role) |
| POST | `/api/v1/cases` | Manager | Create case |
| GET | `/api/v1/cases/:id` | Auth | Case detail + timeline |
| PATCH | `/api/v1/cases/:id/assign` | Manager | Assign to agent |
| PATCH | `/api/v1/cases/:id/status` | Role-based | Update status |
| GET | `/api/v1/cases/:id/audit` | Auth | Audit log |
| GET | `/api/v1/cases/dashboard` | Auth | Stats by status |
| GET/POST | `/api/v1/cases/:caseId/comments` | Auth | Comments |
| GET/POST | `/api/v1/cases/:caseId/documents` | Auth / Agent upload | Documents |

### Standard response format

```json
{
  "success": true,
  "message": "Cases retrieved",
  "data": [],
  "meta": { "page": 1, "limit": 10, "total": 0, "totalPages": 1 }
}
```

### Authorization header

```
Authorization: Bearer <jwt_token>
```

## Status workflow

| Current status | Next (allowed) | Who |
|----------------|----------------|-----|
| new | assigned | Manager (assign) |
| assigned | in_progress | Agent |
| in_progress | submitted | Agent (requires ≥1 document) |
| submitted | cleared, discrepant | Manager |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development with hot reload |
| `npm run build` | Compile TypeScript |
| `npm start` | Run production build |
| `npm run seed` | Reset DB + seed users/case |

## Assumptions

- Managers see all cases; agents see only cases assigned to them.
- File storage is local (`uploads/`); suitable for dev and small deployments.
- Public **register** (`POST /api/v1/auth/register`) is available with role `manager` or `agent`; seed users remain the fastest way to demo.
- Submitting a case requires at least one uploaded document.

## Deployment

Set environment variables on Render / Railway / Fly.io:

- `MONGODB_URI`, `JWT_SECRET`, `PORT`, `CORS_ORIGIN` (your frontend URL)

Build command: `npm install && npm run build`  
Start command: `npm start`

Run seed once after deploy: `npm run seed`
