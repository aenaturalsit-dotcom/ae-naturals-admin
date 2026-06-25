'use client';

import { use, useState } from 'react';
import useSWR from 'swr';
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
  MapPin,
  Calendar,
  MessageSquare,
  Image as ImageIcon,
  RefreshCw,
  Truck,
  CreditCard,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import apiClient from '@/lib/api-client';
import { ReturnStatusBadge } from '@/components/admin/returns/ReturnStatusBadge';
import { RefundStatusBadge } from '@/components/admin/refunds/RefundStatusBadge';
import { toast } from 'react-hot-toast';
import { InspectReturnModal } from '@/components/admin/returns/InspectReturnModal';

// ============================================
// ENTERPRISE MODALS
// ============================================
import {
  ApproveReturnModal,
  RejectReturnModal,
  SchedulePickupModal,
  ReceiveReturnModal,
  CloseReturnModal,
} from '@/components/admin/returns/ReturnActionModals';

const fetcher = async (url: string) => {
  const res = await apiClient.get(url);
  return res?.data?.data || res?.data || res;
};

export default function AdminReturnDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const returnId = resolvedParams?.id;

  // ============================================
  // STATE MANAGEMENT
  // ============================================
  const {
    data: returnData,
    error,
    isLoading,
    mutate,
  } = useSWR(returnId ? `/admin/returns/${returnId}` : null, fetcher);

  const [isActionLoading, setIsActionLoading] = useState(false);

  // Modal States
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showSchedulePickupModal, setShowSchedulePickupModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [showInspectModal, setShowInspectModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);

  const [inspectionItems, setInspectionItems] = useState<any[]>([]);

  // ============================================
  // ACTION HANDLERS
  // ============================================
  const handleAction = async (
    action: string,
    data?: any,
    closeModal?: () => void,
  ) => {
    setIsActionLoading(true);
    try {
      await apiClient.patch(`/admin/returns/${returnId}/${action}`, data);
      toast.success(`Return ${action} successfully`);
      closeModal?.(); // Close modal
      mutate();
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to ${action} return`);
    } finally {
      setIsActionLoading(false);
    }
  };

  // ============================================
  // LOADING & ERROR STATES
  // ============================================
  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error || !returnData) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <XCircle className="h-12 w-12 text-red-500" />
        <h2 className="text-xl font-bold text-gray-900 mt-4">Failed to load return</h2>
        <p className="text-sm text-gray-500 mt-2">The return could not be found or you don't have permission.</p>
        <Link
          href="/admin/returns"
          className="mt-4 inline-flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Returns
        </Link>
      </div>
    );
  }

  // ============================================
  // DATA DESTRUCTURING
  // ============================================
  const {
    returnNumber,
    order,
    returnStatus,
    returnReason,
    customerComment,
    adminComment: existingAdminComment,
    requestedAt,
    approvedAt,
    rejectedAt,
    rejectionReason: existingRejectionReason,
    pickupScheduledAt,
    pickupCompletedAt,
    receivedAt,
    inspectedAt,
    closedAt,
    items,
    refunds,
  } = returnData;

  const latestRefund = refunds?.[0];

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="max-w-[1400px] mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/returns"
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Return #{returnNumber}
            </h1>
            <p className="text-sm text-gray-500">
              Order #{order?.id?.slice(-6).toUpperCase()}
            </p>
          </div>
        </div>
        <ReturnStatusBadge status={returnStatus} />
      </div>

      {/* ========================================== */}
      {/* ACTION BUTTONS - ENTERPRISE GRADE */}
      {/* ========================================== */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-3">
        {returnStatus === 'REQUESTED' && (
          <>
            <button
              onClick={() => setShowApproveModal(true)}
              disabled={isActionLoading}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve Return
            </button>
            <button
              onClick={() => setShowRejectModal(true)}
              disabled={isActionLoading}
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Reject Return
            </button>
          </>
        )}

        {returnStatus === 'APPROVED' && (
          <button
            onClick={() => setShowSchedulePickupModal(true)}
            disabled={isActionLoading}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Truck className="w-4 h-4 mr-2" />
            Schedule Pickup
          </button>
        )}

        {returnStatus === 'PICKUP_SCHEDULED' && (
          <button
            onClick={() => handleAction('complete-pickup')}
            disabled={isActionLoading}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Complete Pickup
          </button>
        )}

        {returnStatus === 'PICKUP_COMPLETED' && (
          <button
            onClick={() => setShowReceiveModal(true)}
            disabled={isActionLoading}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            <Package className="w-4 h-4 mr-2" />
            Receive & Inspect
          </button>
        )}

        {returnStatus === 'RECEIVED' && (
          <>
            <button
              onClick={() => {
                setInspectionItems(items || []);
                setShowInspectModal(true);
              }}
              disabled={isActionLoading}
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Inspect Items
            </button>
            <button
              onClick={() => setShowCloseModal(true)}
              disabled={isActionLoading}
              className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Close Return
            </button>
          </>
        )}

        {returnStatus === 'INSPECTED' && (
          <button
            onClick={() => setShowCloseModal(true)}
            disabled={isActionLoading}
            className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Close Return
          </button>
        )}
      </div>

      {/* ========================================== */}
      {/* MAIN CONTENT - UNCHANGED */}
      {/* ========================================== */}
      {/* ... (keep your existing main content) ... */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Customer Info, Address, Refund Status */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-gray-400" />
              Customer
            </h3>
            <div className="space-y-2 text-sm">
              <p className="font-medium text-gray-900">{order.user?.name || 'N/A'}</p>
              {order.user?.email && (
                <p className="flex items-center gap-2 text-gray-600">
                  <Mail className="w-4 h-4" />
                  {order.user.email}
                </p>
              )}
              {order.user?.phone && (
                <p className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-4 h-4" />
                  {order.user.phone}
                </p>
              )}
            </div>
          </div>

          {/* Address */}
          {order?.addressSnapshot && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-gray-400" />
                Shipping Address
              </h3>
              <address className="not-italic text-sm text-gray-600 space-y-1">
                <p className="font-medium text-gray-900">
                  {order.addressSnapshot.name}
                </p>
                <p>{order.addressSnapshot.addressLine}</p>
                <p>
                  {order.addressSnapshot.city}, {order.addressSnapshot.state}{' '}
                  {order.addressSnapshot.pincode}
                </p>
                <p>Phone: {order.addressSnapshot.phone}</p>
              </address>
            </div>
          )}

          {/* Refund Status */}
          {latestRefund && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-gray-400" />
                Refund
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <RefundStatusBadge status={latestRefund.refundStatus} />
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount</span>
                  <span className="font-medium">
                    ₹{latestRefund.refundAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Method</span>
                  <span className="font-medium">{latestRefund.refundMethod}</span>
                </div>
                {latestRefund.gatewayRefundId && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Gateway Ref</span>
                    <span className="font-mono text-xs">
                      {latestRefund.gatewayRefundId}
                    </span>
                  </div>
                )}
                <Link
                  href={`/admin/refunds/${latestRefund.id}`}
                  className="block text-center text-blue-600 hover:text-blue-700 text-sm font-medium mt-2"
                >
                  View Refund Details →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Return Details, Items, Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Return Details */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-4">Return Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Return Reason</span>
                <p className="font-medium text-gray-900 mt-1">{returnReason}</p>
              </div>
              {customerComment && (
                <div>
                  <span className="text-gray-600">Customer Comment</span>
                  <p className="font-medium text-gray-900 mt-1">{customerComment}</p>
                </div>
              )}
              {existingAdminComment && (
                <div className="col-span-2">
                  <span className="text-gray-600">Admin Comment</span>
                  <p className="font-medium text-gray-900 mt-1">{existingAdminComment}</p>
                </div>
              )}
              {existingRejectionReason && (
                <div className="col-span-2">
                  <span className="text-gray-600">Rejection Reason</span>
                  <p className="font-medium text-red-600 mt-1">{existingRejectionReason}</p>
                </div>
              )}
            </div>
          </div>

          {/* Return Items */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h3 className="font-bold text-gray-900">Return Items</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {items?.map((item: any) => (
                <div key={item.id} className="p-4 flex items-center gap-4">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {item.orderItem?.product?.name || 'Product'}
                    </p>
                    <p className="text-sm text-gray-500">
                      Quantity: {item.quantity} | Condition: {item.condition || 'N/A'}
                    </p>
                    {item.reason && (
                      <p className="text-sm text-gray-500">Reason: {item.reason}</p>
                    )}
                    {item.inspectionNotes && (
                      <p className="text-sm text-blue-600">Inspection: {item.inspectionNotes}</p>
                    )}
                  </div>
                  {item.images && item.images.length > 0 && (
                    <div className="flex gap-2">
                      {item.images.map((image: string, index: number) => (
                        <div
                          key={index}
                          className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden"
                        >
                          <img
                            src={image}
                            alt={`Item ${index}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-4">Timeline</h3>
            <div className="space-y-4">
              {[
                { label: 'Requested', date: requestedAt },
                { label: 'Approved', date: approvedAt },
                { label: 'Rejected', date: rejectedAt },
                { label: 'Pickup Scheduled', date: pickupScheduledAt },
                { label: 'Pickup Completed', date: pickupCompletedAt },
                { label: 'Received', date: receivedAt },
                { label: 'Inspected', date: inspectedAt },
                { label: 'Closed', date: closedAt },
              ]
                .filter((event) => event.date)
                .map((event, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="mt-1">
                      <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                      {index < 7 && <div className="w-0.5 h-8 bg-gray-200 ml-0.5"></div>}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{event.label}</p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(event.date!), 'MMM dd, yyyy h:mm a')}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* ENTERPRISE MODALS */}
      {/* ========================================== */}

      {/* Approve Modal */}
      <ApproveReturnModal
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        onConfirm={(data:any) => handleAction('approve', data, () => setShowApproveModal(false))}
        isLoading={isActionLoading}
        returnId={returnId}
      />

      {/* Reject Modal */}
      <RejectReturnModal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        onConfirm={(data:any) => handleAction('reject', data,() => setShowRejectModal(false),)}
        isLoading={isActionLoading}
        returnId={returnId}
      />

      {/* Schedule Pickup Modal */}
      <SchedulePickupModal
        isOpen={showSchedulePickupModal}
        onClose={() => setShowSchedulePickupModal(false)}
        onConfirm={(data:any) => handleAction('schedule-pickup', data,() => setShowSchedulePickupModal(false),)}
        isLoading={isActionLoading}
        returnId={returnId}
      />

      {/* Receive Return Modal */}
      <ReceiveReturnModal
        isOpen={showReceiveModal}
        onClose={() => setShowReceiveModal(false)}
        onConfirm={(data:any) => handleAction('receive', data,() => setShowReceiveModal(false),)}
        isLoading={isActionLoading}
        returnId={returnId}
        returnItems={items || []}
      />

      {/* Inspect Modal */}
      {showInspectModal && (
        <InspectReturnModal
          isOpen={showInspectModal}
          onClose={() => {
            setShowInspectModal(false);
            setInspectionItems([]);
          }}
          onConfirm={async (data:any) => {
            await handleAction('inspect', data);
            setShowInspectModal(false);
            setInspectionItems([]);
          }}
          returnItems={inspectionItems}
          isLoading={isActionLoading}
          returnId={returnId}
        />
      )}

      {/* Close Modal */}
      <CloseReturnModal
        isOpen={showCloseModal}
        onClose={() => setShowCloseModal(false)}
        onConfirm={() => handleAction('close', undefined, () => setShowCloseModal(false))}
        isLoading={isActionLoading}
        returnId={returnId}
        returnStatus={returnStatus}
      />
    </div>
  );
}