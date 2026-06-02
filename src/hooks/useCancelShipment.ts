import { cancelShipment } from "@/services/admin.shipment.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from 'react-hot-toast';


export const useCancelShipment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      shipmentId,
      reason,
    }: {
      shipmentId: string;
      reason?: string;
    }) =>
      cancelShipment(shipmentId, {
        reason,
      }),

    onSuccess: () => {
      toast.success("Shipment cancelled");

      queryClient.invalidateQueries({
        queryKey: ["shipments"],
      });

      queryClient.invalidateQueries({
        queryKey: ["shipment"],
      });

      queryClient.invalidateQueries({
        queryKey: ["orders"],
      });
    },

    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ??
          "Failed to cancel shipment",
      );
    },
  });
};