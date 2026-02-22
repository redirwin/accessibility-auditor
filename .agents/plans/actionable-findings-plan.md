# Actionable Findings Feature Implmentation Plan

Source PRD: `02-PRDs/actionable-findings-feature-prd.md`

## 1) Scope Lock and Baseline Contract

- [x] Confirm feature scope is limited to fail/warn actionable examples (no pass examples).
- [x] Confirm non-goals remain excluded: DOM path reconstruction, screenshots/highlighting, browser rendering, WCAG mapping, Axe-core, Shadow DOM.
- [x] Confirm existing audit response fields remain backward-compatible where feasible.
- [x] Define default configuration values: `maxExamplesPerCheck = 5`, `maxSnippetLength = 180`.
- [x] Document deterministic behavior expectations for selector/snippet generation.

Section 1 decisions and baseline:

- Actionable examples are in scope only for `fail` and `warn` checks; `pass` checks will not include examples.
- Non-goals from the PRD remain explicitly out of scope for this implementation increment.
- API compatibility baseline is preserved by keeping current check fields and adding optional example fields only (`examples?`, `exampleCount?`).
- Default limits are locked to `maxExamplesPerCheck = 5` and `maxSnippetLength = 180`.
- Determinism baseline is locked:
  - selector priority is fixed (`#id` -> `tag.class1.class2` -> `tag`),
  - class token ordering is stable,
  - rule processing order is unchanged,
  - no randomness in selector/snippet extraction.

## 2) Shared Types and Data Contract Updates

- [x] Add a shared `FindingExample` type with `selector` and `snippet`.
- [x] Update audit check details contract to support `examples?: FindingExample[]`.
- [x] Add `exampleCount?: number` to represent total matches before cap.
- [x] Ensure existing consumers tolerate missing `examples` and `exampleCount` for pass checks.
- [x] Update any mock/fixture response data to match the new shape.

Section 2 implementation notes:

- Added `FindingExample` in `src/audit/types.ts`.
- Updated `AuditCheck.details` to include:
  - `examples?: FindingExample[]` support,
  - `exampleCount?: number`.
- Preserved compatibility during rollout by allowing legacy string examples in the shared type until rule migration is complete.
- Updated `components/check-item.tsx` to safely render both legacy string examples and new structured examples.
- Updated `lib/mock-data.ts` to structured `selector` + `snippet` examples and added `exampleCount` where issue counts are represented.

## 3) Helper Utilities for Actionable Findings

- [x] Create `buildElementSelector(el)` helper with deterministic priority: unique `#id` -> `tag.class1.class2` (max two classes) -> `tag`.
- [x] Create `getTrimmedOuterHtml(el, maxLength)` helper to extract and truncate `outerHTML`.
- [x] Create `collectExamples(elements, maxExamples, maxSnippetLength)` helper to map elements into capped examples.
- [x] Ensure selector helper uses stable class ordering to avoid non-deterministic output.
- [x] Ensure snippet helper consistently adds ellipsis when truncating.

Section 3 implementation notes:

- Added reusable helper utilities in `src/audit/rules/index.ts`:
  - `buildElementSelector($, el)`
  - `getTrimmedOuterHtml($, el, maxLength)`
  - `collectExamples($, elements, maxExamples, maxSnippetLength)`
- Added shared defaults in rule execution layer:
  - `MAX_EXAMPLES_PER_CHECK = 5`
  - `MAX_SNIPPET_LENGTH = 180`
- Implemented selector determinism via fixed priority and sorted class tokens (max two classes).
- Implemented snippet normalization and deterministic ellipsis truncation.

## 4) Rule-Level Integration for Example Collection

- [x] Identify which existing rules currently produce element-level failures/warnings and can emit examples.
- [x] For each applicable fail/warn rule, collect matching elements before status summary creation.
- [x] Set `details.exampleCount` to full match count for each check with findings.
- [x] Set `details.examples` to capped mapped examples (`<= maxExamplesPerCheck`).
- [x] Ensure pass checks do not include actionable examples by default.
- [x] Preserve current rule status/count behavior and avoid changing scoring semantics.

Section 4 implementation notes:

