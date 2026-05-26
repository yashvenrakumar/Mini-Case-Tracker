# API & integration

Base URL convention: **`/api/v1`**. Responses use the **`ApiResponse`** envelope unless middleware short-circuits with raw health checks.

---

## Standard response envelope

```json
{
  "success": true,
  "message": "Human-readable summary",
  "data": {},
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "totalPages": 5
  }
}
```

Pagination lists return **`meta`** describing current page sizing. Errors include appropriate HTTP status (`errorHandler` produces consistent JSON semantics via `ApiError`).

---

## Authentication

**Header:**

```http
Authorization: Bearer <jwt>
```

**JWT payload** minimally carries user identifier and role to enforce authorization (implementation details live in `utils/jwt.ts` and `middleware/auth.middleware.ts`).

| Endpoint | Notes |
|---------|-------|
| `POST /auth/login` | Public; receives email/password |
| `POST /auth/register` | Public extension; selects `manager` or `agent` |
| `POST /auth/forgot-password` | Starts reset flow |
| `POST /auth/reset-password` | Completes reset (`token`, new `password`) |
| `GET /auth/me` | Authenticated bootstrap |

---

## Resource map

### Users (Manager-only after auth)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/users/agents` | Dropdown / assignment targets for Managers |

_All user routes nest under `authenticate` + `authorize(MANAGER)`._

### Cases

| Method | Path | Auth / Role | Notes |
|--------|------|-------------|------|
| `GET` | `/cases` | Auth | Pagination + `search`, `status`, optional `assignedTo` |
| `GET` | `/cases/dashboard` | Auth | Aggregate counts by status (scoped for agents) |
| `POST` | `/cases` | Manager | Creates case |
| `GET` | `/cases/:id` | Auth | Detail + bundled timeline/counts envelope from service |
| `GET` | `/cases/:id/audit` | Auth | Raw audit slices (alternative to aggregated detail) |
| `PATCH` | `/cases/:id/assign` | Manager | Assign / reassign |
| `PATCH` | `/cases/:id/status` | Role-based transitions | Validates graph + extras (documents on submit) |

### Nested under `/cases/:caseId`

**Comments:**

| Method | Path | Role | Body |
|--------|------|------|------|
| `GET` | `/comments` | Auth | List |
| `POST` | `/comments` | Auth | `{ body }` subject to closure rules |

**Documents:**

| Method | Path | Notes |
|--------|------|-------|
| `GET` | `/documents` | List metadata + linkage to download URLs (`/uploads/...`) |
| `POST` | `/documents` | **Multipart**: field name **`file`**; Agent rules in service |

---

## Search & filtering semantics

Case list merges optional filters:

- **`search`** — case-insensitive OR across textual fields (`RegExp`; see service).
- **`status`** — equality on enum.
- **`assignedTo`** — Manager may filter agents; Agents ignore broad org filters because base filter restricts to themselves.

Sorting strategy (current): **`updatedAt` descending** primary driver for backlog recency.

---

## OpenAPI / Swagger

Swagger UI mounts at **`/api-docs`**; raw JSON specification at **`/api-docs.json`**.

Use this as the authoritative operation-level reference for schemas, tagging, security blocks, and example payloads.

---

## Client integration checklist (SPA)

1. **Base URL**: configure Axios (or equivalent) to `http(s)://<host>/api/v1`.
2. **Token storage**: Persist securely in browser (`localStorage` vs `memory` vs `cookie` depends on XSS posture; repo currently follows SPA-local persistence patterns documented in frontend README).
3. **Interceptors**: Attach Bearer token; bubble 401-style responses to logout / login redirect.
4. **Uploads**: `POST` with `multipart/form-data` and **no manual** `Content-Type` header (boundary injection).
5. **Static files**: concatenate backend origin + **`/uploads/<filename>`** from document metadata paths.

---

## Versioning stance

Breaking API changes SHOULD introduce **`/api/v2`**. Minor additive fields stay within `v1`.

---

## Health & diagnostics

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/health` | Liveness-ish signal + environment echo |
