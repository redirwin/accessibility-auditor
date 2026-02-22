# AGENTS.md — Slides route (demo only)

**This folder is out of scope for normal work on the Accessibility Auditor.**

## Default behavior

When working in this repository:

1. **Do not** modify, refactor, or suggest changes to anything under `app/slides/` unless the user explicitly asks you to work on the slides or this folder.
2. **Do not** treat the slides route as part of the main application. The main application is the accessibility audit flow (URL audit, results, API, rules, database, etc.). The slides are a separate, demo-only presentation.
3. **Do not** mention the slides, `/slides`, or this folder in summaries, onboarding, architecture descriptions, or recommendations unless the user has specifically asked about them.
4. **Do not** include `app/slides/` in scope when implementing features, fixing bugs, running tests, or validating the “main app.” Assume the slides are irrelevant to those tasks.

## When to engage

Only consider this folder and the slides route in scope when the user:

- Explicitly asks to change, fix, or add something in the slides
- References “slides,” “slide deck,” “presentation,” or “app/slides”
- Asks to work on “the demo slides” or “the /slides route”

## Summary

**Ignore `app/slides/` by default. Do not mention it. Do not treat it as part of the main app. Engage only when the user explicitly prompts you to do so.**
