'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Package, Search, PlusCircle, ArrowRight, MapPin, Calendar, Clock } from 'lucide-react';
import { Button, Input, Card, DeliveryStatusBadge, PaymentStatusBadge, EmptyState } from '@/components/ui';
import { DashboardLayout } from '@/components/layout';
import { formatNaira, formatDate } from '@/lib/utils';
import type { Delivery, DeliveryStatus } from '@/types/database';

export default function CustomerDeliveriesPage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchDeliveries();
  }, [statusFilter]);

  const fetchDeliveries = async () => {
    setIsLoading(true);
    try {
      const url = new URL('/api/deliveries', window.location.origin);
      if (statusFilter !== 'all') {
        url.searchParams.set('status', statusFilter);
      }
      if (search) {
        url.searchParams.set('search', search);
      }
      const res = await fetch(url.toString());
      const data = await res.json();
      if (res.ok) {
        setDeliveries(data.deliveries || []);
      }
    } catch (err) {
      console.error('Error fetching deliveries:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDeliveries();
  };

  return (
    <DashboardLayout
      user={{
        fullName: 'Customer Account',
        email: 'customer@swiftlogistics.ng',
        role: 'customer',
      }}
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Deliveries</h1>
            <p className="text-sm text-slate-500 mt-1">
              View, track, and monitor all your outgoing parcel shipments.
            </p>
          </div>
          <Link href="/customer/book">
            <Button size="sm">
              <PlusCircle className="mr-2 h-4 w-4" /> Book New Delivery
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
            <Input
              placeholder="Search by tracking code or recipient..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white"
            />
            <Button type="submit" variant="secondary" size="md">
              <Search className="h-4 w-4" />
            </Button>
          </form>

          <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
            {['all', 'pending', 'assigned', 'in_transit', 'delivered'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-colors ${
                  statusFilter === st
                    ? 'bg-[#1D4ED8] text-white shadow-2xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Deliveries list */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 rounded-xl bg-slate-200/60 animate-pulse" />
            ))}
          </div>
        ) : deliveries.length === 0 ? (
          <EmptyState
            title="No deliveries found"
            description={
              statusFilter === 'all'
                ? 'You have not submitted any delivery requests yet. Book your first delivery to get started.'
                : `No deliveries matching status '${statusFilter}'.`
            }
            actionLabel="Book a Delivery"
            onAction={() => (window.location.href = '/customer/book')}
          />
        ) : (
          <div className="space-y-3">
            {deliveries.map((del) => (
              <Card key={del.id} className="p-5 border-slate-200 hover:border-slate-300 transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-sm text-[#1D4ED8]">
                        {del.tracking_number}
                      </span>
                      <DeliveryStatusBadge status={del.delivery_status} />
                      <span className="text-xs text-slate-400 capitalize">
                        {del.delivery_type} delivery
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                        <span>{del.pickup_area || del.pickup_city} → {del.destination_area || del.destination_city}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <span>{formatDate(del.created_at)}</span>
                      </div>
                      <div>
                        <span>Recipient: <strong>{del.recipient_name}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                    <div className="text-right sm:text-right">
                      <p className="text-xs text-slate-400">Total Amount</p>
                      <p className="text-base font-bold text-slate-900">
                        {formatNaira(del.total_amount_kobo)}
                      </p>
                    </div>

                    <Link href={`/track?ref=${del.tracking_number}`}>
                      <Button variant="outline" size="sm">
                        Track
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

