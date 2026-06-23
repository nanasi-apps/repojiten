import type { GenerationJobMessage, GenerationJobQueue } from '@repojiten/backend-domain';
import type { Bindings } from '@repojiten/backend-types';

/** Cloudflare Queues-backed generation job producer. */
export class CloudflareGenerationJobQueue implements GenerationJobQueue {
  constructor(private readonly queue: Bindings['GENERATION_QUEUE']) {}

  async enqueue(message: GenerationJobMessage): Promise<void> {
    await this.queue.send(message);
  }
}
