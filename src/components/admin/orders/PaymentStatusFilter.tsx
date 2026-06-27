// components/admin/orders/PaymentStatusFilter.tsx

import { PAYMENT_STATUS_CONFIG } from '@/lib/config/payment-status.config';
import React from 'react';

interface PaymentStatusFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export const PaymentStatusFilter: React.FC<PaymentStatusFilterProps> = ({ value, onChange }) => {
  const statuses = [
    { value: 'ALL', label: 'All Payment Statuses' },
    ...Object.entries(PAYMENT_STATUS_CONFIG).map(([key, config]) => ({
      value: key,
      label: config.label,
    })),
  ];

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none"
      aria-label="Filter by payment status"
    >
      {statuses.map((status) => (
        <option key={status.value} value={status.value}>
          {status.label}
        </option>
      ))}
    </select>
  );
};