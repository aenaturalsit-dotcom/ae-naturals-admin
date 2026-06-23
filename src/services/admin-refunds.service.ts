// services/admin-refunds.service.ts
import apiClient from '@/lib/api-client';

export interface RefundFilterParams {
  page?: number;
  limit?: number;
  status?: string;
  refundMethod?: string;
  fromDate?: string;
  toDate?: string;
  search?: string;
  orderId?: string;
}

export interface RefundResponse {
  data: any[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const AdminRefundsService = {
  /**
   * Get refunds list with filters
   */
  getRefunds: async (params: RefundFilterParams = {}): Promise<RefundResponse> => {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.status) queryParams.append('status', params.status);
    if (params.refundMethod) queryParams.append('refundMethod', params.refundMethod);
    if (params.fromDate) queryParams.append('fromDate', params.fromDate);
    if (params.toDate) queryParams.append('toDate', params.toDate);
    if (params.search) queryParams.append('search', params.search);
    if (params.orderId) queryParams.append('orderId', params.orderId);

    const url = `/admin/refunds${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiClient.get(url);
    return response.data;
  },

  /**
   * Get single refund details
   */
  getRefund: async (id: string) => {
    const response = await apiClient.get(`/admin/refunds/${id}`);
    return response.data;
  },

  /**
   * Process a refund
   */
  processRefund: async (id: string, data: { gatewayRefundId?: string }) => {
    const response = await apiClient.patch(`/admin/refunds/${id}/process`, data);
    return response.data;
  },

  /**
   * Complete a refund
   */
  completeRefund: async (id: string, data?: { notes?: string }) => {
    const response = await apiClient.patch(`/admin/refunds/${id}/complete`, data || {});
    return response.data;
  },

  /**
   * Fail a refund
   */
  failRefund: async (id: string, data: { failureReason: string; notes?: string }) => {
    const response = await apiClient.patch(`/admin/refunds/${id}/fail`, data);
    return response.data;
  },

  /**
   * Cancel a refund
   */
  cancelRefund: async (id: string, data?: { reason?: string }) => {
    const response = await apiClient.patch(`/admin/refunds/${id}/cancel`, data || {});
    return response.data;
  },

  /**
   * Retry a failed refund
   */
  retryRefund: async (id: string) => {
    const response = await apiClient.post(`/admin/refunds/${id}/retry`);
    return response.data;
  },
};