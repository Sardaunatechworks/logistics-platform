import Link from 'next/link';
import {
  Package,
  ArrowRight,
  ShieldCheck,
  Clock,
  MapPin,
  Truck,
  CheckCircle2,
  Building,
  KeyRound,
} from 'lucide-react';
import { Button } from '@/components/ui';
import { PublicHeader, PublicFooter } from '@/components/layout';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
      <PublicHeader />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 sm:py-24 bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-semibold text-[#1D4ED8]">
                <MapPin className="h-3.5 w-3.5" />
                <span>Serving Dutse & Jigawa State Hubs</span>
              </div>

              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
                Dependable parcel delivery and dispatch operations.
              </h1>

              <p className="text-lg text-slate-600 max-w-2xl leading-relaxed">
                Coordinate customer deliveries, local merchant orders, and verified dispatch riders through an accountable digital tracking workflow.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link href="/auth/register">
                  <Button size="lg" className="w-full sm:w-auto">
                    Book a Delivery <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/track">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    Track Shipment
                  </Button>
                </Link>
              </div>

              <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <KeyRound className="h-4 w-4 text-emerald-600" />
                  <span>OTP Proof of Delivery</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-blue-600" />
                  <span>Verified Riders</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-amber-600" />
                  <span>Paystack & Cash Support</span>
                </div>
              </div>
            </div>

            {/* Quick Track & Booking Preview Card */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 sm:p-8 shadow-xs space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Track your package</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Enter your unique reference to see current status and timeline.
                  </p>
                </div>

                <form action="/track" method="GET" className="space-y-3">
                  <div className="flex rounded-lg shadow-2xs border border-slate-300 bg-white overflow-hidden">
                    <input
                      name="ref"
                      type="text"
                      placeholder="e.g. DLV-4F8B2C"
                      className="flex-1 px-3.5 py-2.5 text-sm uppercase text-slate-900 focus:outline-none min-h-[44px]"
                      required
                    />
                    <button
                      type="submit"
                      className="px-4 bg-[#1D4ED8] text-white text-sm font-medium hover:bg-[#1E3A8A] transition-colors"
                    >
                      Track
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    * Status-based tracking reference model (Not live GPS).
                  </p>
                </form>

                <div className="pt-4 border-t border-slate-200">
                  <div className="flex items-center justify-between text-xs text-slate-600 mb-2 font-medium">
                    <span>Recent dispatch activity</span>
                    <span className="text-emerald-700 font-semibold">Active in Dutse</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200">
                      <div className="flex items-center gap-2">
                        <Truck className="h-3.5 w-3.5 text-blue-600" />
                        <span className="font-medium text-slate-800">Dutse Market → Takur</span>
                      </div>
                      <span className="text-[11px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-medium">
                        In Transit
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        <span className="font-medium text-slate-800">FUD Campus → Gida Dubu</span>
                      </div>
                      <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-medium">
                        Delivered (OTP)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Service Categories */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Delivery options tailored for Dutse
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              Transparent pricing with no unexpected hidden costs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-[#1D4ED8]">
                <Package className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Standard Delivery</h3>
              <p className="text-sm text-slate-600">
                Scheduled same-day or next-day collection and delivery across Dutse metropolitan neighborhoods.
              </p>
              <ul className="text-xs text-slate-500 space-y-1.5 pt-2">
                <li>• Transparent base quotation</li>
                <li>• Recipient OTP verification</li>
                <li>• Online & cash payment</li>
              </ul>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                <Clock className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Express Priority</h3>
              <p className="text-sm text-slate-600">
                Immediate dispatch priority for urgent documents, perishables, and time-critical packages.
              </p>
              <ul className="text-xs text-slate-500 space-y-1.5 pt-2">
                <li>• Accelerated rider allocation</li>
                <li>• Priority dispatch queue</li>
                <li>• Instant notification alerts</li>
              </ul>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                <Building className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Merchant Delivery</h3>
              <p className="text-sm text-slate-600">
                Reliable fulfilment for local retailers, pharmacies, and food vendors needing repeat order dispatch.
              </p>
              <ul className="text-xs text-slate-500 space-y-1.5 pt-2">
                <li>• Dedicated business account</li>
                <li>• Order history & receipts</li>
                <li>• Reconciled cash-on-delivery</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-16 bg-white border-t border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              How the delivery workflow works
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              From request creation to secure recipient OTP handover.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="space-y-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-[#1D4ED8] font-bold text-sm">
                1
              </div>
              <h3 className="text-base font-semibold text-slate-900">Create Request</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Provide pickup and destination contacts, package details, and view your calculated quote before confirming.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-[#1D4ED8] font-bold text-sm">
                2
              </div>
              <h3 className="text-base font-semibold text-slate-900">Rider Assigned</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Operations assign a verified rider who accepts the job and proceeds to collect the parcel.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-[#1D4ED8] font-bold text-sm">
                3
              </div>
              <h3 className="text-base font-semibold text-slate-900">In Transit</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                The customer and recipient follow parcel progress through the status timeline using their tracking ID.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-bold text-sm">
                4
              </div>
              <h3 className="text-base font-semibold text-slate-900">OTP Handover</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Delivery is finalized only when the recipient provides their 6-digit OTP code to the rider.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="py-16 bg-[#1D4ED8] text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl font-extrabold sm:text-4xl">
            Ready to send a parcel in Dutse?
          </h2>
          <p className="text-blue-100 max-w-xl mx-auto text-sm sm:text-base">
            Create an account in two minutes to request parcel pickups or register as a delivery merchant.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
            <Link href="/auth/register">
              <Button size="lg" className="bg-white text-[#1D4ED8] hover:bg-blue-50 w-full sm:w-auto">
                Get Started
              </Button>
            </Link>
            <Link href="/auth/register?role=rider">
              <Button variant="outline" size="lg" className="border-blue-300 text-white hover:bg-blue-800 w-full sm:w-auto">
                Join as a Rider
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
