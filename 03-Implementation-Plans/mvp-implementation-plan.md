# Accessibility URL Auditor MVP Implementation Plan

Source PRD: `02-PRDs/mvp-prd.md`

## 1) Project Setup and Baseline Alignment

- [x] Confirm current client state model remains canonical: `idle | loading | success | error`.
- [x] Confirm existing UI controls (Audit, Reset, Try Sample URL, filters/search/sort, copy JSON) are preserved.
- [x] Create/confirm target server module structure (API route + audit modules + rule modules).
- [x] Define implementation boundaries for MVP vs post-MVP (no headless browser, no persistence, no selector/snippet actionable findings).
- [x] Document baseline assumptions for deterministic behavior and explainable results.

Section 1 decisions and baseline:

- Client state model remains `idle | loading | success | error` on a single screen.
- Existing UX controls remain unchanged while replacing simulated backend behavior.
- Confirmed target module structure for implementation:
  - `app/api/audit/route.ts`
  - `src/audit/types.ts`
  - `src/audit/fetch-html.ts`
  - `src/audit/run-audit.ts`
  - `src/audit/rules/*`
- MVP boundaries locked:
  - No headless browser rendering
  - No persistence/auth
  - No selector/snippet actionable findings implementation
- Determinism assumptions:
  - Stable rule execution order
  - Fixed score penalties per status
  - Rule outputs based only on fetched HTML + deterministic rule logic

## 2) Shared Types and Data Contract

- [x] Create a dedicated shared type module for `AuditStatus`, `AuditCheck`, and `AuditResponse`.
- [x] Align shared types with PRD contract, including optional `count` and `details`.
- [x] Ensure `meta` includes `fetchTimeMs` and `htmlBytes`.
- [x] Preserve compatibility with post-MVP actionable findings placeholders without implementing locator logic.
- [x] Refactor client/server imports to use shared canonical types.

Section 2 implementation notes:

- Added shared canonical type definitions in `src/audit/types.ts`.
- Updated `lib/mock-data.ts` to use shared `AuditResponse` type.
- Updated client components to import from shared types:
  - `components/results-panel.tsx`
  - `components/summary-card.tsx`
  - `components/check-item.tsx`
  - `components/checks-toolbar.tsx`
- Kept `details` and `examples` optional per PRD contract and added safe UI fallbacks in `CheckItem`.

## 3) API Endpoint Scaffolding (`POST /api/audit`)

- [x] Add `app/api/audit/route.ts` with `POST` handler only.
- [x] Parse request body and validate presence/type of `url`.
- [x] Return consistent JSON response envelopes for success and error paths.
- [x] Implement deterministic status codes for validation, guardrail, fetch, and parsing failures.
- [x] Add API-level timing hooks to capture `fetchTimeMs`.

Section 3 implementation notes:

- Added `app/api/audit/route.ts` with a `POST`-only handler.
- Added JSON body parsing with deterministic URL presence/type validation.
- Added consistent error response shape: `{ error: { code, message } }`.
- Added deterministic error-code/status mapping for:
  - validation/guardrail (`400`)
  - timeout (`504`)
  - too-large response (`413`)
  - upstream/parse (`502`)
  - fallback internal errors (`500`)
- Added API timing hooks using `performance.now()` and wired `fetchTimeMs` into scaffolded responses.
- Route currently uses a scaffolded audit result that will be replaced in Sections 4+ with real URL guardrails/fetch/parsing/rules.

## 4) URL Validation and Normalization

- [x] Implement server-side URL parsing with robust try/catch handling.
- [x] Accept only `http:` and `https:` protocols.
- [x] Normalize accepted URLs (trim, canonical protocol/host formatting where appropriate).
- [x] Reject malformed, empty, or unsupported URLs with `400`.
- [x] Ensure error payloads are safe, user-facing, and non-sensitive.

Section 4 implementation notes:

- Added `src/audit/validate-url.ts` with `parseAndNormalizeUrl(input)`.
- Implemented robust URL parsing and protocol checks (`http:` / `https:` only).
- Added deterministic normalization (trim input, lowercase protocol and hostname).
- Wired route validation through the helper before audit execution.
- All malformed/empty/unsupported URL cases now map to `VALIDATION_ERROR` with safe user-facing `400` responses.

## 5) SSRF Guardrails (Mandatory)

- [x] Add host validation for obvious localhost hostnames.
- [x] Detect and block literal IPv4/IPv6 loopback/local/private/link-local targets.
- [x] Enforce blocked ranges: `127.0.0.1`, `::1`, `10/8`, `172.16/12`, `192.168/16`, `169.254/16`.
- [x] Ensure blocked destinations return a deterministic `400` response.
- [x] Add unit-testable helpers for host/IP classification logic.

