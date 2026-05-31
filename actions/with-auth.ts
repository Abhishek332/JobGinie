/**
 * Auth helpers for server actions.
 *
 * Route middleware (Clerk) protects page navigation; server actions still need
 * an explicit DB user check because actions can be invoked directly and must
 * resolve the application user record.
 */

import { checkUserAuth } from './validate-user-auth';

export const UNAUTHENTICATED_ACTION_ERROR = {
  success: false as const,
  error: 'Please sign in to continue.',
};

export type AuthRequiredFailure = typeof UNAUTHENTICATED_ACTION_ERROR;

export type AuthenticatedDbUser = Awaited<ReturnType<typeof checkUserAuth>>;

type AuthenticatedHandler<TArgs extends unknown[], TResult> = (
  user: AuthenticatedDbUser,
  ...args: TArgs
) => Promise<TResult>;

/**
 * Wraps a server action so auth is verified once before the handler runs.
 * Returns a standard { success: false, error } when unauthenticated.
 */
export function withAuth<
  TArgs extends unknown[],
  TResult extends { success: boolean },
>(
  handler: AuthenticatedHandler<TArgs, TResult>,
): (...args: TArgs) => Promise<TResult | AuthRequiredFailure> {
  return async (...args: TArgs) => {
    let user: AuthenticatedDbUser;
    try {
      user = await checkUserAuth();
    } catch {
      return UNAUTHENTICATED_ACTION_ERROR;
    }

    return handler(user, ...args);
  };
}

/** For read helpers that return null when unauthenticated (e.g. page loaders). */
export async function getAuthenticatedUserOrNull(): Promise<AuthenticatedDbUser | null> {
  try {
    return await checkUserAuth();
  } catch {
    return null;
  }
}
