import type { GenerationJobMessage } from './generation-job';

/** Port to enqueue generation jobs for asynchronous processing. */
export interface GenerationJobQueue {
  enqueue(message: GenerationJobMessage): Promise<void>;
}
