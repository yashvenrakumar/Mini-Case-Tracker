# Low-level design, architecture & flow diagrams

This document complements the [High-level backend design](./03-backend-high-level-design.md) with **implementation-level** structure: how code components connect, how requests move through middleware, and how **requirements** (roles, lifecycle, audit, uploads) manifest at runtime. All diagrams use **Mermaid**—render in GitHub, VS Code, or [mermaid.live](https://mermaid.live).

---

## 1. LLD vs HLD (how to use this doc)

| Aspect | HLD ([03](./03-backend-high-level-design.md), [02](./02-system-architecture.md)) | This LLD doc |
|--------|----------------------------------------------------------------------------------|--------------|
| Audience | Stakeholders, reviewers, onboarding | Developers implementing or debugging |
| Focus | Bounded system, modules, rules | File-level flow, sequences, side effects |
| Diagrams | Context, layers | Component graph, sequence charts, state machine |

---

## 2. Repository structure (what maps to what)

```mermaid
flowchart LR
  subgraph fe [frontend/src]
    Pages[pages/]
    Hooks[hooks/api/]
    Redux[redux/]
    Routes[routes/]
  end

  subgraph be [backend/src]
    RT[routes/]
    CTRL[controllers/]
    SVC[services/]
    MW[middleware/]
    MDL[models/]
    VAL[validation/]
  end

  Hooks -->|HTTPS + JWT| RT
  Routes --> RT
  RT --> MW
  MW --> VAL
  MW --> CTRL
  CTRL --> SVC
  SVC --> MDL
```

**Requirement traceability:** “Dashboard stat tiles” → `GET /cases/dashboard` → `CaseService.getDashboardStats` → `Case.countDocuments` filtered by role.

---

## 3. Backend router mount & middleware chain (logical)

```mermaid
flowchart TD
  REQ[Incoming HTTP request]
  REQ --> APP[/app.ts — helmet, cors, json, static uploads/]
  APP --> V1["/api/v1 mount"]
  V1 --> BR{Router}

  BR -->|"/auth/*"| AR[auth.routes]
  BR -->|"/users/*"| UR["user.routes — authenticate + authorize MANAGER"]
  BR -->|"/cases"| CR["case.routes — authenticate on all"]
  BR -->|"/cases/:id/comments"| COR[comment.routes mergeParams]
  BR -->|"/cases/:id/documents"| DOR[document.routes mergeParams]

  AR -->|"POST login/register/reset"| NOAUTH[No JWT]
  AR -->|"GET /me"| JWT1[JWT authenticate]

  UR --> JWT2[JWT + Role]
  CR --> JWT3[JWT]
  CR -->|"POST /, PATCH assign"| MGR[authorize MANAGER]
  CR --> VALZ[Zod validate query/body/params]
  COR --> JWT3
  DOR --> JWT3
  DOR -->|"POST"| MUL[Multer upload.single file]

  JWT1 --> CTRL[Controller]
  JWT2 --> CTRL
  JWT3 --> CTRL
  MGR --> CTRL
  VALZ --> CTRL
  MUL --> CTRL
  CTRL --> SVC[Service]
  SVC --> MG[(MongoDB)]

  CTRL --> RESP[ApiResponse JSON]
  RESP --> DONE[HTTP response]

  CTRL --> ERR[asyncHandler → errorHandler]
  ERR --> DONE
```

**Take-home alignment:** JWT + role-based access is enforced **before** controllers on protected branches; writes always pass **Zod** where configured.

---

## 4. Case status state machine (domain — server is source of truth)

```mermaid
stateDiagram-v2
  direction LR
  [*] --> new : Manager creates\nno assignee
  [*] --> assigned : Manager creates\nwith assignee OR assign API

  new --> assigned : Manager PATCH assign

  assigned --> in_progress : Agent PATCH status
  in_progress --> submitted : Agent PATCH status\n(if ≥ 1 document)
  submitted --> cleared : Manager PATCH status
  submitted --> discrepant : Manager PATCH status

  cleared --> [*]
  discrepant --> [*]

  note right of submitted
    Manager reviews outcome
  end note
```

---

## 5. Sequence: login (JWT issuance)

```mermaid
sequenceDiagram
  participant U as Browser SPA
  participant API as POST /auth/login
  participant AC as AuthController
  participant AS as AuthService
  participant DB as User model

  U->>API: JSON email, password
  API->>AC: validated body
  AC->>AS: authenticate
  AS->>DB: findByEmail(+password select)
  DB-->>AS: user doc or null
  AS->>AS: bcrypt comparePassword
  AS->>AS: sign JWT sub + role
  AS-->>AC: { user, token }
  AC-->>U: ApiResponse.success data
  Note over U: Redux persist stores token<br/>axios attaches Bearer
```

---

## 6. Sequence: list cases with filters & role scoping

```mermaid
sequenceDiagram
  participant U as Client
  participant R as GET /cases
  participant MW as authenticate + validate query
  participant CC as CaseController.listCases
  participant CS as CaseService.list

  U->>R: Bearer JWT + page,limit,search,status,assignedTo?
  R->>MW: JWT verify → req.user id,role
  MW->>MW: Zod listCasesQuerySchema
  MW->>CC: ok
  CC->>CS: userId role params
  alt role is agent
    CS->>CS: filter assignedTo = userId
  else role is manager
    CS->>CS: optional assignedTo ObjectId filter
  end
  CS->>CS: Case.find + countDocuments skip/limit populate
  CS-->>CC: { cases meta }
  CC-->>U: ApiResponse.paginated
```

**Requirement:** “Agent sees only assigned cases” = **applied in service filter**, not UI-only.

---

## 7. Sequence: create case (manager) + audit

```mermaid
sequenceDiagram
  participant M as Manager client
  participant R as POST /cases
  participant MW as authorize MANAGER + Zod
  participant CC as CaseController
  participant CS as CaseService.create
  participant AUD as AuditService
  participant DB as Case + User + AuditLog

  M->>R: Bearer + body fields optional assignedTo
  R->>MW: MANAGER gate + validate
  MW->>CC: createCase
  CC->>CS: createdBy managerId inputs
  CS->>DB: validate assignee active AGENT if set
  CS->>CS: initialStatusForCreate NEW or ASSIGNED
  CS->>DB: Case.create
  CS->>AUD: logAction case_created
  alt status was ASSIGNED on create
    CS->>AUD: logStatusChange NEW to ASSIGNED
  end
  CS->>DB: populate assignedTo createdBy
  CS-->>CC: case doc
  CC-->>M: 201 ApiResponse.created
```

---

## 8. Sequence: PATCH status — agent submits (with document gate)

```mermaid
sequenceDiagram
  participant A as Agent client
  participant R as PATCH /cases/:id/status
  participant CC as CaseController
  participant CS as CaseService.updateStatus
  participant TS as statusTransitions.assertValidTransition
  participant DF as DocumentFile count
  participant AUD as AuditService

  A->>R: Bearer body status submitted
  R->>CC: validate id + status enum
  CC->>CS: userId role nextStatus
  CS->>CS: getByIdForUser access check
  CS->>TS: current submitted role agent
  alt invalid transition or wrong role
    TS-->>CS: throw ApiError
  end
  CS->>DF: countDocuments caseId
  alt count equals 0
    DF-->>CS: reject upload at least one doc
  else count ge 1
    DF-->>CS: ok
  end
  CS->>CS: set submittedAt save Case
  CS->>AUD: logStatusChange
  CS-->>CC: populated case
  CC-->>A: 200 success envelope
```

**Requirement:** “Submit requires ≥1 document” = **explicit check** before persistence.

---

## 9. Sequence: document upload (multipart)

```mermaid
sequenceDiagram
  participant A as Agent
  participant R as POST /cases/:caseId/documents
  participant M as Multer diskStorage
  participant DC as DocumentController
  participant DS as DocumentService.upload
  participant FS as uploads/ filesystem
  participant DB as Document + AuditLog

  A->>R: multipart field file + Bearer
  R->>M: write disk unique filename
  M->>FS: save bytes
  M->>DC: req.file
  DC->>DS: caseId userId role file meta
  DS->>DS: getByIdForUser
  DS->>DS: role must be AGENT assignee match
  DS->>DS: allowedStatuses contains case.status
  DS->>DB: Document.create metadata path
  DS->>DB: Audit document_uploaded
  DS-->>DC: populated doc row
  DC-->>A: 201 ApiResponse.created
```

**Requirement:** File upload via **local storage** + **MIME allowlist** in `upload.middleware.ts`.

---

## 10. Sequence: add comment (closed case blocked)

```mermaid
sequenceDiagram
  participant C as Client
  participant R as POST /cases/:caseId/comments
  participant CM as CommentController
  participant SV as CommentService.create
  participant CS as CaseService.getByIdForUser

  C->>R: Bearer + body
  R->>CM: validate
  CM->>SV: authorId role body
  SV->>CS: load case for access
  alt status cleared or discrepant
    SV-->>CM: 400 cannot add comments
  else open status
    SV->>SV: Comment.create populate author
    SV-->>CM: comment
  end
  CM-->>C: envelope
```

---

## 11. Frontend page → API → state (LLD view)

```mermaid
flowchart LR
  subgraph pages [Pages]
    LP[LoginPage]
    DP[DashboardPage]
    CL[CasesListPage]
    CD[CaseDetailPage]
    CC[CreateCasePage]
  end

  subgraph hooks [hooks/api]
    UA[useAuthApi]
    UC[useCasesApi]
    UCM[useCommentsApi]
    UDM[useDocumentsApi]
  end

  subgraph store [Redux]
    auth[authSlice token user]
    filt[casesFilterSlice page filters]
  end

  LP --> UA
  DP --> UC
  CL --> UC
  CL --> filt
  CD --> UC
  CD --> UCM
  CD --> UDM
  CC --> UC

  UA --> API[(REST /api/v1)]
  UC --> API
  UCM --> API
  UDM --> API

  UA --> auth
```

**Requirement:** “Custom API hooks per task” satisfied by **`hooks/api`** wrapping Axios with JWT from Redux.

---

## 12. Data persistence flows (conceptual writes)

High-level mapping of **which collections** absorb writes for primary user journeys:

```mermaid
flowchart LR
  subgraph Writes [MongoDB writes]
    U[(Users)]
    C[(Cases)]
    D[(Documents)]
    CO[(Comments)]
    A[(AuditLog)]
  end

  RegisterLogin[Register / Login after register] -.->|"register writes"| U
  CreateCase --> C
  CreateCase --> A
  AssignCase --> C
  AssignCase --> A
  StatusPatch --> C
  StatusPatch --> A
  UploadDoc --> D
  UploadDoc --> A
  CommentPost --> CO

  CreateCase(Create case)
  AssignCase(Assign / reassign)
  StatusPatch(Status transition)
  UploadDoc(Document upload)
  CommentPost(New comment)
```

---

## 13. Error path (consistent failure envelope)

All controller paths use **`asyncHandler`**. Throws of **`ApiError`** map through **`errorHandler`** to JSON + HTTP status. Validation failures from Zod are normalized before responding.

```mermaid
flowchart TD
  T[Thrown Error]
  T --> APIE{ instanceof ApiError? }
  APIE -->|yes| MAP[status + message → JSON]
  APIE -->|no| FALL[generic 500 in production pattern]
  MAP --> CLIENT[SPA / Toast / UI]
```

---

## 14. Reading order for “whole project + requirements”

1. **[01](./01-product-requirements-and-scope.md)** — what the take-home asks for vs what shipped.  
2. **[02](./02-system-architecture.md)** — where components live at deploy time.  
3. **This document (07)** — **how** calls flow through code and MongoDB for each story.  
4. **[04](./04-data-model-and-domain.md)** — field-level model and invariant reference.  
5. **[05](./05-api-and-integration.md)** — endpoint checklist for SPA and Swagger parity.  
6. **[06](./06-security-nfr-and-operations.md)** — threats, ops, secrets handling.

Keep **07** updated when routes, middleware order, or side-effect sequencing (audit before/after save) materially changes—those are the details interviewers probe.
