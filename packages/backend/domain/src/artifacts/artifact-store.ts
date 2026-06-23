/** Artifact retrieved from object storage. */
export interface StoredArtifact {
  key: string;
  body: string;
}

/** Persistence port for generated artifacts kept in object storage (R2). */
export interface ArtifactStore {
  put(key: string, body: string, contentType?: string): Promise<void>;
  get(key: string): Promise<StoredArtifact | null>;
  delete(key: string): Promise<void>;
}
