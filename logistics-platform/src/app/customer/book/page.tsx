'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Package,
  MapPin,
  Clock,
  CreditCard,
  Banknote,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Button, Input, Select, Card, Badge } from '@/components/ui';
import { DashboardLayout } from '@/components/layout';
import { formatNaira } from '@/lib/utils';
import { PACKAGE_CATEGORIES, SUPPORTED_STATES, type PackageCategory } from '@/config/constants';
import type { DeliveryType, PackageSize, DeliveryQuote } from '@/types/database';

export default function BookDeliveryPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  // Step 1: Pickup
  const [pickupContactName, setPickupContactName] = useState('');
  const [pickupContactPhone, setPickupContactPhone] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [pickupArea, setPickupArea] = useState('');
  const [pickupCity, setPickupCity] = useState('Dutse');
  const [pickupState, setPickupState] = useState('Jigawa');

  // Step 2: Destination
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [destinationAddress, setDestinationAddress] = useState('');
  const [destinationArea, setDestinationArea] = useState('');
  const [destinationCity, setDestinationCity] = useState('Dutse');
  const [destinationState, setDestinationState] = useState('Jigawa');

  // Step 3: Package
  const [packageDescription, setPackageDescription] = useState('');
  const [packageCategory, setPackageCategory] = useState<PackageCategory>(PACKAGE_CATEGORIES[0]);
  const [packageSize, setPackageSize] = useState<PackageSize>('small');
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('standard');
  const [customerInstructions, setCustomerInstructions] = useState('');

  // Step 4: Payment & Quote
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cash'>('cash');
  const [quote, setQuote] = useState<DeliveryQuote | null>(null);
  const [isQuoting, setIsQuoting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmedDelivery, setConfirmedDelivery] = useState<{
    id: string;
    tracking_number: string;
  } | null>(null);

  // Fetch live quote whenever package details or delivery type change
  useEffect(() => {
    if (step === 4) {
      fetchQuote();
    }
  }, [step, packageSize, deliveryType, pickupArea, destinationArea]);

  const fetchQuote = async () => {
    setIsQuoting(true);
    setError(null);
    try {
      const res = await fetch('/api/deliveries/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          delivery_type: deliveryType,
          package_size: packageSize,
          pickup_area: pickupArea,
          destination_area: destinationArea,
          is_intercity: pickupCity !== destinationCity,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to calculate quote');
      setQuote(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error quoting delivery');
    } finally {
      setIsQuoting(false);
    }
  };

  const handleCreateDelivery = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        pickup_contact_name: pickupContactName,
        pickup_contact_phone: pickupContactPhone,
        pickup_address: pickupAddress,
        pickup_area: pickupArea,
        pickup_city: pickupCity,
        pickup_state: pickupState,

        recipient_name: recipientName,
        recipient_phone: recipientPhone,
        destination_address: destinationAddress,
        destination_area: destinationArea,
        destination_city: destinationCity,
        destination_state: destinationState,

        package_description: packageDescription,
        package_category: packageCategory,
        package_size: packageSize,
        delivery_type: deliveryType,
        customer_instructions: customerInstructions,
        payment_method: paymentMethod,
      };

      const res = await fetch('/api/deliveries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit delivery order');

      setConfirmedDelivery({
        id: data.id,
        tracking_number: data.tracking_number,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error creating delivery order');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout
      user={{
        fullName: 'Customer Account',
        email: 'customer@swiftlogistics.ng',
        role: 'customer',
      }}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Book a Delivery</h1>
          <p className="text-sm text-slate-500 mt-1">
            Fill in the parcel details to calculate a delivery quote and schedule dispatch.
          </p>
        </div>

        {/* Step Indicator */}
        {!confirmedDelivery && (
          <div className="flex items-center justify-between border-b border-slate-200 pb-4 text-xs font-semibold">
            {[
              { num: 1, label: '1. Pickup' },
              { num: 2, label: '2. Destination' },
              { num: 3, label: '3. Package' },
              { num: 4, label: '4. Quotation & Pay' },
            ].map((s) => (
              <div
                key={s.num}
                className={`flex items-center gap-1.5 ${
                  step === s.num
                    ? 'text-[#1D4ED8]'
                    : step > s.num
                    ? 'text-emerald-700'
                    : 'text-slate-400'
                }`}
              >
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                    step === s.num
                      ? 'bg-[#1D4ED8] text-white'
                      : step > s.num
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {s.num}
                </div>
                <span className="hidden sm:inline">{s.label}</span>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-lg border border-red-200 bg-red-50 text-red-800 flex items-start gap-2.5 text-xs">
            <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Confirmation Card */}
        {confirmedDelivery ? (
          <Card className="p-8 text-center space-y-6 border-emerald-200 bg-emerald-50/40">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 mx-auto">
              <CheckCircle2 className="h-10 w-10" />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-900">Delivery Request Confirmed!</h2>
              <p className="text-sm text-slate-600 mt-1 max-w-md mx-auto">
                Your delivery request has been submitted to the dispatch operations queue in Dutse.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 max-w-sm mx-auto">
              <span className="text-xs text-slate-500 font-semibold uppercase">
                Shipment Tracking Code
              </span>
              <p className="text-2xl font-mono font-extrabold text-[#1D4ED8] mt-1 tracking-wider">
                {confirmedDelivery.tracking_number}
              </p>
              <p className="text-[11px] text-slate-400 mt-2">
                Save this code to check delivery status at any time.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => router.push(`/track?ref=${confirmedDelivery.tracking_number}`)}
              >
                Track Shipment Timeline
              </Button>
              <Button onClick={() => router.push('/customer/deliveries')}>
                View My Deliveries
              </Button>
            </div>
          </Card>
        ) : (
          <Card className="p-6 sm:p-8 border-slate-200">
            {/* Step 1: Pickup Information */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-slate-900 font-semibold mb-2">
                  <MapPin className="h-4 w-4 text-[#1D4ED8]" />
                  <span>Pickup Location Details</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Sender contact name"
                    value={pickupContactName}
                    onChange={(e) => setPickupContactName(e.target.value)}
                    placeholder="e.g. Fatima Sani"
                    required
                  />
                  <Input
                    label="Sender phone number"
                    type="tel"
                    value={pickupContactPhone}
                    onChange={(e) => setPickupContactPhone(e.target.value)}
                    placeholder="e.g. 08023456789"
                    required
                  />
                </div>

                <Input
                  label="Pickup street address & building description"
                  value={pickupAddress}
                  onChange={(e) => setPickupAddress(e.target.value)}
                  placeholder="e.g. Suite 4, Dutse Commercial Plaza, Airport Road"
                  required
                />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    label="Area / Neighborhood"
                    value={pickupArea}
                    onChange={(e) => setPickupArea(e.target.value)}
                    placeholder="e.g. Takur Site"
                  />
                  <Input
                    label="City"
                    value={pickupCity}
                    onChange={(e) => setPickupCity(e.target.value)}
                    required
                  />
                  <Select
                    label="State"
                    value={pickupState}
                    onChange={(e) => setPickupState(e.target.value)}
                    options={SUPPORTED_STATES.map((s) => ({ label: s, value: s }))}
                    required
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    onClick={() => {
                      if (!pickupContactName || !pickupContactPhone || !pickupAddress) {
                        setError('Please complete all required pickup details');
                        return;
                      }
                      setError(null);
                      setStep(2);
                    }}
                  >
                    Continue to Destination <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Destination Information */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-slate-900 font-semibold mb-2">
                  <MapPin className="h-4 w-4 text-emerald-600" />
                  <span>Recipient Destination Details</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Recipient contact name"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="e.g. Ibrahim Musa"
                    required
                  />
                  <Input
                    label="Recipient phone number"
                    type="tel"
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                    placeholder="e.g. 08123456789"
                    required
                  />
                </div>

                <Input
                  label="Delivery destination address"
                  value={destinationAddress}
                  onChange={(e) => setDestinationAddress(e.target.value)}
                  placeholder="e.g. Block C, Gida Dubu Housing Estate"
                  required
                />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    label="Area / Neighborhood"
                    value={destinationArea}
                    onChange={(e) => setDestinationArea(e.target.value)}
                    placeholder="e.g. Gida Dubu"
                  />
                  <Input
                    label="City"
                    value={destinationCity}
                    onChange={(e) => setDestinationCity(e.target.value)}
                    required
                  />
                  <Select
                    label="State"
                    value={destinationState}
                    onChange={(e) => setDestinationState(e.target.value)}
                    options={SUPPORTED_STATES.map((s) => ({ label: s, value: s }))}
                    required
                  />
                </div>

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => setStep(1)}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                  <Button
                    onClick={() => {
                      if (!recipientName || !recipientPhone || !destinationAddress) {
                        setError('Please complete all required recipient details');
                        return;
                      }
                      setError(null);
                      setStep(3);
                    }}
                  >
                    Continue to Package <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Package Details */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-slate-900 font-semibold mb-2">
                  <Package className="h-4 w-4 text-blue-600" />
                  <span>Parcel Characteristics</span>
                </div>

                <Input
                  label="Package description"
                  value={packageDescription}
                  onChange={(e) => setPackageDescription(e.target.value)}
                  placeholder="e.g. Sealed envelope with certificates, small electronic charger"
                  required
                />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Select
                    label="Package category"
                    value={packageCategory}
                    onChange={(e) => setPackageCategory(e.target.value as PackageCategory)}
                    options={PACKAGE_CATEGORIES.map((c) => ({ label: c, value: c }))}
                    required
                  />

                  <Select
                    label="Weight / Size band"
                    value={packageSize}
                    onChange={(e) => setPackageSize(e.target.value as PackageSize)}
                    options={[
                      { label: 'Small (up to 2kg)', value: 'small' },
                      { label: 'Medium (2 - 5kg)', value: 'medium' },
                      { label: 'Large (5 - 15kg)', value: 'large' },
                      { label: 'Extra Large (15kg+)', value: 'extra_large' },
                    ]}
                    required
                  />

                  <Select
                    label="Delivery speed"
                    value={deliveryType}
                    onChange={(e) => setDeliveryType(e.target.value as DeliveryType)}
                    options={[
                      { label: 'Standard Delivery', value: 'standard' },
                      { label: 'Express Priority', value: 'express' },
                      { label: 'Intercity Regional', value: 'intercity' },
                    ]}
                    required
                  />
                </div>

                <Input
                  label="Optional delivery notes / handling instructions"
                  value={customerInstructions}
                  onChange={(e) => setCustomerInstructions(e.target.value)}
                  placeholder="e.g. Call recipient upon arrival at gate"
                />

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => setStep(2)}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                  <Button
                    onClick={() => {
                      if (!packageDescription) {
                        setError('Please provide a package description');
                        return;
                      }
                      setError(null);
                      setStep(4);
                    }}
                  >
                    Review Quotation <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 4: Quotation & Confirmation */}
            {step === 4 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">
                    Order Quotation & Payment Method
                  </h3>
                  <p className="text-xs text-slate-500">
                    Calculated by the dispatch pricing engine. Prices are in Nigerian Naira (NGN).
                  </p>
                </div>

                {/* Itemized Quote Card */}
                <div className="p-5 rounded-xl border border-blue-200 bg-blue-50/50 space-y-3">
                  <div className="flex items-center justify-between text-xs text-blue-900 font-semibold border-b border-blue-200/70 pb-2">
                    <span>Pricing Breakdown</span>
                    <span>{quote?.pricing_rule_name || 'Active Pricing Rule'}</span>
                  </div>

                  {isQuoting ? (
                    <div className="py-4 text-center text-xs text-slate-500 animate-pulse">
                      Calculating real-time quotation...
                    </div>
                  ) : quote ? (
                    <div className="space-y-2">
                      {quote.itemized.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-xs text-slate-700">
                          <span>{item.label}</span>
                          <span className="font-medium">{formatNaira(item.amount_kobo)}</span>
                        </div>
                      ))}
                      <div className="pt-2 border-t border-blue-200/70 flex justify-between text-sm font-bold text-slate-900">
                        <span>Total Payable</span>
                        <span className="text-[#1D4ED8] text-base">
                          {formatNaira(quote.total_kobo)}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">No quotation available</p>
                  )}
                </div>

                {/* Payment Method Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700">Select Payment Method</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('cash')}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                        paymentMethod === 'cash'
                          ? 'border-[#1D4ED8] bg-blue-50/50 ring-2 ring-[#1D4ED8]/20'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
                        <Banknote className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-900">Cash on Collection</p>
                        <p className="text-[11px] text-slate-500">Pay rider upon parcel handover</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('online')}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                        paymentMethod === 'online'
                          ? 'border-[#1D4ED8] bg-blue-50/50 ring-2 ring-[#1D4ED8]/20'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-[#1D4ED8]">
                        <CreditCard className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-900">Online Payment</p>
                        <p className="text-[11px] text-slate-500">Card or Transfer via Paystack</p>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => setStep(3)}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                  <Button
                    onClick={handleCreateDelivery}
                    isLoading={isSubmitting}
                    disabled={isQuoting || !quote}
                  >
                    Confirm & Submit Order
                  </Button>
                </div>
              </div>
            )}
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
