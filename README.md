# Repojiten

Repojiten は、repository を読み込み、Wiki と OpenSpec を扱うための v0.1 開発基盤です。**Cloudflare Workers** 上で React、Hono、Drizzle ORM、TypeSpec、OpenSpec を使用したフルスタックアプリケーションとして構成されています。

## 技術スタック

### フロントエンド

- **React** 19.2.3 - React Compiler サポート付き UI ライブラリ
- **Vite** 8.0.16 - ビルドツール
- **React Router** 7.17.0 - ルーティング
- **TanStack Query** 5.101.0 - データフェッチとキャッシング
- **Radix UI / shadcn style components** - コンポーネントライブラリ
- **TypeScript** 5.9+ - 型安全性

### バックエンド

- **Hono** 4.12.25 - 高速で軽量な Web フレームワーク
- **Drizzle ORM** 0.45.2 - D1 用の型安全 ORM
- **Cloudflare Workers** - サーバーレスランタイム
- **Cloudflare D1** - SQLite データベース
- **Cloudflare KV** - キーバリューストレージ
- **Cloudflare R2** - オブジェクトストレージ

### 開発環境

- **pnpm** 11.7.0 - 高速で効率的なパッケージマネージャー
- **Node.js** 24.12.0 LTS - 開発ツール用ランタイム
- **Wrangler** 4.57.0+ - Cloudflare CLI
- **ESLint** 9.39+ - リンティング（flat config）
- **Prettier** 3.7.4 - コードフォーマット
- **Dev Containers** - 一貫した開発環境
- **Serena MCP** - セマンティックコード検索・編集（OpenCode 統合）

## プロジェクト構成

```
repojiten/
├── packages/
│   ├── typespec/                  # TypeSpec (API 契約) - OpenAPI の正
│   ├── frontend/
│   │   ├── app/                   # プレゼンテーション層 (pages/components/router) - Vite
│   │   ├── domain/                # ドメインフック層 (TanStack Query 等はここでのみ)
│   │   ├── api/                   # OpenAPI 生成 SDK + API ラッパー（React 非依存）
│   │   └── ui/                    # Radix UI / shadcn style の共有 UI パッケージ
│   └── backend/                   # Cloudflare Workers バックエンド（クリーンアーキ分割済み）
│       ├── types/                 # Bindings 等の共有型
│       ├── domain/                # エンティティ/リポジトリIF
│       ├── usecases/              # アプリケーションサービス
│       ├── http/                  # Hono ルート（インバウンドアダプタ）
│       ├── persistence/           # Drizzle などの永続化アダプタ
│       ├── app/                   # DI / 配線
│       ├── entry/                 # Workers エントリーポイント
│       └── drizzle/               # Drizzle ORM スキーマ
├── drizzle/
│   └── migrations/                # データベースマイグレーション
├── openspec/                      # OpenSpec specs / archived changes
├── tests/                         # e2e などの統合テスト（Playwright）
├── .devcontainer/                 # Dev Container 設定
├── wrangler.toml                  # Cloudflare 設定
├── drizzle.config.ts              # Drizzle Kit 設定
├── pnpm-workspace.yaml            # pnpm ワークスペース設定
└── package.json                   # ルート package.json
```

## 前提条件

- **Docker**（Dev Containers 用）
- **VS Code**（Dev Containers 拡張機能付き）

または手動セットアップの場合：

- **Node.js** 24.12.0 以降
- **pnpm** 11.7.0 以降
- **Cloudflare アカウント**（デプロイ用）

## セットアップ

### 方法 1: Dev Container を使用

1. **リポジトリをクローン:**

   ```bash
   git clone <your-repo-url>
   cd repojiten
   ```

2. **VS Code で開く:**

   ```bash
   code .
   ```

3. **コンテナで再度開く:**
   - `Cmd+Shift+P`（Mac）または `Ctrl+Shift+P`（Windows/Linux）を押す
   - "Dev Containers: Reopen in Container" を選択
   - コンテナのビルドと依存関係のインストールを待つ

   **注意:** Git 設定（`.gitconfig`）と認証情報は VS Code によって自動的に共有されます。

