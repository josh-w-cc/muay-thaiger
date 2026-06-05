# Playwright

## Test structure

- **Tests** live in `tests/` and currently provide a starter smoke check (`smoke.spec.js`) that verifies the app loads.
- Keep test files focused on user outcomes. If the suite grows, move selector-heavy interaction logic into page classes or helpers so specs stay readable.
- When you introduce page classes, keep locators and interaction methods in the page layer and avoid raw selectors in spec files.

## File naming

- Spec files (`tests/*.spec.js`) use kebab-case names (e.g., `smoke.spec.js`).
- Page class files use `*Page.js` StudlyCaps filenames (e.g., `BoardPage.js`).
- Helper modules use kebab-case filenames (e.g., `criteria-helpers.js`).

## Size limits

- Page/helper modules are subject to standard ESLint limits (100 lines, 20 lines per function).
- Test files (`tests/*.spec.js`) are exempt from line limits.

## Developer commands

Use npm scripts (not `npx playwright ...`) so the config in `config/` is always applied.

| Task | Command |
|------|---------|
| Run E2E tests (recommended) | `docker compose run --rm playwright` |
| Run E2E tests from `playwright/` | `npm test` |
| Lint Playwright package (auto-fix) | `npm run lint --prefix playwright` |
| Lint Playwright package (read-only, CI parity) | `npm run lint:ci --prefix playwright` |
| Lint all packages | `npm run lint` |
| Run root test suite (API + shared + web) | `npm test` |

## Infrastructure

Playwright runs as a Docker Compose profile (`playwright`) and is not started by `docker compose up`. Use `docker compose run --rm playwright` to execute E2E tests against the compose services.

## CI

GitHub Actions (`.github/workflows/playwright.yml`) runs Playwright lint and E2E checks. On PRs, it triggers for changes in `api/**`, `shared/**`, `web/**`, `playwright/**`, `docker-compose.yml`, and the workflow file (with AGENTS.md exclusions). On push, it runs on `main` for shared changes plus compose/workflow and Dockerfile updates used by the E2E stack.
