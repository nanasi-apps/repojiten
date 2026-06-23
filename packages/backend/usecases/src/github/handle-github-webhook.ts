import {
  isRegenerationTrigger,
  parseGithubWebhookPayload,
  verifyGithubSignature,
} from '@repojiten/backend-domain';
import type { GithubWebhookEventRepository } from '@repojiten/backend-domain';
import type { EnqueueGenerationJob } from '@repojiten/backend-usecases';

/** Raw inbound GitHub webhook request handled by the use case. */
export interface HandleGithubWebhookInput {
  deliveryId: string;
  event: string;
  signatureHeader: string | null;
  rawBody: string;
}

/** Outcome of handling a GitHub webhook delivery. */
export type HandleGithubWebhookResult =
  | { status: 'rejected' }
  | { status: 'acknowledged'; eventId: number }
  | { status: 'enqueued'; eventId: number; jobId: string };

/** Safely parse a JSON string, returning null on malformed input. */
const safeJsonParse = (raw: string): unknown => {
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
};

/** Use case to verify, record, and conditionally act on GitHub webhooks. */
export class HandleGithubWebhook {
  constructor(
    private readonly webhookSecret: string,
    private readonly webhookEventRepository: GithubWebhookEventRepository,
    private readonly enqueueGenerationJob: EnqueueGenerationJob
  ) {}

  async execute(input: HandleGithubWebhookInput): Promise<HandleGithubWebhookResult> {
    const verified = await verifyGithubSignature(
      this.webhookSecret,
      input.rawBody,
      input.signatureHeader
    );
    if (!verified) {
      return { status: 'rejected' };
    }

    const fields = parseGithubWebhookPayload(safeJsonParse(input.rawBody));

    let enqueuedJobId: string | null = null;
    if (isRegenerationTrigger(input.event, fields.ref)) {
      const job = await this.enqueueGenerationJob.execute({
        type: 'repository_ingest',
        source: 'github_webhook',
        commitSha: fields.commitSha,
      });
      enqueuedJobId = job.id;
    }

    const recorded = await this.webhookEventRepository.record({
      deliveryId: input.deliveryId,
      event: input.event,
      action: fields.action,
      repositoryFullName: fields.repositoryFullName,
      ref: fields.ref,
      commitSha: fields.commitSha,
      enqueuedJobId,
    });

    if (enqueuedJobId !== null) {
      return { status: 'enqueued', eventId: recorded.id, jobId: enqueuedJobId };
    }

    return { status: 'acknowledged', eventId: recorded.id };
  }
}
