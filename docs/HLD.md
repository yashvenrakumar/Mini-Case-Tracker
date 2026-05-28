# High Level Design (HLD) — Mini Case Tracker (MERN)

## 1) Purpose

Mini Case Tracker replaces a spreadsheet-based workflow for a small ops team. It supports:

- **Manager**: create cases, assign to agents, review submissions, close as **Cleared** or **Discrepant**
- **Agent**: see only assigned cases, work them, upload documents/photos, add notes/comments, submit when done

This document explains the system at a high level (what it does, how it is structured, and how requests/data flow through it).

---

## 2) Requirements summary (from take-home brief)

### Core workflow

**Case status flow (server-enforced):**

`new → assigned → in_progress → submitted → (cleared | discrepant)`

### Must-have checklist

- **JWT login + role-based access**
- **MongoDB schema** for: users, cases, documents, comments, audit log
- **Case list page**: search, status/agent filter, pagination
- **Case detail page**: status timeline + comments
- **File upload**: local storage is acceptable
- **Server-side validation** on every write
- **README**: clone + run in under 10 minutes

### Nice-to-have (present in this repo)

- **Swagger/OpenAPI** (backend uses `swagger-jsdoc` + `swagger-ui-express`)
- **Dashboard stats** endpoint (`GET /cases/dashboard`) and UI page

---

## 3) System overview

### What is built

- **Frontend**: React SPA (Vite) using **MUI** components, Redux for auth/theme/filters, protected routing
- **Backend**: Node.js + Express (TypeScript) REST API with JWT auth, role checks, Zod validation, Swagger
- **Database**: MongoDB via **Mongoose**
- **File storage**: local filesystem uploads (document metadata stored in MongoDB)

### System context

```mermaid
flowchart LR
  U[User: Manager/Agent] -->|Browser| FE[Frontend SPA (React)]
  FE -->|HTTPS JSON + JWT| API[Backend API (Express)]
  API -->|Mongoose| DB[(MongoDB)]
  API -->|read/write| FS[(Local File Storage /uploads)]
```

---

## 4) High-level architecture

### Backend layering

The backend follows a conventional layered design:

- **Routes**: HTTP endpoints + middleware pipeline (auth/role/validation)
- **Controllers**: translate request → service call → standard response envelope
- **Services**: business rules (status transitions, visibility, assignment checks, submit constraints)
- **Models**: Mongoose schemas for persistence
- **Cross-cutting**: error handling, JWT utilities, request validation, audit logging

Example module present in the repo: `backend/src/routes/case.routes.ts` → `controllers/case.controller.ts` → `services/case.service.ts`.

### Frontend structure

Frontend is an SPA with route-based pages and API hooks:

- **Routing**: `frontend/src/routes/AppRoutes.tsx` with protected routes and a Manager-only route
- **Auth state**: Redux slice stores token + user; API client attaches Bearer token
- **Pages**:
  - Auth: login, register, forgot/reset password
  - App: dashboard, cases list, case detail, create case (manager)
- **API hooks**: `useAuthApi`, `useCasesApi` (and similar hooks for comments/documents/users)

---

## 5) Data model (high level)

Primary collections (details in `docs/04-data-model-and-domain.md`):

- **User**: identity + role (`manager` / `agent`)
- **Case**: business record with `status`, `assignedTo`, `createdBy`, due date, timestamps
- **Document**: uploaded file metadata + link to case + uploader
- **Comment**: case notes (with author)
- **AuditLog**: append-only event log for case lifecycle and key actions

Audit log is used by the UI to render a **status timeline** and activity history.

---

## 6) API design (high level)

Base path: **`/api/v1`** (details in `docs/05-api-and-integration.md`).

### Main resources

- **Auth**: login, register, forgot/reset password, `me`
- **Cases**:
  - list with search/filter/pagination: `GET /cases`
  - create/update/delete: manager-only
  - assignment: `PATCH /cases/:id/assign` (manager-only)
  - status transitions: `PATCH /cases/:id/status` (role-based)
  - dashboard stats: `GET /cases/dashboard`
  - audit timeline: `GET /cases/:id` (aggregated detail) and/or `GET /cases/:id/audit`
- **Comments** (nested under a case)
- **Documents** (nested under a case, multipart upload)

### Standard response envelope

Backend returns a consistent JSON envelope:

- `success` (boolean)
- `message` (string)
- `data` (payload)
- `meta` (pagination, when applicable)

---

## 7) Security and access control

### Authentication

- **JWT Bearer token** is issued on login and sent as:
  - `Authorization: Bearer <token>`

### Authorization (role + ownership)

Access rules implemented end-to-end:

- **Managers**: can see all cases; can create/edit/delete; can assign; can close submitted cases
- **Agents**: can only see cases **assigned to them**
- Certain actions require both role + case ownership, e.g. agent upload/document actions on assigned cases

Frontend also enforces UX-level gating via protected routes, but **backend is the source of truth**.

---

## 8) Core business flows (end-to-end)

### A) Manager creates and assigns a case

1. Manager logs in → receives JWT.
2. Manager creates a case (optionally with an assignee).
3. Backend:
   - validates payload
   - sets initial status (`new` or `assigned` when `assignedTo` provided)
   - writes **Case** + writes **AuditLog** entries

### B) Agent works the case and submits

1. Agent opens case detail (only assigned cases are accessible).
2. Agent uploads one or more documents (stored on disk; metadata stored in MongoDB).
3. Agent changes status to `in_progress`, then to `submitted`.
4. Backend enforces:
   - **valid transition** for the actor’s role
   - **submission requires at least one document**
   - emits **AuditLog** entries for status changes and uploads

### C) Manager reviews and closes

1. Manager opens a submitted case.
2. Manager transitions `submitted → cleared` or `submitted → discrepant`.
3. Backend records transition and updates timestamps (reviewed/closed) and audit.

---

## 9) Validation, errors, and auditability

- **Validation**: request bodies/params/queries are validated server-side (Zod + validation middleware)
- **Error handling**: failures return consistent HTTP codes (400/401/403/404/500) with JSON error envelope
- **Auditability**: important actions (case created, assignment, status change, document changes) are logged in **AuditLog** for the timeline

---

## 10) Non-functional considerations (pragmatic)

- **Pagination + search**: list endpoint supports search and filters; results sorted by `updatedAt` descending
- **Uploads**: local filesystem storage keeps implementation simple; metadata in DB allows timeline and UI listing
- **Observability**: request logging (e.g., morgan) and clear error messages help local debugging

---

## 11) How to run (high level)

See `backend/README.md` and `frontend/README.md` for exact steps. At a high level:

- Start **MongoDB** (local or Atlas)
- Run backend (Express API)
- Run frontend (Vite dev server) pointed to backend base URL

---

## 12) Traceability (requirements → implementation)

- **Roles + protected access**: `frontend` protected routes + backend `authenticate` and role middleware
- **Case workflow + enforced transitions**: backend status transition utilities + `PATCH /cases/:id/status`
- **List/search/filter/pagination**: `GET /cases` with query validation + service-layer filtering
- **Case detail timeline**: backend returns case detail + audit timeline; frontend renders timeline component
- **Documents upload**: document endpoints + local storage; frontend upload UI in case detail

If you want deeper implementation details and diagrams, continue with `docs/04-data-model-and-domain.md` and `docs/05-api-and-integration.md`.