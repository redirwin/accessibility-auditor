# Agent Skills Quick Guide

This folder contains project-specific Agent Skills, following the open Agent Skills specification.

> Note: This README is for human maintainers. Agents should prioritize each skill's `SKILL.md` as the source of truth for behavior.

## What is an Agent Skill?

An Agent Skill is a folder with a required `SKILL.md` file (YAML frontmatter + Markdown instructions). Skills can also include optional support folders like `scripts/`, `references/`, and `assets/`.

## Example Skill Folder Structure

```
my-skill/
├── SKILL.md          # Required: instructions + metadata
├── scripts/          # Optional: executable code
├── references/       # Optional: documentation
└── assets/           # Optional: templates, resources
```

## Required `SKILL.md` frontmatter

- `name` (required)
  - Must match the parent directory name
  - Lowercase letters/numbers/hyphens only
  - 1-64 chars, no leading/trailing hyphen, no consecutive hyphens
- `description` (required)
  - 1-1024 chars
  - Should describe both what the skill does and when to use it

Common optional fields: `license`, `compatibility`, `metadata`, and experimental `allowed-tools`.

## How skills are loaded

Skills use progressive disclosure:

1. **Discovery**: agent loads `name` + `description` metadata for available skills.
2. **Activation**: if relevant, agent loads full `SKILL.md`.
3. **Execution**: agent may read referenced files or run scripts as needed.

## Authoring recommendations

- Keep `SKILL.md` concise (spec recommends under 500 lines).
- Keep references shallow and use relative paths from skill root.
- Move detailed material into `references/` and executable helpers into `scripts/`.
- Write explicit, procedural instructions for repeatable outcomes.

## Source

Official Agent Skills website and specification:

- https://agentskills.io/
- https://agentskills.io/specification
