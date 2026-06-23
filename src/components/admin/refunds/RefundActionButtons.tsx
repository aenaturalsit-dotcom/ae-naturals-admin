// components/admin/refunds/RefundActionButtons.tsx
'use client';

import { useState } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  AlertCircle,
  Loader2 
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import apiClient from '@/lib/api-client';

interface RefundActionButtonsProps {
  refundId: string;
  currentStatus: string;
  onActionComplete: () => void;
  className?: string;
}

export function RefundActionButtons({
  refundId,
  currentStatus,
  onActionComplete,
  className = '',
}: RefundActionButtonsProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleAction = async (action: string, data?: any) => {
    setIsLoading(true);
    try {
      await apiClient.patch(`/admin/refunds/${refundId}/${action}`, data);
      toast.success(`Refund ${action} successfully`);
      onActionComplete();
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to ${action} refund`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProcessRefund = () => {
    const gatewayId = prompt('Enter gateway refund ID:');
    if (gatewayId) {
      handleAction('process', { gatewayRefundId: gatewayId });
    }
  };

  const handleCompleteRefund = () => {
    if (confirm('Mark this refund as completed?')) {
      handleAction('complete');
    }
  };

  const handleFailRefund = () => {
    const reason = prompt('Enter failure reason:');
    if (reason && reason.length >= 5) {
      handleAction('fail', { failureReason: reason });
    } else {
      toast.error('Failure reason must be at least 5 characters');
    }
  };

  const getAvailableActions = () => {
    switch (currentStatus) {
      case 'PENDING':
      case 'APPROVED':
        return [
          { 
            label: 'Process Refund', 
            action: handleProcessRefund,
            color: 'bg-blue-600 hover:bg-blue-700',
            icon: <RefreshCw className="w-4 h-4 mr-2" />,
          },
          {
            label: 'Fail Refund',
            action: handleFailRefund,
            color: 'bg-red-600 hover:bg-red-700',
            icon: <AlertCircle className="w-4 h-4 mr-2" />,
          },
        ];
      case 'PROCESSING':
        return [
          {
            label: 'Complete Refund',
            action: handleCompleteRefund,
            color: 'bg-green-600 hover:bg-green-700',
            icon: <CheckCircle className="w-4 h-4 mr-2" />,
          },
          {
            label: 'Fail Refund',
            action: handleFailRefund,
            color: 'bg-red-600 hover:bg-red-700',
            icon: <AlertCircle className="w-4 h-4 mr-2" />,
          },
        ];
      case 'FAILED':
        return [
          {
            label: 'Retry Refund',
            action: () => handleAction('retry'),
            color: 'bg-blue-600 hover:bg-blue-700',
            icon: <RefreshCw className="w-4 h-4 mr-2" />,
          },
          {
            label: 'Cancel Refund',
            action: () => handleAction('cancel'),
            color: 'bg-gray-600 hover:bg-gray-700',
            icon: <XCircle className="w-4 h-4 mr-2" />,
          },
        ];
      default:
        return [];
    }
  };

  const actions = getAvailableActions();

  if (actions.length === 0) {
    return null;
  }

  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      {actions.map((action, index) => (
        <button
          key={index}
          onClick={action.action}
          disabled={isLoading}
          className={`inline-flex items-center px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 ${action.color}`}
        >
          {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : action.icon}
          {action.label}
        </button>
      ))}
    </div>
  );
}