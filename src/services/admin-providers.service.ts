// src/services/admin-providers.service.ts

import apiClient from '@/lib/api-client';

export interface ProviderConfig {
  id?: string;
  type: 'EMAIL' | 'SMS' | 'PAYMENT' | 'SHIPPING' | 'CLOUD';
  bypassProvider?: boolean;
  shippingRules?: {
    freeShippingAbove?: number;
    flatShippingCharge?: number;
    codExtraCharge?: number;
    estimatedDays?: string;
  }[];
  provider: string;
  isActive: boolean;
  priority: number;
  // Change this to allow string during editing
  config: string | Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

// Cloud service config interface
export interface CloudServiceConfig {
  name: string;
  provider: 'AWS' | 'GCP' | 'AZURE' | 'DO' | 'OTHER';
  region: string;
  status: 'ACTIVE' | 'INACTIVE' | 'DEGRADED';
  services: string[];
  credentials: {
    accessKeyId?: string;
    secretAccessKey?: string;
    bucketName?: string;
    projectId?: string;
    serviceAccount?: string;
    endpoint?: string;
    subscriptionId?: string;
    resourceGroup?: string;
    apiKey?: string;
    spaceName?: string;
    storageAccount?: string;
  };
}

export const adminProvidersService = {
  getProviders: async (type: string): Promise<ProviderConfig[]> => {
    // apiClient interceptor already unwrapped response.data for us
    return await apiClient.get(`/admin/providers?type=${type}`);
  },

  createProvider: async (data: ProviderConfig): Promise<ProviderConfig> => {
    return await apiClient.post('/admin/providers', data);
  },

  updateProvider: async (
    id: string,
    data: {
      type?: string;
      provider?: string;
      isActive?: boolean;
      priority?: number;
      config?: any;
      // NEW
      bypassProvider?: boolean;
      shippingRules?: any[];
    }
  ): Promise<ProviderConfig> => {
    return await apiClient.patch(
      `/admin/providers/${id}`,
      data
    );
  },
};