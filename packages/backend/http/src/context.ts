import type { UsersUseCases } from '@repojiten/backend-usecases';

/** Hono context variables injected by server app wiring. */
export interface AppVariables {
  usersUseCases: UsersUseCases;
}
