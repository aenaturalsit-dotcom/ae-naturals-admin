// components/admin/orders/StatusFilter.tsx

import { ORDER_STATUS_CONFIG } from '@/lib/config/order-status.config';
import React from 'react';

interface StatusFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export const StatusFilter: React.FC<StatusFilterProps> = ({ value, onChange }) => {
  const statuses = [
    { value: 'ALL', label: 'All Statuses' },
    ...Object.entries(ORDER_STATUS_CONFIG).map(([key, config]) => ({
      value: key,
      label: config.label,
    })),
  ];

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none"
      aria-label="Filter by order status"
    >
      {statuses.map((status) => (
        <option key={status.value} value={status.value}>
          {status.label}
        </option>
      ))}
    </select>
  );
};