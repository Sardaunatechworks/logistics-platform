'use client';

import React, { useState, useEffect } from 'react';
import { Building, Plus, Trash2, MapPin, CheckCircle, Phone, User } from 'lucide-react';
import { Button, Input, Card, EmptyState } from '@/components/ui';
import { DashboardLayout } from '@/components/layout';
import type { Address } from '@/types/database';

export default function CustomerAddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [label, setLabel] = useState('Home');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [addressText, setAddressText] = useState('');
  const [area, setArea] = useState('');
  const [city, setCity] = useState('Dutse');
  const [isDefault, setIsDefault] = useState(false);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/customer/addresses');
      const data = await res.json();
      if (res.ok) {
        setAddresses(data.addresses || []);
      }
    } catch (err) {
      console.error('Error fetching addresses:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/customer/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label,
          contact_name: contactName,
          contact_phone: contactPhone,
          address_text: addressText,
          area,
          city,
          state: 'Jigawa State',
          is_default: isDefault,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save address');
      }

      setIsModalOpen(false);
      setAddressText('');
      setArea('');
      setContactName('');
      setContactPhone('');
      fetchAddresses();
    } catch (err: any) {
      setError(err.message || 'Error saving address');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;

    try {
      const res = await fetch(`/api/customer/addresses?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setAddresses((prev) => prev.filter((a) => a.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete address:', err);
    }
  };

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
            <h1 className="text-2xl font-bold text-slate-900">Saved Addresses</h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage your frequently used pickup and delivery locations in Dutse and Jigawa.
            </p>
          </div>
          <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Address
          </Button>
        </div>

        {/* Address List */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-slate-100 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : addresses.length === 0 ? (
          <EmptyState
            icon={Building}
            title="No Saved Addresses"
            description="Save your frequent locations to speed up booking deliveries."
            action={{
              label: 'Add First Address',
              onClick: () => setIsModalOpen(true),
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map((addr) => (
              <Card key={addr.id} className="p-5 flex flex-col justify-between border-slate-200">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-emerald-600" />
                      {addr.label || 'Saved Location'}
                    </span>
                    {addr.is_default && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        <CheckCircle className="w-3 h-3" /> Default
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-600">{addr.address_text}</p>
                  <p className="text-xs text-slate-400">
                    {addr.area ? `${addr.area}, ` : ''}
                    {addr.city}, {addr.state}
                  </p>
                  {addr.contact_name && (
                    <div className="pt-2 flex items-center gap-4 text-xs text-slate-500 border-t border-slate-100">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-400" />
                        {addr.contact_name}
                      </span>
                      {addr.contact_phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {addr.contact_phone}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => handleDeleteAddress(addr.id)}
                    className="text-xs text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Add Address Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4">
              <h2 className="text-lg font-bold text-slate-900">Add New Address</h2>
              {error && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                  {error}
                </div>
              )}
              <form onSubmit={handleCreateAddress} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Label</label>
                    <select
                      value={label}
                      onChange={(e) => setLabel(e.target.value)}
                      className="w-full text-sm rounded-lg border border-slate-300 p-2"
                    >
                      <option value="Home">Home</option>
                      <option value="Office / Shop">Office / Shop</option>
                      <option value="Warehouse">Warehouse</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">City</label>
                    <Input
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Dutse"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Street Address & Landmark
                  </label>
                  <Input
                    value={addressText}
                    onChange={(e) => setAddressText(e.target.value)}
                    placeholder="e.g. No. 14 Sani Abacha Way, Near Post Office"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Area / District (Optional)
                  </label>
                  <Input
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    placeholder="e.g. Takur, Gida Dubu, Danmasara"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Contact Name (Optional)
                    </label>
                    <Input
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="Recipient or Sender"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Phone Number (Optional)
                    </label>
                    <Input
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="08012345678"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={isDefault}
                    onChange={(e) => setIsDefault(e.target.checked)}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <label htmlFor="isDefault" className="text-xs text-slate-600">
                    Set as my primary default address
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsModalOpen(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" isLoading={isSubmitting}>
                    Save Address
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
