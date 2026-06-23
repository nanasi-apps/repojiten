import { OpenAPIHono } from '@hono/zod-openapi';
import { env as testEnv } from 'cloudflare:workers';
import { describe, expect, it, vi } from 'vitest';

import type { GenerationJobMessage, GenerationJobQueue } from '@repojiten/backend-domain';
import { registerGithubWebhookRoutes, type AppVariables } from '@repojiten/backend-http';
import {
  createDrizzleClient,
  DrizzleGenerationJobRepository,
  DrizzleGithubWebhookEventRepository,
} from '@repojiten/backend-persistence';
import type { Bindings } from '@repojiten/backend-types';
import {
  EnqueueGenerationJob,
  HandleGithubWebhook,
  type GithubWebhookUseCases,
} from '@repojiten/backend-usecases';

const env = testEnv as unknown as Bindings;
const WEBHOOK_SECRET = 'test-secret';

const signBody = async (secret: string, body: string): Promise<string> => {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(body));
  const hex = Array.from(new Uint8Array(signature), (byte) =>
    byte.toString(16).padStart(2, '0')
  ).join('');

  return `sha256=${hex}`;
};

const buildApp = (queue: GenerationJobQueue) => {
  const drizzle = createDrizzleClient(env.DB);
  const enqueueGenerationJob = new EnqueueGenerationJob(
    new DrizzleGenerationJobRepository(drizzle),
    queue
  );
  const useCases: GithubWebhookUseCases = {
    handleGithubWebhook: new HandleGithubWebhook(
      WEBHOOK_SECRET,
      new DrizzleGithubWebhookEventRepository(drizzle),
      enqueueGenerationJob
    ),
  };

  const app = new OpenAPIHono<{ Bindings: Bindings; Variables: AppVariables }>();
  app.use('*', async (c, next) => {
    c.set('githubWebhookUseCases', useCases);
    await next();
  });
  registerGithubWebhookRoutes(app);

  return app;
};

const countWebhookEvents = async (): Promise<number> => {
  const result = await env.DB.prepare('SELECT COUNT(*) AS count FROM github_webhook_events').first<{
    count: number;
  }>();

  return result?.count ?? 0;
};

const webhookRequest = (body: string, headers: Record<string, string>): Request =>
  new Request('http://localhost/webhooks/github', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body,
  });

describe('GitHub webhook intake', () => {
  it('[REPOJITEN-HOSTING-BE-S007] rejects an invalid signature without enqueuing or recording', async () => {
    const enqueue = vi.fn(async (_message: GenerationJobMessage): Promise<void> => {
      return;
    });
    const app = buildApp({ enqueue: (message) => enqueue(message) });
    const body = JSON.stringify({
      ref: 'refs/heads/develop',
      after: 'sha',
      repository: { full_name: 'octo/repo' },
    });

    const response = await app.fetch(
      webhookRequest(body, {
        'x-github-event': 'push',
        'x-github-delivery': 'delivery-1',
        'x-hub-signature-256': 'sha256=deadbeef',
      }),
      env
    );

    expect(response.status).toBe(401);
    expect(enqueue).not.toHaveBeenCalled();
    expect(await countWebhookEvents()).toBe(0);
  });

  it('[REPOJITEN-HOSTING-BE-S008] records a verified develop push and enqueues regeneration', async () => {
    const enqueue = vi.fn(async (_message: GenerationJobMessage): Promise<void> => {
      return;
    });
    const app = buildApp({ enqueue: (message) => enqueue(message) });
    const body = JSON.stringify({
      ref: 'refs/heads/develop',
      after: 'commit-sha',
      repository: { full_name: 'octo/repo' },
    });
    const signature = await signBody(WEBHOOK_SECRET, body);

    const response = await app.fetch(
      webhookRequest(body, {
        'x-github-event': 'push',
        'x-github-delivery': 'delivery-2',
        'x-hub-signature-256': signature,
      }),
      env
    );

    expect(response.status).toBe(202);
    const payload = await response.json<{ status: string; jobId?: string }>();
    expect(payload.status).toBe('enqueued');
    expect(payload.jobId).toBeDefined();
    expect(enqueue).toHaveBeenCalledOnce();
    expect(await countWebhookEvents()).toBe(1);
  });

  it('[REPOJITEN-HOSTING-BE-S009] acknowledges a verified non-develop push without enqueuing', async () => {
    const enqueue = vi.fn(async (_message: GenerationJobMessage): Promise<void> => {
      return;
    });
    const app = buildApp({ enqueue: (message) => enqueue(message) });
    const body = JSON.stringify({
      ref: 'refs/heads/feature/topic',
      after: 'sha',
      repository: { full_name: 'octo/repo' },
    });
    const signature = await signBody(WEBHOOK_SECRET, body);

    const response = await app.fetch(
      webhookRequest(body, {
        'x-github-event': 'push',
        'x-github-delivery': 'delivery-3',
        'x-hub-signature-256': signature,
      }),
      env
    );

    expect(response.status).toBe(202);
    const payload = await response.json<{ status: string }>();
    expect(payload.status).toBe('acknowledged');
    expect(enqueue).not.toHaveBeenCalled();
    expect(await countWebhookEvents()).toBe(1);
  });
});
