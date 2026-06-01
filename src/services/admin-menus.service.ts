// src/services/admin-menus.service.ts

import apiClient from "@/lib/api-client";

const normalize = (res: any) => {
  if (!res) return null;
  return res?.data ?? res;
};

export const adminMenusService = {
  // =========================
  // MENU
  // =========================
  async getMenuBySlug(slug: string): Promise<any> {
    try {
      const res = await apiClient.get(`/admin/menus/${slug}`);
      return normalize(res);
    } catch (error) {
      console.error("❌ getMenuBySlug failed", error);
      return { groups: [] };
    }
  },

  async updateMenu(slug: string, payload: any): Promise<any> {
    try {
      const res = await apiClient.put(`/admin/menus/${slug}`, payload);
      return normalize(res);
    } catch (error) {
      console.error("❌ updateMenu failed", error);
      throw error;
    }
  },

  // =========================
  // COLLECTIONS
  // =========================
  async getAvailableCollections(): Promise<any[]> {
    try {
      const res = await apiClient.get("/admin/collections");
      const data = normalize(res);

      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("❌ collections fetch failed", error);
      return [];
    }
  },

  // =========================
  // CATEGORY (🔥 NEW)
  // =========================
  async getCategories(): Promise<any[]> {
    try {
      const res = await apiClient.get("/admin/categories");
      const data = normalize(res);

      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("❌ categories fetch failed", error);
      return [];
    }
  },

  // =========================
  // PRODUCTS (🔥 NEW)
  // =========================
  async getProducts(): Promise<any[]> {
    try {
      const res = await apiClient.get("/admin/products", {
        params: {
          limit: 100, // 🔥 IMPORTANT (avoid huge payload)
          isActive: true
        }
      });

      const data = normalize(res);

      return Array.isArray(data) ? data : data?.items || [];
    } catch (error) {
      console.error("❌ products fetch failed", error);
      return [];
    }
  }
};