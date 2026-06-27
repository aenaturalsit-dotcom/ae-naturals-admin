// components/admin/ui/OrderStatusBadge.tsx

import React from 'react';
import { OrderStatus } from '@/types/orders';

interface OrderStatusBadgeProps {
  status: OrderStatus;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
}

const ORDER_STATUS_CONFIG: Record<OrderStatus, { label: string; className: string; dotColor: string }> = {
    PENDING: {
        label: 'Pending',
        className: 'bg-yellow-50 text-yellow-700 ring-yellow-600/20',
        dotColor: 'bg-yellow-400',
    },
    CONFIRMED: {
        label: 'Confirmed',
        className: 'bg-blue-50 text-blue-700 ring-blue-600/20',
        dotColor: 'bg-blue-400',
    },
    PROCESSING: {
        label: 'Processing',
        className: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
        dotColor: 'bg-indigo-400',
    },
    SHIPPED: {
        label: 'Shipped',
        className: 'bg-purple-50 text-purple-700 ring-purple-600/20',
        dotColor: 'bg-purple-400',
    },
    DELIVERED: {
        label: 'Delivered',
        className: 'bg-green-50 text-green-700 ring-green-600/20',
        dotColor: 'bg-green-400',
    },
    CANCELLED: {
        label: 'Cancelled',
        className: 'bg-red-50 text-red-700 ring-red-600/20',
        dotColor: 'bg-red-400',
    },
    RETURNED: {
        label: 'Returned',
        className: 'bg-gray-50 text-gray-700 ring-gray-600/20',
        dotColor: 'bg-gray-400',
    },
    PAID: {
        label: '',
        className: '',
        dotColor: ''
    }
};

export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({
  status,
  size = 'sm',
  showDot = true,
}) => {
  const config = ORDER_STATUS_CONFIG[status];
  
  if (!config) {
    return <span className="text-gray-500 text-sm">{status}</span>;
  }

  const sizeClasses = {
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  const dotSize = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        rounded-full font-medium
        ring-1 ring-inset
        ${config.className}
        ${sizeClasses[size]}
      `}
    >
      {showDot && (
        <span 
          className={`
            rounded-full 
            ${dotSize[size]} 
            ${config.dotColor}
          `}
        />
      )}
      {config.label}
    </span>
  );
};