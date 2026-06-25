// components/admin/returns/ReturnStatusBadge.tsx
'use client';

import { Clock, CheckCircle, XCircle, Truck, Package, RefreshCw } from 'lucide-react';

interface ReturnStatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ReturnStatusBadge({ status, size = 'md' }: ReturnStatusBadgeProps) {
  const config: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    REQUESTED: {
      label: 'Requested',
      color: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      icon: <Clock className="w-3 h-3" />,
    },
    APPROVED: {
      label: 'Approved',
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: <CheckCircle className="w-3 h-3" />,
    },
    REJECTED: {
      label: 'Rejected',
      color: 'bg-red-50 text-red-700 border-red-200',
      icon: <XCircle className="w-3 h-3" />,
    },
    PICKUP_SCHEDULED: {
      label: 'Pickup Scheduled',
      color: 'bg-purple-50 text-purple-700 border-purple-200',
      icon: <Truck className="w-3 h-3" />,
    },
    PICKUP_COMPLETED: {
      label: 'Pickup Completed',
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      icon: <CheckCircle className="w-3 h-3" />,
    },
    RECEIVED: {
      label: 'Received',
      color: 'bg-cyan-50 text-cyan-700 border-cyan-200',
      icon: <Package className="w-3 h-3" />,
    },
    INSPECTED: {
      label: 'Inspected',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: <RefreshCw className="w-3 h-3" />,
    },
    CLOSED: {
      label: 'Closed',
      color: 'bg-gray-100 text-gray-700 border-gray-200',
      icon: <CheckCircle className="w-3 h-3" />,
    },
  };

  const { label, color, icon } = config[status] || {
    label: status,
    color: 'bg-gray-50 text-gray-700 border-gray-200',
    icon: <Clock className="w-3 h-3" />,
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${color} ${sizeClasses[size]}`}
    >
      {icon}
      {label}
    </span>
  );
}