4. **Cloudflare リソースをセットアップ:**

   ```bash
   # D1 データベースを作成
   wrangler d1 create repojiten-db

   # KV 名前空間を作成
   wrangler kv namespace create repojiten-kv

   # R2 バケットを作成
   wrangler r2 bucket create repojiten-bucket

   # 生成ジョブ用の Queue と Dead Letter Queue を作成
   wrangler queues create repojiten-generation
   wrangler queues create repojiten-generation-dlq
   ```

   > Cloudflare Queues は Workers の有料プランが必要です。

5. **wrangler.toml を更新し、ローカル secret を用意:**
   - ステップ 4 で取得した実際の ID で `YOUR_DATABASE_ID_HERE`、`YOUR_KV_NAMESPACE_ID_HERE` を置き換える
   - `.dev.vars.example` を `.dev.vars` にコピーして secret を設定する（`.dev.vars` は gitignore 済み）:

     ```bash
     cp .dev.vars.example .dev.vars
     ```

   - 必要な値: `GITHUB_WEBHOOK_SECRET`（GitHub webhook 署名検証）、`GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET`（GitHub OAuth・#2）、`SESSION_SECRET`（session 署名・#2）、`APP_BASE_URL`

6. **マイグレーションを生成・適用:**

   ```bash
   # マイグレーションファイルを生成
   pnpm migrate:generate

   # ローカルでマイグレーションを適用
   wrangler d1 execute repojiten-db --local --file=./drizzle/migrations/<migration-file>.sql

   # 本番環境でマイグレーションを適用
   wrangler d1 execute repojiten-db-production --remote --file=./drizzle/migrations/<migration-file>.sql
   ```

7. **開発サーバーを起動:**

   ```bash
   # フロントエンドとバックエンドの両方を起動
   pnpm dev:all

   # または個別に起動:
   pnpm dev:server  # バックエンド http://localhost:8787 （@repojiten/backend-entry）
   pnpm dev:client  # フロントエンド http://localhost:5173 （@repojiten/frontend-app）
   ```

8. **アプリケーションにアクセス:**
   - フロントエンド: http://localhost:5173
   - バックエンド API: http://localhost:8787/api
   - `/users` は API、D1、form wiring を確認するための一時的な sample route です
   - Drizzle Studio: `pnpm migrate:studio`

### API SDK の再生成 (TypeSpec -> OpenAPI -> SDK)

このプロジェクトでは TypeSpec を API 契約の正（Single Source of Truth）とし、
TypeSpec から OpenAPI を生成してクライアント SDK（`packages/frontend/api`）を自動生成します。

```bash
# TypeSpec から OpenAPI を生成し、SDK を再生成
pnpm gen:api-sdk
```

個別に実行する場合：

```bash
pnpm gen:openapi
pnpm --filter @repojiten/frontend-api gen
```

### 方法 2: 手動セットアップ

**前提条件:**

- Node.js 24.12.0 以降
- Python 3.11 以降（Serena MCP 用）

1. **依存関係をインストール:**

   ```bash
   corepack enable
   pnpm install
   ```

   `pnpm-workspace.yaml` の `minimumReleaseAge: 4320` により、npm 公開から72時間未満のパッケージはインストール対象から外れます。リリース前の依存追加・更新は、少なくとも72時間前に完了してください。

2. **Wrangler をグローバルインストール:**

   ```bash
   npm install -g wrangler@4
   ```

3. **uv をインストール（任意、Python ツール導入用）:**

   ```bash
   # macOS/Linux
   curl -LsSf https://astral.sh/uv/install.sh | sh

   # Windows
   powershell -c "irm https://astral.sh/uv/install.ps1 | iex"
   ```

4. **OpenCode CLI をインストール（オプション、AI 支援開発用）:**

   ```bash
   npm install -g opencode-ai@latest
   ```

5. 方法 1 のステップ 4-8 に従ってください。

**注意:** Dev Container には、これらすべてのツールがプリインストールされています（Node.js 24、Python 3、pnpm、Wrangler、uv、OpenCode CLI、OpenSpec CLI）。

### OpenCode + OpenSpec セットアップ

AI 支援開発に OpenCode と OpenSpec を使用する場合：

1. **OpenCode を設定:**

   ```bash
   opencode auth
   ```

2. **OpenSpec を初期化:**

   ```bash
   openspec init
   ```

