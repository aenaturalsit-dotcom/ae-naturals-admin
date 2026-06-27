// components/admin/orders/DateRangeFilter.tsx

import React, { useState } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';

interface DateRangeFilterProps {
  value: { from?: string; to?: string };
  onChange: (range: { from?: string; to?: string }) => void;
}

const PRESETS = [
  { label: 'Today', value: 'today' },
  { label: 'Yesterday', value: 'yesterday' },
  { label: 'Last 7 Days', value: 'last7' },
  { label: 'Last 30 Days', value: 'last30' },
  { label: 'This Month', value: 'thisMonth' },
  { label: 'Last Month', value: 'lastMonth' },
];

export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const getDateRange = (preset: string) => {
    const now = new Date();
    const from = new Date(now);
    const to = new Date(now);
    
    switch (preset) {
      case 'today':
        from.setHours(0, 0, 0, 0);
        to.setHours(23, 59, 59, 999);
        break;
      case 'yesterday':
        from.setDate(now.getDate() - 1);
        from.setHours(0, 0, 0, 0);
        to.setDate(now.getDate() - 1);
        to.setHours(23, 59, 59, 999);
        break;
      case 'last7':
        from.setDate(now.getDate() - 7);
        from.setHours(0, 0, 0, 0);
        break;
      case 'last30':
        from.setDate(now.getDate() - 30);
        from.setHours(0, 0, 0, 0);
        break;
      case 'thisMonth':
        from.setDate(1);
        from.setHours(0, 0, 0, 0);
        break;
      case 'lastMonth':
        from.setMonth(now.getMonth() - 1);
        from.setDate(1);
        from.setHours(0, 0, 0, 0);
        to.setDate(0);
        to.setHours(23, 59, 59, 999);
        break;
      default:
        return;
    }
    
    onChange({
      from: from.toISOString(),
      to: to.toISOString(),
    });
  };

  const handleClear = () => {
    onChange({});
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none"
        aria-label="Filter by date range"
      >
        <Calendar className="w-4 h-4" />
        <span>Date Range</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-2 min-w-[200px] z-50">
          {PRESETS.map((preset) => (
            <button
              key={preset.value}
              onClick={() => {
                getDateRange(preset.value);
                setIsOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              {preset.label}
            </button>
          ))}
          <div className="border-t border-gray-200 my-1" />
          <button
            onClick={handleClear}
            className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
          >
            Clear Dates
          </button>
        </div>
      )}
    </div>
  );
};