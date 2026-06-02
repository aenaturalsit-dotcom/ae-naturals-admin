// src\app\admin\orders\CancelShipmentModal.tsx




'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle, Loader2 } from 'lucide-react';
import apiClient from '@/lib/api-client';

interface CancelShipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  shipmentId: string;
  shipmentStatus: string;
  onSuccess: () => void;
}

export default function CancelShipmentModal({
  isOpen,
  onClose,
  shipmentId,
  shipmentStatus,
  onSuccess,
}: CancelShipmentModalProps) {
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCancel = async () => {
    if (reason.trim().length < 5) {
      setError(
        'Please provide a descriptive reason (at least 5 characters).'
      );
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await apiClient.post(
        `/admin/shipping/shipments/${shipmentId}/cancel`,
        {
          reason,
        }
      );

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          'Failed to cancel shipment.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={() => {
        if (!isLoading) onClose();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-red-600 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Cancel Shipment
          </DialogTitle>

          <DialogDescription>
            This will cancel the shipment in Shiprocket
            and mark it as cancelled in the system.
          </DialogDescription>
        </DialogHeader>

        {shipmentStatus === 'READY_TO_SHIP' && (
          <div className="bg-amber-50 text-amber-800 p-3 rounded-md text-sm border border-amber-200">
            This shipment already has an AWB assigned.
            Cancellation will be synced with Shiprocket.
          </div>
        )}

        <div className="py-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cancellation Reason
            <span className="text-red-500"> *</span>
          </label>

          <textarea
            rows={3}
            value={reason}
            disabled={isLoading}
            onChange={(e) => {
              setReason(e.target.value);

              if (error) {
                setError(null);
              }
            }}
            className="w-full border rounded-md p-3 text-sm focus:ring-2 focus:ring-red-500 outline-none"
            placeholder="Customer requested cancellation..."
          />

          {error && (
            <p className="text-red-500 text-sm mt-2">
              {error}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Keep Shipment
          </Button>

          <Button
            variant="destructive"
            onClick={handleCancel}
            disabled={isLoading}
          >
            {isLoading && (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            )}

            Confirm Cancellation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}