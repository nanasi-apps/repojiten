/** Authenticated GitHub webhook delivery metadata. */
export interface GithubWebhookDelivery {
  deliveryId: string;
  event: string;
  action: string | null;
  repositoryFullName: string | null;
  ref: string | null;
  commitSha: string | null;
}

/** Recorded GitHub webhook event entity. */
export interface GithubWebhookEvent extends GithubWebhookDelivery {
  id: number;
  enqueuedJobId: string | null;
  receivedAt: Date;
}

/** Input accepted by the webhook event persistence port. */
export interface RecordGithubWebhookEventInput extends GithubWebhookDelivery {
  enqueuedJobId: string | null;
}
