## Audit History Feature PRD

**Product:** Accessibility Auditor
**Phase:** Post-MVP Feature
**Owner:** David
**Status:** Planned
**Purpose:** Add persistent audit history backed by SQLite, with a developer-friendly history UI and seamless re-run workflow.

---

# 1. Executive Summary

The application currently provides:

* Fully functional accessibility auditor
* Deterministic rule engine
* Actionable findings
* SQLite database foundation (pre-created)

This feature adds **audit persistence and a History experience** so users can:

* View past audits
* See trends per URL
* Quickly re-run known URLs

The implementation must plug cleanly into the existing database layer with minimal risk during the live demo.

---

# 2. Goals

## 2.1 Primary Goals

* Persist each successful audit to SQLite
* Expose history via API
* Provide History page grouped by URL
* Enable one-click re-run workflow
* Maintain fast local performance
* Preserve deterministic behavior

## 2.2 Secondary Goals

* Improve perceived product maturity
* Keep implementation explainable for AI demo
* Avoid over-engineering

---

# 3. Non-Goals

This feature will NOT include:

* User accounts
* Multi-tenant separation
* Cloud database
* Diffing between runs
* Charts or analytics dashboards
* Background jobs
* Soft deletes or retention policies beyond simple cap

---

# 4. Dependencies & Assumptions

This PRD assumes the **SQLite Foundation PRD is already complete**, including:

* `better-sqlite3` installed
* Database file present
* `audits` table created
* Indexes created
* Shared DB connection available
* `PRAGMA user_version = 1`
* Shared URL normalization helper in place for consistent `url_normalized` values
* Runtime-safe DB initialization on first DB access if init script is skipped
* Node runtime usage for DB-backed route handlers (`runtime = "nodejs"`)

The History feature must not perform schema creation during normal runtime beyond existing safety guards.
Edge runtime is out of scope for History DB paths.

---

# 5. User Experience

## 5.1 Entry Points

New route:

```
/history
```

Primary navigation may include a simple link or button from the main page.

---

## 5.2 History Page — High-Level Behavior

The History page must:

* Load recent audits
* Group visually by normalized URL
* Highlight the most recent run per URL
* Allow expansion to view prior runs
* Provide a Re-run action
* Provide a friendly empty state

---

# 6. Functional Requirements — Persistence

## FR-H1 Persist Successful Audits

After a successful audit response is produced, the system must insert one row into the `audits` table.

### Requirements

* Must occur only on successful audits
* Must not block the API response noticeably
* Must not throw user-facing errors
* Must log failures server-side

---

## FR-H2 Insert Mapping

The persisted row must map from `AuditResponse`:

| Column         | Source                |
| -------------- | --------------------- |
| url_original   | request URL           |
| url_normalized | normalized URL helper |
| created_at     | current ISO timestamp |
| score          | summary.score         |
| passes         | summary.passes        |
| warnings       | summary.warnings      |
| fails          | summary.fails         |
| fetch_time_ms  | meta.fetchTimeMs      |
| html_bytes     | meta.htmlBytes        |

---

## FR-H3 Retention Enforcement

System target: **maximum 500 rows**.

After each insert, the system should:

* Delete oldest rows beyond limit

Implementation may be simple and synchronous.

---

# 7. Functional Requirements — History API

## 7.1 Endpoint

Implement:

```
GET /api/history
```

---

## 7.2 Response Shape

```ts
type HistoryItem = {
  id: number;
  urlOriginal: string;
  urlNormalized: string;
  createdAt: string;
  score: number;
  passes: number;
  warnings: number;
  fails: number;
};

export type HistoryResponse = {
  items: HistoryItem[];
};
```

---

## 7.3 Ordering

Default ordering:

* `created_at DESC` (newest first)

---

## 7.4 Limit

Default limit: **100 rows** returned.

Must be implemented in SQL query.

---

## 7.5 Error Handling

If history query fails:

* Return success response with empty list payload (`{ items: [] }`)
* Log server-side
* Do not crash the page

---

# 8. Functional Requirements — History Page UI

## 8.1 Data Loading

On page load:

* Fetch `/api/history`
* Show loading state
* Render grouped results

---

## 8.2 Grouping Behavior

UI must group items by `urlNormalized`.

For each group show:

* URL (display original preferred)
* Latest score badge
* Last run timestamp
* Count of runs (optional but recommended)

Grouping occurs client-side for simplicity.

---

## 8.3 Expanded Runs List

When a group is expanded, show each run:

* Timestamp
* Score
* Pass/warn/fail counts
* Re-run button

Optional nice-to-have:

* View JSON link

---

## 8.4 Re-run Workflow (Critical)

Clicking **Re-run** must:

1. Navigate to `/`
2. Prefill the URL input
3. (Optional) auto-trigger audit

Minimum requirement: prefill only.

Prefill contract for this phase:

* Re-run navigates with query param `/?url=<encoded original url>`
* Main page reads the query param and pre-populates the URL input
* Auto-run remains optional and disabled by default
* Query-param handling should follow the same pattern already used by the main page for `simulate`

---

## 8.5 Empty State

If no history exists, display:

> "No audits yet. Run your first audit to see history."

Must match visual quality of main app.

---

# 9. Performance Requirements

* History query < 200ms locally
* Insert < 10ms typical
* Page responsive with 100 rows
* Grouping must be O(n)

---

# 10. Reliability Requirements

* History must not break main audit flow
* DB failures must degrade gracefully
* UI must handle empty data
* Works on fresh database

---

# 11. Security Requirements

The system must NOT store:

* raw HTML
* page content
* cookies
* headers
* user IPs

Only summary metrics may be persisted.

---

# 12. Acceptance Criteria

Feature is complete when:

1. Successful audits are persisted
2. `/api/history` returns recent rows
3. `/history` page renders grouped results
4. Re-run button prefills URL correctly
5. Retention cap enforced
6. No regression to audit flow
7. Performance remains fast
8. Empty state renders correctly
9. Errors degrade gracefully

---

# 13. Demo Readiness Criteria

The feature is demo-ready when:

* Run audit → appears in History immediately
* Multiple runs group correctly
* Re-run flow is smooth
* Page loads quickly
* Implementation can be partially built live via AI agent

---

# 14. Recommended Demo Build Sequence

For maximum presentation impact:

1. Wire existing `insertAuditSummary(...)` seam into successful `/api/audit` flow
2. Add/expand DB query helper seam(s) for History reads (building on the current list-query pattern)
3. Implement `/api/history`
4. Create History page shell
5. Add grouping logic
6. Add Re-run button
7. Polish empty state

This sequence creates visible progress at each step.

---

**End of Audit History Feature PRD**
