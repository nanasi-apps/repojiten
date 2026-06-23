## Why

Repojiten v0.1 は「Cloudflare 上にホストできる」ことを完了条件に含む (#6)。初期セットアップ (`repojiten-initial-setup`) で repository は Repojiten 名義に揃ったが、Cloudflare 上で実際に動かすための実行基盤 — 永続 data model、非同期ジョブ、GitHub webhook の受け口、生成 artifact の保存先、secret 管理、単一 deploy 構成 — はまだ無い。

この change はプロダクト機能(全自動 Docs 生成、Project、認証、Repository 管理)そのものは追加せず、後続 Issue (#2/#3/#7/#8) が前提にする hosting 基盤を整える。生成処理 (Repository 読み込み・Wiki 生成) は配線のみ用意し、実際の生成ロジックは後続 Issue に委ねる。

## What Changes

- Drizzle schema に v0.1 foundation の全 table (users〜github_webhook_events) を定義し、D1 migration を生成する。
- Cloudflare Queues を producer/consumer として配線し、generation job を enqueue・処理し、状態を D1 (`generation_jobs`) に記録する。
- GitHub webhook endpoint を Worker 上に置き、`x-hub-signature-256` を Web Crypto で検証して、`develop` への push で再生成ジョブを enqueue する。webhook delivery は D1 (`github_webhook_events`) に記録する。
- R2 の object key scheme を設計し、artifact store (put/get/delete) を用意する。
- `wrangler.toml` に generation queue・static assets binding・secret 用の env を追加し、default と production の両 environment を整える。
- Worker static assets で SPA を配信し、API/webhook 以外の未マッチ request を SPA entry にフォールバックする単一 deploy 構成にする。
- 認証・webhook・session に必要な secret と環境変数を README と `.dev.vars.example` で整理する。
- 実際の Repository 取り込み・Wiki 生成ロジック、認証フロー、Project/Repository CRUD、Cloudflare Workflows、AI 機能は対象外とする。

## Spec Units

### New Spec Units

- `repojiten-hosting-be`: 新規。Cloudflare hosting configuration、永続 data model、非同期 generation job、GitHub webhook intake、R2 artifact storage、secret/環境変数の整理を扱う。横断関心は production 再現性、非同期処理の観測性、送信元検証、後続機能への土台。

### Modified Spec Units

- なし。hosting 基盤を表す Spec Unit はまだ存在しないため、新規 Spec Unit として定義する。

## Naming

Scenario ID の DOMAIN prefix は `repojiten-hosting` から派生した `REPOJITEN-HOSTING` を使う。backend/platform scenario は `REPOJITEN-HOSTING-BE-S###`。S001〜S003・S012 は configuration/migration/secrets を扱う manual scenario、S004〜S011 は generation job・webhook・R2 を扱う automated scenario とする。

## Impact

- Backend/domain: generation job・webhook event・artifact 用の entity と port。
- Backend/usecases: enqueue/process/get generation job、handle GitHub webhook。
- Backend/persistence: Drizzle job/webhook repository、Cloudflare queue adapter、R2 artifact store。
- Backend/http: GitHub webhook route(OpenAPI contract 外の plain Hono route)。
- Backend/app/entry: queue consumer を含む Worker handler (`fetch` + `queue`)、SPA assets フォールバック、DI 配線。
- Backend/types: `Bindings` に `GENERATION_QUEUE`、`ASSETS`、GitHub/session secrets、`APP_BASE_URL` を追加。
- Infrastructure: `wrangler.toml` の queues/assets/vars、production environment、Drizzle migration、`.dev.vars.example`。
- Documentation: README の Cloudflare resource 作成手順、secret 設定、single-deploy 手順。
- Data migration: v0.1 foundation tables を作成する初回 migration を追加する(既存データなし)。
