import React from 'react';
import { MapPin, Phone, Mail, Clock, ShieldCheck } from 'lucide-react';
import { Card } from '@/components/ui';
import { PublicHeader, PublicFooter } from '@/components/layout';

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
      <PublicHeader />

      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            Support & Operations Office
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Need assistance with an active delivery, merchant partnership, or rider registration in Dutse? Contact our team.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Card className="p-8 border-slate-200 bg-white space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-[#1D4ED8]">
              <MapPin className="h-5 w-5" />
            </div>
            <h2 className="text-base font-bold text-slate-900">Operations Hub</h2>
            <p className="text-sm text-slate-600">
              Commercial Plaza, Opposite Old State Secretariat, Airport Road, Dutse, Jigawa State, Nigeria.
            </p>
          </Card>

          <Card className="p-8 border-slate-200 bg-white space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
              <Phone className="h-5 w-5" />
            </div>
            <h2 className="text-base font-bold text-slate-900">Direct Dispatch Hotline</h2>
            <p className="text-sm text-slate-600">
              +234 (0) 800 SWIFT-LOG (Toll Free)
            </p>
            <p className="text-xs text-slate-400">Available Monday through Saturday, 7:00 AM – 7:00 PM</p>
          </Card>

          <Card className="p-8 border-slate-200 bg-white space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-[#1D4ED8]">
              <Mail className="h-5 w-5" />
            </div>
            <h2 className="text-base font-bold text-slate-900">Operations Email</h2>
            <p className="text-sm text-slate-600">
              support@swiftlogistics.ng
            </p>
            <p className="text-xs text-slate-400">For merchant invoices, billing inquiries, and lost item reports</p>
          </Card>

          <Card className="p-8 border-slate-200 bg-white space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-800">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h2 className="text-base font-bold text-slate-900">Rider Verification Center</h2>
            <p className="text-sm text-slate-600">
              riders@swiftlogistics.ng
            </p>
            <p className="text-xs text-slate-400">Physical document inspection appointments conducted on weekdays</p>
          </Card>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}