3. **OpenCode 内でスラッシュコマンドを使用:**
   - `/opsx-onboard` - OpenSpec の一連フローをオンボード
   - `/opsx-new <name>` - change を作成（段階的に artifact を作る）
   - `/opsx-ff <name>` - artifact を一括生成（実装開始可能まで）
   - `/opsx-continue <name>` - artifact 作成を継続
   - `/opsx-apply <name>` - tasks に沿って実装
   - `/opsx-verify <name>` - 実装と artifacts の整合を確認
   - `/opsx-sync <name>` - delta specs を main specs に同期
   - `/opsx-archive <name>` - 完了した change を archive
   - `/opsx-explore <topic>` - 実装せずに調査・検討

## 開発ワークフロー

### 開発サーバーの起動

Repojiten は Vite のプロキシを使用して、フロントエンドからの `/api` リクエストを Workers 開発サーバーに転送します。

```bash
# ターミナル 1: Workers バックエンドを起動
pnpm dev:server

# ターミナル 2: React フロントエンドを起動
pnpm dev:client

# または両方を同時に起動
pnpm dev:all
```

### Workers Email のローカル検証

`pnpm dev:server` で Wrangler を起動している状態で、`POST /api/v1/users` を叩くと
`env.EMAIL.send()` が呼ばれ、Wrangler がローカルに `.eml` ファイルを出力します。

1. `wrangler.toml` の `EMAIL_FROM` と `EMAIL_TO` を開発用の値に更新
2. サーバーを起動

   ```bash
   pnpm dev:server
   ```

3. 別ターミナルでユーザー作成 API を実行

   ```bash
   curl --request POST 'http://localhost:8787/api/v1/users' \
     --header 'Content-Type: application/json' \
     --data '{"name":"Email Test User","email":"email-test@example.com"}'
   ```

4. `pnpm dev:server` 側のログに出る `.eml` ファイルパスを確認

本番で送信を有効化する場合は Cloudflare Email Routing を有効化し、`EMAIL_FROM` と `EMAIL_TO`
を運用値に変更してください。

### 利用可能なスクリプト

| スクリプト               | 説明                                        |
| ------------------------ | ------------------------------------------- |
| `pnpm dev:client`        | Vite 開発サーバーを起動（フロントエンド）   |
| `pnpm dev:server`        | Wrangler 開発サーバーを起動（バックエンド） |
| `pnpm dev:all`           | 両方のサーバーを同時に起動                  |
| `pnpm build`             | フロントエンドとバックエンドの両方をビルド  |
| `pnpm check`             | TypeScript 型チェックを実行                 |
| `pnpm lint`              | ESLint ですべてのファイルをリント           |
| `pnpm lint:supply-chain` | pnpm のサプライチェーン防御設定を検証       |
| `pnpm format`            | Prettier でコードをフォーマット             |
| `pnpm migrate:generate`  | Drizzle マイグレーションを生成              |
| `pnpm migrate:studio`    | Drizzle Studio を開く                       |
| `pnpm deploy`            | Cloudflare Workers にデプロイ               |

### データベースマイグレーション

Repojiten は、データベースマイグレーションに Drizzle Kit を使用します。

1. **スキーマを変更:**
   - `packages/backend/drizzle/src/schema.ts` を編集

2. **マイグレーションを生成:**

   ```bash
   pnpm migrate:generate
   ```

3. **ローカルでマイグレーションを適用:**

   ```bash
   wrangler d1 execute repojiten-db --local --file=./drizzle/migrations/<file>.sql
   ```

4. **本番環境でマイグレーションを適用:**

   ```bash
   wrangler d1 execute repojiten-db-production --remote --file=./drizzle/migrations/<file>.sql
   ```

5. **Drizzle Studio でデータベースを表示:**

   ```bash
   pnpm migrate:studio
   ```

## API エンドポイント

### Hello

- `GET /api/v1/hello` - シンプルなヘルスチェック

### Users（sample）

- `GET /api/v1/users` - sample user を一覧表示
- `POST /api/v1/users` - sample user を作成
- `GET /api/v1/users/:id` - ID で sample user を取得

詳細な API 仕様は `packages/typespec/openapi/openapi.json` を参照してください。

## デプロイ

### Cloudflare Workers にデプロイ

API と SPA は **1 つの Worker** で配信します。`pnpm build` で frontend を
`packages/frontend/app/dist` にビルドし、`wrangler deploy` が Worker と
static assets（`[assets]` 設定）をまとめてアップロードします。`/api` と
`/webhooks` 以外の未マッチ request は SPA の `index.html` にフォールバックします。

