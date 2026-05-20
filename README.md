# Muay Thaiger

Muay Thaiger is a PvP incremental fighting game where players choose an anthropomorphic animal race and martial art style, train their fighter, and enter fights mostly against bots with occasional real-player matchups.

Built with:

- **[Fastify](https://fastify.dev/)** – fast Node.js API server (JavaScript)
- **[Vite](https://vitejs.dev/) + React** – frontend SPA (JavaScript)
- **[PostgreSQL](https://www.postgresql.org/)** – relational database (v18)
- **[Docker Compose](https://docs.docker.com/compose/)** – local orchestration
- **[Playwright](https://playwright.dev/)** – end-to-end tests

## Quick Start

```bash
cp .env.example .env
docker compose up
```

The frontend will be available at <http://localhost:3333> and the API at <http://localhost:3334>.

## Structure

See [agents.md](./agents.md) for a detailed breakdown of the repository layout and how the services connect.

The `shared/` package is consumed by both `api/` and `web/` via local file dependencies (`file:../shared`), so Docker builds include the shared code without relying on bind mounts.
