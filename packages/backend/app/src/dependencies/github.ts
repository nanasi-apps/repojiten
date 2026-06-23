import {
  createDrizzleClient,
  DrizzleGithubWebhookEventRepository,
} from '@repojiten/backend-persistence';
import type { Bindings } from '@repojiten/backend-types';
import { HandleGithubWebhook, type GithubWebhookUseCases } from '@repojiten/backend-usecases';

import { createGenerationUseCases } from './generation';

/** Build GitHub webhook use cases with persistence and generation dependencies. */
export const createGithubWebhookUseCases = (bindings: Bindings): GithubWebhookUseCases => {
  const drizzle = createDrizzleClient(bindings.DB);
  const webhookEventRepository = new DrizzleGithubWebhookEventRepository(drizzle);
  const { enqueueGenerationJob } = createGenerationUseCases(bindings);

  return {
    handleGithubWebhook: new HandleGithubWebhook(
      bindings.GITHUB_WEBHOOK_SECRET ?? '',
      webhookEventRepository,
      enqueueGenerationJob
    ),
  };
};
