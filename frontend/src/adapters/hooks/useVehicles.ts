import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { vehicleService, SearchFilters, CreateVehicleData } from "@infra/api/vehicle-service";
import { useToast } from "@adapters/context/toast-context";

// Custom hook to query all vehicles
export function useVehiclesQuery() {
  return useQuery({
    queryKey: ["vehicles"],
    queryFn: () => vehicleService.getAll()
  });
}

// Custom hook to search vehicles with active filters
export function useSearchVehiclesQuery(filters: SearchFilters, enabled: boolean) {
  return useQuery({
    queryKey: ["vehicles-search", filters],
    queryFn: () => vehicleService.search(filters),
    enabled
  });
}

// Custom hook to execute a vehicle purchase mutation
export function usePurchaseMutation(onSuccessCallback?: () => void) {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (id: string) => vehicleService.purchase(id),
    onSuccess: (vehicle) => {
      toast.success(`Successfully purchased ${vehicle.make} ${vehicle.model}!`);
      // Invalidate both vehicle lists to refresh inventory quantities
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["vehicles-search"] });
      if (onSuccessCallback) onSuccessCallback();
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.error?.message || "Purchase failed. Please try again.";
      toast.error(message);
    }
  });
}

// Custom hook to manage vehicle inventory modifications (CRUD/Restock)
export function useVehicleAdminMutations() {
  const queryClient = useQueryClient();
  const toast = useToast();

  const invalidateAdminList = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-vehicles"] });
  };

  const createMutation = useMutation({
    mutationFn: (data: CreateVehicleData) => vehicleService.create(data),
    onSuccess: (vehicle) => {
      toast.success(`${vehicle.make} ${vehicle.model} added to inventory.`);
      invalidateAdminList();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || "Failed to add vehicle.");
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateVehicleData }) =>
      vehicleService.update(id, data),
    onSuccess: (updated) => {
      toast.success(`${updated.make} ${updated.model} updated.`);
      invalidateAdminList();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || "Failed to update vehicle.");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => vehicleService.delete(id),
    onSuccess: () => {
      toast.success("Vehicle removed from inventory.");
      invalidateAdminList();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || "Failed to delete vehicle.");
    }
  });

  const restockMutation = useMutation({
    mutationFn: ({ id, quantity }: { id: string; quantity: number }) =>
      vehicleService.restock(id, quantity),
    onSuccess: (updated) => {
      toast.success(`${updated.make} ${updated.model} restocked. New quantity: ${updated.quantity}`);
      invalidateAdminList();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || "Failed to restock vehicle.");
    }
  });

  return {
    createMutation,
    updateMutation,
    deleteMutation,
    restockMutation
  };
}
