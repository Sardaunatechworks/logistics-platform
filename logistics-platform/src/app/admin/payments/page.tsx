'use client';

import React, { useState, useEffect } from 'react';
import { CreditCard, Banknote, CheckCircle2, AlertCircle, PlusCircle, Search, Calendar } from 'lucide-react';
import { Button, Card, PaymentStatusBadge, Badge, EmptyState, Input } from '@/components/ui';
import { DashboardLayout } from '@/components/layout';
import { formatNaira, formatDate } from '@/lib/utils';
import type { Payment } from '@/types/database';

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCashModal, setShowCashModal] = useState(false);
  const [cashDeliveryId, setCashDeliveryId] = useState('');
  const [cashAmountNaira, setCashAmountNaira] = useState('');
  const [cashNotes, setCashNotes] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/payments');
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

  const handleRecordCash = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRecording(true);
    setStatusMessage(null);

    try {
      const amountKobo = Math.round(parseFloat(cashAmountNaira) * 100);
      const res = await fetch('/api/payments/cash-collection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          delivery_id: cashDeliveryId,
          amount_kobo: amountKobo,
          notes: cashNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to record cash');

      setStatusMessage({
        type: 'success',
        text: 'Cash collection successfully registered and reconciled!',
      });
      setShowCashModal(false);
      setCashDeliveryId('');
      setCashAmountNaira('');
      setCashNotes('');
      loadPayments();
    } catch (err: unknown) {
      setStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Error recording cash collection',
      });
    } finally {
      setIsRecording(false);
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Payments & Cash Reconciliation
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Audit Paystack online settlements and on-field cash collections.
            </p>
          </div>
          <Button size="sm" onClick={() => setShowCashModal(true)}>
            <PlusCircle className="mr-2 h-4 w-4" /> Record Cash Collection
          </Button>
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

        {/* Payments Table Card */}
        <Card className="p-0 border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="Filter by payment reference..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-xs"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Reference</th>
                  <th className="px-6 py-3.5">Method</th>
                  <th className="px-6 py-3.5">Amount</th>
                  <th className="px-6 py-3.5">Payment Status</th>
                  <th className="px-6 py-3.5">Reconciliation</th>
                  <th className="px-6 py-3.5">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                      Loading payment records...
                    </td>
                  </tr>
                ) : payments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                      No payment settlements recorded yet.
                    </td>
                  </tr>
                ) : (
                  payments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 font-mono font-medium text-slate-900">
                        {p.payment_reference}
                      </td>
                      <td className="px-6 py-4 capitalize font-medium text-slate-700">
                        {p.method} ({p.provider})
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900">
                        {formatNaira(p.amount_kobo)}
                      </td>
                      <td className="px-6 py-4">
                        <PaymentStatusBadge status={p.status} />
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant={
                            p.reconciliation_status === 'reconciled'
                              ? 'success'
                              : p.reconciliation_status === 'disputed'
                              ? 'danger'
                              : 'warning'
                          }
                        >
                          {p.reconciliation_status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {formatDate(p.created_at)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Record Cash Collection Modal */}
        {showCashModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-900">
                  Record Cash Collection
                </h3>
                <button onClick={() => setShowCashModal(false)} className="text-slate-400 text-sm">
                  ✕
                </button>
              </div>

              <form onSubmit={handleRecordCash} className="space-y-4">
                <Input
                  label="Delivery UUID or Tracking Ref"
                  value={cashDeliveryId}
                  onChange={(e) => setCashDeliveryId(e.target.value)}
                  placeholder="Enter Delivery UUID"
                  required
                />

                <Input
                  label="Collected Amount (in NGN Naira)"
                  type="number"
                  step="0.01"
                  value={cashAmountNaira}
                  onChange={(e) => setCashAmountNaira(e.target.value)}
                  placeholder="e.g. 1500"
                  required
                />

                <Input
                  label="Reconciliation / Field Notes"
                  value={cashNotes}
                  onChange={(e) => setCashNotes(e.target.value)}
                  placeholder="e.g. Cash collected by field rider and handed to cashier"
                />

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                  <Button variant="outline" size="sm" type="button" onClick={() => setShowCashModal(false)}>
                    Cancel
                  </Button>
                  <Button size="sm" type="submit" isLoading={isRecording}>
                    Record Cash Settlement
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

