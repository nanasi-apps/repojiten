# Repojiten

Repojiten は、repository を読み込み、Wiki と OpenSpec を扱うための v0.1 開発基盤です。現時点の repository は Cloudflare Workers + React + Hono + Drizzle + TypeSpec + OpenSpec の monorepo として、後続 Issue の実装を始められる初期状態を提供します。

## v0.1 Scope

この初期セットアップで扱うもの:

- Repojiten 名義の workspace package、import alias、Cloudflare local resource。
- TypeSpec を source of truth にした OpenAPI と frontend SDK の生成。
- OpenSpec scenario ID と automated test title の紐づけ。
- React frontend の初期 route と sample Users route。
- CI、devcontainer、developer docs、lint/test/codegen guardrail。

この初期セットアップでは扱わないもの:

- GitHub OAuth 認証。
- Project / Repository / Wiki / OpenSpec Viewer の product domain。
- develop webhook、Cloudflare Queue / Workflow、AI Chat / DeepResearch。
- production Cloudflare resource の作成。

## Stack

- TypeScript
- React 19 / Vite 8 / React Router 7
- Radix/shadcn style UI package
- TanStack Query
- Cloudflare Workers
- Hono
- Drizzle ORM / D1
- TypeSpec / OpenAPI / Orval
- OpenSpec
- Vitest / Playwright

## Monorepo Layout

```text
packages/
├── typespec/              # API contract source and generated OpenAPI
├── frontend/
│   ├── app/               # Vite app, routes, pages
│   ├── domain/            # React hooks and client-side domain boundary
│   ├── api/               # generated SDK and API wrappers
│   └── ui/                # shared Radix/shadcn UI primitives
└── backend/
    ├── entry/             # Cloudflare Worker entrypoint
    ├── app/               # server assembly
    ├── http/              # Hono routes and HTTP tests
    ├── usecases/          # application usecases
    ├── domain/            # domain entities and interfaces
    ├── persistence/       # D1/Drizzle and external adapters
    ├── types/             # Worker bindings
    └── drizzle/           # Drizzle schema
```

Dependency direction:

- Frontend: `frontend/app -> frontend/domain -> frontend/api`
- Frontend UI: `frontend/app -> frontend/ui`
- Backend: `backend/entry -> backend/app -> (backend/http | backend/persistence | backend/usecases) -> backend/domain -> backend/types`
- API contract: implementation follows `packages/typespec/main.tsp`; do not generate SDK input from server routes.

## Setup

```bash
corepack enable
pnpm install
```

Node.js `>=24.12.0` is expected.

## Development

```bash
pnpm dev:all
```

Individual processes:

```bash
pnpm dev:server  # @repojiten/backend-entry on http://localhost:8787
pnpm dev:client  # @repojiten/frontend-app on http://localhost:5173
```

The root page is the Repojiten smoke target. `/users` is only a temporary sample route for checking API, D1, and form wiring.

## Cloudflare Local Setup

`wrangler.toml` uses Repojiten local resource names:

- Worker: `repojiten-server`
- D1 database: `repojiten-db`
- R2 bucket: `repojiten-bucket`
- KV namespace name: `repojiten-kv`

Create matching resources when needed:

```bash
wrangler d1 create repojiten-db
wrangler r2 bucket create repojiten-bucket
wrangler kv namespace create repojiten-kv
```

Generate and apply D1 migrations:

```bash
pnpm migrate:generate
wrangler d1 execute repojiten-db --local --file=./drizzle/migrations/<migration-file>.sql
```

## TypeSpec And SDK

TypeSpec source of truth:

```text
packages/typespec/main.tsp
```

Generated artifacts:

```text
packages/typespec/openapi/openapi.json
packages/frontend/api/src/generated/client.ts
```

Commands:

```bash
pnpm gen:openapi
pnpm gen:api-sdk
pnpm check:codegen
```

`pnpm check:codegen` regenerates OpenAPI and the frontend SDK, then fails if committed artifacts drift.

## OpenSpec Workflow

Current behavior specs live under:

```text
openspec/specs/**/spec.md
```

Rules:

- Every `#### Scenario:` heading must end with a stable Scenario ID such as `(REPOJITEN-FOUNDATION-FE-S001)`.
- Automated tests must include the Scenario ID in the test title using brackets, for example `[REPOJITEN-FOUNDATION-FE-S001]`.
- Manual-only scenarios must include `Tags: manual`.

Common commands:

```bash
openspec status --change "<name>"
openspec validate --all --strict
```

## Validation

Run the same checks locally before publishing:

```bash
pnpm format:check
pnpm lint
pnpm check
pnpm test:run
pnpm check:codegen
```

E2E:

```bash
pnpm test:e2e
```

CI runs formatting, lint, TypeScript check, unit/integration tests, and codegen drift checks on pull requests and pushes to `develop` / `main`.

## Supply Chain

`pnpm-workspace.yaml` enforces `minimumReleaseAge: 4320` (72 hours). Do not lower or bypass it. New dependency build scripts require package-by-package approval through `allowBuilds`; never enable `dangerouslyAllowAllBuilds`.

## Deploy

```bash
pnpm build
pnpm deploy
```

Production resource names in `wrangler.toml` use the `repojiten-*-production` pattern. Production IDs and secrets must be reviewed before deployment.
