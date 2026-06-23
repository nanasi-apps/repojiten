import type { GenerationJobMessage, GenerationJobRunner } from '@repojiten/backend-domain';
import {
  CloudflareGenerationJobQueue,
  createDrizzleClient,
  DrizzleGenerationJobRepository,
} from '@repojiten/backend-persistence';
import type { Bindings } from '@repojiten/backend-types';
import {
  EnqueueGenerationJob,
  GetGenerationJob,
  ProcessGenerationJob,
  type GenerationUseCases,
} from '@repojiten/backend-usecases';

/**
 * Placeholder runner that acknowledges jobs without producing artifacts.
 * Repository ingestion and wiki generation land in #7/#8; until then this
 * keeps the async pipeline observable end-to-end.
 */
class PlaceholderGenerationJobRunner implements GenerationJobRunner {
  run(message: GenerationJobMessage): Promise<void> {
    console.info(`[generation] placeholder run for job ${message.jobId} (${message.type})`);
    return Promise.resolve();
  }
}

/** Build the enqueue-side generation use cases with persistence dependencies. */
export const createGenerationUseCases = (bindings: Bindings): GenerationUseCases => {
  const drizzle = createDrizzleClient(bindings.DB);
  const jobRepository = new DrizzleGenerationJobRepository(drizzle);
  const jobQueue = new CloudflareGenerationJobQueue(bindings.GENERATION_QUEUE);

  return {
    enqueueGenerationJob: new EnqueueGenerationJob(jobRepository, jobQueue),
    getGenerationJob: new GetGenerationJob(jobRepository),
  };
};

/** Build the process-side generation use case used by the queue consumer. */
export const createProcessGenerationJob = (bindings: Bindings): ProcessGenerationJob => {
  const drizzle = createDrizzleClient(bindings.DB);
  const jobRepository = new DrizzleGenerationJobRepository(drizzle);

  return new ProcessGenerationJob(jobRepository, new PlaceholderGenerationJobRunner());
};
