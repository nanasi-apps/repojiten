/** Lifecycle status of a generation job. */
export type GenerationJobStatus = 'queued' | 'running' | 'succeeded' | 'failed';

/** Kind of generation work a job represents. */
export type GenerationJobType = 'repository_ingest' | 'wiki_generate';

/** Origin that requested a generation job. */
export type GenerationJobSource = 'github_webhook' | 'manual';

/** Generation job entity tracked in persistence. */
export interface GenerationJob {
  id: string;
  type: GenerationJobType;
  status: GenerationJobStatus;
  source: GenerationJobSource;
  repositoryId: number | null;
  commitSha: string | null;
  attempts: number;
  error: string | null;
  createdAt: Date;
  updatedAt: Date;
  startedAt: Date | null;
  completedAt: Date | null;
}

/** Input accepted by the enqueue-generation-job use case. */
export interface EnqueueGenerationJobInput {
  type: GenerationJobType;
  source: GenerationJobSource;
  repositoryId?: number | null;
  commitSha?: string | null;
}

/** Input accepted by the generation job persistence port to create a job. */
export interface CreateGenerationJobInput {
  id: string;
  type: GenerationJobType;
  source: GenerationJobSource;
  repositoryId: number | null;
  commitSha: string | null;
}

/** Queue message payload describing a generation job to process. */
export interface GenerationJobMessage {
  jobId: string;
  type: GenerationJobType;
  repositoryId: number | null;
  commitSha: string | null;
}
