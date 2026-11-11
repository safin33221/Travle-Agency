import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { brandConfig } from '@/config/brand.config';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString?: string | Date | null): string {
  if (!dateString) return '—';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function formatTime(dateString?: string | Date | null): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

export function formatCurrency(
  amount?: number | string | null,
  currency?: string,
): string {
  if (amount === undefined || amount === null || amount === '') return '—';
  const num = typeof amount === 'string' ? parseFloat(amount) || 0 : amount;
  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num);

  const cur = currency || brandConfig.defaults.currency;
  if (cur === 'BDT') {
    return `${brandConfig.defaults.currencySymbol} ${formatted}`;
  }
  return `${cur} ${formatted}`;
}