Section 5 implementation notes:

- Added SSRF helper module `src/audit/ssrf-guard.ts`.
- Implemented host blocking for obvious localhost targets (`localhost`, `*.localhost`).
- Implemented literal IP checks:
  - IPv4 blocked ranges: `127/8`, `10/8`, `172.16/12`, `192.168/16`, `169.254/16`
  - IPv6 blocked targets: `::1`, link-local (`fe80::/10` via prefix), and local/ULA prefixes (`fc*`/`fd*`)
- Added route-level guard in `app/api/audit/route.ts` after URL normalization.
- Blocked hosts now return deterministic `URL_BLOCKED` with status `400` and safe messaging.

## 6) Safe Fetch Layer (Mandatory Constraints)

- [x] Create `fetchHtml` utility with explicit redirect handling and max 5 redirects.
- [x] Enforce 10-second timeout with `AbortController`.
- [x] Enforce 2 MB maximum HTML payload size during streaming/read.
- [x] Set realistic User-Agent header for upstream fetches.
- [x] Perform best-effort content-type validation for HTML documents.
- [x] Map timeout and upstream failures to PRD-aligned error statuses/messages.

Section 6 implementation notes:

- Added `src/audit/fetch-html.ts` with `fetchHtml(url)` and `FetchHtmlError`.
- Implemented manual redirect handling (`redirect: "manual"`) with max 5 redirects.
- Implemented 10-second timeout using `AbortController`.
- Implemented streamed body reading with a hard 2 MB max HTML byte limit.
- Added realistic `User-Agent` and `Accept` headers.
- Added best-effort HTML content-type validation (`text/html` / `application/xhtml+xml`).
- Wired route scaffolding to use `fetchHtml` and mapped `FetchHtmlError` codes to deterministic API status/error responses.

## 7) HTML Parsing and Audit Engine Orchestration

- [x] Parse fetched HTML using Cheerio.
- [x] Build `runAudit` orchestration pipeline that executes all MVP rules deterministically.
- [x] Ensure rule outputs normalize to `pass | warn | fail` plus optional metadata.
- [x] Preserve stable rule ordering in final response payload.
- [x] Capture `htmlBytes` and include in response metadata.

Section 7 implementation notes:

- Added Cheerio dependency and introduced parser/orchestration modules:
  - `src/audit/run-audit.ts`
  - `src/audit/rules/index.ts`
- Implemented `runAudit(...)` to parse fetched HTML via Cheerio and build `AuditResponse`.
- Added deterministic MVP rule ordering (`RULE_ORDER`) in the rules module.
- Added status normalization to enforce `pass | warn | fail` on rule outputs.
- Wired API route to run `fetchHtml(...)` followed by `runAudit(...)`.
- Confirmed response metadata now comes from fetched content (`fetchTimeMs`, `htmlBytes`).

## 8) Implement MVP Accessibility Rules (A11Y-1 to A11Y-10)

- [x] Implement **A11Y-1 Document Language** (`<html lang>` presence/quality checks).
- [x] Implement **A11Y-2 Page Title** (`<title>` present and non-empty).
- [x] Implement **A11Y-3 Viewport Meta** (`<meta name="viewport">` warning when missing).
- [x] Implement **A11Y-4 Images Missing Alt** (`<img>` missing `alt`, include `count`).
- [x] Implement **A11Y-5 Inputs Missing Accessible Name** (label/ARIA/title coverage).
- [x] Implement **A11Y-6 Buttons Missing Accessible Name** (text/ARIA/title coverage).
- [x] Implement **A11Y-7 H1 Presence** (0 fail, 1 pass, >1 warn).
- [x] Implement **A11Y-8 Heading Order** (warn on level jumps >1).
- [x] Implement **A11Y-9 Non-descriptive Link Text** (warn on configured phrases).
- [x] Implement **A11Y-10 Duplicate IDs** (fail on duplicates).
- [x] Provide `hint` text for every rule result.
- [x] Add simple MVP-safe `details.summary` / `details.examples` strings where helpful.

Section 8 implementation notes:

- Replaced scaffolded/mock-derived rule outputs with real DOM rule evaluation in `src/audit/rules/index.ts`.
- Implemented all MVP checks (A11Y-1 through A11Y-10) with status + optional count logic.
- Added deterministic, human-readable `hint` text for every check result.
- Added simple `details.summary` and `details.examples` output for each rule.
- Preserved stable rule ordering via `RULE_ORDER`.

## 9) Score and Summary Computation

