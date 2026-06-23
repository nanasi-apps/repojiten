import type { HandleGithubWebhook } from './handle-github-webhook';

/** Use case instances for GitHub webhook intake. */
export interface GithubWebhookUseCases {
  handleGithubWebhook: HandleGithubWebhook;
}
