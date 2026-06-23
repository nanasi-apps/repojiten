# repojiten-hosting-be Specification

## Purpose

TBD - created by archiving change repojiten-cloudflare-hosting. Update Purpose after archive.

## Requirements

### Requirement: Cloudflare hosting configuration

Repojiten は、単一の Worker deploy で API と SPA を Cloudflare 上に配信できる構成を持たなければならない (SHALL)。

**Customer Context**

Repojiten v0.1 は Cloudflare 上にホストできることを完了条件に含む。frontend と API が別々の deploy 手順に分かれると、開発者が production を再現するのが難しくなる。Wrangler configuration が Repojiten 名義の resource と single-deploy 構成を示していれば、local と production の前提を揃えられる。

**Requirement**

Wrangler configuration は、D1、KV、R2、generation queue、static assets binding を Repojiten 名義で定義しなければならない (SHALL)。

default と production environment は、それぞれ独立した resource 名(environment suffix を含む)で binding を定義しなければならない (MUST)。

Worker は、static assets で SPA を配信し、未マッチの非 API・非 webhook request を SPA entry にフォールバックしなければならない (SHALL)。

#### Scenario: Wrangler が Repojiten hosting resources を定義する (REPOJITEN-HOSTING-BE-S001)

Tags: manual

- **GIVEN** Wrangler configuration が読み込まれている
- **WHEN** developer が default と production の bindings を確認する
- **THEN** D1・KV・R2・generation queue・assets binding が Repojiten 名義で定義されている
- **AND** production resource 名は default resource と区別できる

#### Scenario: 単一 deploy で API と SPA を配信する (REPOJITEN-HOSTING-BE-S002)

Tags: manual

- **GIVEN** frontend build 出力が存在する
- **WHEN** `pnpm build` と `wrangler deploy` を実行する
- **THEN** 1 つの Worker が API・webhook・SPA assets を配信する
- **AND** client-side route は SPA entry にフォールバックする

### Requirement: Persistent data model

Repojiten は、v0.1 の foundation entities を D1 schema と migration で表現しなければならない (SHALL)。

**Customer Context**

