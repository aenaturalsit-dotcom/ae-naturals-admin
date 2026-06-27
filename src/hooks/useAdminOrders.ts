// hooks/useAdminOrders.ts

import { useQuery } from '@tanstack/react-query';
import { AdminOrdersService } from '@/services/admin-orders.service';
import { useOrdersQueryParams } from './useOrdersQueryParams';
import { ListOrdersParams, ListOrdersResponse } from '@/types/orders';

export const useAdminOrders = () => {
  const { getParam } = useOrdersQueryParams();

  const params: ListOrdersParams = {
    page: Number(getParam('page')) || 1,
    limit: 15,
    status: getParam('status') as any,
    paymentStatus: getParam('paymentStatus') as any,
    search: getParam('search') || '',
    dateFrom: getParam('dateFrom'),
    dateTo: getParam('dateTo'),
    sort: getParam('sort') || 'createdAt_desc',
  };

  return useQuery<ListOrdersResponse>({
    queryKey: ['admin-orders', params],
    queryFn: () => AdminOrdersService.getOrders(params),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    retry: 2,
    retryDelay: 1000,
  });
};