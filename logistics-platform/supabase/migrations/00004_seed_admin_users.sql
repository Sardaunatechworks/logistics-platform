-- ============================================================================
-- Migration: 00004_seed_admin_users.sql
-- Description: Seeds initial Super Admin and Operations Admin credentials into
--              Supabase Auth (auth.users, auth.identities) and public.profiles
--              with ON CONFLICT resolution for automatic auth triggers.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Remove previous records to ensure a completely clean slate
DELETE FROM auth.identities WHERE email IN ('superadmin@swiftlogistics.ng', 'admin@swiftlogistics.ng');
DELETE FROM public.profiles WHERE email IN ('superadmin@swiftlogistics.ng', 'admin@swiftlogistics.ng');
DELETE FROM auth.users WHERE email IN ('superadmin@swiftlogistics.ng', 'admin@swiftlogistics.ng');

DO $$
DECLARE
  super_id UUID := gen_random_uuid();
  admin_id UUID := gen_random_uuid();
  pw_hash  TEXT := crypt('AdminPassword123!', gen_salt('bf', 10));
BEGIN

  -- --------------------------------------------------------------------------
  -- 1. SUPER ADMIN (Full system access, role management, pricing control)
  -- --------------------------------------------------------------------------
  INSERT INTO auth.users (
    instance_id,
    id,
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
    '00000000-0000-0000-0000-000000000000',
    super_id,
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
  );

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
    super_id,
    super_id,
    jsonb_build_object('sub', super_id::text, 'email', 'superadmin@swiftlogistics.ng'),
    'email',
    super_id::text,
    now(),
    now(),
    now()
  );

  -- Handle trigger collision gracefully with ON CONFLICT DO UPDATE
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
    super_id,
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
    full_name = 'System Super Administrator',
    phone = '+2348011112222',
    updated_at = now();

  -- --------------------------------------------------------------------------
  -- 2. OPERATIONS ADMIN (Dispatch queue, rider approvals, cash settlements)
  -- --------------------------------------------------------------------------
  INSERT INTO auth.users (
    instance_id,
    id,
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
    '00000000-0000-0000-0000-000000000000',
    admin_id,
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
  );

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
    admin_id,
    admin_id,
    jsonb_build_object('sub', admin_id::text, 'email', 'admin@swiftlogistics.ng'),
    'email',
    admin_id::text,
    now(),
    now(),
    now()
  );

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
    admin_id,
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
    full_name = 'Dutse Operations Admin',
    phone = '+2348033334444',
    updated_at = now();

END $$;
