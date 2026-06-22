# repojiten-foundation-fe Specification

## Purpose

TBD - created by archiving change repojiten-initial-setup. Update Purpose after archive.

## Requirements

### Requirement: Repojiten application shell

frontend は、Repojiten を識別できる初期 app shell を提供しなければならない (SHALL)。

**Customer Context**

Repojiten の開発者は、最初に起動した frontend がどの製品の入口なのか、v0.1 で確認できる画面がどれなのかを迷わず判断したい。初期画面や navigation が sample 機能中心に見えると、以後の認証、Project、Repository、Wiki、OpenSpec Viewer の実装で UI の起点が不明確になる。

**Requirement**

frontend は document title、app shell、primary initial route で製品名を Repojiten として識別できなければならない (SHALL)。

root route は、認証や seeded business data なしで smoke test できる安定した v0.1 entry screen を表示しなければならない (SHALL)。

product 機能ではない sample screen は、primary Repojiten entrypoint と視覚上・navigation 上で区別できなければならない (MUST)。

#### Scenario: root route が Repojiten を識別できる (REPOJITEN-FOUNDATION-FE-S001)

- **GIVEN** frontend dev server が起動している
- **WHEN** user が `/` を開く
- **THEN** document title と visible app shell が Repojiten を示す
- **AND** 認証なしで page を利用できる

#### Scenario: sample UI が primary product entrypoint ではない (REPOJITEN-FOUNDATION-FE-S002)

- **GIVEN** frontend が sample screen を公開している
- **WHEN** user がその screen に到達する
- **THEN** screen は primary Repojiten entrypoint と区別できる
- **AND** primary navigation は sample を v0.1 product capability として提示しない

### Requirement: Frontend dependency boundary

frontend packages は、Repojiten alias と dependency boundary を保たなければならない (SHALL)。

**Customer Context**

Repojiten の frontend は、アプリ画面、domain hook、API client、shared UI を分けて開発する。依存方向が曖昧になると、generated SDK や low-level API 呼び出しが app layer に広がり、後続機能でテストや置き換えが難しくなる。

**Requirement**

frontend package 名と TypeScript import alias は `@repojiten/frontend-*` namespace を使わなければならない (SHALL)。

frontend dependency direction は `frontend/app -> frontend/domain -> frontend/api` を維持し、`frontend/app` から `frontend/ui` の利用も許可する (MUST)。

app layer は server communication のために `frontend/api` を直接 import してはならない (MUST NOT)。

shared UI の internal import は、component export が package boundary を意識できるよう Repojiten frontend UI alias を使わなければならない (SHALL)。

#### Scenario: frontend aliases が Repojiten package names で解決できる (REPOJITEN-FOUNDATION-FE-S003)

Tags: manual

- **GIVEN** frontend packages が install されている
- **WHEN** TypeScript type checking が実行される
- **THEN** `@repojiten/frontend-*` 経由の imports が正常に解決される
- **AND** frontend source import は product-independent template namespace に依存しない

#### Scenario: app layer が domain hooks を迂回して API call できない (REPOJITEN-FOUNDATION-FE-S004)

Tags: manual

- **GIVEN** frontend app source file が generated API package を直接 import している
- **WHEN** lint が実行される
- **THEN** import boundary check が direct API dependency を報告する

### Requirement: Frontend smoke verification

frontend verification には、安定した root-route smoke test を含めなければならない (MUST)。

**Customer Context**

Repojiten v0.1 の初期開発では、未実装の product flow に依存しない最小の E2E が必要になる。root route と app shell の smoke が安定していれば、CI とローカル環境で frontend が起動できることを早く検知できる。

**Requirement**

frontend E2E smoke test は primary Repojiten initial route を検証しなければならない (SHALL)。

この requirement を cover する automated frontend tests は、test title に related Scenario ID を含めなければならない (MUST)。

frontend component tests は、sample screen が意図的に公開されている場合に限って sample screen coverage を維持しなければならない (SHALL)。

#### Scenario: E2E smoke が initial route を cover する (REPOJITEN-FOUNDATION-FE-S005)

- **GIVEN** client と server の dev processes が Playwright から利用できる
- **WHEN** E2E smoke test が `/` を開く
- **THEN** test は Repojiten app shell を観測する
- **AND** test title は `[REPOJITEN-FOUNDATION-FE-S005]` を参照する
