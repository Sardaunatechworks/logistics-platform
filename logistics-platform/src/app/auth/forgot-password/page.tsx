'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Package, ArrowLeft, Mail, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { Button, Input, Card } from '@/components/ui';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit password reset request.');
      }

      setIsSubmitted(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error processing request';
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
          <span>
            Swift<span className="text-[#1D4ED8]">Logistics</span>
          </span>
        </Link>
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
          Reset your password
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Enter your registered email address to receive password recovery instructions.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <Card className="p-6 sm:p-8 border-slate-200 shadow-sm">
          {isSubmitted ? (
            <div className="text-center space-y-4 py-2">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Check your inbox</h3>
              <p className="text-sm text-slate-600">
                If an account exists for <span className="font-semibold text-slate-900">{email}</span>, we have dispatched a password reset link.
              </p>
              <div className="pt-4 border-t border-slate-100">
                <Link
                  href="/auth/login"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-[#1D4ED8] hover:underline"
                >
                  <ArrowLeft className="h-4 w-4" /> Return to sign in
                </Link>
              </div>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-5 p-3.5 rounded-lg border border-red-200 bg-red-50 text-red-800 flex items-start gap-2.5 text-xs">
                  <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Registered Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                />

                <Button type="submit" isLoading={isLoading} className="w-full mt-2" size="md">
                  Send Recovery Link <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              </form>

              <div className="mt-5 pt-4 border-t border-slate-100 text-center">
                <Link
                  href="/auth/login"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
                </Link>
              </div>
            </>
          )}
        </Card>

        <p className="mt-6 text-center text-xs text-slate-500">
          SwiftLogistics Operations Platform • Dutse Baseline
        </p>
      </div>
    </div>
  );
}