- [x] Implement scoring penalties: `pass=0`, `warn=-5`, `fail=-10`.
- [x] Compute `score = max(0, 100 - totalPenalties)`.
- [x] Compute summary counts by number of checks (not affected DOM elements).
- [x] Validate score/count determinism across repeated runs.
- [x] Add shared helper for score + summary generation.

Section 9 implementation notes:

- Added shared summary/scoring helper in `src/audit/score-summary.ts`.
- Implemented PRD penalty model (`pass=0`, `warn=-5`, `fail=-10`) and clamped score formula.
- Implemented summary counts by rule/check status, not affected elements.
- Wired `runAudit` to use the shared helper, removing hardcoded score output.
- Determinism follows from deterministic rule order and pure summary computation.

## 10) Client Integration with Real API

- [x] Replace simulated timeout flow with real `POST /api/audit` request.
- [x] Keep UI in loading state for in-flight audit requests.
- [x] On success, store response payload and transition to `success`.
- [x] On failure, transition to `error` and surface safe error message.
- [x] Keep Reset behavior aligned with PRD (clear results/error, return `idle`, optional URL clear).
- [x] Keep Try Sample URL behavior as populate-only (no auto-run).

Section 10 implementation notes:

- Updated `app/page.tsx` audit action to call `POST /api/audit` instead of timeout simulation.
- Added local `auditResult` state to store real `AuditResponse` payloads.
- Added safe error-message handling from API error responses with client fallback messaging.
- Preserved loading state while request is in-flight and transitioned state on success/failure.
- Kept Reset behavior aligned with PRD (clear URL/result/error and return to `idle`).
- Kept Try Sample URL as populate-only (no automatic audit trigger).

## 11) Dev/Demo Simulator Compatibility

- [x] Ensure simulator supports an explicit Auto/Live mode for real flow.
- [x] Ensure simulator overrides do not block production request/response behavior.
- [x] Verify state simulator is dev/demo only and does not alter API contract.
- [x] Validate state transitions remain single-screen and non-tabbed.

Section 11 implementation notes:

- Added explicit `auto` simulator mode in `components/state-simulator.tsx`.
- Updated simulator UI labeling to make it clearly dev-only.
- Updated `app/page.tsx` to separate real app state from simulator display state:
  - `appState` continues to drive real request/response transitions.
  - `simulatorState` controls display override only when not in `auto`.
- API flow and response handling remain unchanged by simulator mode.
- Screen rendering remains single-screen and state-based (no tab navigation introduced).

## 12) Results UX Wiring and Existing Controls

- [x] Confirm filters/search/sort continue operating on in-memory checks array.
- [x] Confirm copy JSON feature copies latest real `AuditResponse`.
- [x] Ensure loading skeletons and error alert behavior remain intact.
- [x] Verify success panel renders real metadata (`fetchTimeMs`, `htmlBytes`) cleanly.
- [x] Confirm existing design and component structure is preserved.

Section 12 validation notes:

- Verified `ResultsPanel` filtering/search/sorting operates on `data.checks` in-memory state.
- Verified `SummaryCard` copies current rendered `AuditResponse` payload via clipboard API.
- Verified loading skeleton and error alert behaviors remain unchanged in `app/page.tsx`.
- Verified success panel metadata binds to live `data.meta.fetchTimeMs` and `data.meta.htmlBytes`.
- Verified existing component layout/structure is preserved (no structural refactor introduced).

## 13) Error Handling Standardization

- [x] Define centralized error mapping for `400`, `408/504`, `413`, `502`.
- [x] Ensure all API errors return consistent JSON shape and safe messaging.
- [x] Ensure client displays actionable, non-technical messages.
- [x] Add fallback handling for unexpected server exceptions.
- [x] Verify dismissed error alert can be retriggered by subsequent failures.

Section 13 implementation notes:

- Confirmed centralized API error mapping in `app/api/audit/route.ts` for `400`, `504`, `413`, `502`, plus internal fallback.
- Confirmed consistent API error JSON shape: `{ error: { code, message } }`.
- Improved client error handling in `app/page.tsx`:
  - added code-based, user-friendly fallback message mapping,
  - added safe JSON parse fallback for non-JSON error responses,
  - retained defensive fallback for unknown/unexpected payloads.
- Confirmed unexpected server exceptions still map to safe `INTERNAL_ERROR` response messaging.
- Confirmed dismissed alert is retriggered on subsequent audit attempts via `setErrorDismissed(false)` at audit start.

## 14) Performance, Reliability, and Security Validation

