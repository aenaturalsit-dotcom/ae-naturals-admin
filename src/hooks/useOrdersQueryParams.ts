// hooks/useOrdersQueryParams.ts

import { useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

export const useOrdersQueryParams = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const updateParams = useCallback(
    (updates: Record<string, string | null | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === undefined || value === '' || value === 'ALL') {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      });

      // Reset page when filters change
      const filterKeys = ['status', 'paymentStatus', 'search', 'dateFrom', 'dateTo', 'sort'];
      const hasFilterChange = Object.keys(updates).some((key) => filterKeys.includes(key));
      
      if (hasFilterChange && updates.page === undefined) {
        params.set('page', '1');
      }

      const queryString = params.toString();
      router.push(`${pathname}${queryString ? `?${queryString}` : ''}`, { scroll: false });
    },
    [searchParams, router, pathname]
  );

  const getParam = useCallback(
    (key: string): string | undefined => {
      return searchParams.get(key) || undefined;
    },
    [searchParams]
  );

  const getAllParams = useCallback(() => {
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
    return params;
  }, [searchParams]);

  return { updateParams, getParam, getAllParams, searchParams };
};