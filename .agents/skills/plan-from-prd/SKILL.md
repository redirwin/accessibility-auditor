---
name: plan-from-prd
description: Generate a strict implementation plan from a provided PRD. Use when the user asks to create a plan from a PRD, mentions both PRD and implementation plan, or uses the shortcode "plan from prd".
---

# PRD to Plan

## Purpose

Transform an attached PRD into a complete, step-by-step implementation plan with ordered sections and unchecked task boxes.

## When To Use

Use this skill when:

- The user says `plan from prd`
- The user asks to generate/create a plan from a PRD
- The prompt includes both concepts: PRD + implementation plan

## Required Inputs

Before generating the plan:

1. Confirm the PRD path is provided.
2. Confirm the output folder (default: `.agents/plans`).
3. Infer an output filename from the PRD topic unless the user specifies one.

If the PRD is missing, ask for the PRD path and stop.

## Output Rules (Strict)

For a plan-generation request, do only the following:

1. Read the PRD.
2. Create one Markdown implementation plan file in `.agents/plans` (unless overridden).
3. Populate all plan sections with unchecked checklists.

Do not:

- Implement code
- Modify non-plan files
- Mark any checklist items complete in the initial plan

## Filename Convention

Use kebab-case:

`<feature-topic>-implementation-plan.md`

Examples:

- `audit-history-implementation-plan.md`
- `database-implementation-plan.md`

## Plan Template

Use this structure:

```markdown
# <Feature Name> Implementation Plan

Source PRD: `<path-to-prd>`

## 1) Scope Lock and Baseline Validation

- [ ] Confirm in-scope outcomes for this phase.
- [ ] Confirm explicit non-goals.
- [ ] Confirm runtime/platform constraints.
- [ ] Confirm no-regression expectations for existing flows.

## 2) Dependency and Setup Requirements

- [ ] List required dependencies and scripts.
- [ ] Confirm install/setup order.
- [ ] Confirm environment/config requirements.
- [ ] Confirm repository hygiene updates (ignore rules, file layout).

## 3) Data Contracts and Architecture

- [ ] Define data types/interfaces to add or update.
- [ ] Define API request/response contracts.
- [ ] Define persistence/query contracts (if applicable).
- [ ] Define error-handling/logging contracts.

## 4) Implementation Steps

- [ ] Break delivery into ordered, testable sections.
- [ ] Add precise tasks for each section.
- [ ] Keep changes minimal and scoped.
- [ ] Add rollback-safe or guarded sequencing where applicable.

## 5) UX/Workflow Requirements (if applicable)

- [ ] Define state handling (loading/empty/error/success).
- [ ] Define interaction and navigation workflow.
- [ ] Define edge-case behavior and fallback UX.
- [ ] Define accessibility and consistency checks.

## 6) Validation and Testing

- [ ] Add unit tests for new/changed logic.
- [ ] Add integration tests for critical flows.
- [ ] Add regression checks for existing functionality.
- [ ] Define command-level verification steps.

## 7) Acceptance and Demo Readiness

- [ ] Map completion criteria to PRD requirements.
- [ ] Confirm performance/reliability targets.
- [ ] Confirm non-goals were preserved.
- [ ] Confirm demo-readiness checklist is explicit.
```

## Authoring Standards

- Keep tasks atomic and verifiable.
- Use consistent terminology from the PRD.
- Prefer concrete tasks over vague wording.
- Keep section order implementation-realistic.
