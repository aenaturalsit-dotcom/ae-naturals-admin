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
  }
};