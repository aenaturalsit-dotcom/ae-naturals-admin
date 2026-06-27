// src\app\admin\orders\[id]\page.tsx

"use client";

import { use, useState, useEffect } from "react";
import useSWR from "swr";
import apiClient from "@/lib/api-client";
import CancelOrderModal from "../CancelOrderModal";
import CancelShipmentModal from "../CancelShipmentModal";
import {
  Package,
  XCircle,
  MapPin,
  Loader2,
  User,
  Phone,
  Mail,
  Calendar,
  CreditCard,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Truck,
  FileText,
} from "lucide-react";
import { AdminTrackingLogs } from "../AdminTrackingLogs";
import { resolveFirstProductImage } from "@/shared/utils/media-normalization";
import { format } from "date-fns";

// 🔥 FOOLPROOF FETCHER
const fetcher = async (url: string) => {
  try {
    const res = await apiClient.get(url);
    return res?.data?.data || res?.data || res;
  } catch (error) {
    console.error(`SWR Fetch Error for ${url}:`, error);
    throw error;
  }
};

// 🔥 STATE MACHINE
const ORDER_TRANSITIONS: Record<string, string[]> = {
  PENDING: ["PAID", "CANCELLED"],
  PAID: ["PROCESSING", "SHIPPED", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED", "RETURNED"],
  DELIVERED: ["RETURNED"],
  CANCELLED: [],
  RETURNED: [],
};

const ACTION_LABELS: Record<string, string> = {
  PAID: "Mark as Paid",
  PROCESSING: "Process Order",
  SHIPPED: "Mark as Shipped",
  DELIVERED: "Confirm Delivery",
  CANCELLED: "Cancel Order",
  RETURNED: "Process Return",
};

// 🔥 SHIPMENT STATUS BADGE COMPONENT
const ShipmentStatusBadge = ({ status }: { status: string }) => {
  const colors: Record<string, string> = {
    PENDING: "bg-yellow-50 text-yellow-700 border-yellow-200",
    READY_TO_SHIP: "bg-blue-50 text-blue-700 border-blue-200",
    PICKED_UP: "bg-indigo-50 text-indigo-700 border-indigo-200",
    IN_TRANSIT: "bg-purple-50 text-purple-700 border-purple-200",
    OUT_FOR_DELIVERY: "bg-cyan-50 text-cyan-700 border-cyan-200",
    DELIVERED: "bg-green-50 text-green-700 border-green-200",
    CANCELLED: "bg-red-50 text-red-700 border-red-200",
    FAILED: "bg-red-50 text-red-700 border-red-200",
    RTO_INITIATED: "bg-orange-50 text-orange-700 border-orange-200",
    RTO_DELIVERED: "bg-orange-50 text-orange-700 border-orange-200",
  };

  return (
    <span
      className={`px-3 py-1 text-xs uppercase tracking-wider font-bold rounded-md border ${
        colors[status] || "bg-gray-50 text-gray-700 border-gray-200"
      }`}
    >
      {status}
    </span>
  );
};

// 🔥 REFUND STATUS BADGE
const RefundStatusBadge = ({ status }: { status: string }) => {
  const config: Record<string, { color: string; icon: React.ReactNode }> = {
    NOT_APPLICABLE: {
      color: "bg-gray-50 text-gray-700 border-gray-200",
      icon: <AlertCircle className="w-3 h-3" />,
    },
    PENDING: {
      color: "bg-amber-50 text-amber-700 border-amber-200",
      icon: <Clock className="w-3 h-3" />,
    },
    APPROVED: {
      color: "bg-blue-50 text-blue-700 border-blue-200",
      icon: <RefreshCw className="w-3 h-3" />,
    },
    PROCESSED: {
      color: "bg-green-50 text-green-700 border-green-200",
      icon: <CheckCircle className="w-3 h-3" />,
    },
    REJECTED: {
      color: "bg-red-50 text-red-700 border-red-200",
      icon: <XCircle className="w-3 h-3" />,
    },
    FAILED: {
      color: "bg-red-50 text-red-700 border-red-200",
      icon: <XCircle className="w-3 h-3" />,
    },
  };

  const { color, icon } = config[status] || config["NOT_APPLICABLE"];

  return (
    <span
      className={`px-3 py-1 text-xs uppercase tracking-wider font-bold rounded-md border inline-flex items-center gap-1.5 ${color}`}
    >
      {icon}
      {status === "NOT_APPLICABLE" ? "No Refund" : status}
    </span>
  );
};

// 🔥 CANCELLATION INFO CARD
const CancellationInfoCard = ({ order }: { order: any }) => {
  if (order.status !== "CANCELLED" && order.status !== "RETURNED") {
    return null;
  }

  const isCancelled = order.status === "CANCELLED";
  const isReturned = order.status === "RETURNED";
  const hasRefund =
    order.refundStatus && order.refundStatus !== "NOT_APPLICABLE";

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        {isCancelled ? (
          <XCircle className="h-5 w-5 text-red-500" />
        ) : (
          <RefreshCw className="h-5 w-5 text-orange-500" />
        )}
        {isCancelled ? "Cancellation Details" : "Return Details"}
      </h3>

      <div className="space-y-3">
        {/* Who cancelled */}
        <div className="flex justify-between items-center py-2 border-b border-gray-100">
          <span className="text-sm text-gray-600">Cancelled By</span>
          <span className="text-sm font-medium text-gray-900">
            {order.cancelledBy || "System"}
            {order.cancellationSource && (
              <span className="ml-2 text-xs text-gray-500">
                ({order.cancellationSource})
              </span>
            )}
          </span>
        </div>

        {/* When cancelled */}
        {order.cancelledAt && (
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">Cancelled At</span>
            <span className="text-sm font-medium text-gray-900">
              {format(new Date(order.cancelledAt), "MMM dd, yyyy h:mm a")}
            </span>
          </div>
        )}

        {/* Reason */}
        {order.cancellationReason && (
          <div className="py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600 block mb-1">Reason</span>
            <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
              {order.cancellationReason}
            </p>
          </div>
        )}

        {/* Refund Status */}
        <div className="flex justify-between items-center py-2 border-b border-gray-100">
          <span className="text-sm text-gray-600">Refund Status</span>
          <RefundStatusBadge status={order.refundStatus || "NOT_APPLICABLE"} />
        </div>

        {/* Refund Amount */}
        {hasRefund && order.refundAmount && (
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">Refund Amount</span>
            <span className="text-sm font-bold text-green-600">
              ₹{order.refundAmount.toFixed(2)}
            </span>
          </div>
        )}

        {/* Refund Processed At */}
        {order.refundProcessedAt && (
          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-gray-600">Refund Processed At</span>
            <span className="text-sm font-medium text-gray-900">
              {format(new Date(order.refundProcessedAt), "MMM dd, yyyy h:mm a")}
            </span>
          </div>
        )}

        {/* Cancellation Log (if any) */}
        {order.orderCancellationLogs &&
          order.orderCancellationLogs.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                <FileText className="w-4 h-4" />
                View Audit Log ({order.orderCancellationLogs.length})
              </button>
            </div>
          )}
      </div>
    </div>
  );
};

