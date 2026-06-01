// src\app\admin\orders\CancelOrderModal.tsx

'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle, Loader2 } from 'lucide-react';
import apiClient from '@/lib/api-client';

interface CancelOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  orderStatus: string;
  onSuccess: () => void;
}

export default function CancelOrderModal({ isOpen, onClose, orderId, orderStatus, onSuccess }: CancelOrderModalProps) {
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isProcessing = orderStatus === 'PROCESSING';

  const handleCancel = async () => {
    if (reason.trim().length < 5) {
      setError('Please provide a descriptive reason (at least 5 characters).');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await apiClient.post(`/admin/orders/${orderId}/cancel`, { reason });
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-red-600 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Cancel Order
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel this order? This action cannot be undone. Inventory will be restored automatically.
          </DialogDescription>
        </DialogHeader>

        {isProcessing && (
          <div className="bg-amber-50 text-amber-800 p-3 rounded-md text-sm border border-amber-200">
            <strong>Warning:</strong> This order already has an AWB. Cancelling it will attempt to halt the courier pickup via Shiprocket. If the courier has already scanned it, this will fail.
          </div>
        )}

        <div className="py-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cancellation Reason <span className="text-red-500">*</span>
          </label>
          <textarea
            className="w-full border rounded-md p-3 text-sm focus:ring-2 focus:ring-red-500 outline-none"
            rows={3}
            placeholder="e.g., Customer requested cancellation, Out of stock..."
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