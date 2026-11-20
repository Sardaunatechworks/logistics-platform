'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Package, Menu, X, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui';

export function PublicHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Wordmark (Replaceable per UI/UX Guide) */}
        <Link href="/" className="flex items-center gap-2.5 font-bold text-xl text-slate-900">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1D4ED8] text-white">
            <Package className="h-5 w-5" />
          </div>
          <span className="tracking-tight">
            Swift<span className="text-[#1D4ED8]">Logistics</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <Link href="/" className="hover:text-[#1D4ED8] transition-colors">
            Home
          </Link>
          <Link href="/services" className="hover:text-[#1D4ED8] transition-colors">
            Services
          </Link>
          <Link href="/how-it-works" className="hover:text-[#1D4ED8] transition-colors">
            How It Works
          </Link>
          <Link href="/track" className="hover:text-[#1D4ED8] transition-colors">
            Track Shipment
          </Link>
          <Link href="/contact" className="hover:text-[#1D4ED8] transition-colors">
            Support
          </Link>
        </nav>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/auth/login">
            <Button variant="ghost" size="sm">
              Sign In
            </Button>
          </Link>
          <Link href="/auth/register">
            <Button size="sm">
              Book Delivery <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Mobile menu trigger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden flex p-2 text-slate-600 hover:text-slate-900 rounded-lg"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-3">
          <nav className="flex flex-col space-y-3 text-base font-medium text-slate-700">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="px-2 py-1.5 hover:text-[#1D4ED8]"
            >
              Home
            </Link>
            <Link
              href="/services"
              onClick={() => setMobileMenuOpen(false)}
              className="px-2 py-1.5 hover:text-[#1D4ED8]"
            >
              Services
            </Link>
            <Link
              href="/how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="px-2 py-1.5 hover:text-[#1D4ED8]"
            >
              How It Works
            </Link>
            <Link
              href="/track"
              onClick={() => setMobileMenuOpen(false)}
              className="px-2 py-1.5 hover:text-[#1D4ED8]"
            >
              Track Shipment
            </Link>
            <Link
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="px-2 py-1.5 hover:text-[#1D4ED8]"
            >
              Support
            </Link>
          </nav>
          <div className="flex flex-col gap-2 pt-4 border-t border-slate-100">
            <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="outline" className="w-full">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/register" onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-full">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

