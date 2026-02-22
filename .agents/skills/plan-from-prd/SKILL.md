## name: plan-from-prd
description: Generate a strict plan from a provided PRD. Use when the user asks to create a plan from a PRD, mentions both PRD and plan, or uses the shortcode "plan from prd".

---

# PRD to Plan

## Purpose

Transform an attached PRD into a complete, step-by-step plan with ordered sections and unchecked task boxes.

## When To Use

Use this skill when:

- The user says `plan from prd`
- The user asks to generate/create a plan from a PRD
- The prompt includes both concepts: PRD + plan

## Required Inputs

Before generating the plan:

1. Confirm the PRD path is provided.
2. Confirm the output folder (default: `.agents/plans`).
3. Infer an output filename from the PRD topic unless the user specifies one.

If the PRD is missing, ask for the PRD path and stop.

## Output Rules (Strict)

For a plan-generation request, do only the following:

1. Read the PRD.
2. Create one Markdown plan file in `.agents/plans` (unless overridden).
3. Populate all plan sections with unchecked checklists.

Do not:

- Implement code
- Modify non-plan files
- Mark any checklist items complete in the initial plan

## Filename Convention

Use kebab-case and derive from the PRD filename/topic:

`<feature-topic>-feature-plan.md`

Examples:

- `audit-history-feature-plan.md`
- `database-feature-plan.md`

## Plan Template

Use the template structure defined in [references/plan-template.md](references/plan-template.md).

## Authoring Standards

- Keep tasks atomic and verifiable.
- Use consistent terminology from the PRD.
- Prefer concrete tasks over vague wording.
- Keep section order implementation-realistic.

