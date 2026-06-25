// src/services/admin-orders.service.ts
import  apiClient  from "@/lib/api-client";
import { Order } from '@/types/types';

export const AdminOrdersService = {
 getOrders: async (params: any) => {
    // FIX: apiClient already returns response.data! 
    // Do not destructure { data } here, just return the raw payload.
    const response = await apiClient.get("/admin/orders", { params });
    return response; 
  },

  updateStatus: async (id: string, status: string) => {
    const response = await apiClient.patch(`/admin/orders/${id}/status`, { status });
    return response;
  },

  bulkUpdateStatus: async (orderIds: string[], status: string) => {
    const response = await apiClient.patch(`/admin/orders/bulk-status`, { orderIds, status });
    return response;
  },

  exportCsv: async (status?: string) => {
    const response: any = await apiClient.get("/admin/orders/export", {
      params: { status },
      responseType: "blob",
    });
    
    const url = window.URL.createObjectURL(new Blob([response]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `orders_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },
   getOrderDetails: async (orderId: string): Promise<Order> => {
    return apiClient.get(`/admin/orders/${orderId}`);
  },
// ============== NEW: Returns Management ==============
  
  /**
   * Get returns list with filters
   */
  getReturns: async (params: any) => {
    const response = await apiClient.get("/admin/returns", { params });
    return response;
  },

  /**
   * Get single return details
   */
  getReturnDetails: async (returnId: string) => {
    const response = await apiClient.get(`/admin/returns/${returnId}`);
    return response;
  },

  /**
   * Approve a return
   */
  approveReturn: async (returnId: string, data: any) => {
    const response = await apiClient.patch(`/admin/returns/${returnId}/approve`, data);
    return response;
  },

  /**
   * Reject a return
   */
  rejectReturn: async (returnId: string, data: any) => {
    const response = await apiClient.patch(`/admin/returns/${returnId}/reject`, data);
    return response;
  },

  /**
   * Schedule pickup for a return
   */
  schedulePickup: async (returnId: string, data: any) => {
    const response = await apiClient.patch(`/admin/returns/${returnId}/schedule-pickup`, data);
    return response;
  },

  /**
   * Complete pickup for a return
   */
  completePickup: async (returnId: string) => {
    const response = await apiClient.patch(`/admin/returns/${returnId}/complete-pickup`);
    return response;
  },

  /**
   * Receive and inspect a return
   */
  receiveReturn: async (returnId: string, data: any) => {
    const response = await apiClient.patch(`/admin/returns/${returnId}/receive`, data);
    return response;
  },

  /**
   * Close a return
   */
  closeReturn: async (returnId: string) => {
    const response = await apiClient.patch(`/admin/returns/${returnId}/close`);
    return response;
  },

  // ============== NEW: Refunds Management ==============
  
  /**
   * Get refunds list with filters
   */
  getRefunds: async (params: any) => {
    const response = await apiClient.get("/admin/refunds", { params });
    return response;
  },

  /**
   * Get single refund details
   */
  getRefundDetails: async (refundId: string) => {
    const response = await apiClient.get(`/admin/refunds/${refundId}`);
    return response;
  },

  /**
   * Process a refund
   */
  processRefund: async (refundId: string, data: any) => {
    const response = await apiClient.patch(`/admin/refunds/${refundId}/process`, data);
    return response;
  },

  /**
   * Complete a refund
   */
  completeRefund: async (refundId: string, data?: any) => {
    const response = await apiClient.patch(`/admin/refunds/${refundId}/complete`, data || {});
    return response;
  },

  /**
   * Fail a refund
   */
  failRefund: async (refundId: string, data: any) => {
    const response = await apiClient.patch(`/admin/refunds/${refundId}/fail`, data);
    return response;
  },

  /**
   * Cancel a refund
   */
  cancelRefund: async (refundId: string, data?: any) => {
    const response = await apiClient.patch(`/admin/refunds/${refundId}/cancel`, data || {});
    return response;
  },

  /**
   * Retry a failed refund
   */
  retryRefund: async (refundId: string) => {
    const response = await apiClient.post(`/admin/refunds/${refundId}/retry`);
    return response;
  },
};


