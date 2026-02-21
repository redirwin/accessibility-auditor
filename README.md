# Accessibility URL Auditor

Accessibility URL Auditor is a Next.js web app that runs lightweight, deterministic accessibility checks against a public URL and returns an actionable pass/warn/fail report.

This project is intentionally **AI-assisted**. AI agents were used to accelerate delivery, improve iteration speed, and support rapid prototyping while keeping implementation decisions explicit and reviewable.

## Why This Project

Most accessibility tools are either too shallow or too heavyweight for quick early-stage checks. This app targets a practical middle ground:

- Fast single-page audits
- Clear results for engineers
- Strong server-side safety guardrails
- Deterministic output suitable for demos and repeatable QA

## Key Features

- URL audit flow with `idle`, `loading`, `success`, and `error` states
- `POST /api/audit` backend endpoint with structured response output
- 10 accessibility checks (language, title, viewport, alt text, form labels, button names, heading structure, link clarity, duplicate IDs)
- Summary scoring model (pass/warn/fail penalties)
- Search/filter/sort over in-memory check results
- Copy JSON output for sharing and debugging
- Dev/demo simulator for quickly validating UI states

## Security and Reliability

- URL validation (`http`/`https` only)
- SSRF protections for localhost/private/link-local targets
- Safe fetch constraints:
  - timeout limit
  - redirect limit
  - maximum HTML payload size
  - content-type checks
- Deterministic, non-browser-rendered parsing (Cheerio-based)

## Tech Stack

- Next.js (App Router), React, TypeScript
- Tailwind CSS + Radix UI primitives
- Cheerio for HTML parsing
- Vitest + Testing Library for tests

## AI as a Feature (Not a Shortcut)

This repository demonstrates an AI-enabled development workflow:

- Requirements were translated into implementation steps quickly
- UI and backend iterations were validated in short loops
- AI was used to generate options and accelerate refactors
- Final decisions, tradeoffs, and code quality remained human-directed

The value here is shipping features quickly, and using AI tools responsibly to improve delivery speed while preserving engineering judgment.

## Running Locally

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

To run tests:

```bash
npm test
```

## Project Status

MVP is implemented and demo-ready. A planned post-MVP enhancement is adding element-level actionable findings (stable selectors + HTML snippets) for each issue.

---

Created by David Irwin using AI agents.
