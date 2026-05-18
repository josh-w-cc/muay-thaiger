# Muay Thaiger

Muay Thaiger is a PvP incremental fighting game. Players pick an anthropomorphic animal race and a martial art style, train their fighter over time, and enter matches mostly against bots with occasional fights against real players.

## Terminology

- **Fighter** = the player character.
- **Race** = the fighter's anthropomorphic animal species.
- **Style** = the fighter's martial art.
- **Stanima** = intentional UI spelling and the correct term in-game; do not change it to `Stamina`.
- **Training** = incremental progression that improves fighter stats over time.
- **Fight** = a combat match, usually against bots and occasionally against real players.

## Data flow

User action → React event handler → action (`web/actions/`) → `fetchAPI()` → Fastify route (`api/routes/`) → logic or data module → Knex query → PostgreSQL. Responses flow back the same path.

- **Read path:** React Router `loader` calls `fetchAPI` → API assembles a view (e.g., `logic/board.js`) → populates Zustand store → component renders via `useLoaderData()`.
- **Write path:** Action updates Zustand store **optimistically** (before the API responds) so the UI feels instant, then `await`s the API call.
- **Model injection:** Logic functions receive data models as a destructured first parameter — see `api/AGENTS.md` for the pattern.

## Repo structure

- `api/` — Fastify backend API. Layered: `routes/` → `logic/` → `data/`. App factory in `app.js`.
- `web/` — Vite + React Router SPA. All data flows through the API; state in Zustand stores (`data/`). Design tokens in `globals.css`.
- `playwright/` — End-to-end smoke tests (Page Object Model).

Subprojects have additional details in local `AGENTS.md` files.
- For API changes, read `api/AGENTS.md`.
- For UI changes, read `web/AGENTS.md`.
- For Playwright changes, read `playwright/AGENTS.md`.

## Tech stack

- **Language:** JavaScript (not TypeScript)
- **Runtime:** Node.js 25 with ESM (`"type": "module"` — use `import`/`export`, not `require`)
- **Database:** PostgreSQL 18

## Developer commands

**Do not run test tools directly** (e.g., `npx vitest`, `npx playwright test`). Always use the `npm` scripts — they pass the correct config paths.

The root `package.json` provides aggregate scripts. Subproject commands (e.g., `npm run migrate`) must be run from the subproject directory — see subproject AGENTS.md files.

**After making changes, always run `npm run lint` and `npm test` from the repo root to verify your work passes lint checks and tests before finalizing.**

| Task | Command |
|------|---------|
| Start all services (local dev) | `docker compose up` |
| Install all subproject dependencies | `npm run prepare` |
| Run all tests (API + web) | `npm test` |
| Lint all sub-projects | `npm run lint` |
| Run Playwright E2E tests | `docker compose run --rm playwright` |

## Infrastructure

- **Local dev:** `docker compose up` starts all services

| Service      | Technology        | Host Port | Container Port | Notes                                 |
|--------------|-------------------|-----------|----------------|---------------------------------------|
| `postgres`   | PostgreSQL 18     | 5333      | 5432           | Data persisted in a named volume      |
| `api`        | Fastify / Node.js | 3334      | 3000           | Waits for postgres healthcheck        |
| `web`        | Vite / React 18   | 3333      | 5173           | Dev server; waits for api healthcheck |
| `playwright` | Playwright        | –         | –              | Profile: `playwright`; depends on web |

- **Service connections:**
  - `api → postgres`: `DATABASE_URL` env var uses Docker's internal DNS (`postgres:5432`). Default DB is `app`.
  - `web → api`: Vite dev server proxies `/api` requests and `/ws` websocket connections to `http://api:3000` (via `VITE_API_URL`).
  - `playwright → web`: Playwright uses `BASE_URL` (`http://web:5173`) to reach the frontend.
- **Environment variables:**
  - `DATABASE_URL` — Postgres connection string (knexfile default: `localhost:5333`)
  - `VITE_API_URL` — API base URL for Vite dev proxy (default: `http://localhost:3334`)
  - `NODE_ENV` — when not `production`, the `/api/test/reseed` endpoint is registered
- **`.env.example`** — Copy to `.env` for local dev. Note: its `DATABASE_URL` uses `postgres:5432` (Docker internal); the knexfile default uses `localhost:5333` (host-mapped port).
- **SPA serving:** In production, Fastify serves the Vite build via `plugins/serve-spa.js` with a catch-all for client-side routing.

## Style conventions

- **Object properties:** Alphabetize unless a clear priority/logical ordering exists.
- **Size limits** (7 ± 2 rule): Keep these under their stated maximums. Use options objects, subfolders, or submodules to stay within limits.
  - AGENTS.md files: 150 lines
  - Folder contents: 9 files or directories (test files excluded)
  - Function parameters: 5
  - Module exports: 9
  - Route handlers per file: 9
- **Config files:** Place tool configuration files (e.g., `eslint.config.js`) in a `config/` directory within the sub-project rather than the sub-project root. Some tools require root placement (e.g., `vite.config.js`, `jsconfig.json`) — those are exceptions.
- **Function naming:** Do not use `Handler` in function names — prefer the action alone (e.g., `update` not `updateHandler`). For React event handlers, use `on<Event>` (e.g., `onKeyDown` not `handleKeyDown`). For function generators, use the pattern `generate<Action>Fn` (e.g., `generateUpdateFn`).
- **Function ordering within a file:** Order functions by decreasing scope, alphabetized within the same scope level.
  - Default exports (e.g., React components) go at the top of the file.
  - Helper functions come after the function they support.
- **Acronyms in identifiers:** In camelCase or StudlyCaps names, capitalize acronyms when the first letter of the acronym would be capitalized (e.g., `getURL` not `getUrl`, `FooterCTA` not `FooterCta`). camelCase identifiers that start with an acronym remain lowercase (e.g., `urlPath`).
- **No numerals in identifiers:** Do not use numerals in function or variable names — use descriptive words instead (e.g., `primaryColor` not `color1`, `retryCount` not `retry2`).
- **Terminology:** Prefer `whitelist` and `blocklist` over `allowlist` and `denylist`.
- **Code style:**
  - 2-space indentation, single quotes, semicolons required
  - No space between keyword and paren: `if(`, `for(`; no spaces inside braces: `{foo}` not `{ foo }`
  - Braces required on all control flow (`if`, `else`, `for`, `while`, `do`)

## CI

- **`api.yml`** — Lint + tests (95% coverage) on PRs touching `api/`.
- **`web.yml`** — Lint + tests (95% coverage) on PRs touching `web/`.
- **`playwright.yml`** — Lint + E2E on PRs touching `api/`, `web/`, `playwright/`, or `docker-compose.yml`. Also runs on push to `main`. AGENTS.md changes are excluded from all triggers.
- **Timeouts:** 5 min for lint/test/build jobs, 15 min for E2E. Steps prone to hanging (e.g., `docker compose up --wait`) need step-level `timeout-minutes`.
- **Concurrency:** Every workflow cancels in-progress runs for the same branch: `group: ${{ github.workflow }}-${{ github.head_ref || github.ref }}` with `cancel-in-progress: true`.
