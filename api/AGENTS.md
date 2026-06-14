# API

## Architecture

Layered structure: `routes/` → `logic/` → `data/`. For simple CRUD with no business rules, routes call data modules directly — do not create a logic module just to pass through. Create `logic/` and `data/` directories as needed when adding business logic and data access beyond the starter scaffolding.

- **Routes** are async Fastify plugins registered via `app.register()` in `index.js`. They handle HTTP and delegate to logic or data modules.
  - **Validation:** Use Fastify JSON schema validation by passing a `schema` object as a route option. Schemas are co-located in companion files (e.g., `schemas.js`).
  - **Responses:** Return objects/arrays directly — no wrapper envelope. Use `reply.code(201)` for POST creation. Use `reply.code(204).send()` for successful DELETE. Use `reply.code(404).send({error: 'Not found'})` for missing resources.
  - **URL conventions:** Route URLs use kebab-case. CRUD resource collections use plural nouns; singleton or action endpoints use singular.
- **Logic** modules (`logic/`) contain business logic shared across routes. Logic modules receive model instances (dependency injection) and return view-ready data structures.
  - **Model injection:** Every exported function in `logic/` that depends on data models must accept them as a single destructured object in its first parameter. Non-model arguments (data payloads, IDs, logger) remain as subsequent positional parameters. Pure utility functions that take no models are exempt.
- **Data** modules (`data/models/`) default-export a function that receives the database client (`app.db`) and returns an object of CRUD methods (typically `create`, `find`, `list`, `remove`, `update`).
- **CRUD generators** (`data/utils/crud.js`) export factory functions (`generateCreateFn`, `generateFindFn`, `generateListFn`, `generateRemoveFn`, `generateUpdateFn`) that take `(db, table)` as the first two parameters. Routes pass `app.db` (dependency injection) when calling the model factory. Data modules assemble their default export from these generators.
- **Route handler generators** (`routes/shared/route-handlers.js`) export factory functions that create standard route handlers from model methods, reducing boilerplate in route files. `withFoundItem(model, handler)` wraps a callback with a find-or-404 guard, passing the found item to the callback.
- **App factory** (`app.js`) exports `build(opts)` which creates and configures a Fastify instance. `index.js` calls `build({logger: true})` for production. Tests call `build()` directly and use `app.inject()` for in-memory HTTP testing. When adding tests, refactor `index.js` by extracting app setup into `app.js` using this pattern.
- The database client is a Fastify decorator (`app.db`), registered by `db.js`.

## Endpoints

HTTP endpoints below are registered under the `/api` prefix (except `/health`). The websocket connection entrypoint is `/ws/connect`.

| Route file | Method | Path | Purpose |
|------------|--------|------|---------|
| `resources/actions.js` | GET | `/api/actions` | List all fighter actions |
| `resources/actions.js` | GET | `/api/actions/:id` | Get fighter action by ID |
| `resources/fighters.js` | GET | `/api/fighters` | List all fighters |
| `resources/fighters.js` | GET | `/api/fighters/:id` | Get fighter by ID |
| `health.js` | GET | `/health` | Healthcheck (no `/api` prefix) |
| `resources/moves.js` | GET | `/api/moves` | List all moves |
| `resources/players.js` | GET | `/api/players` | List all players (private fields stripped) |
| `resources/players.js` | GET | `/api/players/:id` | Get player by ID (private fields stripped) |
| `resources/race.js` | GET | `/api/race` | List all playable races |
| `test-reseed.js` | POST | `/api/test/reseed` | Truncate and reseed DB for tests (non-production only) |
| `websocket.js` | WS | `/ws/connect` | WebSocket connection entrypoint |

## Testing

- Node.js built-in test runner (`node --test`) with `node:assert/strict`. Coverage via `c8`.
- Route tests use `build()` from `app.js`, mock `app.db`, then assert via `app.inject()` and call `app.close()` at the end.
- Data module tests exercise the model factory with a mock database client.

## Developer commands

**After making API changes, run `npm run lint` and `npm test` from the `api/` directory to verify your work.**

| Task | Command |
|------|---------|
| Run tests | `npm test` |
| Run tests with coverage | `npm run test:coverage` |
| Lint (auto-fix) | `npm run lint` |
| Lint (read-only, CI) | `npm run lint:ci` |
| Dev server | `npm run dev` |
| Start server | `npm start` |
| Run migrations | `npm run migrate` |
| Seed database | `npm run migrate:seed` |

## Infrastructure

- **Database connection:** `db.js` creates a database client and registers it as a Fastify decorator (`app.db`).
- **Migrations:** SQL migration files live under `migrations/` and are run in alphabetical order by the migration runner (`migrate.js`). Name migration files with a zero-padded numeric prefix (e.g., `002_create_items.sql`).
- **Primary keys:** Every table — including join tables — must have an `id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY` column. Express composite natural keys as `UNIQUE` constraints.
- **Timestamps:** Every table must include a `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()` column. Mutable tables must also include `updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()` and a `BEFORE UPDATE` trigger calling `update_updated_at_column()` to keep it current. Join tables and audit/history tables are exempt from the `updated_at` requirement.
- **API route prefix:** All Fastify HTTP API routes are registered under `/api/` (e.g., `/api/items`). The websocket connection entrypoint is registered separately at `/ws/connect`. The `/health` endpoint remains at the root for Docker healthchecks.
- **SPA serving:** In production, Fastify serves the Vite build output (`web/dist/`) via `@fastify/static`. A catch-all handler serves `index.html` for any GET request outside the `/api/` and `/ws/` prefixes, enabling client-side routing.
- **Seeds** must be idempotent. Name seed files with a zero-padded numeric prefix (e.g., `001-sample-data.sql`). The seed runner (`seed.js`) runs all pending `.sql` files in alphabetical order.

## File naming

- Files use `kebab-case.js`.

## CI

GitHub Actions (`.github/workflows/api.yml`) runs lint and tests with 95% coverage thresholds on PRs touching `api/`.
