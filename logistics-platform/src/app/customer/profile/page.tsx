'use client';

import React, { useState, useEffect } from 'react';
import { User, Phone, Mail, Shield, CheckCircle, Save } from 'lucide-react';
import { Button, Input, Card, Badge } from '@/components/ui';
import { DashboardLayout } from '@/components/layout';
import type { Profile } from '@/types/database';

export default function CustomerProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/customer/profile');
      const data = await res.json();
      if (res.ok && data.profile) {
        setProfile(data.profile);
        setFullName(data.profile.full_name || '');
        setPhone(data.profile.phone || '');
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/customer/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName,
          phone,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      setProfile(data.profile);
      setSuccessMsg('Your profile has been successfully updated.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error updating profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardLayout
      user={{
        name: fullName || 'Account',
        role: 'customer',
      }}
    >
      <div className="max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Profile & Settings</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your personal contact information and delivery notification preferences.
          </p>
        </div>

        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            {successMsg}
          </div>
        )}

        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
            {errorMsg}
          </div>
        )}

        <Card className="p-6 border-slate-200">
          {isLoading ? (
            <div className="space-y-4">
              <div className="h-10 bg-slate-100 animate-pulse rounded-lg" />
              <div className="h-10 bg-slate-100 animate-pulse rounded-lg" />
              <div className="h-10 bg-slate-100 animate-pulse rounded-lg" />
            </div>
          ) : (
            <form onSubmit={handleUpdate} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-9"
                    placeholder="Muhammad Aminu"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-9"
                    placeholder="08012345678"
                    required
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Used by dispatchers and delivery riders to coordinate pickup in Dutse.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <Input
                    value={profile?.email || ''}
                    disabled
                    className="pl-9 bg-slate-50 text-slate-500 cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Managed via your authentication account.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-slate-400" />
                  <span className="text-xs text-slate-500">
                    Status: <span className="font-semibold text-emerald-700 uppercase">{profile?.account_status || 'active'}</span>
                  </span>
                </div>
                <Button type="submit" isLoading={isSaving} className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  Save Changes
                </Button>
              </div>
            </form>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
