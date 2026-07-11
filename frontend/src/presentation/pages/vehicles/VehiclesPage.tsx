import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { vehicleService } from "@infra/api/vehicle-service";
import { Vehicle } from "@core/entities/Vehicle";
import { Card } from "@presentation/components/shared/Card";
import { Button } from "@presentation/components/shared/Button";
import { useToast } from "@adapters/context/toast-context";
import { Car, AlertTriangle, Package, ShoppingCart } from "lucide-react";

// Skeleton card shown during loading
const VehicleCardSkeleton: React.FC = () => (
  <div className="animate-pulse rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
    <div className="mb-4 flex h-40 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800" />
    <div className="space-y-3">
      <div className="h-5 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
      <div className="h-4 w-1/2 rounded bg-gray-200 dark:bg-gray-700" />
      <div className="flex justify-between pt-2">
        <div className="h-6 w-24 rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-6 w-16 rounded bg-gray-200 dark:bg-gray-700" />
      </div>
      <div className="h-9 w-full rounded-lg bg-gray-200 dark:bg-gray-700" />
    </div>
  </div>
);

// Individual vehicle card with purchase button
const VehicleCard: React.FC<{ vehicle: Vehicle }> = ({ vehicle }) => {
  const inStock = vehicle.quantity > 0;
  const queryClient = useQueryClient();
  const toast = useToast();

  const purchaseMutation = useMutation({
    mutationFn: () => vehicleService.purchase(vehicle.id),
    onSuccess: () => {
      toast.success(`Successfully purchased ${vehicle.make} ${vehicle.model}!`);
      // Invalidate the vehicles query to refresh inventory counts
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.error?.message || "Purchase failed. Please try again.";
      toast.error(message);
    }
  });

  return (
    <Card hoverable>
      {/* Image placeholder */}
      <div className="mb-4 flex h-40 items-center justify-center rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-850">
        <Car className="h-16 w-16 text-gray-300 dark:text-gray-600" />
      </div>

      {/* Details */}
      <div className="space-y-2">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">
          {vehicle.make} {vehicle.model}
        </h3>

        <span className="inline-block rounded-full bg-brand-50 px-3 py-0.5 text-xs font-semibold text-brand-600 dark:bg-brand-900/20 dark:text-brand-500">
          {vehicle.category}
        </span>

        <div className="flex items-end justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
          <p className="text-xl font-extrabold text-gray-900 dark:text-white">
            ${vehicle.price.toLocaleString()}
          </p>
          <span
            className={`text-xs font-bold uppercase tracking-wider ${
              inStock
                ? "text-green-600 dark:text-green-400"
                : "text-red-500 dark:text-red-400"
            }`}
          >
            {inStock ? `${vehicle.quantity} in stock` : "Out of stock"}
          </span>
        </div>

        {/* Purchase button */}
        <Button
          className="w-full mt-2"
          variant={inStock ? "primary" : "secondary"}
          size="sm"
          disabled={!inStock || purchaseMutation.isPending}
          isLoading={purchaseMutation.isPending}
          onClick={() => purchaseMutation.mutate()}
        >
          <ShoppingCart className="mr-1.5 h-4 w-4" />
          {inStock ? "Purchase" : "Out of Stock"}
        </Button>
      </div>
    </Card>
  );
};

export const VehiclesPage: React.FC = () => {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ["vehicles"],
    queryFn: () => vehicleService.getAll()
  });

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          Vehicle Inventory
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Browse the full dealership catalog
        </p>
      </div>

      {/* Loading skeleton grid */}
      {isLoading && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <VehicleCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50 p-12 text-center dark:border-red-900/30 dark:bg-red-950/10">
          <AlertTriangle className="mb-4 h-12 w-12 text-red-400" />
          <h2 className="text-lg font-bold text-red-600 dark:text-red-400">
            Failed to load vehicles
          </h2>
          <p className="mt-1 text-sm text-red-500/80 dark:text-red-400/60">
            {(error as Error)?.message || "An unexpected error occurred."}
          </p>
          <button
            onClick={() => refetch()}
            className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !isError && data?.vehicles.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-16 text-center dark:border-gray-800 dark:bg-gray-900">
          <Package className="mb-4 h-16 w-16 text-gray-300 dark:text-gray-600" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">No vehicles found</h2>
          <p className="mt-1 text-sm text-gray-500">
            The inventory is currently empty. Check back later.
          </p>
        </div>
      )}

      {/* Vehicle card grid */}
      {!isLoading && !isError && data && data.vehicles.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {data.vehicles.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} />
          ))}
        </div>
      )}
    </div>
  );
};
