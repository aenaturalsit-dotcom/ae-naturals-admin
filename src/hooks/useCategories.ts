// src/hooks/useCategories.ts

import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  image?: string;
  description?: string;
  productCount?: number;
  parentId?: string | null;
  level?: number;
  isActive: boolean;
  order?: number;
  children?: Category[];
}

interface UseCategoriesOptions {
  enabled?: boolean;
  includeProductCount?: boolean;
  parentId?: string | null;
  limit?: number;
}

export function useCategories(options: UseCategoriesOptions = {}) {
  const {
    enabled = true,
    includeProductCount = true,
    parentId,
    limit,
  } = options;

  return useQuery({
    queryKey: ['categories', { parentId, includeProductCount, limit }],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        if (parentId !== undefined) {
          params.append('parentId', parentId || '');
        }
        if (includeProductCount) {
          params.append('includeProductCount', 'true');
        }
        if (limit) {
          params.append('limit', String(limit));
        }
        
        const response = await apiClient.get<Category[]>(
          `/admin/categories?${params.toString()}`
        );
        return response;
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        return [];
      }
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
  });
}

// Hook for fetching a single category
export function useCategory(id: string) {
  return useQuery({
    queryKey: ['category', id],
    queryFn: async () => {
      try {
        const response = await apiClient.get<Category>(`/admin/categories/${id}`);
        return response;
      } catch (error) {
        console.error('Failed to fetch category:', error);
        return null;
      }
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// Hook for bulk category fetch
export function useCategoriesByIds(
  ids: string[],
  options: { enabled?: boolean } = {}
) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: ['categories', 'bulk', ids.slice().sort().join(',')],
    queryFn: async () => {
      if (!ids || ids.length === 0) return [];
      
      try {
        // Fetch categories one by one (or use bulk endpoint if available)
        const promises = ids.map(id => 
          apiClient.get<Category>(`/admin/categories/${id}`)
            .catch(() => null) // Return null if a category fails
        );
        
        const results = await Promise.all(promises);
        // Filter out nulls and return valid categories
        return results.filter((cat): cat is Category => cat !== null);
      } catch (error) {
        console.error('Failed to fetch categories by ids:', error);
        return [];
      }
    },
    enabled: enabled && ids.length > 0,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
  });
}