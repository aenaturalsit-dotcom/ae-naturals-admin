// src\app\admin\orders\CancelOrderModal.tsx

'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle, Loader2, CreditCard } from 'lucide-react';
import apiClient from '@/lib/api-client';

interface CancelOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  orderStatus: string;
  paymentProvider?: string;
  paymentStatus?: string;
  totalAmount?: number;
  onSuccess: () => void;
}

export default function CancelOrderModal({ 
  isOpen, 
  onClose, 
  orderId, 
  orderStatus,
  paymentProvider,
  paymentStatus,
  totalAmount = 0,
  onSuccess 
}: CancelOrderModalProps) {
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isProcessing = orderStatus === 'PROCESSING';
  const isPaidPrepaid = paymentProvider !== 'COD' && paymentStatus === 'PAID';
  const willNeedRefund = isPaidPrepaid;

  const handleCancel = async () => {
    if (reason.trim().length < 5) {
      setError('Please provide a descriptive reason (at least 5 characters).');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.post(`/admin/orders/${orderId}/cancel`, { reason });
      
      // Show refund status in alert
      if (response.data?.refundStatus === 'PENDING') {
        alert(`Order cancelled. Refund of ₹${response.data.refundAmount.toFixed(2)} has been initiated.`);
      } else {
        alert('Order cancelled successfully.');
      }
      
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to cancel the order. It may have already been processed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isLoading && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-red-600 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Cancel Order
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel this order? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {/* Refund Warning */}
        {willNeedRefund && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 text-sm text-blue-800">
            <div className="flex items-start gap-3">
              <CreditCard className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Refund Required</p>
                <p className="text-xs mt-1">
                  This is a prepaid order. A refund of ₹{totalAmount.toFixed(2)} will be 
                  initiated to the customer's original payment method.
                </p>
              </div>
            </div>
          </div>
        )}

        {isProcessing && (
          <div className="bg-amber-50 text-amber-800 p-3 rounded-md text-sm border border-amber-200">
            <strong>Warning:</strong> This order is in PROCESSING state. If a shipment has been created, 
            this will attempt to cancel it with the courier.
          </div>
        )}

        <div className="py-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cancellation Reason <span className="text-red-500">*</span>
          </label>
          <textarea
            className="w-full border rounded-md p-3 text-sm focus:ring-2 focus:ring-red-500 outline-none"
            rows={3}
            placeholder="e.g., Customer requested cancellation, Out of stock, Payment issue..."
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (error) setError(null);
            }}
            disabled={isLoading}
          />
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Keep Order
          </Button>
          <Button variant="destructive" onClick={handleCancel} disabled={isLoading}>
            {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Confirm Cancellation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}