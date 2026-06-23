import { handleGenerationQueue } from './queue';
import server from './server';

/** Cloudflare Worker handler exposing the HTTP fetch app and the queue consumer. */
export const worker = {
  fetch: server.fetch,
  queue: handleGenerationQueue,
};
