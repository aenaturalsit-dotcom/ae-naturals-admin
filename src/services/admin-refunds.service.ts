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
    console.log('[AdminRefundsService] Fetching:', url);
    
    const response = await apiClient.get(url);
    console.log('[AdminRefundsService] Response:', response.data);
    
    // ✅ Ensure proper structure
    if (response.data && response.data.data) {
      return response.data;
    }
    
    // ✅ If response is already the data array
    if (Array.isArray(response.data)) {
      return {
        data: response.data,
        meta: { total: response.data.length, page: 1, limit: 20, totalPages: 1 }
      };
    }
    
    return response.data;
  },
  // ... rest of methods
};