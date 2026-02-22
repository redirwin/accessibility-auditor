---
name: execute-plan
description: Execute an existing implementation plan with strict sequencing, supporting single-section and batched-section execution. Use when the user says "execute plan", references an implementation plan file, or asks to proceed through specific sections/ranges.
---

# Execute Plan

## Purpose

Implement work from an existing implementation plan in controlled increments, updating the plan as progress is completed.

## When To Use

Use this skill when:

- The user says `execute plan`
- The user asks to proceed through sections of an implementation plan
- The prompt includes a plan file and asks for implementation execution

## Required Inputs

Before implementation:

1. Confirm the plan file path.
2. Confirm target section(s) to execute.
3. Confirm execution mode:
   - Single section
   - Batch (explicit list/range such as "2,3,4" or "5 through 9")
4. Confirm whether to stop after each section (default: yes for single, no for explicit batch unless user says otherwise).

If section scope is ambiguous, ask a focused clarification and pause.

## Execution Rules (Strict)

For each requested section:

1. Read the plan section tasks fully.
2. Implement only tasks in that section.
3. Keep edits minimal and scoped to current section.
4. Run relevant validation checks for changed files.
5. Update the plan:
   - Mark completed tasks `[x]`
   - Add concise section implementation notes
6. Reporting cadence:
   - Single-section mode: report and stop for confirmation after each section.
   - Batch mode: continue through requested sections, reporting completion and validation for each section, then stop at batch end for confirmation.

Do not:

- Jump ahead to unrequested sections
- Modify unrelated files
- Batch unrelated refactors
- Mark tasks complete without implementation evidence

## Section Completion Contract

A section is complete only when all are true:

- Section tasks are implemented
- Plan checklist reflects completion accurately
- Validation was executed and results reported
- Any unresolved issues are explicitly called out

## Validation Guidance

Run targeted checks after edits:

- Unit/integration tests related to changed files
- Lint checks for modified files
- Build check when section impacts runtime integration or routing

Prefer targeted verification first; run broader checks when risk is higher.

## Reporting Format

After each section, report:

1. What changed (files + intent)
2. Validation run and results
3. Plan updates made
4. Open risks/blockers (if any)
5. Continuation prompt:
   - Single-section mode: ask whether to proceed to next section.
   - Batch mode: if sections remain in the requested batch, continue; otherwise ask whether to proceed beyond the batch.

## Safety and Scope Guardrails

- Preserve existing behavior unless section explicitly changes it.
- If unexpected repo changes are detected, pause and ask user how to proceed.
- Never commit unless user explicitly requests a commit.
- Follow repo conventions and existing architecture patterns over introducing new abstractions.
