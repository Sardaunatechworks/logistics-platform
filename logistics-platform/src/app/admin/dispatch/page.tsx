'use client';

import React, { useState, useEffect } from 'react';
import { Truck, CheckCircle2, AlertCircle, Clock, MapPin, UserCheck, Search } from 'lucide-react';
import { Button, Card, DeliveryStatusBadge, EmptyState, Select, Input } from '@/components/ui';
import { DashboardLayout } from '@/components/layout';
import { formatNaira, formatDate } from '@/lib/utils';
import type { Delivery } from '@/types/database';

interface RiderOption {
  id: string;
  name: string;
  phone: string;
  vehicle: string;
}

export default function DispatchQueuePage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [riders, setRiders] = useState<RiderOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [selectedRiderId, setSelectedRiderId] = useState('');
  const [assignNotes, setAssignNotes] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadQueue();
  }, []);

  const loadQueue = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch unassigned deliveries
      const res = await fetch('/api/deliveries?limit=50');
      const data = await res.json();
      if (res.ok) {
        // Filter unassigned or active jobs
        const unassigned = (data.deliveries || []).filter(
          (d: Delivery) => d.delivery_status === 'pending' || d.delivery_status === 'confirmed' || d.delivery_status === 'assigned'
        );
        setDeliveries(unassigned);
      }

      // 2. Fetch approved riders
      const ridersRes = await fetch('/api/admin/riders');
      const ridersData = await ridersRes.json();
      if (ridersRes.ok) {
        setRiders(ridersData.riders || []);
      }
    } catch (err) {
      console.error('Error loading dispatch queue:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedDelivery || !selectedRiderId) return;

    setIsAssigning(true);
    setStatusMessage(null);

    try {
      const res = await fetch(`/api/deliveries/${selectedDelivery.id}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rider_id: selectedRiderId,
          notes: assignNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to assign rider');

      setStatusMessage({
        type: 'success',
        text: `Successfully assigned rider to ${selectedDelivery.tracking_number}`,
      });
      setSelectedDelivery(null);
      setSelectedRiderId('');
      setAssignNotes('');
      loadQueue();
    } catch (err: unknown) {
      setStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Error completing assignment',
      });
    } finally {
      setIsAssigning(false);
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
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dispatch Queue</h1>
          <p className="text-sm text-slate-500 mt-1">
            Review incoming delivery requests and manually assign verified riders.
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

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-xl bg-slate-200/50 animate-pulse" />
            ))}
          </div>
        ) : deliveries.length === 0 ? (
          <EmptyState
            title="Dispatch Queue Clear"
            description="All delivery requests in Dutse have been confirmed and assigned to riders."
          />
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {deliveries.map((del) => (
              <Card key={del.id} className="p-5 border-slate-200 hover:border-slate-300">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-sm text-[#1D4ED8]">
                        {del.tracking_number}
                      </span>
                      <DeliveryStatusBadge status={del.delivery_status} />
                      <span className="text-xs text-slate-400 capitalize">
                        {del.delivery_type}
                      </span>
                      <span className="text-xs font-semibold text-slate-700">
                        {formatNaira(del.total_amount_kobo)} ({del.payment_method})
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                      <div className="flex items-start gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-blue-600 mt-0.5 shrink-0" />
                        <div>
                          <p className="font-medium text-slate-800">
                            Pickup: {del.pickup_contact_name} ({del.pickup_contact_phone})
                          </p>
                          <p className="text-slate-500">{del.pickup_address}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-emerald-600 mt-0.5 shrink-0" />
                        <div>
                          <p className="font-medium text-slate-800">
                            Dropoff: {del.recipient_name} ({del.recipient_phone})
                          </p>
                          <p className="text-slate-500">{del.destination_address}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedDelivery(del);
                        setSelectedRiderId('');
                      }}
                    >
                      <UserCheck className="mr-1.5 h-4 w-4" />
                      {del.delivery_status === 'assigned' ? 'Reassign Rider' : 'Assign Rider'}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Assignment Dialog Modal */}
        {selectedDelivery && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-900">
                  Assign Delivery: {selectedDelivery.tracking_number}
                </h3>
                <button
                  onClick={() => setSelectedDelivery(null)}
                  className="text-slate-400 hover:text-slate-600 text-sm"
                >
                  ✕
                </button>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1 text-slate-600">
                <p>
                  <strong>Route:</strong> {selectedDelivery.pickup_area || selectedDelivery.pickup_city} → {selectedDelivery.destination_area || selectedDelivery.destination_city}
                </p>
                <p>
                  <strong>Package:</strong> {selectedDelivery.package_description} ({selectedDelivery.package_size})
                </p>
              </div>

              <div className="space-y-3">
                <Select
                  label="Select approved rider"
                  value={selectedRiderId}
                  onChange={(e) => setSelectedRiderId(e.target.value)}
                  options={
                    riders.length > 0
                      ? riders.map((r) => ({
                          label: `${r.name} (${r.vehicle} - ${r.phone})`,
                          value: r.id,
                        }))
                      : [{ label: 'No riders available in Dutse', value: '' }]
                  }
                  placeholder="Choose an approved rider..."
                  required
                />

                <Input
                  label="Internal dispatch notes"
                  value={assignNotes}
                  onChange={(e) => setAssignNotes(e.target.value)}
                  placeholder="e.g. Fragile parcel - handle carefully"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <Button variant="outline" size="sm" onClick={() => setSelectedDelivery(null)}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleAssign}
                  isLoading={isAssigning}
                  disabled={!selectedRiderId}
                >
                  Confirm Assignment
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
