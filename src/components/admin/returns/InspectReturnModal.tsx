'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, CheckCircle, AlertCircle, Package, Image as ImageIcon } from 'lucide-react';

interface ReturnItem {
  id: string;
  orderItemId: string;
  quantity: number;
  reason: string;
  condition?: string;
  images?: string[];
  inspectionNotes?: string;
  approvedForRefund?: boolean;
  orderItem?: {
    product?: {
      name: string;
      images?: string[];
    };
  };
}

interface InspectReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: any) => Promise<void>;
  returnItems: ReturnItem[];
  isLoading?: boolean;
  returnId: string;
}

export function InspectReturnModal({
  isOpen,
  onClose,
  onConfirm,
  returnItems,
  isLoading = false,
  returnId,
}: InspectReturnModalProps) {
  const [items, setItems] = useState<ReturnItem[]>([]);
  const [adminComment, setAdminComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize items with default values
  useEffect(() => {
    if (returnItems && returnItems.length > 0) {
      setItems(
        returnItems.map((item) => ({
          ...item,
          condition: item.condition || 'UNKNOWN',
          approvedForRefund: item.approvedForRefund !== undefined ? item.approvedForRefund : true,
          inspectionNotes: item.inspectionNotes || '',
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
    
    // Clear error for this field if it exists
    if (errors[itemId]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[itemId];
        return newErrors;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Validate each item has a condition
    items.forEach((item) => {
      if (!item.condition || item.condition === 'UNKNOWN') {
        newErrors[item.id] = 'Please select a condition for this item';
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        adminComment: adminComment.trim() || undefined,
        items: items.map((item) => ({
          itemId: item.id,
          notes: item.inspectionNotes?.trim() || undefined,
          condition: item.condition || 'UNKNOWN',
          approvedForRefund: item.approvedForRefund !== false,
        })),
      };
      
      await onConfirm(payload);
      onClose();
    } catch (error) {
      console.error('Inspection failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[95vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Package className="w-5 h-5 text-purple-600" />
              Inspect Return Items
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">
              Return #{returnId.slice(-8).toUpperCase()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Info Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-blue-800">Inspection Required</p>
              <p className="text-sm text-blue-700">
                Review each returned item, select its condition, and approve or decline refund eligibility.
              </p>
            </div>
          </div>

          {/* Admin Comment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Admin Comment <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={adminComment}
              onChange={(e) => setAdminComment(e.target.value)}
              placeholder="Add any notes about the inspection process..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none transition-shadow"
              disabled={isSubmitting}
            />
          </div>

          {/* Items List */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">
              Items to Inspect ({items.length})
            </h4>
            <div className="space-y-4">
              {items.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No items to inspect</p>
                </div>
              ) : (
                items.map((item, index) => (
                  <div
                    key={item.id}
                    className="border border-gray-200 rounded-lg p-4 bg-gray-50/50 hover:bg-gray-50 transition-colors"
                  >
                    {/* Item Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center justify-center w-6 h-6 bg-gray-200 rounded-full text-xs font-semibold text-gray-700">
                            {index + 1}
                          </span>
                          <p className="font-medium text-gray-900 text-sm">
                            {item.orderItem?.product?.name || 'Unknown Product'}
                          </p>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                          <span>Qty: {item.quantity}</span>
                          {item.reason && (
                            <span className="flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              {item.reason}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Refund Approval Toggle */}
                      <div className="flex items-center gap-2 ml-4">
                        <label className="flex items-center gap-1.5 text-sm text-gray-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={item.approvedForRefund !== false}
                            onChange={(e) =>
                              handleItemChange(item.id, 'approvedForRefund', e.target.checked)
                            }
                            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 w-4 h-4"
                            disabled={isSubmitting}
                          />
                          <span className="text-xs font-medium">Refund</span>
                        </label>
                      </div>
                    </div>

                    {/* Item Images */}
                    {item.images && item.images.length > 0 && (
                      <div className="mb-3 flex gap-2">
                        {item.images.map((image, idx) => (
                          <div
                            key={idx}
                            className="w-12 h-12 bg-gray-100 rounded-lg border border-gray-200 overflow-hidden flex-shrink-0"
                          >
                            <img
                              src={image}
                              alt={`Item ${index + 1} - ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Item Details Form */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Condition <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={item.condition || 'UNKNOWN'}
                          onChange={(e) =>
                            handleItemChange(item.id, 'condition', e.target.value)
                          }
                          className={`w-full px-2 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-colors ${
                            errors[item.id] ? 'border-red-300 bg-red-50' : 'border-gray-300'
                          }`}
                          disabled={isSubmitting}
                        >
                          <option value="UNKNOWN">Select condition...</option>
                          <option value="NEW">New / Unused</option>
                          <option value="USED">Used / Opened</option>
                          <option value="DAMAGED">Damaged</option>
                          <option value="DEFECTIVE">Defective</option>
                          <option value="MISSING_PARTS">Missing Parts</option>
                        </select>
                        {errors[item.id] && (
                          <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {errors[item.id]}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Inspection Notes <span className="text-gray-400">(optional)</span>
                        </label>
                        <input
                          type="text"
                          value={item.inspectionNotes || ''}
                          onChange={(e) =>
                            handleItemChange(item.id, 'inspectionNotes', e.target.value)
                          }
                          placeholder="Add notes about this item..."
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-shadow"
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || isLoading || items.length === 0}
            className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Confirm Inspection
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}