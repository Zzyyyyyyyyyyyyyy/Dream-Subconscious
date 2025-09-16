# Project Instructions for Codex

## Files & Docs
- CHANGELOG.md: the only place for change logs. Maintain an **Unreleased** section and move entries when tagging releases.
- AGENTS.md: human documentation (setup, scripts, architecture notes). No raw change logs here.

## Commit Message Template
<type>(<scope>): <summary>

[why / design decisions / links]

BREAKING CHANGE: <details> (if any)

Allowed types: feat, fix, docs, refactor, test, chore, perf, build, ci, style.

## When Proposing Changes
- Show a file-by-file plan and minimal diff.
- Provide an updated snippet to append under `## [Unreleased]` in CHANGELOG.md.
- Add/adjust tests when logic changes.

