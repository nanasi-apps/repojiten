import { env as testEnv } from 'cloudflare:workers';
import { beforeAll, beforeEach } from 'vitest';

import type { Bindings } from '@repojiten/backend-types';

const env = testEnv as unknown as Bindings;

// テスト前に D1 データベースのスキーマを初期化
beforeAll(async () => {
  // users テーブルを作成
  await env.DB.prepare(
    `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    )
  `
  ).run();

  // generation_jobs テーブルを作成
  await env.DB.prepare(
    `
    CREATE TABLE IF NOT EXISTS generation_jobs (
      id TEXT PRIMARY KEY NOT NULL,
      type TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'queued',
      source TEXT NOT NULL,
      repository_id INTEGER,
      commit_sha TEXT,
      attempts INTEGER NOT NULL DEFAULT 0,
      error TEXT,
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
      started_at INTEGER,
      completed_at INTEGER
    )
  `
  ).run();

  // github_webhook_events テーブルを作成
  await env.DB.prepare(
    `
    CREATE TABLE IF NOT EXISTS github_webhook_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      delivery_id TEXT NOT NULL UNIQUE,
      event TEXT NOT NULL,
      action TEXT,
      repository_full_name TEXT,
      ref TEXT,
      commit_sha TEXT,
      enqueued_job_id TEXT,
      received_at INTEGER NOT NULL DEFAULT (unixepoch())
    )
  `
  ).run();
});

// 各テストの前にデータをクリーンアップ
beforeEach(async () => {
  await env.DB.prepare('DELETE FROM users').run();
  await env.DB.prepare('DELETE FROM generation_jobs').run();
  await env.DB.prepare('DELETE FROM github_webhook_events').run();
});
