import { env as testEnv } from 'cloudflare:workers';
import { describe, expect, it } from 'vitest';

import { R2ArtifactStore } from '@repojiten/backend-persistence';
import type { Bindings } from '@repojiten/backend-types';

const env = testEnv as unknown as Bindings;

describe('R2 artifact store', () => {
  it('[REPOJITEN-HOSTING-BE-S011] round-trips a stored artifact', async () => {
    const store = new R2ArtifactStore(env.R2);
    const key = 'projects/1/repositories/1/snapshots/sha/tree.json';
    const body = JSON.stringify({ ok: true });

    await store.put(key, body);
    expect((await store.get(key))?.body).toBe(body);

    await store.delete(key);
    expect(await store.get(key)).toBeNull();
  });
});
