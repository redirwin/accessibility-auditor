# SQLite Database Foundation Implementation Plan

Source PRD: `02-PRDs/database-prd.md`

## 1) Scope Lock and Baseline Validation

- [x] Confirm this phase only delivers DB foundation and readiness (no history UI/API delivery).
- [x] Confirm non-goals remain excluded (no ORM, no migrations framework, no persistence wiring for audits yet).
- [x] Confirm current app remains functionally equivalent for existing `/api/audit` behavior.
- [x] Confirm runtime target is Node only (no Edge runtime adoption).
- [x] Confirm single-process, single-connection design assumptions are accepted.

Section 1 decisions and baseline:

- This implementation pass is locked to SQLite foundation work only; History API/UI is explicitly deferred.
- Non-goals are confirmed: no ORM, no migrations framework, and no audit persistence wiring in `/api/audit` during this phase.
- Existing `/api/audit` behavior and response contracts must remain unchanged while DB infrastructure is introduced.
- Runtime target is locked to Node paths only; no Edge runtime usage for DB interactions.
- Connection model is locked to single-process, single shared connection semantics for local demo reliability.

## 2) Dependency Setup

- [x] Add runtime dependency: `better-sqlite3`.
- [x] Add dev dependencies: `@types/better-sqlite3` and `tsx`.
- [x] Verify install succeeds cleanly on local Node runtime.
- [x] Ensure no additional DB abstraction/ORM packages are introduced.
- [x] Validate lockfile updates are minimal and deterministic.

Section 2 implementation notes:

- Added `better-sqlite3` to runtime dependencies in `package.json`.
- Added `@types/better-sqlite3` and `tsx` to dev dependencies in `package.json`.
- Ran `npm install` successfully to update and validate dependency resolution.
- Confirmed no ORM or additional DB abstraction packages were introduced.
- Updated lockfile via install (`package-lock.json`) as part of deterministic dependency state.

## 3) Repository Hygiene and Ignore Rules

- [x] Update `.gitignore` to include `data/`.
- [x] Update `.gitignore` to include `*.db`.
- [x] Verify database artifacts are ignored in git status.
- [x] Confirm no existing tracked DB files are present.
- [x] Document ignore intent in PR notes if needed.

Section 3 implementation notes:

- Added `data/` and `*.db` entries to `.gitignore`.
- Verified repository status does not show tracked SQLite artifacts after updates.
- Confirmed no existing tracked `.db` files are present in current git status output.
- Ignore intent is captured by explicit `.gitignore` entries for DB files and data directory.

## 4) Directory and File Scaffolding

- [x] Create `src/db/` directory.
- [x] Create `src/db/schema.ts` for table/index SQL definitions.
- [x] Create `src/db/index.ts` for connection + initialization + public API.
- [x] Create `scripts/db-init.ts` one-time initializer script.
- [x] Create `data/` directory at runtime when absent (not committed).

Section 4 implementation notes:

- Added DB scaffolding files:
  - `src/db/schema.ts`
  - `src/db/index.ts`
  - `scripts/db-init.ts`
- Added initial schema SQL constants in `src/db/schema.ts` for `audits` table and required indexes.
- Added DB path resolution and directory bootstrap seam in `src/db/index.ts`.
- Added init script seam in `scripts/db-init.ts` to execute initial schema/index setup.
- Runtime directory creation is wired via `ensureDbDirectory(...)` invoked during `getDb()` initialization.

## 5) Database Path and Configuration Contract

- [x] Implement default DB path: `./data/audits.db`.
- [x] Implement optional path override via `AUDITS_DB_PATH`.
- [x] Ensure override fallback behavior is deterministic when env var missing/empty.
- [x] Ensure parent directory creation works for default and override paths.
- [x] Validate behavior on fresh clone and first run.

Section 5 implementation notes:

- `resolveDbPath()` now uses `AUDITS_DB_PATH` only when present and non-empty; otherwise it deterministically falls back to `./data/audits.db`.
- `ensureDbDirectory(...)` creates parent directories for whichever path is active (default or override).
- Fresh-run behavior validated by executing `npx tsx scripts/db-init.ts`, which created `data/audits.db` on first run.

## 6) Schema Definition in `src/db/schema.ts`

- [x] Define `audits` table SQL exactly as specified in PRD.
- [x] Define index SQL for `url_normalized`.
- [x] Define index SQL for `created_at DESC`.
- [x] Define `PRAGMA user_version = 1` initialization SQL.
- [x] Export schema statements for shared use by runtime and init script.

Section 6 implementation notes:

- Schema constants for table and indexes remain centralized in `src/db/schema.ts`.
- Added `DB_USER_VERSION = 1` and exported `READ_USER_VERSION_SQL` for shared runtime/init usage.
- Runtime/init paths both consume shared schema exports to reduce drift risk.

## 7) Shared URL Normalization Helper

- [x] Introduce a single shared normalization helper for DB-bound normalized URLs.
- [x] Ensure helper trims whitespace and lowercases hostname.
- [x] Ensure helper preserves path and query.
- [x] Ensure helper removes trailing slash only when path is `/`.
- [x] Add explicit examples/tests to prevent drift between API normalization and DB normalization.

