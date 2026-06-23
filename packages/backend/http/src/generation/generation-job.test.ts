import { env as testEnv } from 'cloudflare:workers';
import { describe, expect, it, vi } from 'vitest';

import type {
  GenerationJobMessage,
  GenerationJobQueue,
  GenerationJobRunner,
} from '@repojiten/backend-domain';
import {
  createDrizzleClient,
  DrizzleGenerationJobRepository,
} from '@repojiten/backend-persistence';
import type { Bindings } from '@repojiten/backend-types';
import { EnqueueGenerationJob, ProcessGenerationJob } from '@repojiten/backend-usecases';

const env = testEnv as unknown as Bindings;

const createJobRepository = () => new DrizzleGenerationJobRepository(createDrizzleClient(env.DB));

describe('Generation job lifecycle', () => {
  it('[REPOJITEN-HOSTING-BE-S004] enqueue persists a queued job and sends a queue message', async () => {
    const repository = createJobRepository();
    const enqueue = vi.fn(async (_message: GenerationJobMessage): Promise<void> => {
      return;
    });
    const queue: GenerationJobQueue = { enqueue: (message) => enqueue(message) };

    const job = await new EnqueueGenerationJob(repository, queue).execute({
      type: 'repository_ingest',
      source: 'manual',
      commitSha: 'abc123',
    });

    expect(job.status).toBe('queued');
    expect(enqueue).toHaveBeenCalledWith(
      expect.objectContaining({ jobId: job.id, type: 'repository_ingest', commitSha: 'abc123' })
    );

    const stored = await repository.findById(job.id);
    expect(stored?.status).toBe('queued');
  });

  it('[REPOJITEN-HOSTING-BE-S005] processing a job records a succeeded terminal state', async () => {
    const repository = createJobRepository();
    const job = await repository.create({
      id: crypto.randomUUID(),
      type: 'repository_ingest',
      source: 'manual',
      repositoryId: null,
      commitSha: null,
    });

    const run = vi.fn(async (_message: GenerationJobMessage): Promise<void> => {
      return;
    });
    const runner: GenerationJobRunner = { run: (message) => run(message) };

    await new ProcessGenerationJob(repository, runner).execute({
      jobId: job.id,
      type: 'repository_ingest',
      repositoryId: null,
      commitSha: null,
    });

    const stored = await repository.findById(job.id);
    expect(stored?.status).toBe('succeeded');
    expect(run).toHaveBeenCalledOnce();
  });

  it('[REPOJITEN-HOSTING-BE-S006] a failing job is recorded as failed and rethrows for retry', async () => {
    const repository = createJobRepository();
    const job = await repository.create({
      id: crypto.randomUUID(),
      type: 'wiki_generate',
      source: 'manual',
      repositoryId: null,
      commitSha: null,
    });

    const runner: GenerationJobRunner = {
      run: async (_message: GenerationJobMessage): Promise<void> => {
        throw new Error('boom');
      },
    };

    const message: GenerationJobMessage = {
      jobId: job.id,
      type: 'wiki_generate',
      repositoryId: null,
      commitSha: null,
    };
    await expect(new ProcessGenerationJob(repository, runner).execute(message)).rejects.toThrow(
      'boom'
    );

    const stored = await repository.findById(job.id);
    expect(stored?.status).toBe('failed');
    expect(stored?.error).toBe('boom');
  });
});
