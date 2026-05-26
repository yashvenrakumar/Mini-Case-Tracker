# Backend high-level design

## Architectural style

The Node/Express backend follows **layered MVC-oriented** structure with **fat services** and **thin controllers**:

- **HTTP layer** validates shape of input (Zod) and authenticates identity.
- **Application / domain layer** (services) encodes business rules, authorization context, and aggregates.
- **Persistence layer** (Mongoose models + queries) stores entities and supports indexes for list/search.

No separate DDD bounded contexts; complexity remains in a single modular monolith adequate for the take-home scope.

---

## Logical layers

```text
 ┌─────────────────────────────────────────────────────────┐
 │ HTTP — routes, Swagger annotations, multipart routes     │
 └───────────────────────────┬─────────────────────────────┘
                             ▼
 ┌─────────────────────────────────────────────────────────┐
 │ Middleware — auth (JWT), role guard, validation, Multer │
 └───────────────────────────┬─────────────────────────────┘
                             ▼
 ┌─────────────────────────────────────────────────────────┐
 │ Controllers — map req/res → service calls → ApiResponse   │
 └───────────────────────────┬─────────────────────────────┘
                             ▼
 ┌─────────────────────────────────────────────────────────┐
 │ Services — CaseService, DocumentService, AuthService …  │
 │            AuditService writes append-only-ish events    │
 └───────────────────────────┬─────────────────────────────┘
                             ▼
 ┌─────────────────────────────────────────────────────────┐
 │ Persistence — Mongoose models, indexes                   │
 └─────────────────────────────────────────────────────────┘
```

---

## Module map (folders)

| Path | Responsibility |
|------|----------------|
| **`config/`** | Environment aggregation, Swagger spec builder, Mongo connection |
| **`routes/`** | Mount sub-routers at `/auth`, `/users`, `/cases`, nested `:caseId/...` |
| **`middleware/`** | `authenticate`, `authorize`, `validate`, `upload`, `error.middleware` |
| **`controllers/`** | Per-resource Express handlers wrapping `asyncHandler` |
| **`services/`** | Business logic; orchestrates repositories + auditing |
| **`models/`** | Mongoose schemas: `User`, `Case`, `Comment`, `Document`, `AuditLog` |
| **`validation/`** | Zod schemas for bodies, queries, params |
| **`utils/`** | `ApiResponse`, `ApiError`, JWT helpers, `statusTransitions`, shared enums |

---

## Request lifecycle (happy path example)

Example: **`PATCH /api/v1/cases/:id/status`**

1. **Routing** matches case router (`authenticate` already applied globally for cases).
2. **Validation** parses `:id` and JSON body `{ status }` via Zod.
3. **`CaseController.updateCaseStatus`** reads `AuthRequest.user` (user id + role).
4. **`CaseService.updateStatus`**:
   - Loads case and verifies agent access through `getByIdForUser` when role is Agent.
   - Calls **`assertValidStatusTransition`** (central rule table).
   - If transitioning to **`submitted`**, asserts **≥1 document** exists.
   - Sets timestamps (`submittedAt`, `reviewedAt`) for relevant transitions.
   - Persists and **`AuditService.logStatusChange`**.
5. **`ApiResponse.success`** wraps payload in standard envelope.

This pattern repeats: **validate early, authorize in middleware + domain checks, mutate in service, side-effect audit**.

---

## Case workflow authority

**Single source of truth** for allowed next statuses and qualifying roles lives in **`utils/statusTransitions.ts`**. Controllers/services must call `assertValidStatusTransition` whenever status mutates aside from specialized paths (e.g. assign path transitions to `assigned`).

---

## Assignment model

Assignments are modeled as **`Case.assignedTo` (ObjectId ref User)** plus **status**:

- **`POST /cases`** accepts optional **`assignedTo`**. Initial status resolves via **`initialStatusForCreate`**: `assigned` if an agent is provided on create, otherwise **`new`**.
- **`PATCH /cases/:id/assign`** (Manager-only) sets assignee while case is **`new`** or **`assigned`**; status becomes **`assigned`**. Changing assignee while already **`assigned`** logs **`case_reassigned`** audit action vs full status change.

---

## Document upload pipeline

| Stage | Behaviour |
|-------|-----------|
| Client | Multipart field `file` |
| Middleware | Multer saves under configured `uploads/` dir, unique filenames |
| Service | Validates role (**Agent only**), assignee ownership, permissive-but-bounded statuses for upload |
| Metadata | Persisted row in **`Document`** collection |
| Serving | Static `GET /uploads/...` (subject to frontend/proxy composing full URL) |
| MIME allowlist | Images, PDF, DOC/DOCX, plain text |

---

## Cross-cutting concerns

| Concern | Mechanism |
|---------|-----------|
| **Errors** | `ApiError` with HTTP codes mapped in `errorHandler` middleware |
| **Consistency** | No distributed transactions; single-document Mongo updates suffice at this scale |
| **Observability** | `morgan` HTTP logging (`dev`/`combined` by env); structured application logging can extend here |
| **Security headers** | `helmet` with cross-origin policy tuned for uploads |
| **API docs** | OpenAPI emitted from router JSDoc and served by `swagger-ui-express` |

---

## Extensibility hooks

Potential future increments without rewriting core shape:

- Pluggable **`StorageAdapter`** abstraction over local disk vs S3
- Dedicated **`NotificationService`** for real password-reset emails and manager alerts
- Read-model caching for dashboards (aggregation pipelines) if cardinality grows significantly

---

## See also

Sequence charts, router/middleware flow, case **state machine**, and frontend→API wiring are documented in **[07 — Low-level design & Mermaid flows](./07-low-level-design-and-flows.md)**.
