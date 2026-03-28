import apiClient from '@/lib/api-client';

export interface ProviderConfig {
  id: string;
  type: 'EMAIL' | 'SMS' | 'PAYMENT' | 'OTHER';
  provider: string;
  isActive: boolean;
  priority: number;
  config: Record<string, any>;
}

export const adminProvidersService = {
  getProviders: async (type: string): Promise<ProviderConfig[]> => {
    // apiClient interceptor already unwrapped response.data for us
    return await apiClient.get(`/admin/providers?type=${type}`);
  },

  createProvider: async (data: ProviderConfig): Promise<ProviderConfig> => {
    return await apiClient.post('/admin/providers', data);
  },

  updateProvider: async (id: string, data: Partial<ProviderConfig>): Promise<ProviderConfig> => {
    return await apiClient.patch(`/admin/providers/${id}`, data);
  },
};