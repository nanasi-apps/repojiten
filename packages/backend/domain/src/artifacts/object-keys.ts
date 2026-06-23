/** Identifies the repository snapshot an artifact belongs to. */
export interface RepositoryArtifactRef {
  projectId: number;
  repositoryId: number;
  commitSha: string;
}

/** Base R2 prefix for a repository's artifacts within a project. */
const repositoryPrefix = (ref: RepositoryArtifactRef): string =>
  `projects/${String(ref.projectId)}/repositories/${String(ref.repositoryId)}`;

/** Object key for a snapshot's repository tree manifest. */
export const snapshotTreeKey = (ref: RepositoryArtifactRef): string =>
  `${repositoryPrefix(ref)}/snapshots/${ref.commitSha}/tree.json`;

/** Object key for a single analyzed source file within a snapshot. */
export const snapshotFileKey = (ref: RepositoryArtifactRef, relativePath: string): string =>
  `${repositoryPrefix(ref)}/snapshots/${ref.commitSha}/files/${relativePath}.json`;

/** Object key for a generated wiki page (markdown). */
export const wikiPageKey = (ref: RepositoryArtifactRef, slug: string): string =>
  `${repositoryPrefix(ref)}/wiki/${ref.commitSha}/pages/${slug}.md`;

/** Object key for the extracted wiki facts manifest. */
export const wikiFactsKey = (ref: RepositoryArtifactRef): string =>
  `${repositoryPrefix(ref)}/wiki/${ref.commitSha}/facts.json`;

/** Object key for the wiki page plan manifest. */
export const wikiPagePlanKey = (ref: RepositoryArtifactRef): string =>
  `${repositoryPrefix(ref)}/wiki/${ref.commitSha}/page-plan.json`;

/** Object key for the wiki evidence manifest. */
export const wikiEvidenceKey = (ref: RepositoryArtifactRef): string =>
  `${repositoryPrefix(ref)}/wiki/${ref.commitSha}/evidence.json`;
