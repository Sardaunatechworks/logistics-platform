'use client';

import React, { useState, useEffect } from 'react';
import { FileText, PlusCircle, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button, Card, Badge, Input, Select } from '@/components/ui';
import { DashboardLayout } from '@/components/layout';
import { formatNaira, formatDate } from '@/lib/utils';
import type { PricingRule, DeliveryType } from '@/types/database';

export default function AdminPricingPage() {
  const [rules, setRules] = useState<PricingRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form
  const [name, setName] = useState('');
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('standard');
  const [baseFeeNaira, setBaseFeeNaira] = useState('');
  const [zoneSurchargeNaira, setZoneSurchargeNaira] = useState('300');
  const [packageSurchargeNaira, setPackageSurchargeNaira] = useState('200');
  const [expressSurchargeNaira, setExpressSurchargeNaira] = useState('400');
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/pricing');
      const data = await res.json();
      if (res.ok) {
        setRules(data.rules || []);
      }
    } catch (err) {
      console.error('Error fetching pricing rules:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/admin/pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          delivery_type: deliveryType,
          base_fee_kobo: Math.round(parseFloat(baseFeeNaira) * 100),
          zone_surcharge_kobo: Math.round(parseFloat(zoneSurchargeNaira || '0') * 100),
          package_surcharge_kobo: Math.round(parseFloat(packageSurchargeNaira || '0') * 100),
          express_surcharge_kobo: Math.round(parseFloat(expressSurchargeNaira || '0') * 100),
          effective_from: new Date().toISOString(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save pricing rule');

      setStatusMessage({
        type: 'success',
        text: 'New pricing rule created and activated!',
      });
      setShowAddModal(false);
      setName('');
      setBaseFeeNaira('');
      loadRules();
    } catch (err: unknown) {
      setStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Error creating pricing rule',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardLayout
      user={{
        fullName: 'Operations Administrator',
        email: 'ops@swiftlogistics.ng',
        role: 'super_admin',
      }}
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Pricing Rule Configuration</h1>
            <p className="text-sm text-slate-500 mt-1">
              Configure baseline delivery charges and surcharges for Dutse and regional corridors.
            </p>
          </div>
          <Button size="sm" onClick={() => setShowAddModal(true)}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Pricing Rule
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rules.map((rule) => (
            <Card key={rule.id} className="p-6 border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold capitalize px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700">
                  {rule.delivery_type}
                </span>
                <Badge variant={rule.active ? 'success' : 'muted'}>
                  {rule.active ? 'Active' : 'Archived'}
                </Badge>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900">{rule.name}</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Effective: {formatDate(rule.effective_from)}
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Base Fee:</span>
                  <span className="font-bold text-slate-900">{formatNaira(rule.base_fee_kobo)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Zone Surcharge:</span>
                  <span className="font-medium">{formatNaira(rule.zone_surcharge_kobo)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Package Surcharge:</span>
                  <span className="font-medium">{formatNaira(rule.package_surcharge_kobo)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Express Surcharge:</span>
                  <span className="font-medium">{formatNaira(rule.express_surcharge_kobo)}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Add Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-900">New Pricing Rule</h3>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 text-sm">
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateRule} className="space-y-3">
                <Input
                  label="Rule Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dutse Express Priority 2026"
                  required
                />

                <Select
                  label="Delivery Type"
                  value={deliveryType}
                  onChange={(e) => setDeliveryType(e.target.value as DeliveryType)}
                  options={[
                    { label: 'Standard Delivery', value: 'standard' },
                    { label: 'Express Priority', value: 'express' },
                    { label: 'Intercity Regional', value: 'intercity' },
                  ]}
                  required
                />

                <Input
                  label="Base Fee (NGN Naira)"
                  type="number"
                  step="0.01"
                  value={baseFeeNaira}
                  onChange={(e) => setBaseFeeNaira(e.target.value)}
                  placeholder="e.g. 800"
                  required
                />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Input
                    label="Zone Surcharge (NGN)"
                    type="number"
                    value={zoneSurchargeNaira}
                    onChange={(e) => setZoneSurchargeNaira(e.target.value)}
                  />
                  <Input
                    label="Package Surcharge (NGN)"
                    type="number"
                    value={packageSurchargeNaira}
                    onChange={(e) => setPackageSurchargeNaira(e.target.value)}
                  />
                  <Input
                    label="Express Surcharge (NGN)"
                    type="number"
                    value={expressSurchargeNaira}
                    onChange={(e) => setExpressSurchargeNaira(e.target.value)}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                  <Button variant="outline" size="sm" type="button" onClick={() => setShowAddModal(false)}>
                    Cancel
                  </Button>
                  <Button size="sm" type="submit" isLoading={isSaving}>
                    Create Rule
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

