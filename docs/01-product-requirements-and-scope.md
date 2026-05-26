# Product requirements & scope

## Problem statement

Operations teams manage **cases** (client work items) today in spreadsheets: assignment, supporting documents, review, and final outcomes are hard to audit and constrain. Mini Case Tracker is a focused web application that replaces spreadsheets with enforced workflows, role-based visibility, and an audit trail.

## Source requirement

Deliverable aligns with the **MERN Stack take-home specification** (“Mini Case Tracker”), including roles, lifecycle, JWT security, MongoDB persistence, listings with filters/pagination, case detail with timeline and comments, file uploads, server-side validation, and quick-start documentation.

---

## Roles & responsibilities

### Manager

| Responsibility | Implemented |
|----------------|-------------|
| Create cases (client name, subject name, case type, due date) | ✅ `POST /api/v1/cases` |
| Optionally assign / reassign to agents at creation or via assign API | ✅ Create with optional `assignedTo`; `PATCH .../assign` |
| Review submissions and mark outcome | ✅ `PATCH .../status` to `cleared` or `discrepant` |
| Broader visibility (all cases vs agent’s queue) | ✅ List/filter queries scoped by role |

### Agent

| Responsibility | Implemented |
|----------------|-------------|
| See only assigned cases | ✅ List + detail access filtered by `assignedTo` |
| Upload supporting documents | ✅ `POST .../documents` (agent + assignment + status rules) |
| Add notes (comments) | ✅ `POST .../comments` |
| Progress work and submit when done | ✅ Status updates + submit requires ≥1 document |

---

## Case lifecycle (business)

Required flow:

**New → Assigned → In Progress → Submitted → Cleared / Discrepant**

- Transitions are **enforced on the server** (not only in the UI).
- Terminal states: **Cleared**, **Discrepant** (no further status transitions).
- See [04 — Data model & domain](./04-data-model-and-domain.md) for the exact transition matrix and additional business rules (e.g. submit requires a document).

---

## Must-have checklist (take-home)

| Requirement | Implementation note |
|-------------|---------------------|
| JWT login + role-based access | `POST /auth/login`, `authenticate` + `authorize` middleware |
| MongoDB schema: users, cases, documents, comments, audit | Mongoose models under `backend/src/models/` |
| List: search, status filter, agent filter, pagination | `GET /cases` with query validation (Zod) |
| Case detail: status timeline + comments | Detail aggregates case + audit timeline; comments via nested routes |
| File upload (local storage acceptable) | Multer → `uploads/`, static `/uploads`, MIME + size limits |
| Server-side validation on writes | Zod on body/query/params + service-level rules |
| README: clone & run &lt; 10 minutes | Root + `backend/README.md` + `frontend/README.md` |

---

## Nice-to-have (after core)

| Item | Status |
|------|--------|
| Dashboard stat tiles | ✅ `GET /api/v1/cases/dashboard` |
| Swagger / OpenAPI | ✅ `/api-docs`, spec at `/api-docs.json` |
| Dockerfile | Optional / not required for HLD scope unless added to repo |

---

## Extensions beyond minimal brief (as implemented)

The backend also includes features commonly needed for a complete auth story:

- **Self-service registration** with role selection: `POST /api/v1/auth/register`
- **Forgot / reset password** (token-based; dev may return `resetUrl` in response for testing): `POST /auth/forgot-password`, `POST /auth/reset-password`
- **`GET /auth/me`** for session bootstrap

Treat these as product extensions; reviewer evaluation may still prioritize core case workflow fidelity.

---

## Out of scope (implicit)

- Billing, multi-tenancy, or external SSO
- Replacing local disk with S3-compatible object storage (recommended for serious production rather than mandated by brief)
- Real email delivery for password reset in all environments (may be simulated or logged in dev)

---

## Success criteria mapping

Evaluation dimensions from the brief map to concrete artifacts:

| Criterion | Where to inspect |
|-----------|-------------------|
| Schema & API choices | This doc suite + Swagger + Mongoose models |
| Code organisation | MVC layout in `backend/src/` |
| Auth & validation | Middleware + Zod + `CaseService` / `DocumentService` rules |
| Working deploy | README deployment section (hosting-dependent) |
