import type { GithubWebhookEvent, RecordGithubWebhookEventInput } from './webhook-event';

/** Persistence port for inbound GitHub webhook deliveries. */
export interface GithubWebhookEventRepository {
  record(input: RecordGithubWebhookEventInput): Promise<GithubWebhookEvent>;
}
