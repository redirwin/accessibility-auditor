# Accessibility URL Auditor MVP Implementation Note

## Final Architecture and Module Boundaries

- **Client UI orchestration**
  - `app/page.tsx` manages runtime state (`idle/loading/success/error`), simulator mode (`auto` + manual overrides), audit request lifecycle, reset/error handling, and success rendering.
  - `components/*` renders form, results summary, filters/search/sort controls, checks list, and copy JSON UX.
- **API boundary**
  - `app/api/audit/route.ts` is the single MVP server entry point (`POST /api/audit`) with centralized error mapping and safe response envelope.
- **Audit core**
  - `src/audit/validate-url.ts` handles URL parse/normalization.
  - `src/audit/ssrf-guard.ts` applies localhost/private/link-local target blocking.
  - `src/audit/fetch-html.ts` handles safe fetch constraints (redirect limit, timeout, size cap, content-type checks).
  - `src/audit/run-audit.ts` orchestrates parsing + rule execution + summary output assembly.
  - `src/audit/rules/index.ts` implements the 10 deterministic MVP checks in stable order.
  - `src/audit/score-summary.ts` computes score and counts.
  - `src/audit/types.ts` is the shared response/check contract used by client and server.

## Known MVP Limitations

- HTML is analyzed from fetched markup only; JavaScript-rendered DOM states are out of scope.
- No persistence/auth/multi-user storage is implemented.
- Actionable locator/snippet extraction is intentionally not implemented (post-MVP scope).
- Guardrails currently prioritize obvious localhost/private literal targets; deeper DNS resolution rules are not included in MVP.

## Post-MVP Backlog for Actionable Findings

- Add structured examples with selector/snippet payloads for each failing/warning rule.
- Add capped example counts and deterministic truncation policy for large pages.
- Add richer context fields to findings (target attribute, nearest heading/landmark, remediation hint IDs).
- Add optional “expand findings” endpoint/flag to keep base MVP responses lightweight.
- Add UI affordances for structured findings without changing the existing base contract.

## Contract Compatibility Status

The codebase is ready for the next PRD phase. The current `AuditResponse` contract and error envelope are stable and backwards-compatible for adding post-MVP actionable-finding fields as optional extensions.
