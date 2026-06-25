// components/admin/refunds/RefundActionButtons.tsx
'use client';

import { useState } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  AlertCircle,
  Loader2,
  PlayCircle,
  Ban
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

  const handleInitiateRefund = () => {
    // Show modal for COD refund details
    const refundMethod = prompt('Enter refund method (GATEWAY, MANUAL_BANK, UPI):');
    if (!refundMethod) return;

    if (refundMethod === 'MANUAL_BANK') {
      const accountHolderName = prompt('Enter account holder name:');
      const bankName = prompt('Enter bank name:');
      const accountNumber = prompt('Enter account number:');
      const ifscCode = prompt('Enter IFSC code:');
      
      if (accountHolderName && bankName && accountNumber && ifscCode) {
        handleAction('initiate', { 
          refundMethod,
          accountHolderName,
          bankName,
          accountNumber,
          ifscCode
        });
      }
    } else if (refundMethod === 'UPI') {
      const upiId = prompt('Enter UPI ID:');
      if (upiId) {
        handleAction('initiate', { refundMethod, upiId });
      }
    } else {
      handleAction('initiate', { refundMethod });
    }
  };

  const handleProcessRefund = () => {
    const manualTransactionId = prompt('Enter manual transaction ID (optional):');
    handleAction('process', { manualTransactionId });
  };

  const handleCompleteRefund = () => {
    const gatewayRefundId = prompt('Enter gateway refund ID (optional):');
    const manualTransactionId = prompt('Enter manual transaction ID (optional):');
    handleAction('complete', { gatewayRefundId, manualTransactionId });
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
      case 'NOT_STARTED':
        return [
          { 
            label: 'Initiate Refund', 
            action: handleInitiateRefund,
            color: 'bg-blue-600 hover:bg-blue-700',
            icon: <PlayCircle className="w-4 h-4 mr-2" />,
          },
        ];
      case 'INITIATED':
        return [
          { 
            label: 'Process Refund', 
            action: handleProcessRefund,
            color: 'bg-indigo-600 hover:bg-indigo-700',
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
            action: () => {
              if (confirm('Are you sure you want to cancel this refund?')) {
                handleAction('cancel');
              }
            },
            color: 'bg-gray-600 hover:bg-gray-700',
            icon: <Ban className="w-4 h-4 mr-2" />,
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