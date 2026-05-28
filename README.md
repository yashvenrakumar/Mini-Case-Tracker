# Mini Case Tracker

MERN mini case tracker with **role-based auth** (Manager/Agent), case lifecycle + audit log, comments, and document uploads.

## Prerequisites

- Node.js **18+**
- MongoDB (local or Atlas)

## Repo structure

- `backend/` — Express + TypeScript API
- `frontend/` — React + Vite app
- `docs/` — HLD/LLD and architecture docs

## Setup (local)

### 1) Backend

```bash
cd backend
cp .env.example .env
npm install
npm run seed
npm run dev
```

- API: `http://localhost:5000`
- Swagger: `http://localhost:5000/api-docs`

### 2) Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

- App: `http://localhost:5173`

## Environment variables

- **Backend**: see `backend/.env.example`
- **Frontend**: see `frontend/.env.example`

> `.env` and `.env.*` are ignored by git (by design).

## Demo credentials (after seeding backend)

- Manager: `manager@minicase.com` / `password123`
- Agent: `agent@minicase.com` / `password123`

## More details

- Backend docs: `backend/README.md`
- Frontend docs: `frontend/README.md`
- Architecture & design docs: `docs/README.md`

