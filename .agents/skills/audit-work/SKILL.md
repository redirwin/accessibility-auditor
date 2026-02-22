---
name: audit-work
description: Audit previously completed implementation work or actions against the referenced PRD/plan and current repo state. Use when the user asks to "audit" work already done, validate section completion, or verify correctness/completeness after implementation.
---

# Audit Work

## Purpose

Evaluate implementation work that has already been performed and report whether it is correct, complete, and aligned to the governing PRD/plan.

## When To Use

Use this skill when:

- The user asks to `audit` completed work
- The user asks whether previously completed sections are correct/complete
- The user asks for a post-implementation validation pass

## Required Inputs

Before starting:

1. Identify the audit scope:
   - "Since my last prompt"
   - Specific plan section(s)
   - Specific files or feature area
2. Identify the source-of-truth docs:
   - Relevant PRD in `.agents/prds`
   - Relevant plan in `.agents/plans`
3. Confirm audit mode:
   - Default: analysis/report only (no code changes)
   - If fixes are desired, require explicit user instruction after findings

If scope is ambiguous, ask one focused clarification and pause.

## Audit Method (Strict)

1. **Reconstruct intent**
   - Read the governing PRD/plan requirements and acceptance criteria.
   - Identify non-goals and constraints that must still be respected.
2. **Inspect completed work**
   - Review changed files and behavior relevant to the scope.
   - Verify implementation matches requested section boundaries.
3. **Validate evidence**
   - Check for test/lint/build evidence for changed areas.
   - Confirm checklist updates in plan files are truthful and complete.
4. **Assess risk**
   - Identify regressions, gaps, incomplete tasks, and unsafe assumptions.
   - Distinguish critical defects from lower-severity improvements.
5. **Report findings**
   - Findings first, ordered by severity.
   - Include concrete file references and expected vs actual behavior.

## Output Format

Always return:

1. **Findings (highest priority)**
   - `Critical`, `High`, `Medium`, `Low`
   - For each: issue, impact, evidence, required fix direction
2. **Open Questions / Assumptions**
   - Any ambiguity that blocks a definitive pass/fail conclusion
3. **Pass/Fail Summary**
   - Per requested section or scope chunk
4. **Recommended Next Actions**
   - Minimal, ordered remediation steps

If no issues are found, explicitly state:

- "No material findings in audited scope."
- Residual risk/testing gaps, if any.

## Guardrails

- Do not make code edits during audit unless explicitly requested after findings.
- Do not expand scope beyond requested sections/files.
- Do not mark work "complete" without evidence.
- Prefer concrete verification over assumptions.
