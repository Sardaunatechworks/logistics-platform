import React from 'react';
import { cn } from '@/lib/utils';
import type { DeliveryStatus, PaymentStatus, AssignmentStatus } from '@/types/database';
import {
  DELIVERY_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  ASSIGNMENT_STATUS_LABELS,
} from '@/types/database';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'muted';
}

export function Badge({ className, variant = 'secondary', children, ...props }: BadgeProps) {
  const variants = {
    primary: 'bg-blue-100 text-blue-800 border-blue-200',
    secondary: 'bg-slate-100 text-slate-800 border-slate-200',
    success: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    warning: 'bg-amber-100 text-amber-800 border-amber-200',
    danger: 'bg-rose-100 text-rose-800 border-rose-200',
    info: 'bg-sky-100 text-sky-800 border-sky-200',
    muted: 'bg-gray-100 text-gray-600 border-gray-200',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-colors',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export function DeliveryStatusBadge({ status }: { status: DeliveryStatus }) {
  const statusToVariant: Record<DeliveryStatus, BadgeProps['variant']> = {
    pending: 'warning',
    confirmed: 'info',
    assigned: 'info',
    accepted: 'info',
    picked_up: 'info',
    in_transit: 'primary',
    delivered: 'success',
    failed: 'danger',
    cancelled: 'muted',
    returned: 'muted',
  };

  return (
    <Badge variant={statusToVariant[status]}>
      {DELIVERY_STATUS_LABELS[status] || status}
    </Badge>
  );
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const statusToVariant: Record<PaymentStatus, BadgeProps['variant']> = {
    pending: 'warning',
    successful: 'success',
    failed: 'danger',
    abandoned: 'muted',
    refunded: 'info',
  };

  return (
    <Badge variant={statusToVariant[status]}>
      {PAYMENT_STATUS_LABELS[status] || status}
    </Badge>
  );
}

export function AssignmentStatusBadge({ status }: { status: AssignmentStatus }) {
  const statusToVariant: Record<AssignmentStatus, BadgeProps['variant']> = {
    offered: 'warning',
    accepted: 'success',
    rejected: 'danger',
    withdrawn: 'muted',
    completed: 'primary',
  };

  return (
    <Badge variant={statusToVariant[status]}>
      {ASSIGNMENT_STATUS_LABELS[status] || status}
    </Badge>
  );
}

