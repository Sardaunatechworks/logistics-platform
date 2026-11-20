'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CreditCard, ArrowRight, CheckCircle2, Clock, XCircle, Search } from 'lucide-react';
import { Card, PaymentStatusBadge, EmptyState } from '@/components/ui';
import { DashboardLayout } from '@/components/layout';
import { formatNaira, formatDate } from '@/lib/utils';
import type { Payment } from '@/types/database';

interface PaymentWithTracking extends Payment {
  tracking_number: string;
}

export default function CustomerPaymentsPage() {
  const [payments, setPayments] = useState<PaymentWithTracking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/customer/payments');
      const data = await res.json();
      if (res.ok) {
        setPayments(data.payments || []);
      }
    } catch (err) {
      console.error('Error fetching payments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPayments = payments.filter((p) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      p.paystack_reference?.toLowerCase().includes(s) ||
      p.tracking_number?.toLowerCase().includes(s) ||
      p.payment_method?.toLowerCase().includes(s)
    );
  });

  const totalSpentKobo = payments
    .filter((p) => p.status === 'successful')
    .reduce((acc, p) => acc + (p.amount_kobo || 0), 0);

  return (
    <DashboardLayout
      user={{
        name: 'Account',
        role: 'customer',
      }}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Payment History</h1>
            <p className="text-sm text-slate-500 mt-1">
              Review transaction receipts, online Paystack payments, and cash-on-delivery settlements.
            </p>
          </div>
          <Card className="p-4 bg-emerald-50 border-emerald-200 flex items-center gap-3">
            <CreditCard className="w-8 h-8 text-emerald-600" />
            <div>
              <p className="text-xs text-emerald-800 font-medium">Total Paid</p>
              <p className="text-lg font-bold text-emerald-950">{formatNaira(totalSpentKobo)}</p>
            </div>
          </Card>
        </div>

        {/* Filter bar */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by reference, tracking number, or method..."
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          />
        </div>

        {/* Payment Records Table */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-slate-100 animate-pulse rounded-lg" />
            ))}
          </div>
        ) : filteredPayments.length === 0 ? (
          <EmptyState
            icon={CreditCard}
            title="No Payment Records"
            description="Payments made for your deliveries will appear here with downloadable receipts."
          />
        ) : (
          <Card className="overflow-hidden border-slate-200">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium text-xs">
                  <tr>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Delivery Ref</th>
                    <th className="py-3 px-4">Method</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Transaction Ref</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPayments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap text-xs">
                        {formatDate(p.created_at)}
                      </td>
                      <td className="py-3 px-4 font-mono font-medium text-slate-900">
                        <Link
                          href={`/track?ref=${p.tracking_number}`}
                          className="text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1"
                        >
                          {p.tracking_number}
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                      <td className="py-3 px-4 capitalize text-slate-700">
                        {p.payment_method === 'cash' ? 'Cash on Delivery' : 'Online (Paystack)'}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {formatNaira(p.amount_kobo)}
                      </td>
                      <td className="py-3 px-4">
                        <PaymentStatusBadge status={p.status} />
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-slate-400">
                        {p.paystack_reference || 'COD-SETTLED'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
