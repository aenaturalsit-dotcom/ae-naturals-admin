'use client';

import { useState, useEffect } from 'react';
import {
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
  Calendar as CalendarIcon,
  XCircle,
  Package,
} from 'lucide-react';
import { format } from 'date-fns';

// ============================================
// APPROVE RETURN MODAL
// ============================================
interface ApproveReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { adminComment?: string; pickupScheduledAt?: string }) => void;
  isLoading?: boolean;
  returnId: string;
}

export function ApproveReturnModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  returnId,
}: ApproveReturnModalProps) {
  const [adminComment, setAdminComment] = useState('');
  const [pickupDate, setPickupDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm({
      adminComment: adminComment.trim() || undefined,
      pickupScheduledAt: pickupDate || undefined,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl max-w-md w-full shadow-xl">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Approve Return
              </h3>
              <p className="text-sm text-gray-500">Return #{returnId.slice(-8).toUpperCase()}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              disabled={isLoading}
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Admin Comment <span className="text-gray-400">(optional)</span>
              </label>
              <textarea
                value={adminComment}
                onChange={(e) => setAdminComment(e.target.value)}
                placeholder="Add any notes about the approval..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none resize-none"
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pickup Date <span className="text-gray-400">(optional)</span>
              </label>
              <input
                type="datetime-local"
                value={pickupDate}
                onChange={(e) => setPickupDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                disabled={isLoading}
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 px-6 py-4 flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Approving...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Approve Return
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================
// REJECT RETURN MODAL
// ============================================
interface RejectReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { rejectionReason: string; adminComment?: string }) => void;
  isLoading?: boolean;
  returnId: string;
}

export function RejectReturnModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  returnId,
}: RejectReturnModalProps) {
  const [rejectionReason, setRejectionReason] = useState('');
  const [adminComment, setAdminComment] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rejectionReason.trim().length < 5) {
      setError('Rejection reason must be at least 5 characters');
      return;
    }
    setError('');
    onConfirm({
      rejectionReason: rejectionReason.trim(),
      adminComment: adminComment.trim() || undefined,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl max-w-md w-full shadow-xl">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-600" />
                Reject Return
              </h3>
              <p className="text-sm text-gray-500">Return #{returnId.slice(-8).toUpperCase()}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              disabled={isLoading}
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rejection Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => {
                  setRejectionReason(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Explain why the return is being rejected..."
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none resize-none ${
                  error ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                disabled={isLoading}
              />
              {error && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {error}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Admin Comment <span className="text-gray-400">(optional)</span>
              </label>
              <textarea
                value={adminComment}
                onChange={(e) => setAdminComment(e.target.value)}
                placeholder="Add any additional notes..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none resize-none"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 px-6 py-4 flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Rejecting...
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4" />
                  Reject Return
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================
// SCHEDULE PICKUP MODAL
// ============================================
interface SchedulePickupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { pickupDate: string }) => void;
  isLoading?: boolean;
  returnId: string;
}

export function SchedulePickupModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  returnId,
}: SchedulePickupModalProps) {
  const [pickupDate, setPickupDate] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickupDate) {
      setError('Please select a pickup date and time');
      return;
    }
    setError('');
    onConfirm({ pickupDate: new Date(pickupDate).toISOString() });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl max-w-md w-full shadow-xl">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-blue-600" />
                Schedule Pickup
              </h3>
              <p className="text-sm text-gray-500">Return #{returnId.slice(-8).toUpperCase()}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              disabled={isLoading}
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pickup Date & Time <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={pickupDate}
                onChange={(e) => {
                  setPickupDate(e.target.value);
                  if (error) setError('');
                }}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                  error ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                disabled={isLoading}
                min={new Date(Date.now() + 3600000).toISOString().slice(0, 16)}
              />
              {error && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {error}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Pickup must be scheduled at least 1 hour from now
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 px-6 py-4 flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Scheduling...
                </>
              ) : (
                <>
                  <CalendarIcon className="w-4 h-4" />
                  Schedule Pickup
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================
// RECEIVE RETURN MODAL
// ============================================
interface ReceiveReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { adminComment?: string; items?: any[] }) => void;
  isLoading?: boolean;
  returnId: string;
  returnItems: any[];
}

export function ReceiveReturnModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  returnId,
  returnItems,
}: ReceiveReturnModalProps) {
  const [adminComment, setAdminComment] = useState('');
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    if (returnItems) {
      setItems(
        returnItems.map((item) => ({
          ...item,
          condition: item.condition || 'UNKNOWN',
          approvedForRefund: true,
        }))
      );
    }
  }, [returnItems]);

  const handleItemChange = (itemId: string, field: string, value: any) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, [field]: value } : item
      )
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm({
      adminComment: adminComment.trim() || undefined,
      items: items.map((item) => ({
        itemId: item.id,
        notes: item.inspectionNotes || undefined,
        condition: item.condition || 'UNKNOWN',
        approvedForRefund: item.approvedForRefund !== false,
      })),
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-indigo-600" />
                Receive Return
              </h3>
              <p className="text-sm text-gray-500">Return #{returnId.slice(-8).toUpperCase()}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              disabled={isLoading}
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Admin Comment <span className="text-gray-400">(optional)</span>
              </label>
              <textarea
                value={adminComment}
                onChange={(e) => setAdminComment(e.target.value)}
                placeholder="Add notes about receiving the return..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
                disabled={isLoading}
              />
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Items</h4>
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-gray-900 text-sm">
                          {item.orderItem?.product?.name || 'Unknown Product'}
                        </p>
                        <p className="text-xs text-gray-500">Quantity: {item.quantity}</p>
                      </div>
                      <label className="flex items-center gap-1.5 text-sm">
                        <input
                          type="checkbox"
                          checked={item.approvedForRefund !== false}
                          onChange={(e) =>
                            handleItemChange(item.id, 'approvedForRefund', e.target.checked)
                          }
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          disabled={isLoading}
                        />
                        Approve
                      </label>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      <div>
                        <select
                          value={item.condition || 'UNKNOWN'}
                          onChange={(e) =>
                            handleItemChange(item.id, 'condition', e.target.value)
                          }
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                          disabled={isLoading}
                        >
                          <option value="UNKNOWN">Select condition...</option>
                          <option value="NEW">New / Unused</option>
                          <option value="USED">Used / Opened</option>
                          <option value="DAMAGED">Damaged</option>
                          <option value="DEFECTIVE">Defective</option>
                        </select>
                      </div>
                      <div>
                        <input
                          type="text"
                          value={item.inspectionNotes || ''}
                          onChange={(e) =>
                            handleItemChange(item.id, 'inspectionNotes', e.target.value)
                          }
                          placeholder="Inspection notes..."
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Receiving...
                </>
              ) : (
                <>
                  <Package className="w-4 h-4" />
                  Receive Return
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================
// CLOSE RETURN MODAL
// ============================================
interface CloseReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
  returnId: string;
  returnStatus: string;
}

export function CloseReturnModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  returnId,
  returnStatus,
}: CloseReturnModalProps) {
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (confirmation !== 'CLOSE') {
      setError('Please type CLOSE to confirm');
      return;
    }
    setError('');
    onConfirm();
  };

  if (!isOpen) return null;

  const statusDisplay = returnStatus === 'INSPECTED' ? 'inspected' : 'received';
  const action = returnStatus === 'INSPECTED' ? 'completed' : 'closed without full inspection';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl max-w-md w-full shadow-xl">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-500" />
                Close Return
              </h3>
              <p className="text-sm text-gray-500">Return #{returnId.slice(-8).toUpperCase()}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              disabled={isLoading}
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="text-sm text-orange-800">
                <strong>Warning:</strong> This return has been {statusDisplay} but not yet {action}.
                Closing will mark it as complete.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type <strong>CLOSE</strong> to confirm
              </label>
              <input
                type="text"
                value={confirmation}
                onChange={(e) => {
                  setConfirmation(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Type CLOSE to confirm"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none uppercase ${
                  error ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                disabled={isLoading}
              />
              {error && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {error}
                </p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 px-6 py-4 flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || confirmation !== 'CLOSE'}
              className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Closing...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Close Return
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}