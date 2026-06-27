// config/order-status.config.ts

import { OrderStatus } from '@/types/orders';

export const ORDER_STATUS_CONFIG: Record<
  OrderStatus,
  {
    label: string;
    className: string;
    dotColor: string;
    bgColor: string;
    textColor: string;
  }
> = {
  PENDING: {
    label: 'Pending',
    className: 'bg-yellow-50 text-yellow-700 ring-yellow-600/20',
    dotColor: 'bg-yellow-400',
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-700',
  },
  CONFIRMED: {
    label: 'Confirmed',
    className: 'bg-blue-50 text-blue-700 ring-blue-600/20',
    dotColor: 'bg-blue-400',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
  },
  PROCESSING: {
    label: 'Processing',
    className: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
    dotColor: 'bg-indigo-400',
    bgColor: 'bg-indigo-50',
    textColor: 'text-indigo-700',
  },
  SHIPPED: {
    label: 'Shipped',
    className: 'bg-purple-50 text-purple-700 ring-purple-600/20',
    dotColor: 'bg-purple-400',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700',
  },
  DELIVERED: {
    label: 'Delivered',
    className: 'bg-green-50 text-green-700 ring-green-600/20',
    dotColor: 'bg-green-400',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
  },
  CANCELLED: {
    label: 'Cancelled',
    className: 'bg-red-50 text-red-700 ring-red-600/20',
    dotColor: 'bg-red-400',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
  },
  RETURNED: {
    label: 'Returned',
    className: 'bg-gray-50 text-gray-700 ring-gray-600/20',
    dotColor: 'bg-gray-400',
    bgColor: 'bg-gray-50',
    textColor: 'text-gray-700',
  },
  PAID: {
    label: '',
    className: '',
    dotColor: '',
    bgColor: '',
    textColor: ''
  }
};