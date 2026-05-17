# starter-kit

A minimal full-stack starter kit with:

- **[Fastify](https://fastify.dev/)** – fast Node.js API server (JavaScript)
- **[Vite](https://vitejs.dev/) + React** – frontend SPA (TypeScript)
- **[PostgreSQL](https://www.postgresql.org/)** – relational database (v18)
- **[Docker Compose](https://docs.docker.com/compose/)** – local orchestration
- **[Playwright](https://playwright.dev/)** – end-to-end tests

All application logic has been stripped out. This is a clean scaffold to build on top of.

## Quick Start

```bash
cp .env.example .env
docker compose up
```

The frontend will be available at <http://localhost:3333> and the API at <http://localhost:3334>.

## Structure

See [agents.md](./agents.md) for a detailed breakdown of the repository layout and how the services connect.
