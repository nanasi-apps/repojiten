import type { GenerationJobMessage } from './generation-job';

/** Port that performs the actual work for a dequeued generation job. */
export interface GenerationJobRunner {
  run(message: GenerationJobMessage): Promise<void>;
}
