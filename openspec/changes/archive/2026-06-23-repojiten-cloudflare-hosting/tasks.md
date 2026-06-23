## 1. 永続 data model (D1)

- [x] 1.1 Drizzle schema に v0.1 foundation の全 table (users〜github_webhook_events) を定義する。完了条件は schema が型エラーなく compile できること。
- [x] 1.2 `pnpm migrate:generate` で foundation tables を作成する D1 migration を生成する。

## 2. Bindings と Cloudflare 構成

- [x] 2.1 `Bindings` に `GENERATION_QUEUE`、`ASSETS`、`GITHUB_CLIENT_ID/SECRET`、`GITHUB_WEBHOOK_SECRET`、`SESSION_SECRET`、`APP_BASE_URL` を追加する。
- [x] 2.2 `wrangler.toml` に generation queue producer/consumer、`[assets]`、vars、production environment を追加する。完了条件は `wrangler deploy --dry-run` が全 binding を解決すること。
- [x] 2.3 SPA assets を配信できるよう `packages/frontend/app/dist` を `.gitkeep` で常設し、`.gitignore` を調整する。

## 3. 非同期 generation job

- [x] 3.1 domain に generation job entity/status、repository port、queue port、runner port を定義する。
- [x] 3.2 usecases に EnqueueGenerationJob / ProcessGenerationJob / GetGenerationJob を実装する。
- [x] 3.3 persistence に Drizzle job repository と Cloudflare queue adapter を実装する。
- [x] 3.4 generation job lifecycle の integration test を追加し、test title に `[REPOJITEN-HOSTING-BE-S004]`、`[REPOJITEN-HOSTING-BE-S005]`、`[REPOJITEN-HOSTING-BE-S006]` を含める。

## 4. GitHub webhook intake

- [x] 4.1 domain に HMAC SHA-256 署名検証(Web Crypto)と webhook payload parser、webhook event entity/port を実装する。
- [x] 4.2 usecases に HandleGithubWebhook を実装し、develop push で再生成ジョブを enqueue する。
- [x] 4.3 http に plain Hono の webhook route(OpenAPI contract 外)を追加する。
- [x] 4.4 webhook intake の integration test を追加し、test title に `[REPOJITEN-HOSTING-BE-S007]`、`[REPOJITEN-HOSTING-BE-S008]`、`[REPOJITEN-HOSTING-BE-S009]` を含める。

## 5. R2 artifact storage

- [x] 5.1 domain に R2 object key builder(snapshots/wiki scheme)と artifact store port を定義する。
- [x] 5.2 persistence に R2ArtifactStore を実装する。
- [x] 5.3 object key と R2 store の test を追加し、test title に `[REPOJITEN-HOSTING-BE-S010]`、`[REPOJITEN-HOSTING-BE-S011]` を含める。

## 6. Worker handler と queue consumer

- [x] 6.1 app に generation/github の DI factory を実装する。
- [x] 6.2 app に queue consumer handler を実装し、worker `{ fetch, queue }` を構成する。
- [x] 6.3 entry の default export を worker handler に切り替える。
- [x] 6.4 server に webhook route 登録と SPA assets フォールバックを wiring する。

## 7. Documentation と環境変数

- [x] 7.1 README に Cloudflare resource(D1/KV/R2/Queues)作成手順と single-deploy 手順を追記する。
- [x] 7.2 `.dev.vars.example` を追加し、README に local/production の secret 設定手順を記載する。

## 8. Final verification

- [x] 8.1 `pnpm format:check` を実行する。
- [x] 8.2 `pnpm lint` を実行する。
- [x] 8.3 `pnpm check` を実行する。
- [x] 8.4 `pnpm test:run` を実行する。
- [x] 8.5 `pnpm check:codegen` を実行する。
- [x] 8.6 `wrangler deploy --dry-run` で hosting 構成を検証する。
