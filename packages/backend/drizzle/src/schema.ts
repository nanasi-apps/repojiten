import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

/** Fresh created-at column builder (unix epoch seconds). */
const createdAtColumn = () =>
  integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`);

/** Fresh updated-at column builder (unix epoch seconds). */
const updatedAtColumn = () =>
  integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`);

/** Users table schema definition. */
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  createdAt: createdAtColumn(),
});

/** External identity (e.g. GitHub OAuth) linked to a Repojiten user. */
export const userIdentities = sqliteTable(
  'user_identities',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id),
    provider: text('provider').notNull(),
    providerUserId: text('provider_user_id').notNull(),
    createdAt: createdAtColumn(),
  },
  (table) => [
    uniqueIndex('user_identities_provider_user_idx').on(table.provider, table.providerUserId),
  ]
);

/** Authenticated session bound to a user. */
export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  createdAt: createdAtColumn(),
});

/** Project that groups one or more repositories. */
export const projects = sqliteTable('projects', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  ownerId: integer('owner_id')
    .notNull()
    .references(() => users.id),
  createdAt: createdAtColumn(),
  updatedAt: updatedAtColumn(),
});

/** Membership linking a user to a project with a role. */
export const projectMembers = sqliteTable(
  'project_members',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    projectId: integer('project_id')
      .notNull()
      .references(() => projects.id),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id),
    role: text('role').notNull().default('member'),
    createdAt: createdAtColumn(),
  },
  (table) => [uniqueIndex('project_members_project_user_idx').on(table.projectId, table.userId)]
);

/** Repository attached to a project (source for snapshots and wiki). */
export const projectRepositories = sqliteTable(
  'project_repositories',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    projectId: integer('project_id')
      .notNull()
      .references(() => projects.id),
    provider: text('provider').notNull().default('github'),
    owner: text('owner').notNull(),
    name: text('name').notNull(),
    defaultBranch: text('default_branch').notNull().default('develop'),
    createdAt: createdAtColumn(),
    updatedAt: updatedAtColumn(),
  },
  (table) => [
    uniqueIndex('project_repositories_identity_idx').on(
      table.projectId,
      table.provider,
      table.owner,
      table.name
    ),
  ]
);

/** Immutable snapshot of a repository at a specific commit. */
export const repositorySnapshots = sqliteTable(
  'repository_snapshots',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    repositoryId: integer('repository_id')
      .notNull()
      .references(() => projectRepositories.id),
    commitSha: text('commit_sha').notNull(),
    status: text('status').notNull().default('pending'),
    treeObjectKey: text('tree_object_key'),
    createdAt: createdAtColumn(),
  },
  (table) => [
    uniqueIndex('repository_snapshots_commit_idx').on(table.repositoryId, table.commitSha),
  ]
);

/** Generated wiki page for a repository snapshot. */
export const wikiPages = sqliteTable(
  'wiki_pages',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    repositoryId: integer('repository_id')
      .notNull()
      .references(() => projectRepositories.id),
    commitSha: text('commit_sha').notNull(),
    slug: text('slug').notNull(),
    title: text('title').notNull(),
    contentObjectKey: text('content_object_key').notNull(),
    createdAt: createdAtColumn(),
  },
  (table) => [
    uniqueIndex('wiki_pages_slug_idx').on(table.repositoryId, table.commitSha, table.slug),
  ]
);

/** Source repository files that a wiki page was derived from. */
export const wikiPageSources = sqliteTable('wiki_page_sources', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  wikiPageId: integer('wiki_page_id')
    .notNull()
    .references(() => wikiPages.id),
  repositoryFilePath: text('repository_file_path').notNull(),
  createdAt: createdAtColumn(),
});

/** OpenSpec spec discovered in a repository snapshot. */
export const openspecSpecs = sqliteTable(
  'openspec_specs',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    repositoryId: integer('repository_id')
      .notNull()
      .references(() => projectRepositories.id),
    commitSha: text('commit_sha').notNull(),
    specUnit: text('spec_unit').notNull(),
    title: text('title').notNull(),
    sourcePath: text('source_path').notNull(),
    createdAt: createdAtColumn(),
  },
  (table) => [
    uniqueIndex('openspec_specs_unit_idx').on(table.repositoryId, table.commitSha, table.specUnit),
  ]
);

/** Scenario belonging to an OpenSpec spec. */
export const openspecScenarios = sqliteTable(
  'openspec_scenarios',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    specId: integer('spec_id')
      .notNull()
      .references(() => openspecSpecs.id),
    scenarioId: text('scenario_id').notNull(),
    title: text('title').notNull(),
    manual: integer('manual', { mode: 'boolean' }).notNull().default(false),
    createdAt: createdAtColumn(),
  },
  (table) => [uniqueIndex('openspec_scenarios_scenario_idx').on(table.specId, table.scenarioId)]
);

/** Asynchronous generation job tracked in D1. */
export const generationJobs = sqliteTable('generation_jobs', {
  id: text('id').primaryKey(),
  type: text('type').notNull(),
  status: text('status').notNull().default('queued'),
  source: text('source').notNull(),
  repositoryId: integer('repository_id').references(() => projectRepositories.id),
  commitSha: text('commit_sha'),
  attempts: integer('attempts').notNull().default(0),
  error: text('error'),
  createdAt: createdAtColumn(),
  updatedAt: updatedAtColumn(),
  startedAt: integer('started_at', { mode: 'timestamp' }),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
});

/** Inbound GitHub webhook delivery recorded for idempotency and auditing. */
export const githubWebhookEvents = sqliteTable('github_webhook_events', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  deliveryId: text('delivery_id').notNull().unique(),
  event: text('event').notNull(),
  action: text('action'),
  repositoryFullName: text('repository_full_name'),
  ref: text('ref'),
  commitSha: text('commit_sha'),
  enqueuedJobId: text('enqueued_job_id'),
  receivedAt: integer('received_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
});

/** User row type inferred from the users table. */
export type User = typeof users.$inferSelect;
/** Insert payload type inferred from the users table. */
export type NewUser = typeof users.$inferInsert;

/** Generation job row type inferred from the generation_jobs table. */
export type GenerationJobRow = typeof generationJobs.$inferSelect;
/** Insert payload type inferred from the generation_jobs table. */
export type NewGenerationJobRow = typeof generationJobs.$inferInsert;

/** GitHub webhook event row type inferred from the github_webhook_events table. */
export type GithubWebhookEventRow = typeof githubWebhookEvents.$inferSelect;
/** Insert payload type inferred from the github_webhook_events table. */
export type NewGithubWebhookEventRow = typeof githubWebhookEvents.$inferInsert;
