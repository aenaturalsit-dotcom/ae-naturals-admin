import apiClient  from '@/lib/api-client';

export const adminMenusService = {
  async getMenuBySlug(slug: string) {
    try {
      const { data } = await apiClient.get(`/menus/${slug}`);
      return data;
    } catch (error) {
      console.error('Error fetching menu:', error);
      return null;
    }
  },

  async updateMenu(slug: string, payload: any) {
    const { data } = await apiClient.put(`/admin/menus/${slug}`, payload);
    return data;
  }
};