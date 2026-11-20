'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Package, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import { Button, Input, Card } from '@/components/ui';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to sign in. Please verify your credentials.');
      }

      // Redirect to target dashboard according to user's assigned role
      router.push(data.redirectUrl || '/customer');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid login attempt';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-[#F8FAFC]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2.5 font-bold text-2xl text-slate-900">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1D4ED8] text-white">
            <Package className="h-6 w-6" />
          </div>
          <span>Swift<span className="text-[#1D4ED8]">Logistics</span></span>
        </Link>
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
          Sign in to your account
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Or{' '}
          <Link href="/auth/register" className="font-medium text-[#1D4ED8] hover:underline">
            create a new account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <Card className="p-6 sm:p-8 border-slate-200 shadow-sm">
          {error && (
            <div className="mb-5 p-3.5 rounded-lg border border-red-200 bg-red-50 text-red-800 flex items-start gap-2.5 text-xs">
              <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-slate-600">
                <input type="checkbox" className="rounded border-slate-300 text-[#1D4ED8]" />
                <span>Remember me</span>
              </label>
              <Link href="/auth/forgot-password" className="text-[#1D4ED8] hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" isLoading={isLoading} className="w-full mt-2" size="md">
              Sign In <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </form>
        </Card>

        <p className="mt-6 text-center text-xs text-slate-500">
          SwiftLogistics Operations Platform • Dutse Baseline
        </p>
      </div>
    </div>
  );
}

