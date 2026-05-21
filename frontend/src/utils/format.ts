import dayjs from 'dayjs';

export function formatCurrency(value: number, currency = '¥'): string {
  const sign = value < 0 ? '-' : '';
  const abs = Math.abs(value);
  return `${sign}${currency}${abs.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatDate(input: string | Date, fmt = 'YYYY-MM-DD'): string {
  return dayjs(input).format(fmt);
}

export function formatDateTime(input: string | Date): string {
  return dayjs(input).format('YYYY-MM-DD HH:mm');
}

export function todayIso(): string {
  return dayjs().format('YYYY-MM-DD');
}
