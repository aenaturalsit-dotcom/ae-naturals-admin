'use client';

import { useState } from 'react';
import {
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
  CreditCard,
  RefreshCw,
  Ban,
} from 'lucide-react';

// ============================================
// PROCESS REFUND MODAL
// ============================================
interface ProcessRefundModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { gatewayRefundId: string }) => void;
  isLoading?: boolean;
  refundId: string;
  refundAmount: number;
}

export function ProcessRefundModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  refundId,
  refundAmount,
}: ProcessRefundModalProps) {
  const [gatewayRefundId, setGatewayRefundId] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gatewayRefundId.trim()) {
      setError('Gateway Refund ID is required');
      return;
    }
    if (gatewayRefundId.trim().length < 3) {
      setError('Gateway Refund ID must be at least 3 characters');
      return;
    }
    setError('');
    onConfirm({ gatewayRefundId: gatewayRefundId.trim() });
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
                <CreditCard className="w-5 h-5 text-blue-600" />
                Process Refund
              </h3>
              <p className="text-sm text-gray-500">
                Refund #{refundId.slice(-8).toUpperCase()} · ₹{refundAmount.toFixed(2)}
              </p>
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
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                Enter the gateway refund ID from your payment provider to process this refund.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gateway Refund ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={gatewayRefundId}
                onChange={(e) => {
                  setGatewayRefundId(e.target.value);
                  if (error) setError('');
                }}
                placeholder="e.g., re_1234567890"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
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
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  Process Refund
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
// COMPLETE REFUND MODAL
// ============================================
interface CompleteRefundModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { notes?: string }) => void;
  isLoading?: boolean;
  refundId: string;
  refundAmount: number;
}

export function CompleteRefundModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  refundId,
  refundAmount,
}: CompleteRefundModalProps) {
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm({ notes: notes.trim() || undefined });
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
                Complete Refund
              </h3>
              <p className="text-sm text-gray-500">
                Refund #{refundId.slice(-8).toUpperCase()} · ₹{refundAmount.toFixed(2)}
              </p>
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
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800">
                Confirm that the refund has been successfully completed in your payment gateway.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Completion Notes <span className="text-gray-400">(optional)</span>
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about the completion..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none resize-none"
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
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Completing...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Complete Refund
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
// FAIL REFUND MODAL
// ============================================
interface FailRefundModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { failureReason: string }) => void;
  isLoading?: boolean;
  refundId: string;
  refundAmount: number;
}

export function FailRefundModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  refundId,
  refundAmount,
}: FailRefundModalProps) {
  const [failureReason, setFailureReason] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (failureReason.trim().length < 5) {
      setError('Failure reason must be at least 5 characters');
      return;
    }
    setError('');
    onConfirm({ failureReason: failureReason.trim() });
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
                <AlertCircle className="w-5 h-5 text-red-600" />
                Fail Refund
              </h3>
              <p className="text-sm text-gray-500">
                Refund #{refundId.slice(-8).toUpperCase()} · ₹{refundAmount.toFixed(2)}
              </p>
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
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">
                Mark this refund as failed. This will update the order status and allow retry attempts.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Failure Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                value={failureReason}
                onChange={(e) => {
                  setFailureReason(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Explain why the refund failed..."
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
                  Failing...
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4" />
                  Fail Refund
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
// RETRY REFUND MODAL
// ============================================
interface RetryRefundModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
  refundId: string;
  refundAmount: number;
  retryCount: number;
  maxRetries: number;
}

export function RetryRefundModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  refundId,
  refundAmount,
  retryCount,
  maxRetries,
}: RetryRefundModalProps) {
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');
  const remainingAttempts = maxRetries - retryCount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (confirmation !== 'RETRY') {
      setError('Please type RETRY to confirm');
      return;
    }
    setError('');
    onConfirm();
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
                <RefreshCw className="w-5 h-5 text-blue-600" />
                Retry Refund
              </h3>
              <p className="text-sm text-gray-500">
                Refund #{refundId.slice(-8).toUpperCase()} · ₹{refundAmount.toFixed(2)}
              </p>
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
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>{remainingAttempts}</strong> retry attempts remaining.
                {retryCount > 0 && ` Previous attempts: ${retryCount}`}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type <strong>RETRY</strong> to confirm
              </label>
              <input
                type="text"
                value={confirmation}
                onChange={(e) => {
                  setConfirmation(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Type RETRY to confirm"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none uppercase ${
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
              disabled={isLoading || confirmation !== 'RETRY' || remainingAttempts <= 0}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Retry Refund
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
// CANCEL REFUND MODAL
// ============================================
interface CancelRefundModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { reason?: string }) => void;
  isLoading?: boolean;
  refundId: string;
  refundAmount: number;
}

export function CancelRefundModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  refundId,
  refundAmount,
}: CancelRefundModalProps) {
  const [reason, setReason] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (confirmation !== 'CANCEL') {
      setError('Please type CANCEL to confirm');
      return;
    }
    setError('');
    onConfirm({ reason: reason.trim() || undefined });
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
                <Ban className="w-5 h-5 text-red-600" />
                Cancel Refund
              </h3>
              <p className="text-sm text-gray-500">
                Refund #{refundId.slice(-8).toUpperCase()} · ₹{refundAmount.toFixed(2)}
              </p>
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
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">
                <strong>Warning:</strong> This action will cancel the refund and cannot be undone.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason <span className="text-gray-400">(optional)</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Why is this refund being cancelled?"
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none resize-none"
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type <strong>CANCEL</strong> to confirm
              </label>
              <input
                type="text"
                value={confirmation}
                onChange={(e) => {
                  setConfirmation(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Type CANCEL to confirm"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none uppercase ${
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
              disabled={isLoading || confirmation !== 'CANCEL'}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Cancelling...
                </>
              ) : (
                <>
                  <Ban className="w-4 h-4" />
                  Cancel Refund
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}