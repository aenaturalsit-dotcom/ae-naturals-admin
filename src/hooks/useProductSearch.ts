import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

export function useProductSearch(searchTerm: string) {
  return useQuery({
    queryKey: ['product-search', searchTerm],
    queryFn: async ({ signal }) => {
      if (searchTerm.length < 2) return [];

      try {
        const res: any = await apiClient.get('/products/search', {
          params: { q: searchTerm, limit: 12 },
          signal, 
        });
        
        // 🚨 BULLETPROOF UNWRAPPER
        // 1. If apiClient already unwrapped it (res IS the array)
        if (Array.isArray(res)) return res;
        
        // 2. If it's a standard Axios response (res.data IS the array)
        if (res?.data && Array.isArray(res.data)) return res.data;
        
        // 3. If NestJS wrapped it in a data object (res.data.data IS the array)
        if (res?.data?.data && Array.isArray(res.data.data)) return res.data.data;
        
        // 4. If NestJS wrapped it in a products object
        if (res?.data?.products && Array.isArray(res.data.products)) return res.data.products;
        
        return [];
      } catch (error) {
        console.error("Search API Error:", error);
        return [];
      }
    },
    enabled: searchTerm.length >= 2,
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 60 * 5, 
  });
}