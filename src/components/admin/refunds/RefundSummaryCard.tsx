// components/admin/refunds/RefundSummaryCard.tsx
'use client';

import { format } from 'date-fns';
import { 
  CreditCard,
  Calendar,
  User,
  Package,
  IndianRupee,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { RefundStatusBadge } from './RefundStatusBadge';
import { RefundAmountDisplay } from './RefundAmountDisplay';

interface RefundSummaryCardProps {
  refund: {
    id: string;
    refundReference: string;
    refundAmount: number;
    refundStatus: string;
    refundMethod: string;
    initiatedAt?: string;
    completedAt?: string;
    failureReason?: string;
    processedBy?: string;
    order: {
      id: string;
      totalAmount: number;
      user: {
        name: string;
        email: string;
        phone: string;
      };
    };
    return?: {
      returnNumber: string;
    };
  };
}

export function RefundSummaryCard({ refund }: RefundSummaryCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200 bg-gray-50">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              Refund #{refund.refundReference}
            </h3>
            <p className="text-sm text-gray-500">
              Order #{refund.order.id.slice(-6).toUpperCase()}
            </p>
          </div>
          <RefundStatusBadge status={refund.refundStatus} size="lg" />
        </div>
      </div>

      <div className="p-6 space-y-4">
        {/* Amount */}
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Refund Amount</span>
          <RefundAmountDisplay 
            amount={refund.refundAmount} 
            status={refund.refundStatus}
            className="text-xl"
          />
        </div>

        {/* Method */}
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Refund Method</span>
          <span className="font-medium text-gray-900 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-gray-400" />
            {refund.refundMethod}
          </span>
        </div>

        {/* Dates */}
        {refund.initiatedAt && (
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Initiated</span>
            <span className="font-medium text-gray-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              {format(new Date(refund.initiatedAt), 'MMM dd, yyyy h:mm a')}
            </span>
          </div>
        )}

        {refund.completedAt && (
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Completed</span>
            <span className="font-medium text-green-600 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              {format(new Date(refund.completedAt), 'MMM dd, yyyy h:mm a')}
            </span>
          </div>
        )}

        {/* Customer */}
        <div className="flex justify-between items-start pt-4 border-t border-gray-100">
          <span className="text-gray-600">Customer</span>
          <div className="text-right">
            <p className="font-medium text-gray-900">{refund.order.user.name}</p>
            <p className="text-sm text-gray-500">{refund.order.user.email}</p>
            <p className="text-sm text-gray-500">{refund.order.user.phone}</p>
          </div>
        </div>

        {/* Order Total */}
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Order Total</span>
          <span className="font-medium text-gray-900">
            ₹{refund.order.totalAmount.toLocaleString('en-IN')}
          </span>
        </div>

        {/* Return Reference */}
        {refund.return && (
          <div className="flex justify-between items-center pt-4 border-t border-gray-100">
            <span className="text-gray-600">Return</span>
            <span className="font-medium text-gray-900 flex items-center gap-2">
              <Package className="w-4 h-4 text-gray-400" />
              #{refund.return.returnNumber}
            </span>
          </div>
        )}

        {/* Failure Reason */}
        {refund.failureReason && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">Failure Reason</p>
                <p className="text-sm text-red-700">{refund.failureReason}</p>
              </div>
            </div>
          </div>
        )}

        {/* Processed By */}
        {refund.processedBy && (
          <div className="flex justify-between items-center pt-4 border-t border-gray-100">
            <span className="text-gray-600">Processed By</span>
            <span className="font-medium text-gray-900 flex items-center gap-2">
              <User className="w-4 h-4 text-gray-400" />
              {refund.processedBy}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}