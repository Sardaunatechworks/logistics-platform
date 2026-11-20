// ============================================================================
// Utility Functions
// ============================================================================

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes with conflict resolution
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format amount in kobo to Naira display string
 * All monetary values are stored as integer kobo (1 Naira = 100 kobo)
 */
export function formatNaira(amountKobo: number): string {
  const naira = amountKobo / 100;
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(naira);
}

/**
 * Convert Naira to kobo (for user input → storage)
 */
export function nairaToKobo(naira: number): number {
  return Math.round(naira * 100);
}

/**
 * Convert kobo to Naira (for storage → display)
 */
export function koboToNaira(kobo: number): number {
  return kobo / 100;
}

/**
 * Format date for display in user's timezone
 */
export function formatDate(dateString: string, options?: Intl.DateTimeFormatOptions): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  });
}

/**
 * Format date and time
 */
export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateString);
}

/**
 * Normalize Nigerian phone number to +234 format
 */
export function normalizePhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('234')) return `+${cleaned}`;
  if (cleaned.startsWith('0')) return `+234${cleaned.slice(1)}`;
  return `+234${cleaned}`;
}

/**
 * Mask phone number for public display
 * +2348012345678 → +234***5678
 */
export function maskPhone(phone: string): string {
  if (!phone || phone.length < 8) return '***';
  return `${phone.slice(0, 4)}***${phone.slice(-4)}`;
}

/**
 * Mask address for public display
 * "123 Main Street, Dutse" → "*****, Dutse"
 */
export function maskAddress(address: string): string {
  if (!address) return '***';
  const parts = address.split(',');
  if (parts.length > 1) {
    return `*****, ${parts.slice(-1)[0].trim()}`;
  }
  return '*****';
}

/**
 * Truncate text to max length with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}…`;
}

/**
 * Generate a random string of specified length
 */
export function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  for (let i = 0; i < length; i++) {
    result += chars[array[i] % chars.length];
  }
  return result;
}

/**
 * Delay helper for testing/development
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Type-safe Object.keys
 */
export function typedKeys<T extends object>(obj: T): (keyof T)[] {
  return Object.keys(obj) as (keyof T)[];
}

