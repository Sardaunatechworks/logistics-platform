import { createClient, SupabaseClient } from '@supabase/supabase-js';

let adminClient: SupabaseClient<any, 'public', any> | null = null;

export function createAdminClient(): SupabaseClient<any, 'public', any> {
  if (typeof window !== 'undefined') {
    throw new Error(
      'createAdminClient() must only be called on the server. ' +
        'This client bypasses RLS and must never be exposed to the browser.'
    );
  }

  if (adminClient) return adminClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key';

  adminClient = createClient<any>(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return adminClient;
}
