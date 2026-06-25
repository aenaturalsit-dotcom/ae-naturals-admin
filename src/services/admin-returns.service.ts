// services/admin-returns.service.ts

import apiClient from '@/lib/api-client';

export interface ReturnFilterParams {
  page?: number;
  limit?: number;
  status?: string;
  fromDate?: string;
  toDate?: string;
  search?: string;
  customerId?: string;
  orderId?: string;
}

export interface ReturnResponse {
  data: any[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const AdminReturnsService = {
  /**
   * Get returns list with filters
   */
  getReturns: async (params: ReturnFilterParams = {}): Promise<ReturnResponse> => {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.status) queryParams.append('status', params.status);
    if (params.fromDate) queryParams.append('fromDate', params.fromDate);
    if (params.toDate) queryParams.append('toDate', params.toDate);
    if (params.search) queryParams.append('search', params.search);
    if (params.customerId) queryParams.append('customerId', params.customerId);
    if (params.orderId) queryParams.append('orderId', params.orderId);

    const url = `/admin/returns${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    // ✅ FIX: apiClient already returns the unwrapped data
    // The response is already: { data: [...], meta: {...} }
    const response = await apiClient.get(url);
    
    console.log('[DEBUG] Raw API response:', response);
    
    // ✅ Return response directly (not response.data)
    // If response has a data property, use it; otherwise use response as-is
    if (response && response.data !== undefined) {
      return response;
    }
    
    // Fallback
    return {
      data: response || [],
      meta: { total: 0, page: 1, limit: 20, totalPages: 0 }
    };
  },

  /**
   * Get single return details
   */
  getReturn: async (id: string) => {
    const response = await apiClient.get(`/admin/returns/${id}`);
    return response.data || response;
  },

  /**
   * Approve a return
   */
  approveReturn: async (id: string, data: { adminComment?: string; pickupScheduledAt?: string }) => {
    const response = await apiClient.patch(`/admin/returns/${id}/approve`, data);
    return response.data || response;
  },

  /**
   * Reject a return
   */
  rejectReturn: async (id: string, data: { rejectionReason: string; adminComment?: string }) => {
    const response = await apiClient.patch(`/admin/returns/${id}/reject`, data);
    return response.data || response;
  },

  /**
   * Schedule pickup for a return
   */
  schedulePickup: async (id: string, data: { pickupDate: string }) => {
    const response = await apiClient.patch(`/admin/returns/${id}/schedule-pickup`, data);
    return response.data || response;
  },

  /**
   * Complete pickup for a return
   */
  completePickup: async (id: string) => {
    const response = await apiClient.patch(`/admin/returns/${id}/complete-pickup`);
    return response.data || response;
  },

  /**
   * Receive and inspect a return
   */
  receiveReturn: async (id: string, data: { items?: any[]; adminComment?: string }) => {
    const response = await apiClient.patch(`/admin/returns/${id}/receive`, data);
    return response.data || response;
  },

  /**
   * Close a return
   */
  closeReturn: async (id: string) => {
    const response = await apiClient.patch(`/admin/returns/${id}/close`);
    return response.data || response;
  },
};