認証、Project、Repository、Wiki、OpenSpec viewer、生成ジョブはいずれも永続データを必要とする。foundation の段階で D1 schema と migration を用意しておくことで、後続 Issue (#2/#3/#7/#8) が同じ data model を前提に実装を進められる。

**Requirement**

Drizzle schema は、users、user identities、sessions、projects、project members、project repositories、repository snapshots、wiki pages、wiki page sources、openspec specs、openspec scenarios、generation jobs、github webhook events を定義しなければならない (SHALL)。

repository は、これらの table を作成する D1 migration を生成・適用できなければならない (MUST)。

#### Scenario: D1 migration が foundation tables を作成する (REPOJITEN-HOSTING-BE-S003)

Tags: manual

- **GIVEN** Drizzle schema が定義されている
- **WHEN** `pnpm migrate:generate` を実行し migration を local/remote D1 に適用する
- **THEN** foundation tables が作成される
- **AND** generation jobs と github webhook events を含む

### Requirement: Asynchronous generation jobs

Repojiten は、生成処理を非同期ジョブとして enqueue し、その状態を D1 に記録しなければならない (SHALL)。

**Customer Context**

Repository 読み込みと Wiki 生成は同期 request に閉じ込められない。生成ジョブを queue に投げ、状態を D1 に記録できれば、失敗時の再実行余地を残しつつ、frontend や運用者が進行状況を参照できる。

**Requirement**

generation job の enqueue は、`queued` 状態のジョブを D1 に永続化し、queue にメッセージを送信しなければならない (SHALL)。

queue consumer は、dequeue したジョブを `running` に遷移させ、成功時は `succeeded`、失敗時は `failed` と失敗理由を D1 に記録しなければならない (SHALL)。

失敗したジョブ処理は、consumer が再試行できるよう error を伝播しなければならない (MUST)。

#### Scenario: enqueue が queued ジョブと queue メッセージを生成する (REPOJITEN-HOSTING-BE-S004)

- **GIVEN** generation job repository と queue が利用できる
- **WHEN** generation job を enqueue する
- **THEN** D1 に `queued` 状態のジョブが記録される
- **AND** queue にジョブメッセージが送信される

#### Scenario: 処理成功が succeeded 状態を記録する (REPOJITEN-HOSTING-BE-S005)

- **GIVEN** queued なジョブが存在する
- **WHEN** queue consumer がジョブを処理する
- **THEN** ジョブ状態は `succeeded` に遷移する
- **AND** terminal 状態が D1 から参照できる

#### Scenario: 処理失敗が failed 状態を記録し再試行に伝播する (REPOJITEN-HOSTING-BE-S006)

- **GIVEN** queued なジョブが存在する
- **WHEN** ジョブ処理が error を投げる
- **THEN** ジョブ状態は `failed` になり error が記録される
- **AND** error は consumer の再試行のため伝播される

### Requirement: GitHub webhook intake

Repojiten は、署名検証済みの GitHub webhook を受け取り、develop 更新で再生成ジョブを起動しなければならない (SHALL)。

**Customer Context**

#8 の develop 更新検知は Cloudflare 上の endpoint で webhook を受ける必要がある。署名検証で送信元を確認し、develop への push を検知して再生成ジョブを enqueue できれば、Wiki を最新の develop に追従させる土台になる。

**Requirement**

webhook endpoint は、`x-hub-signature-256` を webhook secret で検証し、署名が不正な request を拒否しなければならない (MUST)。

検証済みの webhook delivery は、監査のため D1 に記録されなければならない (SHALL)。

検証済みの `develop` への push は、再生成ジョブを enqueue しなければならない (SHALL)。

`develop` push 以外の検証済み delivery は、ジョブを enqueue せずに受理されなければならない (MUST)。

#### Scenario: 不正署名の webhook を拒否する (REPOJITEN-HOSTING-BE-S007)

- **GIVEN** webhook endpoint が secret で設定されている
- **WHEN** 不正な署名を持つ webhook を受け取る
- **THEN** request は 401 で拒否される
- **AND** ジョブの enqueue も delivery の記録も行われない

#### Scenario: develop push が delivery を記録しジョブを enqueue する (REPOJITEN-HOSTING-BE-S008)

- **GIVEN** webhook endpoint が secret で設定されている
- **WHEN** `refs/heads/develop` への検証済み push を受け取る
- **THEN** delivery が D1 に記録される
- **AND** 再生成ジョブが enqueue される

#### Scenario: develop 以外の delivery を enqueue せず受理する (REPOJITEN-HOSTING-BE-S009)

- **GIVEN** webhook endpoint が secret で設定されている
- **WHEN** develop 以外への検証済み push を受け取る
- **THEN** request は受理され delivery が記録される
- **AND** ジョブは enqueue されない

### Requirement: Artifact object storage

Repojiten は、生成 artifact を Repojiten R2 key scheme で保存・取得できなければならない (SHALL)。

**Customer Context**

Repository snapshot、Wiki 本文、解析中間生成物は R2 に保存する。object key の設計が決まっていれば、後続の生成処理が project・repository・commit ごとに artifact を一貫した場所へ書き込み・読み出しできる。

**Requirement**

artifact object key は、project・repository・commit・artifact 種別を含む Repojiten R2 scheme に従わなければならない (SHALL)。

artifact store は、object を put・get・delete できなければならない (SHALL)。

#### Scenario: object key が Repojiten R2 scheme に従う (REPOJITEN-HOSTING-BE-S010)

- **GIVEN** repository artifact reference が与えられている
- **WHEN** snapshot/wiki の object key を生成する
- **THEN** key は `projects/{projectId}/repositories/{repositoryId}/...` scheme に従う

#### Scenario: artifact store が put した object を取得できる (REPOJITEN-HOSTING-BE-S011)

- **GIVEN** R2 binding が利用できる
- **WHEN** artifact を put して同じ key で get する
- **THEN** 保存した body が取得できる
- **AND** delete 後は取得できない

### Requirement: Secrets and environment configuration

Repojiten は、認証・webhook・session に必要な secret と環境変数を local/production 向けに整理しなければならない (SHALL)。

**Customer Context**

GitHub OAuth、webhook 署名検証、session には secret が必要になる。secret を code や migration に含めず、local dev の例と production の設定手順を分けて document しておくことで、複数メンバーが安全に環境を再現できる。

**Requirement**

required secrets (`GITHUB_CLIENT_SECRET`、`GITHUB_WEBHOOK_SECRET`、`SESSION_SECRET`) と環境変数 (`GITHUB_CLIENT_ID`、`APP_BASE_URL`) は、local dev の例と production の設定手順として document されなければならない (SHALL)。

secrets は、repository の code・configuration・migration に commit されてはならない (MUST NOT)。

#### Scenario: secrets と環境変数が document されている (REPOJITEN-HOSTING-BE-S012)

Tags: manual

- **GIVEN** developer が repository documentation を読む
- **WHEN** local dev と production の環境設定手順を確認する
- **THEN** required secrets と環境変数が説明されている
- **AND** secret 値は repository に commit されていない
