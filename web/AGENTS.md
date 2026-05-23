# Web

## Architecture

The web app is a Vite-built SPA using React Router for client-side routing. It has no direct database access — all data flows through the Fastify API.

- **`pages/`** — Route components with React Router loaders. Each page exports a named component function and an optional `loader` function. Loaders fetch data from `/api/...` (relative URLs) before the route renders. Components access loader data via `useLoaderData()`.
- **`router.js`** — Route configuration using `createBrowserRouter`. Layout route modules (e.g., `pages/Game/GameLayout.js`) that export a named component and `loader` are imported eagerly and referenced with `Component`/`loader` props directly. A `lazyPage(importFn)` helper lazy-loads screen-level modules that export a default component.
- **`actions/`** — Client-side mutation helpers. These call the Fastify API via `fetchAPI()` from `utils/fetchAPI.js`. After mutations, actions update Zustand stores directly so the UI reflects changes without re-running loaders. Each action file should have only a default export and be named after the action (e.g., `moveTask.js`).
- **`components/`** — Shared components live here.
- **`data/`** — Zustand stores.  Actions update stores optimistically before awaiting API calls.
- **`main.js`** — App bootstrap: renders `<RouterProvider>` into the root element.
- **`index.html`** — Vite SPA entry point.

## Tech stack

- **Frontend:** Vite with React (SPA / client-side routing)
- **Path alias:** `@/*` maps to the `web/` root (configured in `vite.config.js`). Use `@/` imports for any module that is not a sibling or descendant of the importing file; use relative paths (`./`, `../`) for siblings and descendants.

## Testing

- Vitest with `@testing-library/react` and `@testing-library/jest-dom`.
- Tests use top-level `vi.mock()` followed by dynamic `await import()` to load modules after mocks are in place. Use `afterEach(() => { vi.clearAllMocks(); })` in every `describe` block.
- `config/vitest.setup.js` mocks `HTMLDialogElement.showModal()` and `.close()` for jsdom — dialog-based components (e.g., modals) rely on this; do not duplicate these mocks in individual test files.

## Developer commands

**After making web changes, run `npm run lint` and `npm run test:coverage` from the `web/` directory to verify your work.**

| Task | Command |
|------|---------|
| Run tests (watch mode) | `npm test` |
| Run tests with coverage | `npm run test:coverage` |
| Lint (auto-fix) | `npm run lint` |
| Lint (read-only, CI) | `npm run lint:ci` |
| Dev server | `npm run dev` |
| Production build | `npm run build` |

## Infrastructure

- **Vite config:** `vite.config.js` configures the `@vitejs/plugin-react` plugin, a `jsxInJs()` plugin (to support JSX in `.js` files), a `@/` path alias, and dev server proxies for `/api` requests plus `/ws` websocket connections to the Fastify backend (`VITE_API_URL`, default `http://localhost:3334`).

## Style conventions

- **CSS:** Use CSS Modules (`.module.css`) for component-scoped styles. Shared utility classes live in `globals.css` and are referenced as bare class name strings — these are intentionally global and should not be migrated. Only use plain `.css` files for shared/global styles.
- **CSS custom properties:** `globals.css` defines design tokens (colors, spacing, radius, transitions) as CSS custom properties on `:root`. Use these variables instead of hardcoding values.
- **Shared CSS modules:** `components/primitive/css-modules/` contains base CSS modules (e.g., `field-base.module.css`, `card-list-base.module.css`) that components compose from via CSS Modules `composes`.
- **No negative margins:** Do not use negative margins (`margin-top: -4px`, `margin: -8px`, etc.). They create fragile, order-dependent layouts. Use padding adjustments, `gap`, or layout restructuring instead.
- **CSS directives/properties ordering within a rule:** `composes` declarations come first (alphabetized if multiple), then a blank line, then all other properties alphabetized. Vendor-prefixed properties (`-webkit-`, `-moz-`, etc.) sort as if the prefix were removed, placed immediately after the unprefixed version of the property if one exists in the same rule.
- **React imports:** Use the default import (`import React from 'react'`) and access hooks/utilities as properties (e.g., `React.useRef()`, `React.useState()`, `React.useEffect()`). Do not use named imports from `react` (e.g., `import {useRef} from 'react'`).
- **Imports:** Order by group, alphabetized within each group. One blank line between groups. Two blank lines after the import block.
  1. `React` import (if needed)
  2. Package imports
  3. Local imports
  4. CSS module imports
- **Component exports:** A file may contain helper components, but must export at most one React component. Split additional exported components into separate files.
- **Component parameters:** Alphabetize props; place `children` last.
- **Foreign key naming:** Foreign key column names use the singular table name alone (e.g., `parent`, `stage`), not the singular with `_id` appended (e.g., not `parent_id`, not `lane_id`).
- **Component placement:** Reserve `components/` (at the `web/` root) for components shared across multiple routes. Components with only one usage should be nested under the directory of the component that uses them.

## File naming

- Exported helpers: `camelCase.js`
- Scripts: `kebab-case.js`
- React component files: `StudlyCaps.js` (e.g., `BoardCard.js`)
- CSS modules: `ComponentName.module.css` (matches the component file name)

## CI

GitHub Actions (`.github/workflows/web.yml`) runs lint and tests with 95% coverage thresholds on PRs touching `web/`.
