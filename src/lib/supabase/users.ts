import { supabase } from './client';
import type { Database } from './types';

export async function upsertUser(userData: {
  email: string;
  name?: string | null;
  google_id?: string;
  image_url?: string;
}) {
  try {
    // Try to find the existing user
    const { data: existingUsers, error: findError } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', userData.email);

    if (findError) {
      throw findError;
    }

    const existingUser = existingUsers?.[0];

    if (existingUser) {
      // User exists, update their data
      const { data, error: updateError } = await supabase
        .from('users')
        .update({
          name: userData.name ?? null,
          google_id: userData.google_id ?? null,
          image_url: userData.image_url ?? null,
          updated_at: new Date().toISOString(),
        })
        .eq('email', userData.email)
        .select();

      if (updateError) {
        throw updateError;
      }

      return data?.[0];
    } else {
      userData.email;
      // User doesn't exist, insert new user
      const { data, error: insertError } = await supabase
        .from('users')
        .insert({
          email: userData.email,
          name: userData.name ?? null,
          google_id: userData.google_id ?? null,
          image_url: userData.image_url ?? null,
        })
        .select();
      return data;
    }
  } catch (error) {
    throw error;
  }
}
