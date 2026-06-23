import { describe, expect, it } from 'vitest';

import {
  snapshotFileKey,
  snapshotTreeKey,
  wikiEvidenceKey,
  wikiFactsKey,
  wikiPageKey,
  wikiPagePlanKey,
  type RepositoryArtifactRef,
} from '@repojiten/backend-domain';

const ref: RepositoryArtifactRef = { projectId: 7, repositoryId: 42, commitSha: 'abc123' };

describe('R2 artifact object keys', () => {
  it('[REPOJITEN-HOSTING-BE-S010] builds keys that follow the Repojiten R2 scheme', () => {
    expect(snapshotTreeKey(ref)).toBe('projects/7/repositories/42/snapshots/abc123/tree.json');
    expect(snapshotFileKey(ref, 'src/index')).toBe(
      'projects/7/repositories/42/snapshots/abc123/files/src/index.json'
    );
    expect(wikiPageKey(ref, 'getting-started')).toBe(
      'projects/7/repositories/42/wiki/abc123/pages/getting-started.md'
    );
    expect(wikiFactsKey(ref)).toBe('projects/7/repositories/42/wiki/abc123/facts.json');
    expect(wikiPagePlanKey(ref)).toBe('projects/7/repositories/42/wiki/abc123/page-plan.json');
    expect(wikiEvidenceKey(ref)).toBe('projects/7/repositories/42/wiki/abc123/evidence.json');
  });
});