- Wired actionable example extraction into fail/warn checks in `src/audit/rules/index.ts`.
- Applied capped structured examples with total counts on checks that produce findings:
  - `doc-lang`, `page-title`, `viewport-meta`,
  - `img-alt`, `input-label`, `btn-label`,
  - `h1-presence`, `heading-order`,
  - `link-text`, `dup-ids`.
- Added `details.exampleCount` values representing total matched findings while capping returned `details.examples`.
- Removed pass-state examples so pass checks default to summary-only details.
- Kept existing status and count semantics unchanged to avoid score/regression impacts.

## 5) Selector Generation Details and Safety Checks

- [x] Implement unique ID detection logic for `#id` selectors.
- [x] Implement class-based fallback using sanitized class tokens and a maximum of two classes.
- [x] Implement tag-only fallback for elements without suitable ID/class.
- [x] Add deterministic sanitization for malformed/empty selector parts.
- [x] Validate output remains best-effort (not guaranteed globally unique), per PRD.

Section 5 implementation notes:

- Updated `buildElementSelector($, el)` in `src/audit/rules/index.ts` with explicit safety behavior.
- Unique-ID selector logic now verifies uniqueness by attribute comparison across `[id]` nodes before returning `#id`.
- Added deterministic selector-token sanitization for `id` and class tokens.
- Kept class fallback deterministic with sanitized, sorted class tokens and max-two-token limit.
- Added tag-name sanitization and a stable fallback (`element`) for malformed tag names.
- Preserved best-effort selector behavior (not guaranteed globally unique), aligned to PRD.

## 6) Snippet Extraction and Safe Rendering Pipeline

- [x] Ensure raw extraction is based on element `outerHTML` (or best Cheerio equivalent).
- [x] Enforce maximum snippet length via shared config.
- [x] Apply safe escaping strategy before rendering in UI.
- [x] Confirm no path executes extracted markup as HTML.
- [x] Verify malformed HTML input cannot break snippet rendering.

Section 6 implementation notes:

- `getTrimmedOuterHtml($, el, maxLength)` continues to extract from Cheerio HTML serialization (outer HTML equivalent for the target node).
- Snippet length enforcement is centralized via deterministic truncation using shared `MAX_SNIPPET_LENGTH`.
- Added explicit HTML escaping in rule-layer snippet generation before values are returned to the client.
- Output is rendered as text in existing UI code paths, with no HTML injection rendering behavior introduced.
- Added defensive fallbacks for malformed/missing element markup to keep snippet generation stable.

## 7) API Response Wiring and Compatibility

- [x] Update server response composition to include `details.examples` and `details.exampleCount` when present.
- [x] Ensure `count` still reflects rule issue count independent of example cap.
- [x] Keep success/error envelope behavior unchanged.
- [x] Validate response remains deterministic for identical input HTML.
- [x] Add/update response typing imports across API and client boundaries.

Section 7 implementation notes:

- Kept API success/error envelope handling unchanged in `app/api/audit/route.ts`.
- Preserved rule-level `count` semantics while adding independent `details.exampleCount` in rule output.
- Ensured response composition flows through shared `AuditResponse` types from `src/audit/types.ts`.
- Finalized `AuditCheck.details.examples` typing as structured `FindingExample[]`.
- Wired deterministic example generation in the rule layer so identical HTML input yields stable selector/snippet output.

## 8) UI Rendering for Actionable Examples

- [x] Update check expansion UI to render examples section only when examples exist.
- [x] Render selector in monospace style and snippet in code-style formatting.
- [x] Add section header text `Examples`.
- [x] Render truncation indicator text `Showing X of Y` when `exampleCount > examples.length`.
- [x] Ensure empty-state behavior is clean (hide section or show optional fallback text).
- [x] Keep current check list interactions (search/filter/sort/expand) intact.

Section 8 implementation notes:

- Updated `components/check-item.tsx` to render structured example rows only when examples are present.
- Added `Examples` section header in expanded check details.
- Added truncation indicator text (`Showing X of Y`) using `details.exampleCount`.
- Rendered selector and snippet separately in code-styled, monospace blocks.
- Preserved empty-state behavior by not rendering the section when no examples exist.
- Kept existing list/search/filter/sort/expand flow unchanged in `components/results-panel.tsx`.

