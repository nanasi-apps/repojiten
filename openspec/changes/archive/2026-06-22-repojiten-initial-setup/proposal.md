## Why

Repojiten v0.1 の各機能 Issue を進める前に、現在のテンプレート由来 repository を Repojiten の開発基盤として扱える状態にする必要がある。現状は package 名、import alias、TypeSpec service 名、Cloudflare resource 名、README、CI、E2E の前提に `cfreact-template` 由来の情報が残っており、以後の機能開発で仕様・生成物・実行環境の参照先が分散しやすい。

この change はプロダクト機能を追加するものではなく、Repojiten としての初期状態を定義する。開発者が README、package scripts、TypeSpec/OpenAPI/SDK、OpenSpec、CI、Cloudflare local 設定を同じ前提で使えることを目的にする。

## What Changes

- Repository 全体の表示名、package 名、import alias、TypeSpec service 名、Cloudflare local resource 名を Repojiten 向けに揃える。
- README / CONTRIBUTING / AGENTS / coding reference を、Repojiten v0.1 の開発者向け入口として読める内容にする。
- Frontend の初期画面と E2E smoke を、未実装のプロダクト機能に依存せず Repojiten の初期状態を確認できる内容にする。
- TypeSpec を API contract の source of truth とし、OpenAPI と frontend SDK を Repojiten 名義で生成する。
- CI を `develop` 主軸の v0.1 開発運用に合わせる。
- GitHub OAuth、Project domain、Repository 取り込み、Wiki 生成、OpenSpec Viewer、Cloudflare Queue/Workflow、AI 機能は対象外とする。

## Spec Units

### New Spec Units

- `repojiten-foundation-fe`: 新規。Repojiten の初期 frontend shell、ルーティング、表示文言、sample UI の扱い、frontend smoke/E2E の観測点を扱う。横断関心は開発者体験、回帰検知、将来機能への置き換えやすさ。
- `repojiten-foundation-be`: 新規。Repojiten の backend/API contract、package boundary、TypeSpec/OpenAPI/SDK 生成、Cloudflare local resource naming、CI/codegen guardrail を扱う。横断関心は contract drift、clean architecture boundary、開発環境の再現性。

### Modified Spec Units

- なし。Repojiten 向けの baseline Spec Unit はまだ存在しないため、この change では新規 Spec Unit として定義する。

## Naming

Scenario ID の DOMAIN prefix は `repojiten-foundation` から派生した `REPOJITEN-FOUNDATION` を使う。Frontend scenario は `REPOJITEN-FOUNDATION-FE-S###`、Backend/API/platform scenario は `REPOJITEN-FOUNDATION-BE-S###` とし、FE と BE の prefix を分ける。

## Impact

- Frontend: app shell、初期 route、表示文言、Users sample の扱い、Playwright smoke。
- Backend/API: package 名、import alias、TypeSpec namespace/service title、generated OpenAPI、generated SDK、OpenAPI contract test。
- Infrastructure: `wrangler.toml` の local resource 名、backend binding type、CI branch trigger。
- Documentation: README、CONTRIBUTING、AGENTS、CODING_STANDARDS、OpenCode reference。
- Developer workflow: `pnpm` scripts、workspace filter、ESLint boundary/import rules、codegen drift check、lint/test/check コマンド。
- Data migration: v0.1 のプロダクト schema 追加は行わないため、永続データ移行は発生しない。
