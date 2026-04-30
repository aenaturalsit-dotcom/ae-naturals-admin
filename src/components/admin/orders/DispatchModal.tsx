// src\components\admin\orders\DispatchModal.tsx
'use client';

import { useState } from 'react';
import { Truck, X, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import apiClient from '@/lib/api-client';
import { toast } from 'react-hot-toast';

interface DispatchModalProps {
  order: any; // The full order object containing courier data
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (shipmentData: any) => void;
}

export default function DispatchOrderModal({ order, isOpen, onClose, onSuccess }: DispatchModalProps) {
  const [loading, setLoading] = useState(false);
  const [overrideCourier, setOverrideCourier] = useState('');

  if (!isOpen || !order) return null;

  const handleDispatch = async () => {
    setLoading(true);
    try {
      // Prioritize the admin override, fallback to the locked customer choice
      const finalCourierId = overrideCourier || order.courierPartnerId;

      const response = await apiClient.post(`/admin/shipping/dispatch/${order.id}`, {
        courierId: finalCourierId || undefined, 
      });
      
      toast.success('Shipment created successfully!');
      onSuccess(response.data);
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to dispatch order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Truck className="h-5 w-5 text-blue-600" />
            Dispatch Order
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="space-y-4 my-6">
          <p className="text-sm text-gray-600">
            This will push the order details to Shiprocket, assign an AWB, and mark the order as <strong>SHIPPED</strong>.
          </p>

          {/* Locked Courier Display */}
          <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Customer Selected Courier
            </p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-bold text-gray-900">
                  {order.courierName || 'Standard Auto-Assign'}
                </p>
                {order.courierPartnerId && (
                  <p className="text-xs text-gray-500 font-mono">
                    ID: {order.courierPartnerId}
                  </p>
                )}
              </div>
              {order.courierRate && (
                <div className="text-right">
                  <p className="text-sm font-semibold text-green-600">₹{order.courierRate}</p>
                  <p className="text-xs text-gray-400">Paid by Cust.</p>
                </div>
              )}
            </div>
          </div>

          {/* Worker Fallback Warning (If applicable) */}
          {order.courierMetadata?.fallbackTriggered && (
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 p-3 rounded-lg text-amber-800">
              <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
              <p className="text-xs leading-relaxed">
                <strong>Warning:</strong> The background worker failed to assign the customer's selected courier previously. You may need to manually override the courier below.
              </p>
            </div>
          )}

          {/* Manual Override */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Manual Courier Override (Optional)
            </label>
            <input
              type="text"
              value={overrideCourier}
              onChange={(e) => setOverrideCourier(e.target.value)}
              placeholder="Enter Courier ID (e.g., 10 for Delhivery)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave blank to strictly use the customer's selection.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDispatch}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
            {loading ? 'Processing...' : 'Confirm Dispatch'}
          </button>
        </div>
      </div>
    </div>
  );
}