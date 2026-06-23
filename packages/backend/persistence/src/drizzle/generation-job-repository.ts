import { eq, sql } from 'drizzle-orm';

import type {
  CreateGenerationJobInput,
  GenerationJob,
  GenerationJobRepository,
  GenerationJobSource,
  GenerationJobStatus,
  GenerationJobType,
} from '@repojiten/backend-domain';
import { generationJobs } from '@repojiten/backend-drizzle';
import type { GenerationJobRow } from '@repojiten/backend-drizzle';

import type { DrizzleClient } from './db';

/** Map a generation job row to the domain entity. */
const toGenerationJob = (row: GenerationJobRow): GenerationJob => ({
  id: row.id,
  type: row.type as GenerationJobType,
  status: row.status as GenerationJobStatus,
  source: row.source as GenerationJobSource,
  repositoryId: row.repositoryId,
  commitSha: row.commitSha,
  attempts: row.attempts,
  error: row.error,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
  startedAt: row.startedAt,
  completedAt: row.completedAt,
});

/** Drizzle-backed generation job repository over Cloudflare D1. */
export class DrizzleGenerationJobRepository implements GenerationJobRepository {
  constructor(private readonly db: DrizzleClient) {}

  async create(input: CreateGenerationJobInput): Promise<GenerationJob> {
    const [row] = await this.db
      .insert(generationJobs)
      .values({
        id: input.id,
        type: input.type,
        source: input.source,
        status: 'queued',
        repositoryId: input.repositoryId,
        commitSha: input.commitSha,
      })
      .returning();

    if (row === undefined) {
      throw new Error('Failed to create generation job');
    }

    return toGenerationJob(row);
  }

  async findById(id: string): Promise<GenerationJob | null> {
    const [row] = await this.db
      .select()
      .from(generationJobs)
      .where(eq(generationJobs.id, id))
      .limit(1);

    return row === undefined ? null : toGenerationJob(row);
  }

  async markRunning(id: string): Promise<void> {
    await this.db
      .update(generationJobs)
      .set({
        status: 'running',
        attempts: sql`${generationJobs.attempts} + 1`,
        startedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(generationJobs.id, id));
  }

  async markSucceeded(id: string): Promise<void> {
    await this.db
      .update(generationJobs)
      .set({ status: 'succeeded', error: null, completedAt: new Date(), updatedAt: new Date() })
      .where(eq(generationJobs.id, id));
  }

  async markFailed(id: string, error: string): Promise<void> {
    await this.db
      .update(generationJobs)
      .set({ status: 'failed', error, completedAt: new Date(), updatedAt: new Date() })
      .where(eq(generationJobs.id, id));
  }
}
