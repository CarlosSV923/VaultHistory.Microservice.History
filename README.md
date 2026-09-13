# VaultHistory.Microservice.History

History is the NestJS service that generates, stores, lists, and deactivates stories for the Vault History system. It keeps the domain independent of persistence and AI providers: application use cases depend on ports, while Mongoose and Gemini implement those ports in infrastructure.

## Architecture

![History microservice architecture](docs/architecture/history-architecture.png)

The service accepts three kinds of requests: JWT-protected user requests, subscription jobs authenticated with the internal job token, and anonymous frontend requests authenticated with the fixed frontend token. The application layer delegates story generation to Gemini, persists stories in MongoDB, and atomically consumes the anonymous daily quota in a separate MongoDB collection.

- [Interactive architecture diagram](docs/architecture/history-architecture.html)
- [Editable diagram specification](docs/architecture/history-architecture.json)

## Responsibilities

- Generate subscription, authenticated query, and anonymous stories with Gemini.
- Store active and deactivated stories in MongoDB through Mongoose repositories.
- List active stories for an authenticated user or an anonymous visitor key.
- Enforce the anonymous daily generation allowance atomically per normalized IP and UTC day.
- Reuse a previously stored subscription story when its `idempotencyKey` matches.

## API and authentication

The API uses the `/api/v1/history` base path. Swagger is available at `/docs/v1` when `SWAGGER_ENABLE=true` and `NODE_ENV` is not `production`.

| Route | Authentication | Purpose |
| --- | --- | --- |
| `POST /generate/query` | Bearer JWT | Generate a story for the authenticated user. |
| `GET /list` | Bearer JWT | List the authenticated user's active stories, with filters and pagination. |
| `PATCH /deactivate-by-id/:id` | Bearer JWT | Deactivate one story owned by the authenticated user. |
| `PATCH /deactivate-by-user` | Bearer JWT | Deactivate all active stories owned by the authenticated user. |
| `POST /generate/subscription` | `AUTH_TOKEN_JOB` | Generate a subscription story for a supplied user ID. |
| `POST /generate/anonymous` | `AUTH_TOKEN_FORNT` | Generate an anonymous story subject to the daily allowance. |
| `GET /list/anonymous` | `AUTH_TOKEN_FORNT` | List active anonymous stories for the declared visitor IP. |

`AUTH_TOKEN_FORNT` is the environment-variable name used by the implemented service. The anonymous generation endpoint accepts a declared IPv4 or IPv6 address in its request body; the anonymous list endpoint receives it as a query parameter. The service normalizes that value, but it does not trust the connection address or forwarding headers. This is not a strong abuse-control boundary: shared addresses share the allowance, and a caller can change its declared address.

For anonymous generation, `ANONYMOUS_DAILY_LIMIT` defaults to `3` and can be set to `0` to disable the endpoint. MongoDB consumes an accepted request before Gemini is called; that attempt remains consumed if Gemini times out, fails, or persistence fails. Responses include `usage.limit`, `usage.remaining`, and `usage.resetAt`. An exhausted quota returns `429`, `ANONYMOUS_DAILY_LIMIT_EXCEEDED`, and `Retry-After`.

## Design and data

The codebase follows a layered design:

```text
src/
  api/             HTTP controller, DTOs, guards, Swagger, and exception handling
  application/     use cases and anonymous-generation policy
  domain/          story entities, errors, results, and port contracts
  infrastructure/  Mongoose repositories and the Gemini adapter
  app.module.ts    configuration, MongoDB, and module composition
```

The `histories` collection stores generated content, its type, optional owner or anonymous visitor key, optional idempotency key, creation time, and `isActive`. Deactivation is a soft state change, so inactive entries are excluded from active lists. The `anonymous_daily_usage` collection has a unique visitor-key and UTC-day counter that supports the atomic allowance check.

## Prerequisites and configuration

- Node.js 24 and pnpm (the repository recommends Volta with Node `24.16.0`).
- MongoDB, either locally or through the central Docker environment.
- A Google Gemini API key only for real story generation. Unit and integration tests use doubles or an in-memory MongoDB instance and do not send requests to Gemini.

Create a local environment file at `config/.env.local`. Keep real credentials and tokens out of source control.

```env
GOOGLE_API_KEY=replace_with_a_real_key_for_generation
PORT=3000
MONGO_URI=mongodb://vault_history:vault_history_password@localhost:27017/vault_history_local?authSource=admin
JWT_SECRET=replace_with_a_secure_secret
JWT_ISSUER=VaultHistory.User.Api
JWT_AUDIENCE=VaultHistory.User.Clients
AUTH_TOKEN_JOB=replace_with_a_secure_job_token
AUTH_TOKEN_FORNT=replace_with_a_secure_frontend_token
ANONYMOUS_DAILY_LIMIT=3
SWAGGER_ENABLE=true
```

The application loads `config/.env.${NODE_ENV}`. When it runs inside Docker, use the MongoDB service host in `MONGO_URI` rather than `localhost`.

## Run locally

```bash
pnpm install
pnpm run start:dev
```

Useful commands:

```bash
pnpm run build
pnpm run start
pnpm run start:prod
pnpm run test
pnpm run test:e2e
pnpm run test:cov
pnpm run lint
```

The central [Vault.History.System](https://github.com/CarlosSV923/Vault.History.System) repository owns the Docker Compose environment and service orchestration. From that repository, start the complete environment with:

```bash
docker compose up --build -d
```

## Testing

Unit tests cover domain behavior, use cases, guards, Mongoose mappings, repository behavior, and Gemini-adapter error handling. Integration tests start `mongodb-memory-server` and exercise HTTP behavior against the Nest application. They verify service behavior without requiring real Google credentials or sending external requests.

## Related repositories

- [Vault.History.System](https://github.com/CarlosSV923/Vault.History.System) — central Docker environment and system documentation.
- [VaultHistory.Microservice.User](https://github.com/CarlosSV923/VaultHistory.Microservice.User) — user identity and preferences.
- [VaultHistory.Microservice.Jobs](https://github.com/CarlosSV923/VaultHistory.Microservice.Jobs) — scheduled work.
- [VaultHistory.Microservice.Notification](https://github.com/CarlosSV923/VaultHistory.Microservice.Notification) — notification delivery.
- [Portfolio Vault History System project](https://github.com/users/CarlosSV923/projects/3) — cross-repository work tracking.
