import type { EnqueueGenerationJob } from './enqueue-generation-job';
import type { GetGenerationJob } from './get-generation-job';

/** Use case instances for generation-job operations. */
export interface GenerationUseCases {
  enqueueGenerationJob: EnqueueGenerationJob;
  getGenerationJob: GetGenerationJob;
}
