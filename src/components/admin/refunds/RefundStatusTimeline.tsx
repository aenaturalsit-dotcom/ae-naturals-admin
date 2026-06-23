// components/admin/refunds/RefundStatusTimeline.tsx
'use client';

import { format } from 'date-fns';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  RefreshCw,
  AlertCircle,
  Ban,
  Loader2
} from 'lucide-react';

interface RefundStatusTimelineProps {
  refund: {
    status: string;
    initiatedAt?: string;
    processingAt?: string;
    completedAt?: string;
    failedAt?: string;
    failureReason?: string;
    createdAt: string;
    updatedAt: string;
  };
}

export function RefundStatusTimeline({ refund }: RefundStatusTimelineProps) {
  const events = [
    {
      status: 'PENDING',
      label: 'Refund Initiated',
      date: refund.initiatedAt || refund.createdAt,
      icon: <Clock className="w-4 h-4" />,
      color: 'text-yellow-500',
    },
    {
      status: 'PROCESSING',
      label: 'Processing',
      date: refund.processingAt,
      icon: <Loader2 className="w-4 h-4 animate-spin" />,
      color: 'text-blue-500',
    },
    {
      status: 'COMPLETED',
      label: 'Completed',
      date: refund.completedAt,
      icon: <CheckCircle className="w-4 h-4" />,
      color: 'text-green-500',
    },
    {
      status: 'FAILED',
      label: 'Failed',
      date: refund.failedAt || refund.updatedAt,
      icon: <AlertCircle className="w-4 h-4" />,
      color: 'text-red-500',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
      case 'PROCESSED':
        return 'bg-green-500';
      case 'PROCESSING':
        return 'bg-blue-500';
      case 'PENDING':
        return 'bg-yellow-500';
      case 'FAILED':
      case 'REJECTED':
        return 'bg-red-500';
      case 'CANCELLED':
        return 'bg-gray-500';
      default:
        return 'bg-gray-300';
    }
  };

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {events.map((event, index) => {
          const isActive = event.date && new Date(event.date) <= new Date();
          const isCurrent = event.status === refund.status;
          const isCompleted = ['COMPLETED', 'PROCESSED', 'APPROVED'].includes(event.status);

          // Filter out events that don't have a date (unless they're the current status)
          if (!event.date && !isCurrent) return null;

          // Don't show FAILED if it's not the current status
          if (event.status === 'FAILED' && refund.status !== 'FAILED') return null;

          return (
            <li key={event.status} className="relative pb-8">
              {index < events.length - 1 && (
                <div
                  className={`absolute left-4 top-4 -ml-px h-full w-0.5 ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                  aria-hidden="true"
                />
              )}
              <div className="relative flex items-start gap-3">
                <div className="relative">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full ring-8 ring-white ${
                      isCompleted ? 'bg-green-100' : 'bg-gray-100'
                    }`}
                  >
                    {event.icon}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">
                      {event.label}
                      {isCurrent && (
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Current
                        </span>
                      )}
                    </p>
                    {event.date && (
                      <time className="text-sm text-gray-500 whitespace-nowrap">
                        {format(new Date(event.date), 'MMM dd, yyyy h:mm a')}
                      </time>
                    )}
                  </div>
                  {event.status === 'FAILED' && refund.failureReason && (
                    <p className="mt-1 text-sm text-red-600">
                      Reason: {refund.failureReason}
                    </p>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}