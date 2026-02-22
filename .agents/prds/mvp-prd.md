## MVP PRD

**Product:** Accessibility Auditor
**Scope:** MVP
**Status:** Complete
**Purpose:** Wire the existing UI to a real accessibility audit engine with safe URL fetching and deterministic checks.

---

# 1. Context

The application already has a polished UI built with Vercel v0 that includes:

* URL input with Audit / Reset / Try sample URL
* Visual states for Idle, Loading, Success, and Error
* Summary card layout
* Checks list with filters/search/sort
* Error alert banner
* Loading skeletons
* Dev/demo state simulator control

This PRD focuses on implementing **real MVP functionality** behind the existing UI while preserving the design.

---

# 2. Goals

## 2.1 Primary MVP Goals

1. Enable real audit execution from the existing UI
2. Implement a deterministic, explainable accessibility ruleset
3. Enforce strong SSRF and fetch safety guardrails
4. Drive UI states from real application state
5. Maintain demo reliability and fast performance

## 2.2 Secondary Goals

* Keep architecture simple and explainable
* Maintain compatibility with future actionable findings feature
* Ensure results are copyable via existing UI

## 2.3 Non‑Goals (MVP)

The MVP will NOT include:

* Headless browser rendering
* JavaScript-executed DOM analysis
* Full WCAG or axe-core parity
* Multi-page crawling
* Authentication or persistence
* Visual highlighting of remote elements
* Required implementation of selector/snippet actionable findings

---

# 3. UX Architecture (Important)

## 3.1 Single-Screen State Model

The production experience MUST use a **single screen** whose content changes based on runtime state.

The previously generated tabs represent **design reference states only** and must not be treated as navigation.

### Canonical UI States

```
"idle" | "loading" | "success" | "error"
```

The main page must render conditionally based on this state.

---

## 3.2 Dev/Demo State Simulator

The existing “Simulate: Idle / Loading / Success / Error” control may remain but must be treated as a **dev/demo override only**.

### Requirements

* Real audit flow must work when simulator is in normal/auto mode
* Simulator must not block real behavior
* Production UX is single-screen state driven

**Recommended:** add an `Auto` or `Live` mode that reflects real state.

---

# 4. User Flow

## 4.1 Primary Flow

1. User enters URL
2. User clicks **Audit**
3. UI enters Loading state
4. Client calls `POST /api/audit`
5. Server returns results
6. UI enters Success state and renders data

---

## 4.2 Error Flow

1. Audit fails or server returns error
2. UI enters Error state
3. Error alert is displayed
4. User may dismiss and retry

---

## 4.3 Reset Flow

Reset action:

* Clears results
* Clears error
* Returns UI to Idle
* (Optional) clears URL input

---

# 5. Functional Requirements — Client

## FR-C1 URL Input

* Accepts user URL input
* Audit button disabled when empty
* Client-side validation optional; server is authoritative

---

## FR-C2 Audit Action

On click Audit:

* Set UI state → `loading`
* POST to `/api/audit` with `{ url }`
* On success → store results, state → `success`
* On failure → state → `error` with message

---

## FR-C3 Reset Action

Reset must:

* Clear results
* Clear error
* Return to `idle`
* Optionally clear URL

---

## FR-C4 Try Sample URL

* Populates URL field with sample value
* Does not automatically run audit

---

## FR-C5 Filters / Search / Sort

Existing UI controls must operate against the **in-memory checks array**.

No server involvement required.

---

## FR-C6 Copy JSON

* Copies latest `AuditResponse` to clipboard
* Uses browser clipboard API
* No server changes required

---

# 6. Functional Requirements — Server

## FR-S1 Endpoint

Implement:

```
POST /api/audit
```

Request:

```
{ "url": string }
```

Response:

`AuditResponse`

---

## FR-S2 URL Validation

Server must:

* Ensure URL parses
* Allow only `http:` and `https:`

Invalid → return 400

---

## FR-S3 SSRF Protection (MANDATORY)

Block requests to:

* localhost
* 127.0.0.1
* ::1
* 10.0.0.0/8
* 172.16.0.0/12
* 192.168.0.0/16
* 169.254.0.0/16

Minimum MVP requirement:

* Block literal IPs in these ranges
* Block obvious localhost hostnames

---

## FR-S4 Fetch Constraints (MANDATORY)

The fetch layer must enforce:

* Redirect limit: 5
* Timeout: 10 seconds
* Max HTML size: 2 MB
* Realistic User-Agent
* Best-effort HTML content-type check

