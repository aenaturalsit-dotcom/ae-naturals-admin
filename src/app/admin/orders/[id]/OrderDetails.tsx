"use client";

import { useState } from "react";
import { OrderStatus } from "@/types/types";
import apiClient from "@/lib/api-client";
import CancelOrderModal from "../CancelOrderModal";
import { Package, MapPin, Loader2, User, Phone, Mail } from "lucide-react";

const ORDER_TRANSITIONS: Record<string, OrderStatus[]> = {
  PENDING: [OrderStatus.PAID, OrderStatus.CANCELLED],
  PAID: [OrderStatus.PROCESSING, OrderStatus.SHIPPED, OrderStatus.CANCELLED],
  PROCESSING: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
  SHIPPED: [OrderStatus.DELIVERED, OrderStatus.RETURNED],
  DELIVERED: [OrderStatus.RETURNED],
  CANCELLED: [],
  RETURNED: [],
};

const ACTION_LABELS: Record<string, string> = {
  PAID: "Mark as Paid",
  PROCESSING: "Process Order",
  SHIPPED: "Fulfill & Ship",
  DELIVERED: "Confirm Delivery",
  CANCELLED: "Cancel Order",
  RETURNED: "Process Return",
};

interface OrderDetailsProps {
  order: any;
  onUpdate: () => void;
}

export default function OrderDetails({ order, onUpdate }: OrderDetailsProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  // Derive state directly from the prop to avoid React sync issues
  const currentStatus = order.status || OrderStatus.PENDING;
  const availableActions = ORDER_TRANSITIONS[currentStatus] || [];
  const hasAddress = order.addressSnapshot && order.addressSnapshot.name;

  const handleStateChange = async (newStatus: OrderStatus) => {
    if (!confirm(`Are you sure you want to change status to ${newStatus}?`)) return;

    setIsUpdating(true);
    try {
      await apiClient.patch(`/admin/orders/${order.id}/status`, {
        status: newStatus,
      });
      // Trigger SWR re-fetch in the parent
      onUpdate();
    } catch (err) {
      console.error("Status update failed", err);
      alert("Failed to update status. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      {/* HEADER & DYNAMIC ACTIONS */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-extrabold text-gray-900">
              Order #{order.id?.slice(-6).toUpperCase() || "UNKNOWN"}
            </h1>
            <StatusBadge status={currentStatus} />
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Placed on{" "}
            {order.createdAt
              ? new Date(order.createdAt).toLocaleDateString("en-IN", {
                  year: "numeric", month: "short", day: "numeric",
                  hour: "2-digit", minute: "2-digit",
                })
              : "Unknown Date"}
          </p>
        </div>

        {/* ADMIN ACTION BUTTONS (Dynamic) */}
        <div className="flex flex-wrap gap-3">
          {availableActions.length === 0 && (
            <span className="text-sm text-gray-500 italic">
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
              className={`px-4 py-2 text-sm font-semibold rounded-lg flex items-center justify-center transition-all ${
                isUpdating ? "opacity-50 cursor-not-allowed" : ""
              } ${
                targetStatus === "CANCELLED"
                  ? "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                  : targetStatus === "RETURNED"
                  ? "bg-orange-50 text-orange-600 hover:bg-orange-100 border border-orange-200"
                  : "bg-gray-900 text-white hover:bg-gray-800 shadow-sm"
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* LEFT COLUMN: CUSTOMER & ADDRESS */}
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
                <p className="font-medium text-gray-900">{order.addressSnapshot?.name}</p>
                <p>{order.addressSnapshot?.addressLine}</p>
                <p>
                  {order.addressSnapshot?.city}, {order.addressSnapshot?.state}{" "}
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
              <p className="font-medium text-gray-900">{order.paymentProvider}</p>
              <p className="text-xs text-gray-500 mt-1 font-mono break-all">
                ID: {order.paymentProviderId}
              </p>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: ITEMS & FINANCIALS */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50">
              <h3 className="font-bold text-gray-900">Ordered Items</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {order.items && Array.isArray(order.items) ? (
                order.items.map((item: any) => (
                  <div key={item.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                    <div className="h-16 w-16 bg-white rounded-lg border border-gray-200 flex-shrink-0 flex items-center justify-center overflow-hidden p-1">
                      {item?.product?.images?.[0] ? (
                        <img
                          src={item.product.images[0]}
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
                        Unit Price: ₹{item?.price?.toLocaleString("en-IN") || 0}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">
                        ₹{((item?.price || 0) * (item?.quantity || 1)).toLocaleString("en-IN")}
                      </p>
                      <p className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full inline-block mt-1">
                        Qty: {item?.quantity || 1}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">No items found in this order.</div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Payment Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-medium">
                  ₹{((order.totalAmount || 0) - (order.shippingCost || 0)).toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping Fee</span>
                <span className="font-medium">
                  {order.shippingCost ? `₹${order.shippingCost.toLocaleString("en-IN")}` : "Free"}
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
        </div>
      </div>

      <CancelOrderModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        orderId={order.id}
        orderStatus={currentStatus}
        onSuccess={onUpdate} // 🔥 Calls SWR mutate() in the parent
      />
    </>
  );
}

const StatusBadge = ({ status }: { status: string }) => {
  const colors: Record<string, string> = {
    PENDING: "bg-yellow-50 text-yellow-700 border-yellow-200",
    PAID: "bg-blue-50 text-blue-700 border-blue-200",
    PROCESSING: "bg-indigo-50 text-indigo-700 border-indigo-200",
    SHIPPED: "bg-purple-50 text-purple-700 border-purple-200",
    DELIVERED: "bg-green-50 text-green-700 border-green-200",
    CANCELLED: "bg-red-50 text-red-700 border-red-200",
    RETURNED: "bg-orange-50 text-orange-700 border-orange-200",
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