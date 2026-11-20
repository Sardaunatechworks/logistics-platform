'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Package, Search, Clock, CheckCircle2, AlertCircle, MapPin, Shield } from 'lucide-react';
import { Button, Input, Card, Badge, DeliveryStatusBadge } from '@/components/ui';
import { PublicHeader, PublicFooter } from '@/components/layout';
import type { DeliveryStatus, DeliveryType } from '@/types/database';
import { DELIVERY_TYPE_LABELS } from '@/types/database';
import { STATUS_DESCRIPTIONS } from '@/config/constants';

interface TrackingResult {
  tracking_number: string;
  delivery_status: DeliveryStatus;
  delivery_type: DeliveryType;
  pickup_city: string;
  pickup_state: string;
  destination_city: string;
  destination_state: string;
  created_at: string;
  status_history: {
    status: DeliveryStatus;
    timestamp: string;
    description: string;
  }[];
}

function TrackingForm() {
  const searchParams = useSearchParams();
  const initialRef = searchParams.get('ref') || '';
  const [trackingNumber, setTrackingNumber] = useState(initialRef);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TrackingResult | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = trackingNumber.trim().toUpperCase();
    if (!query) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`/api/tracking/${encodeURIComponent(query)}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Tracking reference not found');
      }

      setResult(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to find tracking reference';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Search Bar */}
      <Card className="p-6 sm:p-8 mb-8 border-slate-200 shadow-sm">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Enter tracking code (e.g. DLV-4F8B2C)"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value.toUpperCase())}
              className="uppercase font-mono text-base tracking-wider"
              required
            />
          </div>
          <Button type="submit" isLoading={isLoading} size="md" className="sm:w-32">
            <Search className="h-4 w-4 mr-2" />
            Track
          </Button>
        </form>

        <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
          <Shield className="h-3.5 w-3.5 text-slate-400" />
          <span>Public tracking mode: personal phone numbers and private addresses are concealed.</span>
        </div>
      </Card>

      {/* Error message */}
      {error && (
        <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-red-800 flex items-start gap-3 mb-8">
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-sm">Delivery Reference Not Found</p>
            <p className="text-xs text-red-700 mt-0.5">
              {error}. Please check the reference code on your receipt or SMS and try again.
            </p>
          </div>
        </div>
      )}

      {/* Tracking Details & Timeline */}
      {result && (
        <div className="space-y-6">
          <Card className="p-6 border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Tracking Reference
                </span>
                <h2 className="text-2xl font-mono font-bold text-slate-900 mt-0.5">
                  {result.tracking_number}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Status:</span>
                <DeliveryStatusBadge status={result.delivery_status} />
              </div>
            </div>

            {/* Route Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-6 border-b border-slate-100 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-slate-500">Pickup Origin</p>
                  <p className="font-semibold text-slate-900">
                    {result.pickup_city}, {result.pickup_state}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-slate-500">Destination</p>
                  <p className="font-semibold text-slate-900">
                    {result.destination_city}, {result.destination_state}
                  </p>
                </div>
              </div>
            </div>

            {/* Status Timeline */}
            <div className="pt-6">
              <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Clock className="h-4 w-4 text-slate-500" />
                Status Timeline
              </h3>

              <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {result.status_history.map((event, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-6 top-1.5 h-4 w-4 rounded-full border-2 border-white bg-[#1D4ED8] shadow-xs" />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-slate-900 capitalize">
                          {event.status.replace('_', ' ')}
                        </span>
                        <span className="text-xs text-slate-400">
                          {new Date(event.timestamp).toLocaleString('en-NG')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">{event.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Disclaimer */}
            <div className="mt-8 pt-4 border-t border-slate-100 text-[11px] text-slate-400">
              Note: In accordance with MVP specification, this tracking system provides checkpoint status updates. Real-time GPS location streaming is not included.
            </div>
          </Card>
        </div>
      )}
    </>
  );
}

export default function TrackPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
      <PublicHeader />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        <div className="text-center space-y-3 mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#1D4ED8] text-xs font-semibold">
            <Package className="h-3.5 w-3.5" />
            <span>Shipment Status Lookup</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Track Your Delivery
          </h1>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            Enter your tracking reference number to see current progress and dispatch updates.
          </p>
        </div>

        <Suspense fallback={<div className="h-32 bg-slate-100 rounded-xl animate-pulse" />}>
          <TrackingForm />
        </Suspense>
      </main>

      <PublicFooter />
    </div>
  );
}