1. **Cloudflare にログイン:**

   ```bash
   wrangler login
   ```

2. **アプリケーションをビルド:**

   ```bash
   pnpm build
   ```

3. **依存関係のリリース猶予を確認:**

   ```bash
   pnpm lint:supply-chain
   ```

   依存追加・更新を含むリリースでは、対象パッケージの npm 公開から72時間以上経過していることを確認してください。

4. **secret を設定:**

   ```bash
   wrangler secret put GITHUB_WEBHOOK_SECRET
   # GitHub OAuth / session（#2 で利用）
   wrangler secret put GITHUB_CLIENT_SECRET
   wrangler secret put SESSION_SECRET
   ```

5. **デフォルト環境へデプロイ:**

   ```bash
   pnpm deploy
   ```

6. **GitHub webhook を設定:**
   - GitHub repository の Webhooks に `https://<your-worker-domain>/webhooks/github` を追加
   - Content type は `application/json`、Secret は `GITHUB_WEBHOOK_SECRET` と同じ値
   - `develop` への push を受けると再生成ジョブが Queue に enqueue されます

7. **本番環境リソースをセットアップ:**
   - 本番環境の D1 データベース、KV 名前空間、R2 バケット、Queue（`repojiten-generation-production` と DLQ）を作成
   - `wrangler.toml` の `[env.production]` セクションを更新
   - 本番環境データベースにマイグレーションを適用
   - `wrangler secret put <NAME> --env production` で production の secret を設定

8. **production 環境へデプロイする場合:**

   ```bash
   pnpm build
   wrangler deploy --env production
   ```

### 環境変数と secret

非 secret の値（`EMAIL_FROM` / `EMAIL_TO` / `APP_BASE_URL` / `GITHUB_CLIENT_ID`）は
`wrangler.toml` の `[vars]` に置きます。secret は repository に commit せず、ローカルでは
`.dev.vars`（`.dev.vars.example` を参照）、本番では Wrangler の secret として設定します：

```bash
wrangler secret put GITHUB_WEBHOOK_SECRET
wrangler secret put GITHUB_CLIENT_SECRET
wrangler secret put SESSION_SECRET
# メール送信値を secret として扱う場合
wrangler secret put EMAIL_FROM
wrangler secret put EMAIL_TO
```

## OpenSpec による仕様駆動開発

このプロジェクトには、OpenSpec の運用をサポートするディレクトリ構造が含まれています。

### OpenSpec とは

OpenSpec は仕様駆動開発（Spec-Driven Development）のためのワークフローです。change（変更単位）に proposal/specs/design/tasks を揃え、AI コーディングアシスタントと協力して、要件定義から実装まで段階的に進めます。

### 基本の開発プロセス

1. **Proposal**: 目的/非ゴール/成功条件を固める
2. **Specs**: 仕様（要求・受け入れ条件）を文書化する
3. **Design**: 実装方針・設計を固める
4. **Tasks**: 実装可能なタスクに分解する
5. **Apply**: tasks に沿って実装する

### プロジェクトの初期化

```bash
openspec init
```

### スラッシュコマンド

OpenCode で以下のコマンドが使えます：

- **`/opsx-new <name>`** - change を作成して artifact 作成を開始
- **`/opsx-continue <name>`** - 次の artifact を作成
- **`/opsx-apply <name>`** - tasks に沿って実装
- **`/opsx-archive <name>`** - change を archive

### 使用例

```
# OpenCode 内で実行
/opsx-new add-user-auth
/opsx-continue add-user-auth
/opsx-apply add-user-auth
```

## Serena MCP - セマンティックコード検索

このプロジェクトには、OpenCode と統合できる Serena MCP Server が設定されています。Serena は Language Server Protocol (LSP) を使用して、IDE 並みのコード理解機能を提供します。

### 機能

- **セマンティック検索**: シンボルレベルでのコード検索
- **定義へのジャンプ**: "Go to Definition" 機能
- **参照の検索**: "Find All References" 機能
- **インテリジェント編集**: コンテキストを理解したコード編集
- **メモリ管理**: コードベースのコンテキストを保持

### 使用方法

OpenCode などから以下のように使用できます：

```bash
# プロジェクトをアクティベート（初回のみ）
"Activate the current dir as project using serena"

# セマンティック検索
"Find all references to the User type using serena"
"Show me the definition of apiClient using serena"
"Find all usages of the createUser function using serena"
```

