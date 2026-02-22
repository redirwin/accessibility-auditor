# AGENTS.md — Project Instructions for AI Agents

This file defines project-specific shorthand commands, workflow rules, and skill references that AI agents must follow when working in this repository.

# Prompt Short Cuts

Use these **standalone** prompt short cuts anywhere in a prompt (before, after, or inline). When present, the agent must interpret them as the full instructions below.

---

## Short Cut Iterpretation

- **onboard** — "Familiarize yourself with the full project and codebase; then summarize the project in **300 words or less** and be ready to help with updates."
- **nccp** — "No code changes, please; provide analysis, guidance, suggestions, or commands only and do not modify files."
- **commit msg** — "Review work since the last commit and produce **one short, descriptive commit message** appropriate for the changes."
- **plan from prd** — "Use the [plan-from-prd](.agents/skills/plan-from-prd/SKILL.md) skill to generate a comprehensive **step-by-step implementation plan** from the attached PRD. Save the plan in [.agents/plans](.agents/plans) with clear sections and **unchecked task boxes**; take no other actions."
- **implement plan** — "Use the [implement-plan](.agents/skills/implement-plan/SKILL.md) skill to execute the referenced plan section(s), update checklist progress and section notes, and follow single/batch section rules."
- **audit** — "Use the [audit-completed-tasks](.agents/skills/audit-completed-tasks/SKILL.md) skill to audit actions already taken and validate correctness/completeness against the PRD and/or plan."

---

## Processing Rules

- Short cuts may appear **before, after, or within** the main prompt
- If multiple short cuts appear, **apply all of them**
- If a short cut conflicts with another instruction, **the short cut wins** (unless explicitly overridden by the user in the same message)

---

# Document References

**Canonical locations**

- [PRDs](.agents/prds) — Source product requirements. Use these to define scope, constraints, acceptance criteria, and non-goals before planning or implementation.
- [Plans](.agents/plans) — Execution checklists derived from PRDs. Use these to implement work section-by-section and track completion notes.

---

# Skills

Skills are reusable workflow guides stored in [.agents/skills](.agents/skills). When a user request clearly matches one of the workflows below, the agent should prefer using that skill first to keep output consistent, reduce drift, and follow project-specific process rules.

- [plan-from-prd](.agents/skills/plan-from-prd/SKILL.md) — Use this skill when the user asks to generate an implementation plan from a PRD (for example `plan from prd`, “create a plan from this PRD”, or equivalent language). This skill is for planning only: it should produce a structured Markdown plan with unchecked checklist tasks in `.agents/plans`, and it should not implement code or modify unrelated files.
- [implement-plan](.agents/skills/implement-plan/SKILL.md) — Use this skill when the user asks to execute an existing implementation plan (for example `implement plan`, “proceed to section 3”, or “run sections 5 through 9”). This skill enforces section-scoped implementation, supports both single-section and batched-section execution, requires plan checkbox updates and implementation notes, and requires validation/reporting before requesting confirmation to continue.
- [audit-completed-tasks](.agents/skills/audit-completed-tasks/SKILL.md) — Use this skill when the user asks to audit work that has already been done (for example `audit`, “validate completed sections”, or “check if this implementation is correct and complete”). This skill performs a findings-first audit against the relevant PRD/plan and current repo state, defaults to analysis-only (no code changes), and reports severity-ordered issues, pass/fail scope summary, and minimal next-step remediation guidance.

