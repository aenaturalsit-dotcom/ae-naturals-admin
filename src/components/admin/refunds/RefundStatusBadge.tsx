// components/admin/refunds/RefundStatusBadge.tsx
'use client';

import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  AlertCircle,
  Ban,
  Loader2,
  Circle,
  PlayCircle,
  CheckCircle2,
  XOctagon,
  Timer
} from 'lucide-react';

interface RefundStatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export function RefundStatusBadge({ 
  status, 
  size = 'md', 
  showIcon = true 
}: RefundStatusBadgeProps) {
  const config: Record<string, { 
    label: string; 
    color: string; 
    icon: React.ReactNode;
    description?: string;
  }> = {
    NOT_APPLICABLE: {
      label: 'Not Applicable',
      color: 'bg-gray-100 text-gray-500 border-gray-200',
      icon: <Ban className="w-3 h-3" />,
      description: 'No refund required for this order',
    },
    NOT_STARTED: {
      label: 'Not Started',
      color: 'bg-gray-100 text-gray-600 border-gray-300',
      icon: <Circle className="w-3 h-3" />,
      description: 'Return closed, refund ready to initiate',
    },
    INITIATED: {
      label: 'Initiated',
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: <PlayCircle className="w-3 h-3" />,
      description: 'Refund has been initiated by admin',
    },
    PROCESSING: {
      label: 'Processing',
      color: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      icon: <Loader2 className="w-3 h-3 animate-spin" />,
      description: 'Refund is being processed',
    },
    COMPLETED: {
      label: 'Completed',
      color: 'bg-green-50 text-green-700 border-green-200',
      icon: <CheckCircle2 className="w-3 h-3" />,
      description: 'Refund successfully completed',
    },
    FAILED: {
      label: 'Failed',
      color: 'bg-red-50 text-red-700 border-red-200',
      icon: <XOctagon className="w-3 h-3" />,
      description: 'Refund failed - needs manual intervention',
    },
    CANCELLED: {
      label: 'Cancelled',
      color: 'bg-gray-50 text-gray-600 border-gray-200',
      icon: <Ban className="w-3 h-3" />,
      description: 'Refund was cancelled',
    },
    // Legacy statuses (for backward compatibility)
    PENDING: {
      label: 'Pending',
      color: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      icon: <Clock className="w-3 h-3" />,
      description: 'Awaiting processing',
    },
    APPROVED: {
      label: 'Approved',
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: <CheckCircle className="w-3 h-3" />,
      description: 'Refund has been approved',
    },
    PROCESSED: {
      label: 'Processed',
      color: 'bg-green-50 text-green-700 border-green-200',
      icon: <CheckCircle className="w-3 h-3" />,
      description: 'Refund has been completed',
    },
    REJECTED: {
      label: 'Rejected',
      color: 'bg-red-50 text-red-700 border-red-200',
      icon: <XCircle className="w-3 h-3" />,
      description: 'Refund request was rejected',
    },
  };

  const { label, color, icon, description } = config[status] || {
    label: status,
    color: 'bg-gray-50 text-gray-700 border-gray-200',
    icon: <AlertCircle className="w-3 h-3" />,
    description: 'Unknown status',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${color} ${sizeClasses[size]}`}
      title={description}
    >
      {showIcon && icon}
      {label}
    </span>
  );
}