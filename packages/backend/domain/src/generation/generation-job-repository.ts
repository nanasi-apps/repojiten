import type { CreateGenerationJobInput, GenerationJob } from './generation-job';

/** Persistence port for generation job lifecycle state. */
export interface GenerationJobRepository {
  create(input: CreateGenerationJobInput): Promise<GenerationJob>;
  findById(id: string): Promise<GenerationJob | null>;
  markRunning(id: string): Promise<void>;
  markSucceeded(id: string): Promise<void>;
  markFailed(id: string, error: string): Promise<void>;
}
