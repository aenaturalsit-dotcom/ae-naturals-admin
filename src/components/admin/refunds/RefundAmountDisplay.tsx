// components/admin/refunds/RefundAmountDisplay.tsx
'use client';

import { IndianRupee, AlertCircle, CheckCircle } from 'lucide-react';

interface RefundAmountDisplayProps {
  amount: number;
  status?: string;
  className?: string;
}

export function RefundAmountDisplay({ 
  amount, 
  status, 
  className = '' 
}: RefundAmountDisplayProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'COMPLETED':
      case 'PROCESSED':
        return 'text-green-600';
      case 'PROCESSING':
        return 'text-blue-600';
      case 'PENDING':
        return 'text-yellow-600';
      case 'FAILED':
      case 'REJECTED':
        return 'text-red-600';
      case 'CANCELLED':
        return 'text-gray-500';
      default:
        return 'text-gray-900';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'COMPLETED':
      case 'PROCESSED':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'FAILED':
      case 'REJECTED':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <IndianRupee className={`w-4 h-4 ${getStatusColor()}`} />
      <span className={`font-bold ${getStatusColor()}`}>
        {amount.toLocaleString('en-IN', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </span>
      {getStatusIcon()}
    </div>
  );
}