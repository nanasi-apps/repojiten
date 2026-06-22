# repojiten-foundation-be Specification

## Purpose

TBD - created by archiving change repojiten-initial-setup. Update Purpose after archive.

## Requirements

### Requirement: Repojiten API contract identity

API contract は、source と generated artifacts の両方で service を Repojiten API として識別しなければならない (SHALL)。

**Customer Context**

Repojiten の backend/API contract は、TypeSpec、generated OpenAPI、frontend SDK、contract test が同じ API を指している必要がある。contract の表示名や生成物の名前が揃っていないと、実装者はどの artifact を信頼すべきか判断しづらい。

**Requirement**

TypeSpec は public HTTP API contract の source of truth でなければならない (SHALL)。

TypeSpec service title、generated OpenAPI document、generated frontend SDK header、OpenAPI contract test は、service を `Repojiten API` として識別しなければならない (SHALL)。

generated OpenAPI document と frontend SDK は、repository の codegen command から uncommitted drift なしで再現できなければならない (MUST)。

#### Scenario: API contract が Repojiten を識別できる (REPOJITEN-FOUNDATION-BE-S001)

- **GIVEN** API contract artifacts が生成されている
- **WHEN** OpenAPI contract test が served document を読む
- **THEN** API title は `Repojiten API` である
- **AND** generated SDK header も同じ API を識別する

#### Scenario: codegen に drift がない (REPOJITEN-FOUNDATION-BE-S002)

Tags: manual

- **GIVEN** dependencies が install されている
- **WHEN** codegen drift check が実行される
- **THEN** OpenAPI document と generated frontend SDK は committed source of truth と一致する

### Requirement: Backend package boundary

backend packages は、Repojiten aliases と clean architecture boundaries を保たなければならない (SHALL)。

**Customer Context**

Repojiten の backend は Cloudflare Workers、Hono、Drizzle、domain/usecase/persistence/http/app/entry packages を分離している。package 名と import alias が製品名義で統一され、dependency boundary が lint で守られることで、後続の認証、Project、Repository、Wiki 機能を同じ構造で追加できる。

**Requirement**

backend package 名と TypeScript import alias は `@repojiten/backend-*` namespace を使わなければならない (SHALL)。

backend dependency direction は `backend/entry -> backend/app -> (backend/http | backend/persistence | backend/usecases) -> backend/domain -> backend/types` を維持しなければならない (MUST)。

backend domain と usecase packages は、Cloudflare Workers、Hono、Drizzle runtime adapters、frontend packages、generated frontend SDK modules に依存してはならない (MUST NOT)。

lint boundary messages は、developer が使うべき Repojiten aliases を示さなければならない (SHALL)。

#### Scenario: backend aliases が Repojiten package names で解決できる (REPOJITEN-FOUNDATION-BE-S003)

Tags: manual

- **GIVEN** backend packages が install されている
- **WHEN** TypeScript type checking が実行される
- **THEN** `@repojiten/backend-*` 経由の imports が正常に解決される
- **AND** backend source import は product-independent template namespace に依存しない

#### Scenario: backend boundary violations が拒否される (REPOJITEN-FOUNDATION-BE-S004)

Tags: manual

- **GIVEN** backend domain または usecase source file が adapter-only dependency を import している
- **WHEN** lint が実行される
- **THEN** boundary check が Repojiten alias guidance 付きで dependency violation を報告する

### Requirement: Cloudflare development resource naming

Cloudflare development resources は、Repojiten resource naming を使わなければならない (SHALL)。

**Customer Context**

Repojiten の開発者は Wrangler local 環境を短時間で起動し、D1/R2/KV binding がどの project に属するかを設定から判断したい。Cloudflare resource 名が Repojiten 名義で揃っていれば、local setup と production setup の説明を同じ前提で運用できる。

**Requirement**

Cloudflare Worker、D1 database、R2 bucket、KV namespace names は `repojiten` prefix を使わなければならない (SHALL)。

environment-specific Cloudflare resource names は、environment suffix または environment-specific binding configuration によって区別できなければならない (MUST)。

backend binding types は、Worker runtime configuration が要求する bindings を公開しなければならない (SHALL)。

#### Scenario: Wrangler resources が Repojiten names を使う (REPOJITEN-FOUNDATION-BE-S005)

Tags: manual

- **GIVEN** Wrangler configuration が読み込まれている
- **WHEN** developer が Worker、D1、R2、KV configuration を確認する
- **THEN** each configured resource name は `repojiten` prefix を使う
- **AND** production resources は local/default resources と区別できる

### Requirement: Development workflow guardrails

development workflow guardrails は、Repojiten scripts、docs、CI、codegen checks を整合させなければならない (MUST)。

**Customer Context**

Repojiten v0.1 の複数 Issue を並行して進めるには、README、package scripts、CI、OpenSpec checks が同じ command set を示す必要がある。開発者が local と CI で異なる検証を実行すると、contract drift や spec/test 紐づけ漏れが検出されにくくなる。

**Requirement**

repository scripts は、client/server dev、build、lint、TypeScript check、tests、TypeSpec/OpenAPI/SDK generation、codegen drift check、migration generation/application、deploy の標準 local commands を提供しなければならない (SHALL)。

CI は pull requests と `develop` / `main` への push で実行されなければならない (MUST)。

CI は formatting、OpenSpec scenario coverage を含む lint、TypeScript checks、unit/integration tests、codegen drift を検証しなければならない (SHALL)。

developer documentation は、Repojiten v0.1 scope、monorepo layout、Cloudflare local setup、TypeSpec codegen workflow、OpenSpec workflow、validation commands を説明しなければならない (MUST)。

#### Scenario: CI が develop と main branches を保護する (REPOJITEN-FOUNDATION-BE-S006)

Tags: manual

- **GIVEN** pull request または branch push が GitHub Actions で評価される
- **WHEN** workflow trigger と job steps を確認する
- **THEN** pull requests と `develop` / `main` への pushes が cover されている
- **AND** standard validation commands が workflow に含まれている

#### Scenario: documentation が Repojiten commands と一致する (REPOJITEN-FOUNDATION-BE-S007)

Tags: manual

- **GIVEN** developer が repository documentation を読む
- **WHEN** documented setup と validation command names に従う
- **THEN** commands は Repojiten package names と resource names に対応している
- **AND** OpenSpec scenario/test linkage が document されている
