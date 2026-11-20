'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Package,
  Truck,
  Users,
  CreditCard,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { Button, Card, DeliveryStatusBadge, EmptyState } from '@/components/ui';
import { DashboardLayout } from '@/components/layout';
import { formatNaira, formatDate } from '@/lib/utils';
import type { Delivery } from '@/types/database';

export default function AdminDashboardPage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadMetrics() {
      try {
        const res = await fetch('/api/deliveries?limit=100');
        const data = await res.json();
        if (res.ok) {
          setDeliveries(data.deliveries || []);
        }
      } catch (err) {
        console.error('Error loading admin dashboard metrics:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadMetrics();
  }, []);

  const totalCount = deliveries.length;
  const pendingCount = deliveries.filter((d) => d.delivery_status === 'pending').length;
  const unassignedCount = deliveries.filter(
    (d) => d.delivery_status === 'pending' || d.delivery_status === 'confirmed'
  ).length;
  const activeCount = deliveries.filter(
    (d) =>
      d.delivery_status === 'assigned' ||
      d.delivery_status === 'accepted' ||
      d.delivery_status === 'picked_up' ||
      d.delivery_status === 'in_transit'
  ).length;
  const completedCount = deliveries.filter((d) => d.delivery_status === 'delivered').length;
  const totalRevenueKobo = deliveries
    .filter((d) => d.delivery_status === 'delivered')
    .reduce((sum, d) => sum + (d.total_amount_kobo || 0), 0);

  return (
    <DashboardLayout
      user={{
        fullName: 'Operations Administrator',
        email: 'ops@swiftlogistics.ng',
        role: 'operations_admin',
      }}
    >
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Operational Command Center
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Real-time delivery operations metrics for Dutse, Jigawa State.
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/admin/dispatch">
              <Button size="sm">
                <Truck className="mr-2 h-4 w-4" /> Open Dispatch Queue
              </Button>
            </Link>
          </div>
        </div>

        {/* Operational Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5 border-slate-200">
            <p className="text-xs font-semibold uppercase text-slate-500">Awaiting Assignment</p>
            <div className="flex items-center justify-between mt-2">
              <p className="text-3xl font-extrabold text-amber-600">{unassignedCount}</p>
              <div className="p-2.5 rounded-lg bg-amber-50 text-amber-700">
                <Clock className="h-5 w-5" />
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-2">Requests waiting for rider</p>
          </Card>

          <Card className="p-5 border-slate-200">
            <p className="text-xs font-semibold uppercase text-slate-500">Active In-Transit</p>
            <div className="flex items-center justify-between mt-2">
              <p className="text-3xl font-extrabold text-[#1D4ED8]">{activeCount}</p>
              <div className="p-2.5 rounded-lg bg-blue-50 text-[#1D4ED8]">
                <Truck className="h-5 w-5" />
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-2">Live shipments on road</p>
          </Card>

          <Card className="p-5 border-slate-200">
            <p className="text-xs font-semibold uppercase text-slate-500">Completed (OTP)</p>
            <div className="flex items-center justify-between mt-2">
              <p className="text-3xl font-extrabold text-emerald-700">{completedCount}</p>
              <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-700">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-2">Successfully handed over</p>
          </Card>

          <Card className="p-5 border-slate-200">
            <p className="text-xs font-semibold uppercase text-slate-500">Total Fulfilled Revenue</p>
            <div className="flex items-center justify-between mt-2">
              <p className="text-2xl font-extrabold text-slate-900">
                {formatNaira(totalRevenueKobo)}
              </p>
              <div className="p-2.5 rounded-lg bg-slate-100 text-slate-700">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-2">Completed deliveries volume</p>
          </Card>
        </div>

        {/* Dispatch Queue Quick Link Card */}
        {unassignedCount > 0 && (
          <div className="p-4 rounded-xl border border-amber-300 bg-amber-50/70 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-800 shrink-0">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-amber-950">
                  {unassignedCount} deliveries require rider allocation
                </p>
                <p className="text-xs text-amber-800">
                  Review unassigned customer shipments and dispatch available riders.
                </p>
              </div>
            </div>
            <Link href="/admin/dispatch">
              <Button size="sm" className="bg-amber-800 hover:bg-amber-900 text-white whitespace-nowrap">
                Go to Dispatch Queue <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}

        {/* Recent Operational Deliveries */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">All Operations Shipments</h2>
            <Link
              href="/admin/deliveries"
              className="text-xs font-semibold text-[#1D4ED8] hover:underline flex items-center gap-1"
            >
              Detailed view <ArrowRight className="h-3 w-3" />
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
              title="No operational data recorded yet"
              description="Deliveries created by customers or merchants will automatically appear here."
            />
          ) : (
            <div className="space-y-3">
              {deliveries.slice(0, 10).map((del) => (
                <div
                  key={del.id}
                  className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs hover:border-slate-300 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-bold text-xs text-[#1D4ED8]">
                        {del.tracking_number}
                      </span>
                      <DeliveryStatusBadge status={del.delivery_status} />
                      <span className="text-xs font-medium text-slate-700">
                        {formatNaira(del.total_amount_kobo)} ({del.payment_method})
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">
                      {del.pickup_area || del.pickup_city} → {del.destination_area || del.destination_city} • Recipient: <strong>{del.recipient_name}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400">{formatDate(del.created_at)}</span>
                    <Link href={`/track?ref=${del.tracking_number}`}>
                      <Button variant="outline" size="sm">
                        Track
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

