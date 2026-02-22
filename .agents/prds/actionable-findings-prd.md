## Actionable Findings PRD

**Product:** Accessibility Auditor
**Scope:** Actionable Findings (element locators & HTML snippets; post-MVP enhancement)
**Status:** Complete
**Purpose:** Enhance failing or warning accessibility checks with stable element locators and trimmed HTML snippets so developers can locate and fix issues directly.

---

# 1. Overview

## 1.1 Problem Statement

The current MVP audit reports identify accessibility issues only at an aggregate level (e.g., “3 buttons missing accessible names”). While useful, this forces developers to manually search the page to locate the offending elements.

This significantly reduces the tool’s practical value and weakens the developer workflow.

## 1.2 Feature Summary

Enhance each failing or warning accessibility check to include:

* Stable element locator (CSS-like selector)
* Trimmed HTML snippet of the element
* Limited set of representative examples per rule

This transforms the tool from **informational** to **actionable**.

---

# 2. Goals

## Primary Goals

* Make audit findings directly actionable for developers
* Improve clarity of accessibility issues
* Provide concrete element-level evidence
* Maintain fast MVP performance
* Keep implementation simple enough for live AI-agent demo

## Secondary Goals

* Provide copyable selectors
* Improve perceived sophistication of the tool
* Prepare foundation for future DOM highlighting features

---

# 3. Non-Goals

This feature will NOT include:

* Full DOM path reconstruction
* Pixel highlighting or screenshots
* Browser-rendered element inspection
* Infinite example lists
* WCAG mapping
* Axe-core integration
* Shadow DOM support

---

# 4. User Stories

## Primary User

**As a developer**,
I want to see exactly which elements failed an accessibility check,
so that I can quickly locate and fix the issue.

---

## Secondary User

**As a demo audience member**,
I want to see concrete examples of problems,
so that the tool feels credible and useful.

---

# 5. Functional Requirements

## 5.1 Example Extraction

**FR-EL-1**
For any check that produces violations or warnings, the system SHALL collect example elements.

**FR-EL-2**
Each example SHALL include:

* a stable selector
* a trimmed HTML snippet

**FR-EL-3**
Examples SHALL only be collected for:

* fail checks
* warn checks

(pass checks do not need examples)

---

## 5.2 Selector Generation

**FR-EL-4**
The system SHALL generate a best-effort CSS-style selector using this priority:

1. `#id` if present and unique
2. `tag.class1.class2` (up to 2 classes)
3. fallback to tag name

**FR-EL-5**
Selectors MUST be deterministic for the same DOM.

**FR-EL-6**
Selectors do NOT need to be guaranteed unique in MVP (best effort is sufficient).

---

## 5.3 HTML Snippet Extraction

**FR-EL-7**
The system SHALL capture the element’s outer HTML.

**FR-EL-8**
The snippet SHALL be trimmed to a maximum length (configurable).

**Recommended default:** 180 characters

**FR-EL-9**
Snippets SHALL be safely escaped before rendering.

**FR-EL-10**
Very long attributes or children SHOULD be truncated with ellipsis.

Example:

```html
<button class="icon-only"><svg …></svg></button>
```

---

## 5.4 Example Limits

**FR-EL-11**
The system SHALL limit examples per check.

**Default:** max 5 examples per check

**FR-EL-12**
The check result SHALL still report the full issue count even when examples are capped.

Example:

```
Buttons missing accessible name — FAIL (17 issues)

Showing 5 of 17
```

---

## 5.5 API Response Changes

### Current (MVP)

```ts
checks: Array<{
  id: string
  title: string
  status: "pass" | "warn" | "fail"
  count?: number
  hint: string
  details: {
    summary: string
    examples: string[]
  }
}>
```

---

### New Required Shape

```ts
type FindingExample = {
  selector: string
  snippet: string
}

checks: Array<{
  id: string
  title: string
  status: "pass" | "warn" | "fail"
  count?: number
  hint: string
  details: {
    summary: string
    examples?: FindingExample[]
    exampleCount?: number
  }
}>
```

**FR-EL-13**
`exampleCount` SHALL represent the total number of matching elements.

**FR-EL-14**
`examples.length` SHALL be ≤ maxExamples.

---

# 6. UI Requirements

## 6.1 Check Item Expansion

When a check is expanded:

* Show summary text (existing)
* Show examples section when present

---

## 6.2 Example Display

Each example row SHALL show:

* selector (monospace)
* HTML snippet (code-styled)
* optional copy button (nice-to-have, not required for MVP)

---

## 6.3 Example Section Header

Display:

* “Examples”
* If truncated: “Showing X of Y”

---

## 6.4 Empty State

If no examples exist:

* Do not render examples section
* Or show: “No specific elements to display”

---

# 7. Non-Functional Requirements

## Performance

* Example extraction must not add more than ~500ms typical overhead
* Must respect global HTML size limits
* Must avoid quadratic DOM scans

---

## Safety

* Snippets must be HTML-escaped before rendering
* Must not execute any extracted markup
* Must handle malformed HTML safely

---

## Determinism

* Same input HTML → same selectors and snippets
* No randomness

---

# 8. Technical Notes

## Recommended Helper Functions

(Not required but strongly suggested)

* `buildElementSelector(el)`
* `getTrimmedOuterHtml(el, maxLength)`
* `collectExamples(elements, maxExamples)`

---

## Libraries

Continue using:

* Cheerio for DOM parsing
* No browser required

---

# 9. Acceptance Criteria

Feature is complete when:

* Failing checks include example elements
* Each example shows selector + snippet
* Examples are capped correctly
* Counts remain accurate
* UI renders examples cleanly
* No performance regression > ~500ms typical
* Demo flow clearly shows improved actionability

---

# 10. Demo Success Criteria (Important)

The feature is considered demo-ready when:

* Before/after difference is visually obvious
* Audience can immediately see which elements are broken
* Implementation can be reasonably completed via AI agent during presentation
* No flaky behavior during repeated runs