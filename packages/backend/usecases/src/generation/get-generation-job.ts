import type { GenerationJob, GenerationJobRepository } from '@repojiten/backend-domain';

/** Use case to read a generation job's current state by id. */
export class GetGenerationJob {
  constructor(private readonly jobRepository: GenerationJobRepository) {}

  execute(id: string): Promise<GenerationJob | null> {
    return this.jobRepository.findById(id);
  }
}
