'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Package,
  LayoutDashboard,
  PlusCircle,
  Truck,
  Users,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  X,
  FileText,
  Clock,
  ShieldCheck,
  Building,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { UserRole } from '@/types/database';

interface DashboardLayoutProps {
  children: React.ReactNode;
  user: {
    fullName: string;
    email: string;
    role: UserRole;
  };
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

export function DashboardLayout({ children, user }: DashboardLayoutProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Role-based navigation items
  const navItemsByRole: Record<UserRole, NavItem[]> = {
    customer: [
      { label: 'Overview', href: '/customer', icon: LayoutDashboard },
      { label: 'Book Delivery', href: '/customer/book', icon: PlusCircle },
      { label: 'My Deliveries', href: '/customer/deliveries', icon: Package },
      { label: 'Saved Addresses', href: '/customer/addresses', icon: Building },
      { label: 'Payments', href: '/customer/payments', icon: CreditCard },
      { label: 'Profile & Settings', href: '/customer/profile', icon: Settings },
    ],
    merchant: [
      { label: 'Overview', href: '/merchant', icon: LayoutDashboard },
      { label: 'Create Delivery', href: '/merchant/book', icon: PlusCircle },
      { label: 'Business Deliveries', href: '/merchant/deliveries', icon: Package },
      { label: 'Payment Records', href: '/merchant/payments', icon: CreditCard },
      { label: 'Business Profile', href: '/merchant/profile', icon: Building },
    ],
    rider: [
      { label: 'Overview', href: '/rider', icon: LayoutDashboard },
      { label: 'Active Jobs', href: '/rider/active', icon: Truck },
      { label: 'Available Jobs', href: '/rider/available', icon: Package },
      { label: 'Completed Deliveries', href: '/rider/history', icon: Clock },
      { label: 'Earnings Summary', href: '/rider/earnings', icon: CreditCard },
      { label: 'Rider Profile & Docs', href: '/rider/profile', icon: ShieldCheck },
    ],
    operations_admin: [
      { label: 'Overview', href: '/admin', icon: LayoutDashboard },
      { label: 'Dispatch Queue', href: '/admin/dispatch', icon: Truck },
      { label: 'All Deliveries', href: '/admin/deliveries', icon: Package },
      { label: 'Rider Fleet', href: '/admin/riders', icon: Users },
      { label: 'Customers & Merchants', href: '/admin/users', icon: Building },
      { label: 'Payments & Cash', href: '/admin/payments', icon: CreditCard },
      { label: 'Pricing Rules', href: '/admin/pricing', icon: FileText },
    ],
    super_admin: [
      { label: 'Overview', href: '/admin', icon: LayoutDashboard },
      { label: 'Dispatch Queue', href: '/admin/dispatch', icon: Truck },
      { label: 'All Deliveries', href: '/admin/deliveries', icon: Package },
      { label: 'Rider Fleet', href: '/admin/riders', icon: Users },
      { label: 'User Directory', href: '/admin/users', icon: Building },
      { label: 'Payments & Cash', href: '/admin/payments', icon: CreditCard },
      { label: 'Pricing Rules', href: '/admin/pricing', icon: FileText },
      { label: 'Audit Logs', href: '/admin/audit', icon: ShieldCheck },
      { label: 'System Settings', href: '/admin/settings', icon: Settings },
    ],
  };

  const navItems = navItemsByRole[user.role] || navItemsByRole.customer;

  const roleLabels: Record<UserRole, string> = {
    customer: 'Customer',
    merchant: 'Merchant Partner',
    rider: 'Verified Rider',
    operations_admin: 'Operations Admin',
    super_admin: 'Super Administrator',
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/auth/login';
    } catch {
      window.location.href = '/auth/login';
    }
  };

  return (
    <div className="min-h-screen flex bg-[#F8FAFC]">
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-slate-200 bg-white">
        {/* Brand */}
        <div className="flex h-16 items-center gap-2.5 px-6 border-b border-slate-100">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1D4ED8] text-white">
            <Package className="h-5 w-5" />
          </div>
          <span className="font-bold text-lg text-slate-900 tracking-tight">
            Swift<span className="text-[#1D4ED8]">Logistics</span>
          </span>
        </div>

        {/* User Card */}
        <div className="p-4 mx-3 my-3 rounded-lg bg-slate-50 border border-slate-200/60">
          <p className="text-sm font-semibold text-slate-900 truncate">{user.fullName}</p>
          <p className="text-xs text-slate-500 truncate">{user.email}</p>
          <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-blue-100 text-blue-800">
            {roleLabels[user.role]}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-[#1D4ED8] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                )}
              >
                <Icon className={cn('h-4 w-4', isActive ? 'text-white' : 'text-slate-500')} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout bottom action */}
        <div className="p-3 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-700 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg"
            aria-label="Open navigation sidebar"
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex items-center gap-3 ml-auto">
            <span className="text-xs text-slate-500 hidden sm:inline-block">
              Market: <strong>Dutse, Jigawa</strong>
            </span>
          </div>
        </header>

        {/* Mobile Sidebar Modal */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
              onClick={() => setMobileOpen(false)}
            />
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
              <div className="flex h-16 items-center justify-between px-6 border-b border-slate-100">
                <span className="font-bold text-lg text-slate-900">SwiftLogistics</span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-1 text-slate-500 hover:text-slate-900"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="p-4 bg-slate-50 m-3 rounded-lg border border-slate-200">
                <p className="text-sm font-semibold text-slate-900">{user.fullName}</p>
                <p className="text-xs text-slate-500">{user.email}</p>
                <span className="mt-2 inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-blue-100 text-blue-800">
                  {roleLabels[user.role]}
                </span>
              </div>

              <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        'flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium',
                        isActive
                          ? 'bg-[#1D4ED8] text-white'
                          : 'text-slate-600 hover:bg-slate-100'
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="p-3 border-t border-slate-100">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}

