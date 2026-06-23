import type {
  GenerationJobMessage,
  GenerationJobRepository,
  GenerationJobRunner,
} from '@repojiten/backend-domain';

/** Use case to process a dequeued generation job and record its outcome. */
export class ProcessGenerationJob {
  constructor(
    private readonly jobRepository: GenerationJobRepository,
    private readonly jobRunner: GenerationJobRunner
  ) {}

  async execute(message: GenerationJobMessage): Promise<void> {
    await this.jobRepository.markRunning(message.jobId);

    try {
      await this.jobRunner.run(message);
      await this.jobRepository.markSucceeded(message.jobId);
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'Unknown generation error';
      await this.jobRepository.markFailed(message.jobId, reason);
      throw error;
    }
  }
}
