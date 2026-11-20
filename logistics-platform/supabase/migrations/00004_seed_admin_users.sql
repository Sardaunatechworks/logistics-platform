-- ============================================================================
-- Migration: 00004_seed_admin_users.sql
-- Description: Seeds initial Super Admin and Operations Admin credentials into
--              Supabase Auth (auth.users, auth.identities) and public.profiles.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  super_admin_id UUID := 'a0000000-0000-0000-0000-000000000001';
  ops_admin_id   UUID := 'a0000000-0000-0000-0000-000000000002';
  pw_hash        TEXT := crypt('AdminPassword123!', gen_salt('bf'));
BEGIN
  -- ==========================================================================
  -- 1. SUPER ADMIN (Full system access, role management, pricing control)
  -- ==========================================================================
  INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token
  ) VALUES (
    super_admin_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'superadmin@swiftlogistics.ng',
    pw_hash,
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"System Super Administrator","role":"super_admin"}'::jsonb,
    now(),
    now(),
    '',
    ''
  )
  ON CONFLICT (id) DO UPDATE
  SET
    encrypted_password = EXCLUDED.encrypted_password,
    email_confirmed_at = now(),
    raw_user_meta_data = EXCLUDED.raw_user_meta_data,
    updated_at = now();

  INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    last_sign_in_at,
    created_at,
    updated_at
  ) VALUES (
    super_admin_id,
    super_admin_id,
    jsonb_build_object('sub', super_admin_id::text, 'email', 'superadmin@swiftlogistics.ng'),
    'email',
    super_admin_id::text,
    now(),
    now(),
    now()
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.profiles (
    id,
    full_name,
    email,
    phone,
    role,
    account_status,
    created_at,
    updated_at
  ) VALUES (
    super_admin_id,
    'System Super Administrator',
    'superadmin@swiftlogistics.ng',
    '+2348011112222',
    'super_admin',
    'active',
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE
  SET
    role = 'super_admin',
    account_status = 'active',
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    updated_at = now();

  -- ==========================================================================
  -- 2. OPERATIONS ADMIN (Dispatch queue, rider approvals, cash reconciliation)
  -- ==========================================================================
  INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token
  ) VALUES (
    ops_admin_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'admin@swiftlogistics.ng',
    pw_hash,
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Dutse Operations Admin","role":"operations_admin"}'::jsonb,
    now(),
    now(),
    '',
    ''
  )
  ON CONFLICT (id) DO UPDATE
  SET
    encrypted_password = EXCLUDED.encrypted_password,
    email_confirmed_at = now(),
    raw_user_meta_data = EXCLUDED.raw_user_meta_data,
    updated_at = now();

  INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    last_sign_in_at,
    created_at,
    updated_at
  ) VALUES (
    ops_admin_id,
    ops_admin_id,
    jsonb_build_object('sub', ops_admin_id::text, 'email', 'admin@swiftlogistics.ng'),
    'email',
    ops_admin_id::text,
    now(),
    now(),
    now()
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.profiles (
    id,
    full_name,
    email,
    phone,
    role,
    account_status,
    created_at,
    updated_at
  ) VALUES (
    ops_admin_id,
    'Dutse Operations Admin',
    'admin@swiftlogistics.ng',
    '+2348033334444',
    'operations_admin',
    'active',
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE
  SET
    role = 'operations_admin',
    account_status = 'active',
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    updated_at = now();

END $$;
