// components/admin/ui/PaymentStatusBadge.tsx

import React from 'react';
import { PaymentStatus } from '@/types/orders';

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
}

const PAYMENT_STATUS_CONFIG: Record<PaymentStatus, { label: string; className: string; dotColor: string }> = {
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

export const PaymentStatusBadge: React.FC<PaymentStatusBadgeProps> = ({
  status,
  size = 'sm',
  showDot = true,
}) => {
  const config = PAYMENT_STATUS_CONFIG[status];
  
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