## 9) Copy Selector/Snippet Functionality (In Scope)

- [x] Add copy action for selector with non-intrusive feedback.
- [x] Add copy action for snippet with non-intrusive feedback.
- [x] Ensure copy functionality does not alter existing global copy JSON control behavior.
- [x] Add keyboard-accessible labels for copy actions.

Section 9 implementation notes:

- Added per-example copy buttons for selector and snippet in `components/check-item.tsx`.
- Added lightweight copied-state feedback with temporary check icon replacement.
- Added explicit accessible labels for copy buttons (`Copy selector...`, `Copy snippet...`).
- Kept existing global `Copy JSON` behavior unchanged in `components/summary-card.tsx`.

## 10) Performance and Reliability Validation

- [x] Benchmark representative audit runs before and after feature integration.
- [x] Confirm typical added overhead remains within ~500ms target.
- [x] Ensure helper logic avoids quadratic DOM work patterns.
- [x] Verify example capping prevents excessive payload growth on large pages.
- [x] Validate repeated runs on the same input yield stable selector/snippet outputs.

Section 10 validation notes:

- Added representative performance validation in `src/audit/rules.test.ts` with a large synthetic HTML fixture.
- Verified rule execution with actionable extraction remains under the target budget in test runtime (`<500ms` threshold assertion).
- Confirmed payload-growth control by enforcing capped `details.examples` and validating cap behavior in tests.
- Confirmed deterministic repeated-output behavior with stable example assertions in `app/api/audit/route.test.ts`.
- Helper strategy remains linear per-rule over selected elements and uses bounded example extraction (`slice` cap), avoiding nested full-document rescans for example mapping.

## 11) Test Plan Implementation

- [x] Add unit tests for `buildElementSelector` priority behavior and determinism.
- [x] Add unit tests for `getTrimmedOuterHtml` truncation/ellipsis behavior.
- [x] Add unit tests for `collectExamples` capping and count integrity.
- [x] Add rule tests verifying fail/warn checks emit `examples` and accurate `exampleCount`.
- [x] Add API integration tests confirming new response shape and cap behavior.
- [x] Add UI/component tests for examples rendering, `Showing X of Y`, and hidden empty states.
- [x] Add UI/component tests covering selector and snippet copy actions.
- [x] Add regression tests to ensure pass checks remain unaffected.

Section 11 implementation notes:

- Expanded `src/audit/rules.test.ts` with helper-level unit tests and structured example assertions.
- Added API integration coverage in `app/api/audit/route.test.ts` for capped examples, `exampleCount`, and stable repeated outputs.
- Added UI coverage in `components/check-item.test.tsx` for:
  - examples rendering,
  - `Showing X of Y` display,
  - hidden examples section when absent,
  - selector/snippet copy interaction feedback.
- Updated `vitest.config.ts` to run component tests in `jsdom`.
- Updated `app/page.test.tsx` with `next/navigation` mocks to keep client-flow regression tests stable.
- Full suite verification: `npm test` passes with `39` tests.

## 12) Acceptance and Demo Readiness Checklist

- [x] Verify failing checks include selector + snippet examples.
- [x] Verify warning checks include selector + snippet examples where applicable.
- [x] Verify `examples.length <= maxExamplesPerCheck` for all checks.
- [x] Verify `exampleCount` matches full issue count even when examples are capped.
- [x] Verify UI makes before/after actionability improvement visually obvious.
- [x] Verify selector and snippet copy actions work reliably in the demo flow.
- [x] Verify no flaky behavior during repeated demo runs.
- [x] Verify all non-goals remain out of scope in delivered implementation.

Section 12 completion notes:

- Confirmed actionable fail/warn checks now include structured selector/snippet examples.
- Confirmed capped-example behavior and total-count integrity via rule + API tests.
- Confirmed UI now presents dedicated actionable evidence with section header and truncation context.
- Confirmed selector/snippet copy actions are implemented and covered by component tests.
- Confirmed repeated-run stability using deterministic output assertions in integration tests.
- Confirmed no non-goal feature scope expansion (no screenshots/highlighting/browser rendering/WCAG mapping/Axe-core/Shadow DOM).