### Web ダッシュボード

Serena のダッシュボードにアクセスして、ログやプロジェクト情報を確認できます：

```
http://localhost:24282/dashboard
```

### 設定ファイル

- **`.serena/project.yml`**: プロジェクト固有の設定

### セキュリティ

デフォルトでは `read_only: true` に設定されており、ファイルの読み取りのみが可能です。ファイル編集機能を有効にする場合は、`.serena/project.yml` で `read_only: false` に変更してください。

詳細については、https://github.com/oraios/serena を参照してください。

## カスタマイズ

### 共有 UI のカスタマイズ

共有 UI は `packages/frontend/ui` に配置しています。

- `packages/frontend/ui/src/components/ui/`: Radix UI / shadcn style の UI primitive
- `packages/frontend/ui/src/styles/globals.css`: Tailwind CSS の global styles と theme token
- `packages/frontend/ui/src/lib/utils.ts`: class name composition などの UI helper

色や spacing などの基本 token を変える場合は `globals.css` を更新し、component primitive を追加する場合は `components/ui/` に配置してください。

### 新しいルートの追加

1. `packages/frontend/app/src/pages/` にページコンポーネントを作成
2. `packages/frontend/app/src/router.tsx` にルートを追加

### 新しい API ルートの追加

1. `packages/backend/http/src/routes/` にルートハンドラーを作成
2. `packages/backend/http/src/routes/index.ts` にルートを登録

## コード品質

このプロジェクトには、一貫したコード標準を維持するための自動コード品質ツールが含まれています。

### Git フック

Git フックは Husky を介して自動的に設定されます：

- **pre-commit**: ステージされたファイルに lint-staged を実行
- **commit-msg**: コミットメッセージ形式を検証

### Lint-Staged

コミット用にステージされたファイルのみをリント・フォーマット：

```bash
# pre-commit で自動実行
pnpm lint-staged
```

`.lintstagedrc.json` の設定：

- TypeScript/JavaScript ファイル: ESLint 修正 + Prettier フォーマット
- JSON/Markdown ファイル: Prettier フォーマット

### コミットメッセージ規約

このプロジェクトは [Conventional Commits](https://www.conventionalcommits.org/) を使用：

```bash
# 有効なコミットメッセージ形式
feat: 新機能を追加
fix: ユーザー認証のバグを修正
docs: セットアップ手順で README を更新
style: prettier でコードをフォーマット
refactor: API ルートを再構築
perf: データベースクエリを最適化
test: ユーザーサービスのユニットテストを追加
build: 依存関係を更新
ci: GitHub Actions を設定
chore: .gitignore を更新
revert: 前回のコミットを取り消す
```

**無効なコミットは commit-msg フックによって拒否されます。**

### 手動品質チェック

必要に応じて手動でこれらのコマンドを実行：

```bash
# すべてのファイルをリント
pnpm lint

# すべてのファイルをフォーマット
pnpm format

# 変更なしでフォーマットをチェック
pnpm format:check

# すべてのパッケージの型チェック
pnpm check
```

## トラブルシューティング

### Dev Container の問題

- **ポートが使用中:** ポート 5173 または 8787 を使用しているローカルサーバーを停止
- **Permission denied:** Docker に適切な権限があることを確認

### Wrangler の問題

- **Database not found:** `wrangler d1 create` を実行してデータベースを作成
- **Bindings error:** `wrangler.toml` に正しいバインディング ID があることを確認

### 型エラー

すべてのパッケージの型チェックを実行：

```bash
pnpm check
```

## コントリビュート

詳細は `CONTRIBUTING.md` を参照してください（ブランチ運用、チェック項目、SDK 再生成手順など）。コーディング規則は `CODING_STANDARDS.md` にまとめています。

## リソース

- [Cloudflare Workers ドキュメント](https://developers.cloudflare.com/workers/)
- [Hono ドキュメント](https://hono.dev/)
- [Drizzle ORM ドキュメント](https://orm.drizzle.team/)
- [React ドキュメント](https://react.dev/)
- [Radix UI ドキュメント](https://www.radix-ui.com/)
- [TanStack Query ドキュメント](https://tanstack.com/query/latest)
- [OpenSpec](https://github.com/fission-ai/openspec)
