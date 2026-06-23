import type { AppVariables } from '@repojiten/backend-http/context';
import type { Bindings } from '@repojiten/backend-types';

import type { Hono } from 'hono';

/** Hono app shape required to register the GitHub webhook route. */
type WebhookApp = Hono<{ Bindings: Bindings; Variables: AppVariables }>;

/** Register the inbound GitHub webhook route on the given app. */
export const registerGithubWebhookRoutes = (app: WebhookApp): void => {
  app.post('/webhooks/github', async (c) => {
    const rawBody = await c.req.text();
    const result = await c.get('githubWebhookUseCases').handleGithubWebhook.execute({
      deliveryId: c.req.header('x-github-delivery') ?? '',
      event: c.req.header('x-github-event') ?? '',
      signatureHeader: c.req.header('x-hub-signature-256') ?? null,
      rawBody,
    });

    if (result.status === 'rejected') {
      return c.json({ error: 'Invalid signature' }, 401);
    }

    if (result.status === 'enqueued') {
      return c.json({ status: 'enqueued', jobId: result.jobId }, 202);
    }

    return c.json({ status: 'acknowledged' }, 202);
  });
};
