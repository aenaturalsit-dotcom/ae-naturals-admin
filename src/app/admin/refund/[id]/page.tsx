// app/admin/refunds/[id]/page.tsx
'use client';

import { use, useState, useEffect } from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import { format } from 'date-fns';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  Package,
  User,
  Mail,
  Phone,
  CreditCard,
  IndianRupee,
  Calendar,
  AlertCircle,
  RefreshCw,
  Loader2,
  Ban,
  Truck,
  FileText,
} from 'lucide-react';
import apiClient from '@/lib/api-client';
import { RefundStatusBadge } from '@/components/admin/refunds/RefundStatusBadge';
import { toast } from 'react-hot-toast';
import { BRAND } from '@/config/brand.config';

const fetcher = async (url: string) => {
  const res = await apiClient.get(url);
  return res?.data?.data || res?.data || res;
};

export default function AdminRefundDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const refundId = resolvedParams?.id;

  const [isActionLoading, setIsActionLoading] = useState(false);
  const [showFailureModal, setShowFailureModal] = useState(false);
  const [failureReason, setFailureReason] = useState('');
  const [gatewayRefundId, setGatewayRefundId] = useState('');
  const [showProcessModal, setShowProcessModal] = useState(false);

  const { data: refund, error, isLoading, mutate } = useSWR(
    refundId ? `/admin/refunds/${refundId}` : null,
    fetcher
  );

  // Debug log
  useEffect(() => {
    if (refund) {
      console.log('[DEBUG] Refund Data:', refund);
    }
  }, [refund]);

  // Handle refund actions
  const handleAction = async (action: string, data?: any) => {
    setIsActionLoading(true);
    try {
      await apiClient.patch(`/admin/refunds/${refundId}/${action}`, data || {});
      toast.success(`Refund ${action} successfully`);
      mutate();
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to ${action} refund`);
    } finally {
      setIsActionLoading(false);
      setShowProcessModal(false);
      setShowFailureModal(false);
      setGatewayRefundId('');
      setFailureReason('');
    }
  };

  // Handle retry
  const handleRetry = async () => {
    setIsActionLoading(true);
    try {
      await apiClient.post(`/admin/refunds/${refundId}/retry`);
      toast.success('Refund retry initiated');
      mutate();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to retry refund');
    } finally {
      setIsActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error || !refund) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <XCircle className="h-12 w-12 text-red-500" />
        <h2 className="text-xl font-bold text-gray-900">Failed to load refund</h2>
        <p className="text-sm text-gray-500">The refund could not be found or you don't have permission to view it.</p>
        <Link
          href="/admin/refunds"
          className="inline-flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Refunds
        </Link>
      </div>
    );
  }

  const {
    id,
    refundReference,
    refundAmount,
    refundStatus,
    refundMethod,
    order,
    return: returnData,
    initiatedAt,
    processingAt,
    completedAt,
    failureReason: existingFailureReason,
    failureRetryCount,
    processedBy,
    gatewayRefundId: existingGatewayRefundId,
    createdAt,
    updatedAt,
  } = refund;

  // Determine available actions
  const getAvailableActions = () => {
    switch (refundStatus) {
      case 'PENDING':
      case 'APPROVED':
        return [
          {
            label: 'Process Refund',
            action: () => setShowProcessModal(true),
            color: 'bg-blue-600 hover:bg-blue-700',
            icon: <RefreshCw className="w-4 h-4 mr-2" />,
          },
          {
            label: 'Fail Refund',
            action: () => setShowFailureModal(true),
            color: 'bg-red-600 hover:bg-red-700',
            icon: <AlertCircle className="w-4 h-4 mr-2" />,
          },
        ];
      case 'PROCESSING':
        return [
          {
            label: 'Complete Refund',
            action: () => handleAction('complete'),
            color: 'bg-green-600 hover:bg-green-700',
            icon: <CheckCircle className="w-4 h-4 mr-2" />,
          },
          {
            label: 'Fail Refund',
            action: () => setShowFailureModal(true),
            color: 'bg-red-600 hover:bg-red-700',
            icon: <AlertCircle className="w-4 h-4 mr-2" />,
          },
        ];
      case 'FAILED':
        return [
          {
            label: `Retry Refund (${3 - (failureRetryCount || 0)} attempts left)`,
            action: handleRetry,
            color: 'bg-blue-600 hover:bg-blue-700',
            icon: <RefreshCw className="w-4 h-4 mr-2" />,
            disabled: (failureRetryCount || 0) >= 3,
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

  const availableActions = getAvailableActions();

  // Timeline events
  const timelineEvents = [
    { label: 'Refund Created', date: createdAt, icon: <Clock className="w-4 h-4" /> },
    { label: 'Refund Initiated', date: initiatedAt, icon: <CreditCard className="w-4 h-4" /> },
    { label: 'Refund Processing', date: processingAt, icon: <RefreshCw className="w-4 h-4" /> },
    { label: 'Refund Completed', date: completedAt, icon: <CheckCircle className="w-4 h-4" /> },
    { label: 'Refund Failed', date: existingFailureReason ? updatedAt : null, icon: <AlertCircle className="w-4 h-4" /> },
  ].filter(event => event.date);

  return (
    <div className="max-w-[1400px] mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/refunds"
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Refund #{refundReference}
            </h1>
            <p className="text-sm text-gray-500">
              Order #{order?.id?.slice(-6).toUpperCase() || 'N/A'}
            </p>
          </div>
        </div>
        <RefundStatusBadge status={refundStatus} size="lg" />
      </div>

      {/* Action Buttons */}
      {availableActions.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-3">
          {availableActions.map((action, index) => (
            <button
              key={index}
              onClick={action.action}
              disabled={isActionLoading || action.disabled}
              className={`inline-flex items-center px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${action.color}`}
            >
              {isActionLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : action.icon}
              {action.label}
            </button>
          ))}
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Refund Summary */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-4">Refund Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Reference</span>
                <span className="font-mono font-medium text-gray-900">{refundReference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount</span>
                <span className="font-bold text-lg text-blue-600 flex items-center gap-1">
                  <IndianRupee className="w-4 h-4" />
                  {refundAmount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Method</span>
                <span className="font-medium text-gray-900 flex items-center gap-1">
                  <CreditCard className="w-4 h-4 text-gray-400" />
                  {refundMethod || 'N/A'}
                </span>
              </div>
              {existingGatewayRefundId && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Gateway Refund ID</span>
                  <span className="font-mono text-xs text-gray-700">{existingGatewayRefundId}</span>
                </div>
              )}
              {processedBy && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Processed By</span>
                  <span className="font-medium text-gray-900">{processedBy}</span>
                </div>
              )}
              {failureRetryCount !== undefined && failureRetryCount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Retry Attempts</span>
                  <span className="font-medium text-red-600">{failureRetryCount}/3</span>
                </div>
              )}
            </div>
          </div>

          {/* Order Info */}
          {order && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-gray-400" />
                Order Details
              </h3>
              <div className="space-y-2 text-sm">
                <Link
                  href={`/admin/orders/${order.id}`}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Order #{order.id.slice(-6).toUpperCase()}
                </Link>
                <p className="text-gray-600">Total: ₹{order.totalAmount?.toFixed(2)}</p>
                {order.user && (
                  <div className="pt-2 border-t border-gray-100 mt-2">
                    <p className="font-medium text-gray-900">{order.user.name}</p>
                    <p className="text-gray-500 flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5" />
                      {order.user.email}
                    </p>
                    <p className="text-gray-500 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" />
                      {order.user.phone}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Return Info */}
          {returnData && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Truck className="w-5 h-5 text-gray-400" />
                Return Details
              </h3>
              <div className="space-y-2 text-sm">
                <Link
                  href={`/admin/returns/${returnData.id}`}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Return #{returnData.returnNumber}
                </Link>
                <p className="text-gray-600">
                  Status: <span className="font-medium">{returnData.returnStatus}</span>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Failure Reason */}
          {existingFailureReason && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-red-800">Refund Failed</h4>
                  <p className="text-sm text-red-700 mt-1">{existingFailureReason}</p>
                </div>
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-6">Refund Timeline</h3>
            {timelineEvents.length > 0 ? (
              <div className="flow-root">
                <ul className="-mb-8">
                  {timelineEvents.map((event, index) => {
                    const isLast = index === timelineEvents.length - 1;
                    const isActive = event.date && new Date(event.date) <= new Date();
                    const isCompleted = event.label.includes('Completed') || event.label.includes('Created');

                    return (
                      <li key={index} className="relative pb-8">
                        {!isLast && (
                          <div
                            className={`absolute left-4 top-4 -ml-px h-full w-0.5 ${
                              isCompleted ? 'bg-green-500' : 'bg-gray-300'
                            }`}
                            aria-hidden="true"
                          />
                        )}
                        <div className="relative flex items-start gap-3">
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-full ring-8 ring-white ${
                              isCompleted ? 'bg-green-100' : 'bg-gray-100'
                            }`}
                          >
                            {event.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-gray-900">
                                {event.label}
                              </p>
                              {event.date && (
                                <time className="text-sm text-gray-500 whitespace-nowrap">
                                  {format(new Date(event.date), 'MMM dd, yyyy h:mm a')}
                                </time>
                              )}
                            </div>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                No timeline events available
              </p>
            )}
          </div>

          {/* Audit Log - Placeholder for future implementation */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-400" />
              Audit Log
            </h3>
            <p className="text-sm text-gray-500 text-center py-4">
              Audit log will be displayed here
            </p>
          </div>
        </div>
      </div>

      {/* Process Refund Modal */}
      {showProcessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Process Refund</h3>
            <p className="text-sm text-gray-600 mb-4">
              Enter the gateway refund ID to process this refund.
            </p>
            <input
              type="text"
              placeholder="Gateway Refund ID"
              value={gatewayRefundId}
              onChange={(e) => setGatewayRefundId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowProcessModal(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAction('process', { gatewayRefundId })}
                disabled={!gatewayRefundId || isActionLoading}
                className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isActionLoading ? 'Processing...' : 'Process Refund'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fail Refund Modal */}
      {showFailureModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-lg font-bold text-red-600 mb-4">Fail Refund</h3>
            <p className="text-sm text-gray-600 mb-4">
              Enter the reason why this refund failed.
            </p>
            <textarea
              placeholder="Failure reason (minimum 5 characters)"
              value={failureReason}
              onChange={(e) => setFailureReason(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none resize-none mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowFailureModal(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAction('fail', { failureReason })}
                disabled={failureReason.length < 5 || isActionLoading}
                className="flex-1 px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isActionLoading ? 'Processing...' : 'Fail Refund'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}