// 🔥 LOGISTICS / SHIPMENT INFO CARD
const LogisticsInfoCard = ({ shipment }: { shipment: any }) => {
  if (!shipment) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Truck className="h-5 w-5 text-gray-400" />
          Logistics Details
        </h3>
        <ShipmentStatusBadge status={shipment.status} />
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center py-2 border-b border-gray-100">
          <span className="text-sm text-gray-600">Provider</span>
          <span className="text-sm font-medium text-gray-900">
            {shipment.provider || "-"}
          </span>
        </div>

        <div className="flex justify-between items-center py-2 border-b border-gray-100">
          <span className="text-sm text-gray-600">AWB Code</span>
          <span className="text-sm font-mono font-medium text-gray-900">
            {shipment.awbCode || "-"}
          </span>
        </div>

        <div className="flex justify-between items-center py-2 border-b border-gray-100">
          <span className="text-sm text-gray-600">Courier</span>
          <span className="text-sm font-medium text-gray-900">
            {shipment.courierName || "-"}
          </span>
        </div>

        {shipment.trackingUrl && (
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">Tracking</span>
            <a
              href={shipment.trackingUrl}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-blue-600 hover:text-blue-700 underline font-medium"
            >
              Open Tracking
            </a>
          </div>
        )}

        {shipment.pickupScheduledAt && (
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">Pickup Scheduled</span>
            <span className="text-sm font-medium text-gray-900">
              {format(
                new Date(shipment.pickupScheduledAt),
                "MMM dd, yyyy h:mm a",
              )}
            </span>
          </div>
        )}

        {shipment.cancelledAt && (
          <>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">
                Shipment Cancelled At
              </span>
              <span className="text-sm font-medium text-gray-900">
                {format(new Date(shipment.cancelledAt), "MMM dd, yyyy h:mm a")}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-600">
                Shipment Cancelled By
              </span>
              <span className="text-sm font-medium text-gray-900">
                {shipment.cancelledBy || "-"}
              </span>
            </div>
            {shipment.cancellationReason && (
              <div className="py-2 mt-2 bg-red-50 p-3 rounded-lg border border-red-200">
                <span className="text-sm text-gray-600 block mb-1">
                  Shipment Cancellation Reason
                </span>
                <p className="text-sm text-gray-900">
                  {shipment.cancellationReason}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default function AdminOrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const orderId = resolvedParams?.id;

  const [isUpdating, setIsUpdating] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isShipmentCancelModalOpen, setIsShipmentCancelModalOpen] =
    useState(false);

  const {
    data: order,
    error,
    isLoading,
    mutate,
  } = useSWR(orderId ? `/admin/orders/${orderId}` : null, fetcher);

  // --- ERROR / LOADING STATES ---
  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <XCircle className="h-12 w-12 text-red-500" />
        <h2 className="text-xl font-bold text-gray-900">
          Failed to load order
        </h2>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-gray-500">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p>Loading admin order details...</p>
      </div>
    );
  }

  if (!order || !order.id) {
    return (
      <div className="p-10 text-center">
        <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900">Order Not Found</h2>
        <p className="text-gray-500 mt-2">The data could not be parsed.</p>
      </div>
    );
  }

  // --- SAFE FALLBACKS ---
  const currentStatus = order?.status ? String(order.status) : "PENDING";
  const rawActions = ORDER_TRANSITIONS[currentStatus];
  const availableActions = Array.isArray(rawActions) ? rawActions : [];
  const hasAddress = order.addressSnapshot && order.addressSnapshot.name;

  // --- ACTION HANDLER ---
  const handleStateChange = async (newStatus: string) => {
    if (!confirm(`Are you sure you want to change status to ${newStatus}?`))
      return;

    setIsUpdating(true);
    try {
      await apiClient.patch(`/admin/orders/${orderId}/status`, {
        status: newStatus,
      });
      mutate({ ...order, status: newStatus }, false);
    } catch (err) {
      console.error("Status update failed", err);
      alert("Failed to update status. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <div className="max-w-[1200px] mx-auto py-8 px-4 space-y-6">
        {/* 🔥 TOP HEADER */}
        <div className="bg-white rounded-xl shadow-sm border p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Order #{order.id?.slice(-6).toUpperCase() || "UNKNOWN"}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Currently:{" "}
              <strong className="text-gray-900">{currentStatus}</strong>
              {order.cancelledAt && (
                <span className="ml-2 text-xs text-red-500">
                  (Cancelled on{" "}
                  {format(new Date(order.cancelledAt), "MMM dd, yyyy")})
                </span>
              )}
            </p>
          </div>

          {/* Dynamic State Machine Buttons */}
          <div className="flex gap-3">
            {availableActions.length === 0 && (
              <span className="text-sm text-gray-500 italic py-2">
                No further actions available
              </span>
            )}
            {availableActions.map((targetStatus) => (
              <button
                key={targetStatus}
                onClick={() => {
                  if (targetStatus === "CANCELLED") {
                    setIsCancelModalOpen(true);
                  } else {
                    handleStateChange(targetStatus);
                  }
                }}
                disabled={isUpdating}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center justify-center ${
                  isUpdating ? "opacity-50 cursor-not-allowed" : ""
                } ${
                  targetStatus === "CANCELLED"
                    ? "bg-white text-red-600 border border-red-200 hover:bg-red-50"
                    : "bg-gray-900 text-white hover:bg-gray-800"
                }`}
              >
                {isUpdating && targetStatus !== "CANCELLED" && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                {ACTION_LABELS[targetStatus] || targetStatus}
              </button>
            ))}
          </div>
        </div>

        {/* 🔥 REST OF THE PAGE */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT COLUMN: CUSTOMER & ADDRESS & CANCELLATION INFO */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <User className="h-5 w-5 text-gray-400" /> Customer Info
              </h3>
              <div className="space-y-3 text-sm">
                <p className="font-medium text-gray-900 text-base">
                  {order.user?.name || "Guest Checkout"}
                </p>
                {order.user?.email && (
                  <p className="flex items-center gap-2 text-gray-600">
                    <Mail className="h-4 w-4" /> {order.user.email}
                  </p>
                )}
                {order.user?.phone && (
                  <p className="flex items-center gap-2 text-gray-600">
                    <Phone className="h-4 w-4" /> {order.user.phone}
                  </p>
                )}
              </div>
            </div>

            {hasAddress ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-gray-400" /> Shipping Address
                </h3>
                <address className="not-italic text-sm text-gray-600 space-y-1">
                  <p className="font-medium text-gray-900">
                    {order.addressSnapshot?.name}
                  </p>
                  <p>{order.addressSnapshot?.addressLine}</p>
                  <p>
                    {order.addressSnapshot?.city},{" "}
                    {order.addressSnapshot?.state}{" "}
                    {order.addressSnapshot?.pincode}
                  </p>
                  <p className="pt-2">Phone: {order.addressSnapshot?.phone}</p>
                </address>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6 text-center text-gray-500 text-sm">
                <MapPin className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                No address snapshot saved for this order.
              </div>
            )}

            {order.paymentProvider && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Gateway
                </h3>
                <p className="font-medium text-gray-900">
                  {order.paymentProvider}
                </p>
                <p className="text-xs text-gray-500 mt-1 font-mono break-all">
                  ID: {order.paymentProviderId}
                </p>
              </div>
            )}

            {/* 🔥 CANCELLATION INFO - This is the key addition! */}
            <CancellationInfoCard order={order} />
          </div>

          {/* RIGHT COLUMN: ITEMS & FINANCIALS & SHIPMENT */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-100 bg-gray-50">
                <h3 className="font-bold text-gray-900">Ordered Items</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {order.items && Array.isArray(order.items) ? (
                  order.items.map((item: any) => {
                    const itemImageUrl = resolveFirstProductImage(
                      item?.product?.images,
                    );

                    return (
                      <div
                        key={item.id}
                        className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="h-16 w-16 bg-white rounded-lg border border-gray-200 flex-shrink-0 flex items-center justify-center overflow-hidden p-1">
                          {itemImageUrl ? (
                            <img
                              src={itemImageUrl}
                              alt={item.product?.name || "product"}
                              className="h-full w-full object-contain"
                            />
                          ) : (
                            <Package className="text-gray-300" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            {item?.product?.name || "Product Unavailable"}
                          </h4>
                          <p className="text-sm text-gray-500">
                            Unit Price: ₹
                            {item?.price?.toLocaleString("en-IN") || 0}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">
                            ₹
                            {(
                              (item?.price || 0) * (item?.quantity || 1)
                            ).toLocaleString("en-IN")}
                          </p>
                          <p className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full inline-block mt-1">
                            Qty: {item?.quantity || 1}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    No items found in this order.
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Payment Summary
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-medium">
                    ₹
                    {(
                      (order.totalAmount || 0) - (order.shippingCost || 0)
                    ).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping Fee</span>
                  <span className="font-medium">
                    {order.shippingCost
                      ? `₹${order.shippingCost.toLocaleString("en-IN")}`
                      : "Free"}
                  </span>
                </div>
                <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                  <span className="font-bold text-gray-900">Total Amount</span>
                  <span className="text-xl font-black text-blue-600">
                    ₹{order.totalAmount?.toLocaleString("en-IN") || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* 🔥 LOGISTICS / SHIPMENT DETAILS CARD */}
            {order.shipment && (
              <>
                <LogisticsInfoCard shipment={order.shipment} />

                {![
                  "PICKED_UP",
                  "IN_TRANSIT",
                  "OUT_FOR_DELIVERY",
                  "DELIVERED",
                  "CANCELLED",
                ].includes(order.shipment.status) && (
                  <button
                    onClick={() => setIsShipmentCancelModalOpen(true)}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Cancel Shipment
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Tracking Logs */}
      <AdminTrackingLogs orderId={order.id} currentStatus={currentStatus} />

      {/* 🔥 The Cancel Modal */}
      <CancelOrderModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        orderId={order.id}
        orderStatus={currentStatus}
        paymentProvider={order.paymentProvider}
        paymentStatus={order.paymentStatus}
        totalAmount={order.totalAmount}
        onSuccess={() => mutate()}
      />

      {/* 🔥 The Cancel Shipment Modal */}
      {order?.shipment && (
        <CancelShipmentModal
          isOpen={isShipmentCancelModalOpen}
          onClose={() => setIsShipmentCancelModalOpen(false)}
          shipmentId={order.shipment.id}
          shipmentStatus={order.shipment.status}
          onSuccess={() => mutate()}
        />
      )}
    </>
  );
}
