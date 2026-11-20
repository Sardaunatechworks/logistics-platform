import React from 'react';
import Link from 'next/link';
import { Package, MapPin, Phone, Mail, Shield } from 'lucide-react';

export function PublicFooter() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 font-bold text-lg text-slate-900">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1D4ED8] text-white">
                <Package className="h-4 w-4" />
              </div>
              <span>Swift<span className="text-[#1D4ED8]">Logistics</span></span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">
              Dependable parcel logistics and delivery management platform serving Dutse, Jigawa State and connecting regional hubs.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Shield className="h-4 w-4 text-emerald-600" />
              <span>Verified deliveries & Secure OTP handoff</span>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-3">Platform</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <Link href="/services" className="hover:text-[#1D4ED8] transition-colors">
                  Delivery Services
                </Link>
              </li>
              <li>
                <Link href="/track" className="hover:text-[#1D4ED8] transition-colors">
                  Track a Shipment
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-[#1D4ED8] transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/auth/register?role=rider" className="hover:text-[#1D4ED8] transition-colors">
                  Become a Rider
                </Link>
              </li>
            </ul>
          </div>

          {/* Operations & Legal */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-3">Service Coverage</h4>
            <p className="text-sm text-slate-600 leading-relaxed mb-3">
              Initial operations baseline: <strong>Dutse Metropolitan Area</strong>, Jigawa State, Nigeria.
            </p>
            <p className="text-xs text-slate-400">
              Status-based tracking reference model. Not live GPS tracking.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-3">Operations Office</h4>
            <ul className="space-y-2.5 text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                <span>Dutse, Jigawa State, Nigeria</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                <span>+234 (0) 800 SWIFT-LOG</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                <span>support@swiftlogistics.ng</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} SwiftLogistics. All rights reserved.</p>
          <div className="flex gap-4">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Security</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

