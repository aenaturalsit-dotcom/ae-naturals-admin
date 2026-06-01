// src/services/admin-products.service.ts
import apiClient from '@/lib/api-client';

export const adminProductService = {
  updateProduct: async (id: string, data: any) => {
    return apiClient.put(`/admin/products/${id}`, data);
  },
  createProduct: (data: any) => {
    return apiClient.post('/admin/products', data);
  },
deleteProduct: (id: string) => apiClient.delete(`/admin/products/${id}`),
  updateVariant: async (variantId: string, stock: number, priceModifier: number) => {
    return apiClient.put(`/admin/products/variants/${variantId}`, {
      stock,
      priceModifier,
    });
  },
};