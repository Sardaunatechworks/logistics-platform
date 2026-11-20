'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Package, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button, Input, Select, Card } from '@/components/ui';
import { VEHICLE_TYPES } from '@/config/constants';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = searchParams.get('role') === 'rider' ? 'rider' : 'customer';

  const [accountType, setAccountType] = useState<'customer' | 'rider'>(initialRole);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Rider specific
  const [vehicleType, setVehicleType] = useState('Motorcycle');
  const [vehicleRegistration, setVehicleRegistration] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);

    try {
      const payload: Record<string, string> = {
        full_name: fullName,
        email,
        phone,
        password,
        account_type: accountType,
      };

      if (accountType === 'rider') {
        payload.vehicle_type = vehicleType;
        payload.vehicle_registration = vehicleRegistration;
      }

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to complete registration');
      }

      router.push(data.redirectUrl || (accountType === 'rider' ? '/rider' : '/customer'));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6 sm:p-8 border-slate-200 shadow-sm">
      {/* Account Type Toggle */}
      <div className="flex rounded-lg bg-slate-100 p-1 mb-6 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setAccountType('customer')}
          className={`flex-1 py-2 rounded-md transition-colors ${
            accountType === 'customer'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Customer / Merchant
        </button>
        <button
          type="button"
          onClick={() => setAccountType('rider')}
          className={`flex-1 py-2 rounded-md transition-colors ${
            accountType === 'rider'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Delivery Rider
        </button>
      </div>

      {error && (
        <div className="mb-5 p-3.5 rounded-lg border border-red-200 bg-red-50 text-red-800 flex items-start gap-2.5 text-xs">
          <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="e.g. Aminu Bello"
          required
        />

        <Input
          label="Email address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
        />

        <Input
          label="Nigerian phone number"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="e.g. 08012345678"
          required
        />

        {accountType === 'rider' && (
          <div className="space-y-4 p-3.5 rounded-lg bg-blue-50/60 border border-blue-100">
            <p className="text-xs font-semibold text-blue-900">Rider Vehicle Details</p>
            <Select
              label="Vehicle type"
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
              options={VEHICLE_TYPES.map((v) => ({ label: v, value: v }))}
              required
            />
            <Input
              label="Vehicle registration / plate number"
              value={vehicleRegistration}
              onChange={(e) => setVehicleRegistration(e.target.value)}
              placeholder="e.g. JGW-123-AA"
              required
            />
            <p className="text-[11px] text-blue-700">
              * New rider accounts require operational review and approval before assignment dispatch.
            </p>
          </div>
        )}

        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 8 characters"
          required
        />

        <Input
          label="Confirm password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Re-enter password"
          required
        />

        <Button type="submit" isLoading={isLoading} className="w-full mt-2" size="md">
          Create Account <ArrowRight className="ml-1.5 h-4 w-4" />
        </Button>
      </form>
    </Card>
  );
}

export default function RegisterPage() {
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
          Create an account
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Already registered?{' '}
          <Link href="/auth/login" className="font-medium text-[#1D4ED8] hover:underline">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <Suspense fallback={<div className="h-64 bg-slate-100 rounded-xl animate-pulse" />}>
          <RegisterForm />
        </Suspense>
      </div>
    </div>
  );
}
