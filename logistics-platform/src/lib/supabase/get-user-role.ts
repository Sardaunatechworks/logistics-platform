import { SupabaseClient, User } from '@supabase/supabase-js';
import type { UserRole } from '@/types/database';

/**
 * Safely resolves user role from metadata or profiles table
 */
export async function getUserRole(supabase: SupabaseClient, user: User): Promise<UserRole> {
  if (user.user_metadata?.role) {
    return user.user_metadata.role as UserRole;
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  return (profile?.role as UserRole) || 'customer';
}

