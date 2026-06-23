import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

import { createGithubWebhookUseCases, createUsersUseCases } from '@repojiten/backend-app';
import {
  openApiApp,
  registerGithubWebhookRoutes,
  type AppVariables,
} from '@repojiten/backend-http';
import type { Bindings } from '@repojiten/backend-types';

const app = new Hono<{ Bindings: Bindings; Variables: AppVariables }>();

// Middleware
app.use('*', logger());
app.use('*', async (c, next) => {
  c.set('usersUseCases', createUsersUseCases(c.env));
  c.set('githubWebhookUseCases', createGithubWebhookUseCases(c.env));
  await next();
});
app.use(
  '*',
  cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  })
);

// GitHub webhook intake (outside the versioned /api/v1 surface)
registerGithubWebhookRoutes(app);

// Routes
app.route('/', openApiApp);

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// SPA static assets fallback (API/webhook misses still return JSON 404)
app.notFound((c) => {
  const { pathname } = new URL(c.req.url);
  if (pathname.startsWith('/api/') || pathname.startsWith('/webhooks/')) {
    return c.json({ error: 'Not Found', path: c.req.path }, 404);
  }

  return c.env.ASSETS.fetch(c.req.raw);
});

// Error handler
app.onError((err, c) => {
  console.error(`Error: ${err.message}`);
  return c.json({ error: 'Internal Server Error', message: err.message }, 500);
});

/** Hono app configured with middleware and routes. */
export default app;
