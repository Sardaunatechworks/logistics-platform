import React from 'react';
import Link from 'next/link';
import { Package, Truck, KeyRound, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button, Card } from '@/components/ui';
import { PublicHeader, PublicFooter } from '@/components/layout';

export default function HowItWorksPage() {
  const steps = [
    {
      num: '01',
      title: 'Enter Pickup & Delivery Details',
      desc: 'Specify the sender contact, recipient contact, address landmarks, and package category.',
      detail: 'Our pricing engine instantly provides an itemized quote based on active base rates and weight categories in integer kobo.',
    },
    {
      num: '02',
      title: 'Dispatcher Assigns an Approved Rider',
      desc: 'Operations review the order in the live Dutse dispatch queue and allocate a verified courier.',
      detail: 'Riders receive the notification on their mobile console, reviewing pickup instructions before accepting the assignment.',
    },
    {
      num: '03',
      title: 'Track Checkpoints in Real-Time',
      desc: 'Follow each status progression from "Picked Up" to "In Transit" via your unique reference number.',
      detail: 'Public tracking provides privacy-safe timeline visibility without exposing private phone numbers or addresses.',
    },
    {
      num: '04',
      title: 'OTP Verification & Secure Handover',
      desc: 'The recipient receives a secure 6-digit confirmation code.',
      detail: 'The delivery cannot be marked completed until the rider enters and validates this recipient code on their device.',
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
      <PublicHeader />

      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            How SwiftLogistics Works
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            A step-by-step walkthrough of our delivery coordination and proof-of-delivery lifecycle.
          </p>
        </div>

        <div className="space-y-6">
          {steps.map((s, idx) => (
            <Card key={idx} className="p-6 sm:p-8 border-slate-200 bg-white shadow-xs">
              <div className="flex flex-col sm:flex-row items-start gap-6">
                <span className="text-3xl sm:text-4xl font-mono font-extrabold text-[#1D4ED8]">
                  {s.num}
                </span>
                <div className="space-y-2 flex-1">
                  <h2 className="text-lg font-bold text-slate-900">{s.title}</h2>
                  <p className="text-sm text-slate-700">{s.desc}</p>
                  <p className="text-xs text-slate-500 leading-relaxed pt-1 border-t border-slate-100">
                    {s.detail}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center pt-6">
          <Link href="/auth/register">
            <Button size="lg">
              Start Booking Now <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}

