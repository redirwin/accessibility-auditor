# Custom Short Codes

Use these **standalone** short codes anywhere in a prompt (before, after, or inline). When present, the agent must interpret them as the full instructions below.

---

## Short Codes

* **new convo** — Familiarize yourself with the full project and codebase; then summarize the project in **300 words or less** and be ready to help with updates.
* **nccp** — No code changes; provide analysis, guidance, suggestions, or commands only and do not modify files.
* **commit msg** — Review work since the last commit and produce **one short, descriptive commit message** appropriate for the changes.
* **plan from prd** — Using the attached **PRD**, generate a comprehensive **step-by-step implementation plan** in Markdown with clear sections and **unchecked task boxes** for each step; save it with an appropriate filename in [02-Implementation-Plans](02-Implementation-Plans); take no other actions.
* **implement plan** — Review the attached plan and implement **one section at a time**; check off completed steps in the plan, stop after each section, and wait for user confirmation before continuing.
* **audit** - Audit the actions you took after my last prompt to ensure that they are correct and complete based on the PRD and/or implementation plan.

---

## Processing Rules

* Short codes may appear **before, after, or within** the main prompt
* If multiple short codes appear, **apply all of them**
* If a short code conflicts with another instruction, **the short code wins** (unless explicitly overridden by the user in the same message)

---

# Document References

* [MVP PRD](01-PRDs/mvp-prd.md)
* [Actionable Findings Feature PRD](01-PRDs/actionable-findings-prd.md)
* [Database PRD](01-PRDs/database-prd.md)
* [Audit History PRD](01-PRDs/audit-history-prd.md)
* [MVP Implementation Plan](02-Implementation-Plans/mvp-implementation-plan.md)
* [Actionable Findings Implementation Plan](02-Implementation-Plans/actionable-findings-implementation-plan.md)
* [Database Implementation Plan](02-Implementation-Plans/database-implementation-plan.md)