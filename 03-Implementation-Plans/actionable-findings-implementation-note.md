# Accessibility Auditor Actionable Findings Implementation Note

## Final Architecture and Module Boundaries

- **Client UI presentation**
  - `components/check-item.tsx` renders fail/warn actionable finding rows with selector + snippet, capped-list context (`Showing X of Y`), and copy actions for selector/snippet.
  - `components/results-panel.tsx` continues to own list filtering/search/sort/ordering without contract changes.
  - `components/summary-card.tsx` preserves aggregate summary UX and global copy JSON behavior.
- **Shared contract**
  - `src/audit/types.ts` now includes structured finding examples (`FindingExample`) and optional `details.exampleCount`.
  - Contract remains additive/optional for findings fields so existing consumers can degrade safely when examples are absent.
- **Rule-layer actionable extraction**
  - `src/audit/rules/index.ts` owns selector generation, snippet trimming, capped example collection, and deterministic mapping from matched DOM nodes to structured findings.
  - Findings are emitted only for `fail`/`warn` checks; `pass` checks remain summary-only.
- **API boundary**
  - `app/api/audit/route.ts` response envelope is unchanged; actionable fields flow through rule output in the existing `AuditResponse` shape.

## Key Implementation Decisions

- Scope is limited to representative findings for failing/warning checks (no pass-state examples).
- Selector generation is best-effort and deterministic:
  - unique `#id` preferred,
  - fallback to `tag.class1.class2` (stable class ordering, max two classes),
  - final fallback to tag.
- Snippets are truncated deterministically with a configured length cap, and example lists are capped per check.
- Full issue totals are preserved via `exampleCount` even when displayed examples are capped.

## UX Outcome

- Check details now surface concrete, copyable problem elements instead of only aggregate issue counts.
- Capped lists communicate scope clearly with `Showing X of Y` when applicable.
- Copy interactions are local to each finding row and do not interfere with global “Copy JSON”.
- URL summary row now behaves consistently with its icon affordance (clickable external link in the summary card).

## Known Limitations

- Selector uniqueness is not guaranteed globally (best-effort by design for MVP extension scope).
- Findings are based on fetched HTML markup; JavaScript-rendered DOM states remain out of scope.
- No visual DOM highlighting, screenshots, WCAG mapping, Axe-core integration, or Shadow DOM handling are included.

## Validation and Quality Status

- Rule, API, and UI tests were extended to cover structured findings, capping, deterministic behavior, and copy affordances.
- Performance validation was added for representative large-markup fixtures, with rule-layer extraction kept within the target budget in test runtime.
- Current suite status at completion: passing end-to-end test suite with no introduced lint errors.
