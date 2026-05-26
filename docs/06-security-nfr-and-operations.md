# Security, non-functional qualities & operations

## Threat model snapshot (proportionate to brief)

Threats intentionally considered:

- **Unauthorized reads/writes** to cases across role boundaries → JWT + enforced filters.
- **Token tampering** → signed JWT verified per request (`authenticate`).
- **Role escalation** (`authorize(UserRole.MANAGER)`) gates privileged routes (`create`, `assign`).
- **Input abuse** → Zod validation caps shapes; mongoose constraints on enums/length.
- **File upload malware surface** reduces via **MIME allowlist** + **`MAX_FILE_SIZE_MB`** ceilings.
- **Header hardening / basic transport hygiene** → `helmet`, JSON body limits, CORS whitelist.

Threats deliberately out of MVP scope unless extended:

- Field-level encryption at rest
- Dedicated WAF tuning
- Full SIEM ingestion (only raw HTTP logs today)

---

## Authentication & passwords

| Mechanism | Implementation |
|-----------|----------------|
| Password storage | bcrypt (pre-save hashing in `User` model) |
| Session model | Stateless JWT bearer tokens |
| Reset | Token + TTL fields on user; **`FRONTEND_URL`** participates in UX deep links |

**Operational note:** Rotate **`JWT_SECRET`** per environment tier; prohibit shared dev/prod secrets.

---

## Authorization matrix (summarized)

| Capability | Manager | Agent |
|------------|---------|-------|
| List all org cases (`assignedTo` filter optional) | ✅ | Implicitly only own |
| Create case | ✅ | ❌ |
| Assign/reassign eligible cases | ✅ | ❌ |
| Change status according to lifecycle | Where rule applies | Agent steps only (`assigned→in_progress→submitted`) |
| Mark cleared/discrepant | ✅ | ❌ |
| Upload document | Listed read | ✅ Own assigned + status window |
| List documents / comments when allowed to view case | ✅ | ✅ Scoped view |
| List agents dropdown | ✅ | ❌ |

**Defense in depth:** route-level `authorize` plus **services** repeat contextual checks (`getByIdForUser`) to resist accidental middleware gaps.

---

## Data protection & secrets

Recommended practices:

| Secret / config | Storage |
|-----------------|---------|
| `MONGODB_URI` | Environment only; `.env.example` illustrates shape without real credentials |
| `JWT_SECRET` | Long random secret; never checked into VCS |

**⚠️ Do not paste production credentials into design docs.** Local `doc.txt`-style placeholders should stay untracked or secret-managed.

---

## Non-functional behaviors

### Performance characteristics

Workload is typical CRUD with modest pagination caps; hotspots:

- Text search scans using regex (`list` filtering) acceptable for demos; Atlas full-text/search indexes would matter at scale.

### Reliability patterns

Express `asyncHandler` ensures rejected promises converge on centralized **`errorHandler`**, preventing silent hangs.

### Consistency guarantees

Mongo single-document atomicity around case updates suffices; auditing written after successful mutate (same request). No multi-document Mongo transactions mandated for take-home SLA.

---

## Observability & runbooks

| Signal | Implementation |
|--------|----------------|
| HTTP access logs | Morgan (`dev` / `combined`) |
| Errors | Structured `ApiError` JSON output + stack traces only when safe in prod |
| Debugging API | Swagger + optional seed users |

Suggested **runbook**:

1. **502/connection**: verify Atlas IP allowlists + URI format (`mongodb+srv`).
2. **401 spikes**: JWT clock skew unlikely; investigate secret mismatch or revoked tokens UX.
3. **Upload failures**: verify disk mount path + MIME type + quota on hosting platform.

---

## Deployment checklist (minimal)

Variables (subset): **`NODE_ENV`**, **`PORT`**, **`MONGODB_URI`**, **`JWT_SECRET`**, **`CORS_ORIGIN`**, **`UPLOAD_DIR`**, **`JWT_EXPIRES_IN`**, optional password-reset timing + **`FRONTEND_URL`**.

1. **`npm ci` / install** dependencies.
2. **`npm run build`** TypeScript compilation.
3. **`npm run seed`** only on fresh dataset or controlled refresh (⚠ destroys prior demo data semantics depending on script).
4. **`npm start`** node process supervised by platform autoscaling baseline = 1.

---

## Regulatory / retention (placeholder)

Operational teams may impose retention on audit logs (`AuditLog.createdAt`-based TTL index) — not implemented unless business demands; document as backlog if auditors require purge policies.
