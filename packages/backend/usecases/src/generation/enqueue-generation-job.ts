import type {
  EnqueueGenerationJobInput,
  GenerationJob,
  GenerationJobQueue,
  GenerationJobRepository,
} from '@repojiten/backend-domain';

/** Use case to persist a generation job and enqueue it for processing. */
export class EnqueueGenerationJob {
  constructor(
    private readonly jobRepository: GenerationJobRepository,
    private readonly jobQueue: GenerationJobQueue
  ) {}

  async execute(input: EnqueueGenerationJobInput): Promise<GenerationJob> {
    const job = await this.jobRepository.create({
      id: crypto.randomUUID(),
      type: input.type,
      source: input.source,
      repositoryId: input.repositoryId ?? null,
      commitSha: input.commitSha ?? null,
    });

    await this.jobQueue.enqueue({
      jobId: job.id,
      type: job.type,
      repositoryId: job.repositoryId,
      commitSha: job.commitSha,
    });

    return job;
  }
}
