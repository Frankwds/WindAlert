import { createClient } from '@supabase/supabase-js';
import { User } from '@supabase/supabase-js';

/**
 * Get the authenticated user from the Authorization header (Bearer token)
 * @param authHeader Authorization header (Bearer token)
 * @returns The authenticated user object
 * @throws Error if user is not authenticated or token is missing/invalid
 */
export async function getAuthenticatedUser(authHeader: string | null): Promise<User> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Authorization header with Bearer token is required');
  }

  const token = authHeader.substring(7);
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser(token);

  if (userError) {
    throw new Error(`Failed to verify token: ${userError.message}`);
  }

  if (!user) {
    throw new Error('User is not authenticated');
  }

  return user;
}

