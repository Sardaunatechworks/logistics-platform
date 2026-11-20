import React from 'react';
import Link from 'next/link';
import { Package, Clock, Building, Truck, ShieldCheck, ArrowRight } from 'lucide-react';
import { Button, Card } from '@/components/ui';
import { PublicHeader, PublicFooter } from '@/components/layout';

export default function ServicesPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
      <PublicHeader />

      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#1D4ED8] text-xs font-semibold">
            <Truck className="h-3.5 w-3.5" />
            <span>Dutse & Jigawa Logistics Operations</span>
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            Logistics Services Built for Local Reliability
          </h1>
          <p className="text-base text-slate-600 leading-relaxed">
            From essential same-day documents to regional commercial freight, our dispatch team coordinates deliveries with verified checkpoints and secure OTP handoff.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="p-8 border-slate-200 bg-white space-y-4 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-[#1D4ED8]">
              <Package className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Standard Intramarket Delivery</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Dependable collection and drop-off across all major Dutse neighborhoods, including Dutse Central Market, Takur Site, Gida Dubu, Federal University Dutse (FUD), and airport corridors.
            </p>
            <div className="pt-2 text-xs text-slate-500 space-y-2 border-t border-slate-100">
              <p>• Suitable for packages up to 15kg</p>
              <p>• Scheduled same-day dispatch</p>
              <p>• Checkpoint status history</p>
            </div>
            <div className="pt-4">
              <Link href="/auth/register">
                <Button className="w-full" size="sm">Book Standard</Button>
              </Link>
            </div>
          </Card>

          <Card className="p-8 border-slate-200 bg-white space-y-4 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
              <Clock className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Express Priority Dispatch</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Direct, priority rider allocation for urgent pharmaceutical items, court documents, official contracts, and time-sensitive perishable foods.
            </p>
            <div className="pt-2 text-xs text-slate-500 space-y-2 border-t border-slate-100">
              <p>• Top priority in dispatch queue</p>
              <p>• Direct point-to-point courier</p>
              <p>• Immediate recipient SMS/in-app alert</p>
            </div>
            <div className="pt-4">
              <Link href="/auth/register">
                <Button className="w-full bg-amber-800 hover:bg-amber-900" size="sm">Book Express</Button>
              </Link>
            </div>
          </Card>

          <Card className="p-8 border-slate-200 bg-white space-y-4 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
              <Building className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Merchant Fulfillment Hub</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Designed for retail merchants, fashion designers, electronics shops, and local distributors who require regular customer dispatch and cash-on-delivery reconciliation.
            </p>
            <div className="pt-2 text-xs text-slate-500 space-y-2 border-t border-slate-100">
              <p>• Business delivery history & invoices</p>
              <p>• Audited cash-on-delivery collection</p>
              <p>• Dedicated business support line</p>
            </div>
            <div className="pt-4">
              <Link href="/auth/register">
                <Button className="w-full bg-emerald-700 hover:bg-emerald-800" size="sm">Register Business</Button>
              </Link>
            </div>
          </Card>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}

