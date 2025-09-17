# Repository Guidelines

## Project Structure & Module Organization
- Use a simple, predictable layout:
  - `src/` — core modules and entrypoints
  - `tests/` — unit/integration tests mirroring `src/`
  - `assets/` — images, prompts, static files
  - `scripts/` — developer utilities and one-offs
  - `docs/` — design notes, ADRs, architecture

## Build, Test, and Development Commands
- Prefer Make targets for a consistent DX:
  - `make setup` — install dependencies (Python: `pip install -r requirements.txt`; Node: `npm ci`)
  - `make run` — start the app (e.g., Python: `python -m src.app`; Node: `npm run dev`)
  - `make test` — run tests with coverage (Python: `pytest -q`; Node: `npm test`)
  - `make lint` — run linters (Python: `flake8`; JS/TS: `eslint .`)
  - `make fmt` — apply formatting (Python: `black .`; JS/TS: `prettier -w .`)

## Coding Style & Naming Conventions
- Python: 4-space indent, `black` + `isort` + `flake8`; files/modules `snake_case`, classes `PascalCase`, constants `UPPER_SNAKE`.
- JS/TS: 2-space indent, `prettier` + `eslint`; files `kebab-case` or `camelCase`, classes `PascalCase`.
- Keep functions small, pure when possible; document public APIs with concise docstrings/JSDoc.

## Testing Guidelines
- Frameworks: prefer `pytest` (Python) or `vitest/jest` (JS/TS).
- Place tests in `tests/` mirroring `src/` paths; name Python tests `test_<module>_<behavior>.py`.
- Aim for ≥80% line coverage on changed code. Include at least one integration test per feature.

## Commit & Pull Request Guidelines
- History shows no strict convention—adopt Conventional Commits:
  - Examples: `feat: add dream parser`, `fix: handle empty prompt`, `docs: update setup`
- PRs: clear description, scope/impact, linked issues (`Closes #123`), screenshots/CLI output when UI/CLI changes, and test evidence.
- Keep PRs focused (<500 LOC diff when feasible); add migration notes in `docs/` if behavior changes.

## Security & Configuration Tips
- Do not commit secrets. Use `.env` (gitignored) and provide `.env.example` with safe defaults.
- Validate and load config via a single module (e.g., `src/config.py` or `src/config.ts`).
