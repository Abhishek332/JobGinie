/**
 * Auth helpers for server actions and server components.
 *
 * Route middleware (Clerk) protects page navigation; server actions still need
 * an explicit DB user check because actions can be invoked directly and must
 * resolve the application user record.
 */

import { currentUser } from '@clerk/nextjs/server';

import { checkUserAuth } from './validate-user-auth';
import type { User } from '@/generated/prisma/client';
import { db } from '@/lib/prisma';

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

/**
 * Wraps a handler that requires auth but does not use the { success } result pattern.
 * Throws when unauthenticated — use for route-protected reads/actions.
 */
export function withAuthGuard<TArgs extends unknown[], TResult>(
  handler: AuthenticatedHandler<TArgs, TResult>,
): (...args: TArgs) => Promise<TResult> {
  return async (...args: TArgs) => {
    const user = await checkUserAuth();
    return handler(user, ...args);
  };
}

/** Strict auth for mutations/actions: returns null when unauthenticated. */
export async function getAuthenticatedUserOrNull(): Promise<AuthenticatedDbUser | null> {
  try {
    return await checkUserAuth();
  } catch {
    return null;
  }
}

/**
 * Ensures a signed-in Clerk user has a DB row; creates one if missing.
 * Returns null when signed out. Use for onboarding status and layout bootstrapping.
 */
export async function getOrCreateUserOrNull(): Promise<User | null> {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  try {
    const existing = await db.user.findUnique({
      where: { clerkUserId: clerkUser.id },
    });
    if (existing) return existing;

    const name =
      `${clerkUser.firstName ?? ''} ${clerkUser.lastName ?? ''}`.trim() || null;

    return await db.user.create({
      data: {
        clerkUserId: clerkUser.id,
        name,
        imageUrl: clerkUser.imageUrl,
        email:
          clerkUser.emailAddresses[0]?.emailAddress ??
          clerkUser.primaryEmailAddress?.emailAddress ??
          '',
      },
    });
  } catch (error) {
    console.error('getOrCreateUserOrNull error:', error);
    throw new Error('Failed to get user details');
  }
}
