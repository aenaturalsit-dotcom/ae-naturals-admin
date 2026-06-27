// components/admin/orders/SortDropdown.tsx

import React from 'react';
import { ArrowUpDown } from 'lucide-react';

interface SortDropdownProps {
  value: string;
  onChange: (value: string) => void;
}

const SORT_OPTIONS = [
  { value: 'createdAt_desc', label: 'Newest First' },
  { value: 'createdAt_asc', label: 'Oldest First' },
  { value: 'totalAmount_desc', label: 'Highest Amount' },
  { value: 'totalAmount_asc', label: 'Lowest Amount' },
  { value: 'status_desc', label: 'Order Status (Z-A)' },
  { value: 'status_asc', label: 'Order Status (A-Z)' },
  { value: 'paymentStatus_desc', label: 'Payment Status (Z-A)' },
  { value: 'paymentStatus_asc', label: 'Payment Status (A-Z)' },
];

export const SortDropdown: React.FC<SortDropdownProps> = ({ value, onChange }) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none"
      aria-label="Sort orders"
    >
      <option value="" disabled>Sort by</option>
      {SORT_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};