Section 7 implementation notes:

- Added `normalizeUrlForStorage(parsedUrl: URL)` in `src/audit/url-normalization.ts`.
- Updated `parseAndNormalizeUrl(...)` to delegate normalization to the shared helper.
- Added tests in `src/audit/url-normalization.test.ts` and expanded `src/audit/validate-url.test.ts` to lock base-path slash removal behavior.

## 8) Connection Layer in `src/db/index.ts`

- [x] Implement singleton `getDb()` accessor with one shared connection instance.
- [x] Configure WAL mode on connection initialization (`PRAGMA journal_mode = WAL`).
- [x] Ensure directory and DB file are created automatically when missing.
- [x] Provide clear, minimal exported surface for later history integration.
- [x] Ensure connection lifecycle is stable across repeated imports/calls.

Section 8 implementation notes:

- `getDb()` remains a singleton accessor backed by `dbInstance`.
- Added runtime init hook that sets `journal_mode = WAL` on first connection setup.
- `resolveDbPath()` + `ensureDbDirectory(...)` continue to guarantee file-system readiness before opening DB.
- Exported surface remains intentionally small: path resolution, directory ensure, and shared DB accessor.

## 9) Runtime Initialization Safety (Critical)

- [x] Run guarded table creation in runtime initialization path.
- [x] Run guarded index creation in runtime initialization path.
- [x] Run guarded `user_version` initialization in runtime initialization path.
- [x] Ensure runtime initialization executes on first DB access (even if script not run).
- [x] Ensure initialization failures do not crash active audit flow paths.

Section 9 implementation notes:

- Added `ensureRuntimeDbInitialization(...)` called from `getDb()` on first DB access.
- Runtime path now executes guarded `CREATE TABLE IF NOT EXISTS`, guarded index creation, and guarded `user_version` update.
- Initialization failures are caught and logged with `console.error` + `db_init` context instead of throwing from init logic.
- Added `runtimeSchemaInitialized` guard so successful initialization is performed once per process.

## 10) Optional Seam for Future Persistence

- [x] Add placeholder `insertAuditSummary()` helper (stub or minimal implementation).
- [x] Define helper input shape aligned to current `AuditResponse` summary/meta fields.
- [x] Keep helper optional and unused by `/api/audit` in this phase.
- [x] Ensure helper failures can be surfaced via return/error contract without user-facing impact.
- [x] Keep implementation small and clearly extensible for History phase.

Section 10 implementation notes:

- Added `insertAuditSummary(...)` in `src/db/index.ts` as an optional persistence seam for a later history phase.
- Added `InsertAuditSummaryInput` shape aligned to current `AuditResponse["summary"]` and `AuditResponse["meta"]` fields plus URL and timestamp fields required by schema.
- Added `InsertAuditSummaryResult` union contract (`{ ok: true; rowId } | { ok: false; error }`) so failures are returned without throwing user-facing flow errors.
- Added `INSERT_AUDIT_SUMMARY_SQL` constant in `src/db/schema.ts` to keep statement definitions centralized.
- Left `/api/audit` behavior unchanged in this phase (helper is present but not yet wired into request flow).

## 11) Init Script (`scripts/db-init.ts`)

- [x] Implement script to ensure DB directory exists.
- [x] Open database using the same path/config contract as runtime layer.
- [x] Execute table creation statements.
- [x] Execute index creation statements.
- [x] Set/verify `PRAGMA user_version = 1`.
- [x] Print deterministic success/failure output.

Section 11 implementation notes:

- Updated `scripts/db-init.ts` to explicitly call `ensureDbDirectory(resolveDbPath())` before DB access.
- Script uses runtime path contract via shared DB layer (`resolveDbPath()` + `getDb()`).
- Script executes guarded table/index setup and sets `user_version` using shared schema constant.
- Added explicit `user_version` verification after set and throws on mismatch.
- Added deterministic logging:
  - Success: `[db_init] Success path=<...> user_version=1`
  - Failure: `[db_init] Failed` with operation, path, and message payload.

## 12) Package Script Wiring

- [x] Add `db:init` script to `package.json` using `tsx`.
- [x] Verify `npm run db:init` works on a fresh clone with no pre-existing `data/`.
- [x] Verify rerunning `npm run db:init` is idempotent.
- [x] Verify non-zero exit behavior for hard script failures.
- [x] Document script usage in implementation notes.

Section 12 implementation notes:

- Added `db:init` package script in `package.json`: `tsx scripts/db-init.ts`.
- Verified normal run: `npm run db:init` exits `0` with deterministic success output.
- Verified fresh-path bootstrap + idempotency by setting `AUDITS_DB_PATH` to a new path, running `npm run db:init` twice, and confirming both exits were `0`.
- Verified hard-failure non-zero behavior by setting `AUDITS_DB_PATH` to an invalid parent (`.../package.json/audits.db`), which produced deterministic failure output and exit code `1`.
- Script usage for this phase: run `npm run db:init` after clone/setup to precreate DB artifacts; runtime safeguards remain in place if script is skipped.

## 13) Error Handling and Logging Policy

