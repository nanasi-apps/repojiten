import type { ArtifactStore, StoredArtifact } from '@repojiten/backend-domain';
import type { Bindings } from '@repojiten/backend-types';

/** Cloudflare R2-backed artifact store for generated objects. */
export class R2ArtifactStore implements ArtifactStore {
  constructor(private readonly bucket: Bindings['R2']) {}

  async put(key: string, body: string, contentType = 'application/json'): Promise<void> {
    await this.bucket.put(key, body, { httpMetadata: { contentType } });
  }

  async get(key: string): Promise<StoredArtifact | null> {
    const object = await this.bucket.get(key);
    if (object === null) {
      return null;
    }

    return { key, body: await object.text() };
  }

  async delete(key: string): Promise<void> {
    await this.bucket.delete(key);
  }
}