---

## FR-S5 Parse and Audit

Server must:

* Parse HTML with Cheerio
* Run MVP rule set
* Compute score
* Return structured response

---

## FR-S6 Error Handling

Return consistent errors:

* 400 → invalid/blocked URL
* 408/504 → timeout
* 413 → response too large (or safe equivalent)
* 502 → upstream fetch failure

Responses must include safe user-facing message.

---

# 7. MVP Accessibility Rule Set

Each rule returns:

* `status: pass | warn | fail`
* optional `count`
* `hint`
* optional `details.summary`
* optional `details.examples` (string only in MVP)

---

## A11Y-1 Document Language

Check `<html lang>`

* Fail if missing
* Warn if empty/invalid (optional)
* Pass otherwise

---

## A11Y-2 Page Title

Check `<title>`

* Fail if missing or empty
* Pass otherwise

---

## A11Y-3 Viewport Meta

Check `<meta name="viewport">`

* Warn if missing
* Pass otherwise

---

## A11Y-4 Images Missing Alt

Find `<img>` without `alt`

* Fail if any
* `count = number missing`

---

## A11Y-5 Inputs Missing Accessible Name

Applies to:

* input
* select
* textarea

Pass if ANY present:

* associated `<label for>`
* wrapped by `<label>`
* aria-label
* aria-labelledby
* title

Fail if any missing.

---

## A11Y-6 Buttons Missing Accessible Name

For each `<button>`:

Fail if:

* no visible text
* AND no aria-label
* AND no aria-labelledby
* AND no title

---

## A11Y-7 H1 Presence

* Fail if 0
* Warn if >1
* Pass if exactly 1

---

## A11Y-8 Heading Order

Warn if heading level jumps by >1.

---

## A11Y-9 Non‑descriptive Link Text

Flag anchors whose text equals:

* click here
* read more
* learn more
* more

Status: warn if any.

---

## A11Y-10 Duplicate IDs

Detect duplicate `id` values.

* Fail if any

---

# 8. Scoring Model

Penalties:

* pass → 0
* warn → -5
* fail → -10

```
score = max(0, 100 - totalPenalties)
```

Summary counts represent **number of checks**, not number of elements.

---

# 9. Data Contract

## 9.1 Response Shape

```ts
export type AuditStatus = "pass" | "warn" | "fail";

export type AuditCheck = {
  id: string;
  title: string;
  status: AuditStatus;
  hint: string;
  count?: number;
  details?: {
    summary?: string;
    examples?: string[]; // MVP simple examples only
    // Post‑MVP reserved:
    // examples?: Array<{ selector: string; snippet: string }>;
    // exampleCount?: number;
  };
};

export type AuditResponse = {
  url: string;
  summary: {
    score: number;
    passes: number;
    warnings: number;
    fails: number;
  };
  checks: AuditCheck[];
  meta: {
    fetchTimeMs: number;
    htmlBytes: number;
  };
};
```

---

## 9.2 Post‑MVP Compatibility

Because the UI may already include placeholders for actionable findings:

MVP MAY:

* omit selector/snippet fields
* return empty arrays

But MUST NOT fully implement locator logic yet.

---

# 10. Technical Implementation Plan

## Suggested Modules

* `app/api/audit/route.ts`
* `src/audit/fetchHtml.ts`
* `src/audit/runAudit.ts`
* `src/audit/rules/*`
* `src/audit/types.ts`

Exact structure may vary.

---

## Rule Design Constraints

* Prefer single-pass scans
* Avoid repeated DOM traversal
* Keep functions pure where possible
* Maintain determinism

---

# 11. Non‑Functional Requirements

## Performance

* Typical audit < 5 seconds
* Parsing sub‑second for normal pages

## Reliability

* Graceful handling of malformed HTML
* Stable error messages

## Security

* SSRF protections required
* Never execute remote scripts

---

# 12. Acceptance Criteria

MVP is complete when:

1. User can audit any public http/https URL
2. UI transitions correctly using real state
3. `/api/audit` enforces all guardrails
4. At least 8 checks return real data
5. Score and counts are correct
6. Copy JSON copies real response
7. Reset returns to Idle
8. Dev simulator does not interfere with real flow
9. No actionable findings logic is required yet

---

# 13. Demo Readiness Criteria

The MVP is demo‑ready when:

* State transitions are visibly smooth
* Results populate quickly
* Errors are clean and understandable
* Output looks credible to engineers
* System behaves deterministically across runs

---

**End of MVP PRD**
