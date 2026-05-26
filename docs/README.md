# Mini Case Tracker — Design documentation

Design documentation (HLD + LLD) for the **Mini Case Tracker** MERN application: product scope mapped to implementation, system context, architecture diagrams and flows, data domain, APIs, security, and operations.

These documents complement the runnable setup in **`backend/README.md`** and **`frontend/README.md`** and mirror the codebase under `backend/src` and `frontend/src`.

---

## Document index

| Document | Contents |
|---------|----------|
| [01 — Product requirements & scope](./01-product-requirements-and-scope.md) | Original take-home brief, must-haves / nice-to-haves, traceability to features |
| [02 — System architecture](./02-system-architecture.md) | Context diagram, deployment topology, external dependencies |
| [03 — Backend high-level design](./03-backend-high-level-design.md) | Layered architecture, modules, request flow, cross-cutting concerns |
| [04 — Data model & domain](./04-data-model-and-domain.md) | Entities, relationships, indexes, workflow rules |
| [05 — API & integration](./05-api-and-integration.md) | Resource map, envelopes, versioning, Swagger, client integration notes |
| [06 — Security, NFRs & operations](./06-security-nfr-and-operations.md) | Authentication, authorization matrix, uploads, resilience, observability |
| [07 — Low-level design & Mermaid flows](./07-low-level-design-and-flows.md) | Detailed architecture diagrams, middleware/router chain, sequences (auth, CRUD, status, upload), state machine, frontend→API wiring, persistence map |

---

## Recommended reading path

For **requirements + end-to-end understanding**: **01 → 07 → 04 → 05**. For deployment and security context: **02** and **06**. **07** focuses on LLD diagrams (Mermaid): component flow, request pipeline, sequences, case state machine, and which collections participate in each user story.

---

## Quick reference

| Item | Detail |
|------|--------|
| API base path | `/api/v1` |
| Interactive docs | Swagger UI at `/api-docs` (development / when enabled) |
| Health | `GET /health` |
| Primary store | MongoDB (Mongoose ODM) |
| Auth scheme | Bearer JWT |

---

## Conventions used in these docs

- **Manager / Agent**: two application roles enforced server-side on sensitive routes.
- **Case statuses**: snake_case enums in API payloads (`new`, `assigned`, `in_progress`, `submitted`, `cleared`, `discrepant`).
- **Standard JSON envelope**: `{ success, message, data?, meta?, errors? }` for API responses unless otherwise noted.

Maintain these documents when introducing new bounded contexts, routes, or persistence changes.
