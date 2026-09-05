import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { nanoid } from 'nanoid';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(length = 21): string {
  return nanoid(length);
}

export function generateSecureToken(): string {
  // 48 bytes = 64 base64url characters, cryptographically secure
  const array = new Uint8Array(48);
  if (typeof crypto !== 'undefined') {
    crypto.getRandomValues(array);
  }
  return Buffer.from(array).toString('base64url');
}

export function formatCurrency(amountPaise: number, currency = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amountPaise / 100);
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length).trim() + '…';
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export function isValidEmail(email: string): boolean {
  const re = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
  return re.test(email);
}

export function isValidPhone(phone: string): boolean {
  // Indian mobile: +91 10-digit or 10-digit
  const re = /^(\+91)?[6-9]\d{9}$/;
  return re.test(phone.replace(/\s/g, ''));
}

export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!local || !domain) return email;
  const masked = local[0] + '*'.repeat(Math.max(local.length - 2, 1)) + (local.length > 1 ? local.slice(-1) : '');
  return `${masked}@${domain}`;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getRequestId(): string {
  return nanoid(16);
}
