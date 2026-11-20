'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Package, Search, MapPin, Calendar, Clock } from 'lucide-react';
import { Button, Input, Card, DeliveryStatusBadge, EmptyState } from '@/components/ui';
import { DashboardLayout } from '@/components/layout';
import { formatNaira, formatDate } from '@/lib/utils';
import type { Delivery } from '@/types/database';

export default function AdminDeliveriesPage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadDeliveries();
  }, [statusFilter]);

  const loadDeliveries = async () => {
    setIsLoading(true);
    try {
      const url = new URL('/api/deliveries', window.location.origin);
      if (statusFilter !== 'all') url.searchParams.set('status', statusFilter);
      if (search) url.searchParams.set('search', search);

      const res = await fetch(url.toString());
      const data = await res.json();
      if (res.ok) {
        setDeliveries(data.deliveries || []);
      }
    } catch (err) {
      console.error('Error fetching admin deliveries:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadDeliveries();
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
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">All Operations Deliveries</h1>
          <p className="text-sm text-slate-500 mt-1">
            Complete database audit and log of customer shipments and dispatch records.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
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
            {['all', 'pending', 'assigned', 'accepted', 'picked_up', 'in_transit', 'delivered', 'failed', 'cancelled'].map((st) => (
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

        <Card className="p-0 border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Tracking Ref</th>
                  <th className="px-6 py-3.5">Route (Origin → Destination)</th>
                  <th className="px-6 py-3.5">Recipient</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Amount</th>
                  <th className="px-6 py-3.5">Created Date</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                      Loading deliveries...
                    </td>
                  </tr>
                ) : deliveries.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                      No deliveries found matching current criteria.
                    </td>
                  </tr>
                ) : (
                  deliveries.map((del) => (
                    <tr key={del.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 font-mono font-bold text-[#1D4ED8]">
                        {del.tracking_number}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {del.pickup_area || del.pickup_city} → {del.destination_area || del.destination_city}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {del.recipient_name}
                      </td>
                      <td className="px-6 py-4">
                        <DeliveryStatusBadge status={del.delivery_status} />
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900">
                        {formatNaira(del.total_amount_kobo)}
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {formatDate(del.created_at)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link href={`/track?ref=${del.tracking_number}`}>
                          <Button variant="outline" size="sm" className="text-xs py-1 px-2.5 min-h-[32px]">
                            Track
                          </Button>
                        </Link>
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

