## 1. Repository namespace と resource naming

- [x] 1.1 root `package.json` の package 名、scripts、workspace filters、migration command の resource 名、TypeSpec formatter filters を Repojiten 名に更新する。完了条件は `pnpm --filter @repojiten/frontend-app dev` と `pnpm --filter @repojiten/backend-entry dev` が package 解決できること。
- [x] 1.2 各 workspace `package.json` の package 名と workspace dependencies を `@repojiten/*` 名に更新し、`pnpm install` で `pnpm-lock.yaml` を workspace graph に合わせる。
- [x] 1.3 `tsconfig.base.json`、source imports、shared UI の internal imports、generated/source package references を `@cfreact-template-*` から `@repojiten/*` に更新する。完了条件は `pnpm check` が alias resolution error ではなく TypeScript compilation まで進むこと。
- [x] 1.4 `eslint.config.js` の import ordering、restricted imports、boundary rules、messages、generated SDK exclusions、stale `theme.ts` handling を Repojiten aliases に合わせる。完了条件は `pnpm lint:eslint` が namespace 由来の failure を出さないこと。
- [x] 1.5 `playwright.config.ts`、`wrangler.toml`、`.devcontainer/devcontainer.json`、`.serena/project.yml`、`openspec/config.yaml` を Repojiten 名に更新する。完了条件は local config inspection で `repojiten` resource/package names が確認できること。

## 2. API contract と generated artifacts

- [x] 2.1 `packages/typespec/package.json`、`packages/typespec/main.tsp`、`packages/typespec/src/**/*.tsp` を更新し、namespace と service title を Repojiten に揃え、public title を `Repojiten API` にする。
- [x] 2.2 `pnpm gen:api-sdk` を実行し、regenerate された `packages/typespec/openapi/openapi.json` と `packages/frontend/api/src/generated/client.ts` を反映する。
- [x] 2.3 `packages/backend/http/src/contracts/openapi-contract.test.ts` を更新し、test title に `[REPOJITEN-FOUNDATION-BE-S001]` を含めて OpenAPI title と served contract が `Repojiten API` を示すことを検証する。
- [x] 2.4 generated artifact coverage を追加または更新し、test title に `[REPOJITEN-FOUNDATION-BE-S002]` を含める。OpenAPI/SDK identity の committed state を確認し、drift gate は `pnpm check:codegen` に残す。
- [x] 2.5 TypeSpec/OpenAPI/SDK 再生成後に `pnpm check:codegen` が clean に通ることを確認する。

## 3. Frontend shell、sample route、frontend tests

- [x] 3.1 `packages/frontend/app/index.html`、`AppLayout.tsx`、`HomePage.tsx`、route wiring を更新し、`/` が Repojiten initial route として auth や seeded business data なしで render できるようにする。
- [x] 3.2 `/users` を残す場合は、`UsersPage.tsx`、navigation、copy を更新し、v0.1 product capability ではなく sample と分かる表示にする。
- [x] 3.3 frontend app/domain/api/ui の package imports と package metadata を Repojiten 名に更新する。`packages/frontend/ui/src/**` の shared UI internal imports も含める。
- [x] 3.4 `tests/e2e/user-flow.spec.ts` の Playwright coverage を更新し、test title に `[REPOJITEN-FOUNDATION-FE-S001]`、`[REPOJITEN-FOUNDATION-FE-S002]`、`[REPOJITEN-FOUNDATION-FE-S005]` を含める。smoke path は `/` を開く形にする。
- [x] 3.5 frontend alias/boundary coverage を追加または更新し、test title に `[REPOJITEN-FOUNDATION-FE-S003]` と `[REPOJITEN-FOUNDATION-FE-S004]` を含める。TypeScript alias resolution と app-layer API import restriction を検証する。
- [x] 3.6 `UsersPage.test.tsx`、MSW handlers、test utilities を Repojiten aliases と sample-route expectations に合わせる。完了条件は `pnpm test:client` が通ること。

## 4. Backend boundary、Cloudflare config、CI tests

- [x] 4.1 backend package metadata と `packages/backend/**/src/**/*.ts` の imports を `@repojiten/backend-*` に更新し、既存 dependency direction を維持する。
- [x] 4.2 backend alias/boundary coverage を追加または更新し、test title に `[REPOJITEN-FOUNDATION-BE-S003]` と `[REPOJITEN-FOUNDATION-BE-S004]` を含める。alias resolution と boundary-rule regression を検知できるようにする。
- [x] 4.3 `packages/backend/types/src/bindings.ts` と config checks を更新し、Worker bindings が Repojiten Wrangler configuration と一致するようにする。
- [x] 4.4 Wrangler config coverage を追加または更新し、test title に `[REPOJITEN-FOUNDATION-BE-S005]` を含める。Worker、D1、R2、KV names が `repojiten` prefix を使い、production resources が区別できることを検証する。
- [x] 4.5 `.github/workflows/ci.yml` を更新し、push trigger に `develop` と `main` の両方を含める。pull request の standard verification job は維持する。
- [x] 4.6 CI workflow coverage を追加または更新し、test title に `[REPOJITEN-FOUNDATION-BE-S006]` を含める。workflow に `format:check`、`lint`、`check`、`test:run`、`check:codegen` が含まれることを検証する。

## 5. Documentation と developer workflow

- [x] 5.1 `README.md` を Repojiten v0.1 の開発者向け入口として全面更新する。scope、stack、monorepo layout、local setup、Cloudflare setup、TypeSpec codegen、OpenSpec workflow、checks、deploy notes を含める。
- [x] 5.2 `CONTRIBUTING.md`、`AGENTS.md`、`CODING_STANDARDS.md` を更新し、package names、commands、UI stack、TypeSpec/OpenSpec contract rules、supply-chain guardrails を Repojiten に合わせる。
- [x] 5.3 `.opencode/skills/coding-guardian/SKILL.md`、`.opencode/skills/coding-guardian/references/repo-entrypoints.md`、frontend unit agent references を更新し、stale template/package/theme references を消す。
- [x] 5.4 docs/config coverage を追加または更新し、test title に `[REPOJITEN-FOUNDATION-BE-S007]` を含める。user-facing docs と scripts が Repojiten commands/resources を参照することを検証する。
- [x] 5.5 GitHub Issue #1 に `wontfix` label がなく、v0.1 milestone に残っていることを確認する。ずれがあれば implementation done 前に記録する。

## 6. Final verification

- [x] 6.1 `rg "cfreact-template|@cfreact-template|CfreactTemplate|Material UI|theme\\.ts" --hidden -g '!.git' -g '!node_modules'` を実行し、active source/config/docs の hit を解消する。historical planning artifact を残す場合は意図を明確にする。
- [x] 6.2 `pnpm format:check` を実行し、formatting drift を直す。
- [x] 6.3 `pnpm lint` を実行し、ESLint/OpenSpec/supply-chain guardrail failures を直す。
- [x] 6.4 `pnpm check` を実行し、TypeScript/package graph failures を直す。
- [x] 6.5 `pnpm test:run` を実行し、unit/integration failures を直す。
- [x] 6.6 `pnpm check:codegen` を実行し、generated artifact drift を直す。
- [x] 6.7 Playwright browser dependencies が利用できる場合は `pnpm test:e2e` を実行する。skip する場合は local blocker と完了済みの最も近い verification を記録する。
