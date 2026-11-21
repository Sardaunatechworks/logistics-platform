'use client';

import React, { useState, useEffect } from 'react';
import {
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  AlertCircle,
  KeyRound,
  ShieldCheck,
  Package,
} from 'lucide-react';
import { Button, Card, DeliveryStatusBadge, EmptyState, Input } from '@/components/ui';
import { DashboardLayout } from '@/components/layout';
import { formatNaira } from '@/lib/utils';
import type { Delivery, DeliveryStatus } from '@/types/database';

interface RiderAssignment {
  id: string; // assignment_id
  assignment_status: string;
  delivery: Delivery;
}

export default function RiderDashboardPage() {
  const [activeJobs, setActiveJobs] = useState<RiderAssignment[]>([]);
  const [offeredJobs, setOfferedJobs] = useState<RiderAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [otpModalJob, setOtpModalJob] = useState<Delivery | null>(null);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadRiderData();
  }, []);

  const loadRiderData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/rider/assignments');
      const data = await res.json();
      if (res.ok) {
        setActiveJobs(data.active || []);
        setOfferedJobs(data.offered || []);
      }
    } catch (err) {
      console.error('Error loading rider assignments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRespond = async (assignmentId: string, action: 'accept' | 'reject') => {
    setStatusMessage(null);
    try {
      const res = await fetch(`/api/assignments/${assignmentId}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update assignment');

      setStatusMessage({
        type: 'success',
        text: action === 'accept' ? 'Assignment accepted! Proceed to pickup location.' : 'Assignment rejected.',
      });
      loadRiderData();
    } catch (err: unknown) {
      setStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Error updating assignment',
      });
    }
  };

  const handleStatusUpdate = async (deliveryId: string, targetStatus: DeliveryStatus, otp?: string) => {
    setStatusMessage(null);
    try {
      const res = await fetch(`/api/deliveries/${deliveryId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target_status: targetStatus, otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update delivery status');

      setStatusMessage({
        type: 'success',
        text: `Delivery status successfully updated to ${targetStatus.replace('_', ' ')}!`,
      });
      setOtpModalJob(null);
      setEnteredOtp('');
      loadRiderData();
    } catch (err: unknown) {
      setStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Error updating status',
      });
    }
  };

  return (
    <DashboardLayout
      user={{
        fullName: 'Verified Rider',
        email: 'rider@swiftlogistics.ng',
        role: 'rider',
      }}
    >
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Rider Dispatch Console</h1>
            <p className="text-sm text-slate-500 mt-1">
              Dutse Operational Zone • Active Fleet
            </p>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Ready for Deliveries</span>
          </div>
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

        {/* Offered Assignments */}
        {offeredJobs.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-600" />
              Offered Assignments ({offeredJobs.length})
            </h2>

            {offeredJobs.map((job) => (
              <Card key={job.id} className="p-5 border-amber-300 bg-amber-50/30">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-sm text-[#1D4ED8]">
                      {job.delivery.tracking_number}
                    </span>
                    <span className="text-xs font-bold text-slate-900">
                      Fee: {formatNaira(job.delivery.total_amount_kobo)} ({job.delivery.payment_method})
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
                    <div>
                      <p className="font-semibold text-slate-900">Pickup</p>
                      <p>{job.delivery.pickup_contact_name} ({job.delivery.pickup_contact_phone})</p>
                      <p className="text-slate-500">{job.delivery.pickup_address}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">Dropoff</p>
                      <p>{job.delivery.recipient_name} ({job.delivery.recipient_phone})</p>
                      <p className="text-slate-500">{job.delivery.destination_address}</p>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      variant="outline"
                      className="flex-1 border-red-200 text-red-700 hover:bg-red-50"
                      onClick={() => handleRespond(job.id, 'reject')}
                    >
                      Reject
                    </Button>
                    <Button
                      className="flex-1 bg-emerald-700 hover:bg-emerald-800"
                      onClick={() => handleRespond(job.id, 'accept')}
                    >
                      Accept Assignment
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Active Deliveries */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Truck className="h-4 w-4 text-[#1D4ED8]" />
            Active Delivery ({activeJobs.length})
          </h2>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-32 rounded-xl bg-slate-200/50 animate-pulse" />
              ))}
            </div>
          ) : activeJobs.length === 0 ? (
            <EmptyState
              title="No active deliveries"
              description="You have no current active deliveries. New assignments from Dutse dispatch will appear here."
              icon={<Truck className="h-7 w-7 text-slate-400" />}
            />
          ) : (
            <div className="space-y-4">
              {activeJobs.map((job) => {
                const del = job.delivery;
                return (
                  <Card key={job.id} className="p-6 border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div>
                        <span className="font-mono font-bold text-base text-[#1D4ED8]">
                          {del.tracking_number}
                        </span>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Package: {del.package_description} ({del.package_size})
                        </p>
                      </div>
                      <DeliveryStatusBadge status={del.delivery_status} />
                    </div>

                    {/* Routing Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="p-3 rounded-lg bg-blue-50/50 border border-blue-100 space-y-1">
                        <span className="font-bold text-blue-900 uppercase">Pickup Location</span>
                        <p className="font-semibold text-slate-900">
                          {del.pickup_contact_name} —{' '}
                          <a href={`tel:${del.pickup_contact_phone}`} className="text-[#1D4ED8] underline">
                            {del.pickup_contact_phone}
                          </a>
                        </p>
                        <p className="text-slate-600">{del.pickup_address}</p>
                      </div>

                      <div className="p-3 rounded-lg bg-emerald-50/50 border border-emerald-100 space-y-1">
                        <span className="font-bold text-emerald-900 uppercase">Destination</span>
                        <p className="font-semibold text-slate-900">
                          {del.recipient_name} —{' '}
                          <a href={`tel:${del.recipient_phone}`} className="text-emerald-700 underline">
                            {del.recipient_phone}
                          </a>
                        </p>
                        <p className="text-slate-600">{del.destination_address}</p>
                      </div>
                    </div>

                    {/* Touch Action Controls */}
                    <div className="pt-2">
                      {del.delivery_status === 'accepted' && (
                        <Button
                          className="w-full text-base min-h-[48px]"
                          onClick={() => handleStatusUpdate(del.id, 'picked_up')}
                        >
                          Confirm Package Picked Up
                        </Button>
                      )}

                      {del.delivery_status === 'picked_up' && (
                        <Button
                          className="w-full text-base min-h-[48px] bg-blue-600 hover:bg-blue-700"
                          onClick={() => handleStatusUpdate(del.id, 'in_transit')}
                        >
                          Start In-Transit Delivery
                        </Button>
                      )}

                      {del.delivery_status === 'in_transit' && (
                        <Button
                          className="w-full text-base min-h-[48px] bg-emerald-700 hover:bg-emerald-800"
                          onClick={() => setOtpModalJob(del)}
                        >
                          <KeyRound className="mr-2 h-5 w-5" />
                          Hand Over & Verify Recipient OTP
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* OTP Verification Modal */}
        {otpModalJob && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4">
              <div className="text-center space-y-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 mx-auto">
                  <KeyRound className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  Recipient Proof of Delivery Code
                </h3>
                <p className="text-xs text-slate-500">
                  Ask recipient <strong>{otpModalJob.recipient_name}</strong> for their 6-digit confirmation code or delivery reference code.
                </p>
              </div>

              <div className="space-y-3">
                <Input
                  type="text"
                  maxLength={20}
                  placeholder="e.g. 582910 or DLV-4F8B2C"
                  value={enteredOtp}
                  onChange={(e) => setEnteredOtp(e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, ''))}
                  className="text-center text-xl font-mono tracking-wider min-h-[52px]"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setOtpModalJob(null);
                    setEnteredOtp('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-emerald-700 hover:bg-emerald-800"
                  disabled={enteredOtp.trim().length < 4 || isVerifyingOtp}
                  isLoading={isVerifyingOtp}
                  onClick={async () => {
                    setIsVerifyingOtp(true);
                    await handleStatusUpdate(otpModalJob.id, 'delivered', enteredOtp.trim());
                    setIsVerifyingOtp(false);
                  }}
                >
                  Complete Delivery
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

