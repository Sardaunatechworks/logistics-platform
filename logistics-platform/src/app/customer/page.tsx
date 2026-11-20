'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Package,
  PlusCircle,
  Truck,
  CheckCircle2,
  Clock,
  ArrowRight,
  Search,
} from 'lucide-react';
import { Button, Card, DeliveryStatusBadge, EmptyState } from '@/components/ui';
import { DashboardLayout } from '@/components/layout';
import { formatNaira, formatDate } from '@/lib/utils';
import type { Delivery } from '@/types/database';

export default function CustomerDashboardPage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/deliveries?limit=5');
        const data = await res.json();
        if (res.ok) {
          setDeliveries(data.deliveries || []);
        }
      } catch (err) {
        console.error('Error loading dashboard deliveries:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const pendingCount = deliveries.filter((d) => d.delivery_status === 'pending').length;
  const inTransitCount = deliveries.filter(
    (d) => d.delivery_status === 'in_transit' || d.delivery_status === 'assigned'
  ).length;
  const deliveredCount = deliveries.filter((d) => d.delivery_status === 'delivered').length;

  return (
    <DashboardLayout
      user={{
        fullName: 'Customer Account',
        email: 'customer@swiftlogistics.ng',
        role: 'customer',
      }}
    >
      <div className="space-y-8">
        {/* Header Greeting */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Welcome back
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Dispatch orders and monitor parcels across Dutse and regional corridors.
            </p>
          </div>
          <Link href="/customer/book">
            <Button size="md">
              <PlusCircle className="mr-2 h-4 w-4" /> Book a Delivery
            </Button>
          </Link>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-5 border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Pending Dispatch
                </p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{pendingCount}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
                <Clock className="h-5 w-5" />
              </div>
            </div>
          </Card>

          <Card className="p-5 border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  In Transit
                </p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{inTransitCount}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-[#1D4ED8]">
                <Truck className="h-5 w-5" />
              </div>
            </div>
          </Card>

          <Card className="p-5 border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Completed
                </p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{deliveredCount}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Tracking shortcut */}
        <Card className="p-6 border-slate-200 bg-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Track an incoming shipment</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Have a reference code from another sender? Look up the checkpoint timeline.
              </p>
            </div>
            <form action="/track" method="GET" className="flex gap-2 w-full sm:w-auto">
              <input
                name="ref"
                type="text"
                placeholder="e.g. DLV-4A9B8C"
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm uppercase text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] w-full sm:w-64"
                required
              />
              <Button type="submit" variant="secondary" size="sm">
                <Search className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </Card>

        {/* Recent Deliveries */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Recent Deliveries</h2>
            <Link
              href="/customer/deliveries"
              className="text-xs font-semibold text-[#1D4ED8] hover:underline flex items-center gap-1"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 rounded-xl bg-slate-200/50 animate-pulse" />
              ))}
            </div>
          ) : deliveries.length === 0 ? (
            <EmptyState
              title="No deliveries yet"
              description="You have not requested any deliveries. Schedule a pickup to send your first parcel."
              actionLabel="Book a Delivery"
              onAction={() => (window.location.href = '/customer/book')}
            />
          ) : (
            <div className="space-y-3">
              {deliveries.slice(0, 5).map((del) => (
                <div
                  key={del.id}
                  className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs hover:border-slate-300 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-[#1D4ED8]">
                        {del.tracking_number}
                      </span>
                      <DeliveryStatusBadge status={del.delivery_status} />
                    </div>
                    <p className="text-xs text-slate-600">
                      To: <strong>{del.recipient_name}</strong> • {del.destination_area || del.destination_city}
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 text-xs">
                    <span className="text-slate-500 font-medium">
                      {formatNaira(del.total_amount_kobo)}
                    </span>
                    <Link href={`/track?ref=${del.tracking_number}`}>
                      <Button variant="ghost" size="sm">
                        Timeline
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

