## SQLite Database Foundation PRD

**Product:** Accessibility Auditor
**Scope:** SQLite Database Foundation (post-MVP infrastructure)
**Status:** Complete
**Purpose:** Fully prepare a reliable SQLite persistence layer so the upcoming Audit History feature can be implemented live without schema or infrastructure work.

---

# 1. Executive Summary

The application currently has a fully functional accessibility auditor and actionable findings engine but **no persistence layer**.

This PRD defines the work required to:

* Introduce SQLite safely
* Create and validate the database schema
* Provide a stable DB access layer
* Ensure runtime safety and demo reliability

After this phase, the system must be **history-ready**, meaning the Audit History feature can plug in with minimal code changes and zero schema work during the demo.

---

# 2. Goals

## 2.1 Primary Goals

* Install and configure SQLite via `better-sqlite3`
* Create deterministic database initialization
* Ensure DB file is created automatically
* Pre-create required tables and indexes
* Provide a shared DB access module
* Guarantee DB failures never break auditing
* Maintain full compatibility with current MVP behavior

## 2.2 Secondary Goals

* Keep implementation minimal and explainable
* Optimize for local demo reliability
* Prepare clean extension points for history feature

---

# 3. Non-Goals

This phase will NOT:

* Build the History UI
* Expose `/api/history`
* Persist audits yet (optional helper only)
* Add ORMs (Prisma, etc.)
* Introduce migrations framework
* Support serverless persistence
* Add multi-user concerns

---

# 4. Environment Assumptions

These are **locked constraints** for this phase:

* Demo environment: local Node runtime
* Runtime: Node (NOT Edge)
* SQLite driver: `better-sqlite3`
* Single process access
* Single shared DB connection
* No external database services

---

# 5. Dependencies

## Required Packages

Install:

```bash
npm install better-sqlite3
npm install -D @types/better-sqlite3
npm install -D tsx
```

No additional DB libraries are permitted in this phase.

---

# 6. File and Directory Structure

The following structure must be created:

```
data/                     # gitignored
src/db/
  index.ts                # connection + public helpers
  schema.ts               # SQL definitions
scripts/
  db-init.ts              # one-time initializer
```

---

## 6.1 Git Ignore Requirements

`.gitignore` MUST include:

```
data/
*.db
```

The SQLite file must never be committed.

---

# 7. Database Location

## Path

```
./data/audits.db
```

Optional override:

```
AUDITS_DB_PATH=<custom path>
```

## Requirements

The system must:

* Create `data/` if missing
* Create the DB file automatically
* Work on fresh clones
* Default to `./data/audits.db` when no override is provided

---

# 8. Database Schema

This phase intentionally keeps schema minimal but production-shaped.

---

## 8.1 audits Table (Required)

### Purpose

Stores one row per completed audit.

---

### SQL Definition

```sql
CREATE TABLE IF NOT EXISTS audits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  url_original TEXT NOT NULL,
  url_normalized TEXT NOT NULL,
  created_at TEXT NOT NULL,
  score INTEGER NOT NULL,
  passes INTEGER NOT NULL,
  warnings INTEGER NOT NULL,
  fails INTEGER NOT NULL,
  fetch_time_ms INTEGER NOT NULL,
  html_bytes INTEGER NOT NULL
);
```

---

## 8.2 Required Indexes

```sql
CREATE INDEX IF NOT EXISTS idx_audits_url_norm
ON audits(url_normalized);

CREATE INDEX IF NOT EXISTS idx_audits_created_at
ON audits(created_at DESC);
```

Indexes must be created during initialization.

---

## 8.3 Schema Version

Use SQLite built-in versioning:

```
PRAGMA user_version
```

Initial value:

```
user_version = 1
```

Do NOT introduce a migrations system in this phase.

---

# 9. URL Normalization Contract

The DB layer must support storing both original and normalized URLs.

## Normalization Rules (future enforcement)

When used, normalization must:

1. Trim whitespace
2. Lowercase hostname
3. Preserve path and query
4. Remove trailing slash only when path is `/`

Example:

```
Original:  HTTPS://Example.com/
Normalized: https://example.com
```

Normalization is required in this phase and must use a single shared helper so API and DB writes cannot drift.

---

# 10. Database Access Layer

## 10.1 Connection Requirements

`src/db/index.ts` must:

* Create data directory if missing
* Open database at configured path
* Use a **single shared connection**
* Enable WAL mode

Required pragma:

```sql
PRAGMA journal_mode = WAL;
```

---

## 10.2 Initialization Safety (Critical)

The runtime must be safe even if the developer forgets to run the init script.

### Requirements

Runtime code must execute:

* `CREATE TABLE IF NOT EXISTS`
* index creation guards
* `PRAGMA user_version` initialization guard

This safety logic must run on first DB access (for example inside `getDb()` initialization).

The application must never crash due to missing tables/indexes/version metadata.

---

## 10.3 Public DB Surface (Required)

The DB module must export at minimum:

* `getDb()` or equivalent singleton accessor

Optional but recommended (no-op allowed initially):

* `insertAuditSummary()` helper (may be stubbed)

The goal is to create a clean seam for the upcoming feature.

---

# 11. Initialization Script

## 11.1 Location

```
scripts/db-init.ts
```

---

## 11.2 Responsibilities

When executed, the script must:

* Ensure `data/` exists
* Open database
* Create tables
* Create indexes
* Set `PRAGMA user_version = 1`
* Log success message

---

## 11.3 Package Script

Add to `package.json`:

```json
{
  "scripts": {
    "db:init": "tsx scripts/db-init.ts"
  }
}
```

Use the repo’s standard runner if different.

---

# 12. Retention Policy (Prepared Only)

Target maximum audits stored:

```
500 rows
```

This phase only prepares for retention.

Actual pruning logic will be implemented with the History feature.

---

# 13. Error Handling Policy (Critical)

Database failures must NEVER break the audit experience.

If DB operations fail:

* Log server-side
* Continue normal API response
* Do not throw user-facing errors

Logging policy for this phase:

* Use consistent `console.error(...)` logging in DB integration points
* Include operation context (e.g., `db_init`, `db_insert`, `db_query`) and error message

This is required for demo safety.

---

# 14. Runtime Constraints

## 14.1 Node Runtime Only

The API must remain on Node runtime.

Do NOT:

* opt into Edge runtime
* attempt SQLite in Edge

---

## 14.2 Connection Model

* Single process
* Single shared connection
* No pooling
* No worker threads

---

# 15. Performance Targets

* DB open: < 50ms typical
* Future insert: < 10ms typical
* Future history query: < 200ms

---

# 16. Acceptance Criteria

This phase is complete when:

1. `better-sqlite3` installed
2. `data/audits.db` created automatically
3. `audits` table exists
4. Indexes exist
5. `PRAGMA user_version = 1`
6. `npm run db:init` works on fresh clone
7. Runtime safely ensures tables, indexes, and `user_version` if script is skipped
8. `.gitignore` protects DB file
9. App runs with zero regression
10. DB failures do not break auditing

---

# 17. Demo Readiness Criteria

The database layer is demo-ready when:

* Fresh clone setup works reliably
* DB file appears automatically
* No runtime crashes occur
* Initialization is deterministic
* The system is ready for plug-in history work

---

# 18. Next Phase (Planned)

After this PRD is implemented, the next step is:

**Audit History Feature PRD**

Which will add:

* Persist audit results
* `/api/history`
* History page UI
* URL grouping
* Re-run workflow

---

**End of SQLite Database Foundation PRD**
