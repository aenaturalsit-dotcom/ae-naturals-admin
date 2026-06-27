// config/payment-status.config.ts

import { PaymentStatus } from '@/types/orders';

export const PAYMENT_STATUS_CONFIG: Record<
  PaymentStatus,
  {
    label: string;
    className: string;
    dotColor: string;
    icon?: React.ReactNode;
  }
> = {
  PENDING: {
    label: 'Pending',
    className: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    dotColor: 'bg-amber-400',
  },
  PAID: {
    label: 'Paid',
    className: 'bg-green-50 text-green-700 ring-green-600/20',
    dotColor: 'bg-green-400',
  },
  FAILED: {
    label: 'Failed',
    className: 'bg-red-50 text-red-700 ring-red-600/20',
    dotColor: 'bg-red-400',
  },
  REFUNDED: {
    label: 'Refunded',
    className: 'bg-purple-50 text-purple-700 ring-purple-600/20',
    dotColor: 'bg-purple-400',
  },
  PARTIALLY_REFUNDED: {
    label: 'Partially Refunded',
    className: 'bg-purple-50 text-purple-700 ring-purple-600/20',
    dotColor: 'bg-purple-400',
  },
};