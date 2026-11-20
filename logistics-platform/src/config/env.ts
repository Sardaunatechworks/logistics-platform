// ============================================================================
// Environment Configuration
// Runtime validation of required environment variables using Zod
// ============================================================================

import { z } from 'zod';

// Schema for server-side environment variables
const serverEnvSchema = z.object({
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('Invalid Supabase URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'Supabase anon key is required'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'Supabase service role key is required'),

  // Paystack
  PAYSTACK_SECRET_KEY: z.string().min(1, 'Paystack secret key is required'),
  PAYSTACK_WEBHOOK_SECRET: z.string().optional(),

  // App
  NEXT_PUBLIC_APP_URL: z.string().url('Invalid app URL'),
  NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY: z.string().min(1, 'Paystack public key is required'),

  // Node environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

// Schema for client-side environment variables (NEXT_PUBLIC_ only)
const clientEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('Invalid Supabase URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'Supabase anon key is required'),
  NEXT_PUBLIC_APP_URL: z.string().url('Invalid app URL'),
  NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY: z.string().min(1, 'Paystack public key is required'),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type ClientEnv = z.infer<typeof clientEnvSchema>;

// ============================================================================
// Server Environment (only accessible server-side)
// ============================================================================

let _serverEnv: ServerEnv | null = null;

export function getServerEnv(): ServerEnv {
  if (_serverEnv) return _serverEnv;

  // Only validate on the server
  if (typeof window !== 'undefined') {
    throw new Error(
      'getServerEnv() must only be called on the server. ' +
        'Use getClientEnv() for client-side environment variables.'
    );
  }

  const parsed = serverEnvSchema.safeParse(process.env);

  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;
    const errorMessages = Object.entries(errors)
      .map(([key, messages]) => `  ${key}: ${messages?.join(', ')}`)
      .join('\n');

    throw new Error(
      `Missing or invalid environment variables:\n${errorMessages}\n\n` +
        'Check your .env.local file against .env.example'
    );
  }

  _serverEnv = parsed.data;
  return _serverEnv;
}

// ============================================================================
// Client Environment (safe for browser)
// ============================================================================

let _clientEnv: ClientEnv | null = null;

export function getClientEnv(): ClientEnv {
  if (_clientEnv) return _clientEnv;

  const parsed = clientEnvSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
  });

  if (!parsed.success) {
    console.error('Invalid client environment variables:', parsed.error.flatten());
    throw new Error('Invalid client environment configuration');
  }

  _clientEnv = parsed.data;
  return _clientEnv;
}

