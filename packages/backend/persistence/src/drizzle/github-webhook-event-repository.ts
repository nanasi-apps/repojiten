import type {
  GithubWebhookEvent,
  GithubWebhookEventRepository,
  RecordGithubWebhookEventInput,
} from '@repojiten/backend-domain';
import { githubWebhookEvents } from '@repojiten/backend-drizzle';
import type { GithubWebhookEventRow } from '@repojiten/backend-drizzle';

import type { DrizzleClient } from './db';

/** Map a webhook event row to the domain entity. */
const toGithubWebhookEvent = (row: GithubWebhookEventRow): GithubWebhookEvent => ({
  id: row.id,
  deliveryId: row.deliveryId,
  event: row.event,
  action: row.action,
  repositoryFullName: row.repositoryFullName,
  ref: row.ref,
  commitSha: row.commitSha,
  enqueuedJobId: row.enqueuedJobId,
  receivedAt: row.receivedAt,
});

/** Drizzle-backed GitHub webhook event repository over Cloudflare D1. */
export class DrizzleGithubWebhookEventRepository implements GithubWebhookEventRepository {
  constructor(private readonly db: DrizzleClient) {}

  async record(input: RecordGithubWebhookEventInput): Promise<GithubWebhookEvent> {
    const [row] = await this.db
      .insert(githubWebhookEvents)
      .values({
        deliveryId: input.deliveryId,
        event: input.event,
        action: input.action,
        repositoryFullName: input.repositoryFullName,
        ref: input.ref,
        commitSha: input.commitSha,
        enqueuedJobId: input.enqueuedJobId,
      })
      .returning();

    if (row === undefined) {
      throw new Error('Failed to record GitHub webhook event');
    }

    return toGithubWebhookEvent(row);
  }
}
