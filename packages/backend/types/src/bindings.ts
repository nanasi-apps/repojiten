import type {
  D1Database,
  Fetcher,
  KVNamespace,
  Queue,
  R2Bucket,
  SendEmail,
} from '@cloudflare/workers-types';

/** Cloudflare bindings consumed by the worker. */
export interface Bindings {
  DB: D1Database;
  KV: KVNamespace;
  R2: R2Bucket;
  EMAIL: SendEmail;
  /** Queue producer for asynchronous generation jobs. */
  GENERATION_QUEUE: Queue;
  /** Static asset fetcher used to serve the SPA build output. */
  ASSETS: Fetcher;
  EMAIL_FROM?: string;
  EMAIL_TO?: string;
  /** GitHub OAuth app client id (#2 authentication). */
  GITHUB_CLIENT_ID?: string;
  /** GitHub OAuth app client secret (secret). */
  GITHUB_CLIENT_SECRET?: string;
  /** Shared secret used to verify GitHub webhook signatures (secret). */
  GITHUB_WEBHOOK_SECRET?: string;
  /** Secret used to sign and verify user sessions (secret). */
  SESSION_SECRET?: string;
  /** Public base URL of the deployed Repojiten app. */
  APP_BASE_URL?: string;
}
