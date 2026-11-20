import React from 'react';
import { cn } from '@/lib/utils';
import { PackageOpen } from 'lucide-react';
import { Button } from './button';

export interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  className?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon,
  className,
  action,
}: EmptyStateProps) {
  const effectiveActionLabel = actionLabel || action?.label;
  const effectiveOnAction = onAction || action?.onClick;

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center rounded-xl border border-dashed border-slate-300 bg-white/50 my-6',
        className
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-500 mb-4">
        {icon || <PackageOpen className="h-7 w-7 text-slate-400" />}
      </div>
      <h3 className="text-base font-semibold text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mb-5">{description}</p>
      {effectiveActionLabel && effectiveOnAction && (
        <Button onClick={effectiveOnAction} size="sm">
          {effectiveActionLabel}
        </Button>
      )}
    </div>
  );
}