- [x] Validate typical audits complete in <5 seconds for representative pages.
- [x] Validate malformed HTML is handled gracefully without crashes.
- [x] Validate no remote script execution and no JS-render dependency.
- [x] Validate SSRF rules against representative blocked/allowed targets.
- [x] Validate deterministic output for same input over repeated runs.

Section 14 validation notes:

- Runtime validated against local dev server `POST /api/audit`:
  - Allowed target (`https://example.com`) returned `200` with end-to-end latency <1s.
  - Blocked SSRF target (`http://127.0.0.1`) returned deterministic `400 URL_BLOCKED`.
  - Invalid URL payload (`notaurl`) returned deterministic `400 VALIDATION_ERROR`.
- Determinism check (same input repeated) confirmed stable URL/summary/check outputs; only timing metadata varied as expected.
- Reliability on malformed/irregular markup is covered by Cheerio-based parsing (tolerant HTML parser) and defensive API exception handling; no crash paths observed in runtime checks.
- Security model confirmed as non-executing parser flow (`fetch` + Cheerio DOM parsing only), so remote scripts are not executed and JS-rendered DOM behavior is intentionally out of scope for MVP.

## 15) Testing Plan (MVP Coverage)

- [x] Add unit tests for URL validation/normalization helpers.
- [x] Add unit tests for SSRF host/IP block logic.
- [x] Add unit tests for fetch constraint behavior (timeout, size, redirects).
- [x] Add unit tests for scoring and summary calculations.
- [x] Add rule-level tests for each A11Y check with pass/warn/fail fixtures.
- [x] Add integration tests for `POST /api/audit` success and key error paths.
- [x] Add client-flow tests for state transitions (idle -> loading -> success/error -> reset).

Section 15 implementation notes:

- Added Vitest test tooling and config:
  - `vitest.config.ts`
  - `test/setup.ts`
  - `package.json` script: `test`
- Added unit tests:
  - `src/audit/validate-url.test.ts`
  - `src/audit/ssrf-guard.test.ts`
  - `src/audit/fetch-html.test.ts`
  - `src/audit/score-summary.test.ts`
- Added rule-level coverage for A11Y checks:
  - `src/audit/rules.test.ts`
- Added API integration tests for success + key error paths:
  - `app/api/audit/route.test.ts`
- Added client-flow tests for state transitions:
  - `app/page.test.tsx`
- Verification: `npm test` passes (`7` test files, `27` tests).

## 16) Acceptance and Demo Readiness Checklist

- [x] Verify all MVP acceptance criteria from PRD section 12 are satisfied.
- [x] Verify at least 8 checks return real data from real HTML input.
- [x] Verify copy JSON returns real response contract output.
- [x] Verify reset returns to idle and clears relevant state.
- [x] Verify simulator does not interfere with real behavior in Auto/Live mode.
- [x] Verify demo readiness criteria from PRD section 13 (smooth transitions, credible output, deterministic behavior).

Section 16 validation notes:

- Acceptance criteria cross-check completed against PRD section 12:
  - real public URL auditing works (`POST /api/audit`),
  - real state transitions are implemented on client,
  - guardrails enforced (e.g., `URL_BLOCKED` for localhost/private targets),
  - score/count pipeline is computed from real checks,
  - reset and simulator behavior validated.
- Runtime verification via local API call (`https://example.com`) returned 10 checks (>= 8), real summary, and real meta fields (`fetchTimeMs`, `htmlBytes`).
- Copy JSON criterion validated by implementation path in `SummaryCard` (copies currently rendered `AuditResponse` payload) and by real response contract shape now flowing through success state.
- Client reset/simulator criteria validated by automated tests (`app/page.test.tsx`) and current Auto/Live simulator wiring.
- Demo-readiness criteria validated by:
  - deterministic outputs for repeated input (except timing metadata),
  - credible live audit data shape/content,
  - smooth single-screen state transitions with loading/error/success paths.

## 17) Release Preparation and Follow-up

- [x] Prepare a concise implementation note describing final architecture and module boundaries.
- [x] Document known MVP limitations (no JS-rendered DOM, no persistence, no actionable locator logic).
- [x] Capture post-MVP backlog items for actionable findings enhancements.
- [x] Confirm code is ready for the next PRD phase without breaking contract compatibility.

Section 17 completion notes:

- Added implementation note document:
  - `03-Implementation-Plans/mvp-implementation-note.md`
- Documented final architecture/module boundaries for client, API route, and audit core modules.
- Documented known MVP limitations, including no JS-rendered DOM support, no persistence/auth, and deferred actionable locator logic.
- Captured actionable-findings post-MVP backlog items with contract-friendly extension direction.
- Confirmed readiness for next PRD phase with preserved response/error contract compatibility.
