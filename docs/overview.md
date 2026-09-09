# History service documentation

History is the NestJS API for generating, storing, listing and deactivating stories. Application use cases depend on MongoDB and AI ports; infrastructure supplies Mongoose and Gemini adapters.

- Interactive diagram: [History architecture](architecture/history-architecture.html)
- Editable diagram source: [history-architecture.json](architecture/history-architecture.json)
- Commands: `pnpm install`, `pnpm build`, `pnpm test`, `pnpm test:e2e`
- Central Docker environment: [Vault.History.System](https://github.com/CarlosSV923/Vault.History.System)

Interactive routes use JWT authentication. `POST /api/v1/history/generate/subscription` is called by Notification and requires the internal `AUTH_TOKEN_JOB`.

`POST /api/v1/history/generate/anonymous` accepts a declared IPv4 or IPv6 address in its body and requires the fixed `AUTH_TOKEN_FORNT` header value. It never trusts the connection address or forwarding headers. MongoDB atomically consumes `ANONYMOUS_DAILY_LIMIT` (default `3`) using the normalized address and the UTC day; anonymous histories store neither the address nor a user identity. A limit of `0` disables the endpoint.

Keep `GOOGLE_API_KEY`, MongoDB credentials and tokens outside the repository.

The subscription request accepts an optional `idempotencyKey`. When it matches a previously stored story, History returns that content without calling Gemini again.
