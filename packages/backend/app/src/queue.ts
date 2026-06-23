import { createProcessGenerationJob } from '@repojiten/backend-app';
import type { GenerationJobMessage } from '@repojiten/backend-domain';
import type { Bindings } from '@repojiten/backend-types';

import type { MessageBatch } from '@cloudflare/workers-types';

/** Cloudflare Queues consumer that processes generation jobs. */
export const handleGenerationQueue = async (
  batch: MessageBatch<GenerationJobMessage>,
  env: Bindings
): Promise<void> => {
  const processGenerationJob = createProcessGenerationJob(env);

  for (const message of batch.messages) {
    try {
      await processGenerationJob.execute(message.body);
      message.ack();
    } catch {
      message.retry();
    }
  }
};
