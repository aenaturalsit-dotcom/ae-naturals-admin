// src\services\admin.shipment.service.ts


import  apiClient  from '@/lib/api-client';


export interface CancelShipmentPayload {
  reason?: string;
}

export const cancelShipment = async (
  shipmentId: string,
  payload: CancelShipmentPayload,
) => {
  const response = await apiClient.post(
    `/admin/shipments/${shipmentId}/cancel`,
    payload,
  );

  return response.data;
};