- [x] Add consistent `console.error` logging for DB init failures.
- [x] Add consistent `console.error` logging for DB insert/query helper failures.
- [x] Include operation context in logs (`db_init`, `db_insert`, `db_query`).
- [x] Ensure DB errors do not leak as user-facing API errors in existing audit flow.
- [x] Confirm fallback behavior preserves normal audit responses.

Section 13 implementation notes:

- Runtime DB initialization failures in `src/db/index.ts` are logged with `console.error("[db_init] ...", { operation: "db_init", ... })`.
- Init-script failures in `scripts/db-init.ts` are logged with deterministic `console.error("[db_init] Failed", { operation: "db_init", path, message })` output.
- Added DB helper query seam `listAuditSummariesByUrl(...)` and ensured both insert/query helper failures log with operation context:
  - `db_insert` in `insertAuditSummary(...)`
  - `db_query` in `listAuditSummariesByUrl(...)`
- Existing `/api/audit` flow remains DB-unaware in this phase, so DB errors cannot leak as user-facing API failures.
- Regression tests confirm normal audit behavior remains intact while DB foundation code exists in parallel.

## 14) Runtime Constraints and Compatibility Checks

- [x] Confirm DB code is only used in Node runtime paths.
- [x] Ensure no Edge runtime configuration conflicts are introduced.
- [x] Verify no worker-thread or pooling model is added.
- [x] Validate compatibility with current Next.js app routing setup.
- [x] Confirm existing tests/build still run after foundation scaffolding.

Section 14 implementation notes:

- DB access remains isolated to server/runtime files in `src/db/*` and `scripts/db-init.ts`; no client-side imports were introduced.
- Explicitly pinned API route runtime with `export const runtime = "nodejs"` in `app/api/audit/route.ts` to avoid Edge runtime conflicts.
- Connection design remains single-process and singleton-based (`getDb()`), with no pooling or worker-thread model added.
- Fixed Next.js build compatibility for `/` by wrapping `useSearchParams` usage in a `Suspense` boundary in `app/page.tsx`.
- Verified compatibility by running:
  - `npm run build` (success)
  - `npm test` (all tests passing)

## 15) Performance and Reliability Validation

- [x] Measure first DB open against target (< 50ms typical on local machine).
- [x] Validate init script execution speed and repeatability.
- [x] Validate runtime initialization safety when script is skipped.
- [x] Validate fresh-clone bootstrap behavior end-to-end.
- [x] Validate DB file creation and continued app stability across repeated runs.

Section 15 implementation notes:

- Added a first-open performance assertion in `src/db/index.test.ts` (`opens the database within local performance target`) with `< 50ms` threshold.
- Revalidated init script speed/repeatability by running `npm run db:init` multiple times (deterministic success output and stable behavior).
- Runtime safety without init script is validated in `src/db/index.test.ts` by creating a fresh DB path and asserting table/index/version presence on first `getDb()` call.
- Fresh-bootstrap behavior validated with new test DB paths and env overrides in unit tests plus CLI-level `db:init` execution.
- Repeated runs continue to succeed with stable DB artifact creation and no regressions in app/test behavior.

## 16) Testing Plan

- [x] Add unit tests for normalization helper behavior (including base-path slash removal).
- [x] Add unit tests for DB path resolution (default + override).
- [x] Add tests for schema/init idempotency.
- [x] Add tests for `getDb()` singleton behavior.
- [x] Add tests for runtime fallback init path when script is not run.
- [x] Add tests for graceful error handling/logging behavior where practical.

Section 16 implementation notes:

- Normalization coverage is in:
  - `src/audit/url-normalization.test.ts`
  - `src/audit/validate-url.test.ts`
- Added `src/db/index.test.ts` with focused DB foundation coverage:
  - default/override path resolution
  - singleton `getDb()` behavior
  - runtime schema/index/version bootstrap on first access
  - schema/idempotent statement re-run behavior
  - insert/query helper success path
  - graceful error + logging behavior for insert/query failures
- Full test suite is currently green via `npm test`.

## 17) Acceptance and Demo Readiness Checklist

- [x] `better-sqlite3` installed and usable.
- [x] `data/audits.db` created automatically on setup/use.
- [x] `audits` table exists with required columns.
- [x] Required indexes exist.
- [x] `PRAGMA user_version = 1` is set.
- [x] `npm run db:init` works on fresh clone and is idempotent.
- [x] Runtime safely ensures schema/index/version if script is skipped.
- [x] `.gitignore` blocks DB artifacts from commits.
- [x] Existing audit flow has no functional regressions.
- [x] DB failures do not break auditing UX or API responses.

Section 17 acceptance notes:

- Dependency/install status is validated and exercised via runtime/test/build commands.
- DB creation + schema/index/version checks are validated via runtime init path and DB test coverage.
- Init script behavior (fresh run, repeat run, non-zero hard failure) has been verified and documented.
- Ignore rules are in place for DB artifacts (`data/`, `*.db`).
- Regression checks pass (`npm test`) and production build passes (`npm run build`).
- Current phase still preserves existing audit UX/API flow with DB foundation isolated for future history wiring.
