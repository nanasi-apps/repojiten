/** Git ref whose updates trigger Repojiten wiki regeneration. */
export const REGENERATION_REF = 'refs/heads/develop';

/** Fields extracted from a GitHub webhook JSON payload. */
export interface GithubWebhookPayloadFields {
  action: string | null;
  repositoryFullName: string | null;
  ref: string | null;
  commitSha: string | null;
}

/** Coerce an unknown value to a string, or null when it is not a string. */
const asString = (value: unknown): string | null => (typeof value === 'string' ? value : null);

/** Narrow an unknown value to a plain record. */
const asRecord = (value: unknown): Record<string, unknown> | null =>
  typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : null;

/** Extract Repojiten-relevant fields from a parsed GitHub webhook payload. */
export const parseGithubWebhookPayload = (payload: unknown): GithubWebhookPayloadFields => {
  const record = asRecord(payload);
  if (record === null) {
    return { action: null, repositoryFullName: null, ref: null, commitSha: null };
  }

  const repository = asRecord(record.repository);

  return {
    action: asString(record.action),
    repositoryFullName: repository === null ? null : asString(repository.full_name),
    ref: asString(record.ref),
    commitSha: asString(record.after),
  };
};

/** Whether a delivery should trigger a wiki regeneration job. */
export const isRegenerationTrigger = (event: string, ref: string | null): boolean =>
  event === 'push' && ref === REGENERATION_REF;
