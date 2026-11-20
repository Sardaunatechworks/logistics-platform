'use client';

import React, { useState, useEffect } from 'react';
import { Users, CheckCircle2, XCircle, AlertCircle, ShieldCheck, Truck } from 'lucide-react';
import { Button, Card, Badge, EmptyState } from '@/components/ui';
import { DashboardLayout } from '@/components/layout';

interface RiderFleetItem {
  id: string; // user_id
  rider_profile_id: string;
  name: string;
  phone: string;
  email: string;
  vehicle: string;
  verification_status: 'pending' | 'approved' | 'rejected';
  availability_status: 'available' | 'unavailable' | 'suspended';
  account_status: string;
}

export default function AdminRidersPage() {
  const [riders, setRiders] = useState<RiderFleetItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionInProgressId, setActionInProgressId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadRiders();
  }, []);

  const loadRiders = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/riders');
      const data = await res.json();
      if (res.ok) {
        setRiders(data.riders || []);
      }
    } catch (err) {
      console.error('Error fetching riders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveReject = async (riderProfileId: string, action: 'approve' | 'reject') => {
    setActionInProgressId(riderProfileId);
    setStatusMessage(null);

    try {
      const res = await fetch(`/api/admin/riders/${riderProfileId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update rider');

      setStatusMessage({
        type: 'success',
        text: `Rider successfully marked as ${action === 'approve' ? 'Approved' : 'Rejected'}.`,
      });
      loadRiders();
    } catch (err: unknown) {
      setStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Error updating rider status',
      });
    } finally {
      setActionInProgressId(null);
    }
  };

  return (
    <DashboardLayout
      user={{
        fullName: 'Operations Administrator',
        email: 'ops@swiftlogistics.ng',
        role: 'operations_admin',
      }}
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Rider Fleet Management</h1>
          <p className="text-sm text-slate-500 mt-1">
            Review onboarding submissions and manage approved riders operating in Dutse.
          </p>
        </div>

        {statusMessage && (
          <div
            className={`p-3.5 rounded-lg flex items-center gap-2.5 text-xs ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        <Card className="p-0 border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Rider Name</th>
                  <th className="px-6 py-3.5">Contact</th>
                  <th className="px-6 py-3.5">Vehicle Details</th>
                  <th className="px-6 py-3.5">Verification</th>
                  <th className="px-6 py-3.5">Availability</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                      Loading rider fleet data...
                    </td>
                  </tr>
                ) : riders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                      No registered delivery riders yet.
                    </td>
                  </tr>
                ) : (
                  riders.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        {r.name}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        <p>{r.phone}</p>
                        <p className="text-[11px] text-slate-400">{r.email}</p>
                      </td>
                      <td className="px-6 py-4 text-slate-700">
                        {r.vehicle}
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant={
                            r.verification_status === 'approved'
                              ? 'success'
                              : r.verification_status === 'rejected'
                              ? 'danger'
                              : 'warning'
                          }
                        >
                          {r.verification_status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant={
                            r.availability_status === 'available'
                              ? 'success'
                              : 'muted'
                          }
                        >
                          {r.availability_status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {r.verification_status === 'pending' ? (
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              className="bg-emerald-700 hover:bg-emerald-800 text-xs py-1 px-2.5 min-h-[36px]"
                              isLoading={actionInProgressId === r.rider_profile_id}
                              onClick={() => handleApproveReject(r.rider_profile_id, 'approve')}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs py-1 px-2.5 border-red-200 text-red-700 hover:bg-red-50 min-h-[36px]"
                              isLoading={actionInProgressId === r.rider_profile_id}
                              onClick={() => handleApproveReject(r.rider_profile_id, 'reject')}
                            >
                              Reject
                            </Button>
                          </div>
                        ) : r.verification_status === 'approved' ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-xs text-red-600 hover:bg-red-50 min-h-[36px]"
                            onClick={() => handleApproveReject(r.rider_profile_id, 'reject')}
                          >
                            Revoke Approval
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs min-h-[36px]"
                            onClick={() => handleApproveReject(r.rider_profile_id, 'approve')}
                          >
                            Re-approve
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}

