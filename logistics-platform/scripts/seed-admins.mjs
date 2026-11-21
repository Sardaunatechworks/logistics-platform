import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// 1. Read environment variables from .env / .env.local
function loadEnv() {
  const envPaths = [
    path.resolve(process.cwd(), '.env.local'),
    path.resolve(process.cwd(), '.env'),
    path.resolve(process.cwd(), '../.env.local'),
    path.resolve(process.cwd(), '../.env'),
  ];

  for (const envPath of envPaths) {
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx !== -1) {
          const key = trimmed.slice(0, eqIdx).trim();
          const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      }
    }
  }
}

loadEnv();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !serviceKey || serviceKey.includes('placeholder')) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be defined in .env');
  process.exit(1);
}

const adminSupabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const clientSupabase = createClient(url, anonKey || serviceKey);

const accountsToSeed = [
  {
    email: 'superadmin@swiftlogistics.ng',
    password: 'AdminPassword123!',
    fullName: 'System Super Administrator',
    phone: '+2348011112222',
    role: 'super_admin',
  },
  {
    email: 'admin@swiftlogistics.ng',
    password: 'AdminPassword123!',
    fullName: 'Dutse Operations Admin',
    phone: '+2348033334444',
    role: 'operations_admin',
  },
];

async function seed() {
  console.log('--- Seeding Admin Accounts via Supabase Auth Admin API ---');

  for (const acc of accountsToSeed) {
    console.log(`\nProcessing: ${acc.email} (${acc.role})...`);

    // Check if user already exists
    const { data: usersData, error: listErr } = await adminSupabase.auth.admin.listUsers();
    if (listErr) {
      console.error('Failed to list users:', listErr.message);
      return;
    }

    const existingUser = usersData.users.find((u) => u.email?.toLowerCase() === acc.email.toLowerCase());
    let userId = null;

    if (existingUser) {
      console.log(`Found existing auth record (ID: ${existingUser.id}). Resetting password and confirming email...`);
      const { data: updateData, error: updateErr } = await adminSupabase.auth.admin.updateUserById(
        existingUser.id,
        {
          password: acc.password,
          email_confirm: true,
          user_metadata: {
            full_name: acc.fullName,
            phone: acc.phone,
            role: acc.role,
          },
        }
      );

      if (updateErr) {
        console.error(`Failed to update user ${acc.email}:`, updateErr.message);
        continue;
      }
      userId = updateData.user.id;
    } else {
      console.log(`Creating new user with confirmed email...`);
      const { data: createData, error: createErr } = await adminSupabase.auth.admin.createUser({
        email: acc.email,
        password: acc.password,
        email_confirm: true,
        user_metadata: {
          full_name: acc.fullName,
          phone: acc.phone,
          role: acc.role,
        },
      });

      if (createErr) {
        console.error(`Failed to create user ${acc.email}:`, createErr.message);
        continue;
      }
      userId = createData.user.id;
    }

    // Ensure public.profiles is synced
    console.log(`Syncing public.profiles for ID: ${userId}...`);
    const { error: profileErr } = await adminSupabase.from('profiles').upsert({
      id: userId,
      full_name: acc.fullName,
      email: acc.email,
      phone: acc.phone,
      role: acc.role,
      account_status: 'active',
      updated_at: new Date().toISOString(),
    });

    if (profileErr) {
      console.error(`Warning on public.profiles upsert:`, profileErr.message);
    } else {
      console.log(`✓ public.profiles successfully updated to role '${acc.role}'.`);
    }

    // Test sign-in to verify credentials work
    console.log(`Testing signInWithPassword for ${acc.email}...`);
    const { data: signInData, error: signInErr } = await clientSupabase.auth.signInWithPassword({
      email: acc.email,
      password: acc.password,
    });

    if (signInErr) {
      console.error(`✗ Test login failed for ${acc.email}:`, signInErr.message);
    } else {
      console.log(`✓ SUCCESS! Verified credentials for ${acc.email} (Session active: ${!!signInData.session})`);
    }
  }

  console.log('\n--- Seeding Process Complete ---');
}

seed().catch((err) => {
  console.error('Fatal error during seed:', err);
});

