import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatHKD(amount: number): string {
  return new Intl.NumberFormat('zh-HK', {
    style: 'currency',
    currency: 'HKD',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatArea(sqft: number): string {
  return `${sqft.toLocaleString('zh-HK')} 呎`;
}

export function pricePerSqft(rent: number, sqft: number): number {
  return sqft > 0 ? Math.round(rent / sqft) : 0;
}
