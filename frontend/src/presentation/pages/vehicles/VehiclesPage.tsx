import React from "react";
import { useVehiclesQuery, usePurchaseMutation } from "@adapters/hooks/useVehicles";
import { Vehicle } from "@core/entities/Vehicle";
import { Card } from "@presentation/components/shared/Card";
import { Button } from "@presentation/components/shared/Button";
import { Car, AlertTriangle, Package, ShoppingCart } from "lucide-react";

// Skeleton card shown during loading with pulsing gradient effect
const VehicleCardSkeleton: React.FC = () => (
  <div className="animate-pulse rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800/80 dark:bg-gray-900/60">
    <div className="mb-4 h-44 rounded-xl bg-gray-100 dark:bg-gray-800/80" />
    <div className="space-y-3">
      <div className="h-5 w-3/4 rounded bg-gray-200 dark:bg-gray-850" />
      <div className="h-4 w-1/4 rounded bg-gray-200 dark:bg-gray-850" />
      <div className="flex justify-between items-center pt-3 border-t border-gray-100 dark:border-gray-800">
        <div className="h-6 w-24 rounded bg-gray-200 dark:bg-gray-850" />
        <div className="h-4 w-16 rounded bg-gray-200 dark:bg-gray-850" />
      </div>
      <div className="h-10 w-full rounded-xl bg-gray-200 dark:bg-gray-850 pt-2" />
    </div>
  </div>
);

// Individual vehicle card with purchase button
const VehicleCard: React.FC<{ vehicle: Vehicle }> = ({ vehicle }) => {
  const inStock = vehicle.quantity > 0;
  const purchaseMutation = usePurchaseMutation();

  return (
    <Card hoverable className="flex flex-col h-full justify-between">
      <div>
        {/* Image placeholder with premium mesh gradient */}
        <div className="group relative mb-4 flex h-44 items-center justify-center rounded-xl bg-gradient-to-br from-brand-50/50 via-gray-100 to-gray-50 dark:from-brand-950/20 dark:via-gray-800/60 dark:to-gray-900 overflow-hidden border border-gray-100 dark:border-gray-800/30">
          <div className="absolute inset-0 bg-brand-500/0 group-hover:bg-brand-500/5 dark:group-hover:bg-brand-500/10 transition-colors duration-300" />
          <Car className="h-16 w-16 text-gray-300 dark:text-gray-600 group-hover:scale-110 group-hover:text-brand-500/40 dark:group-hover:text-brand-400/30 transition-all duration-500" />
        </div>

        {/* Details */}
        <div className="space-y-1.5">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate" title={`${vehicle.make} ${vehicle.model}`}>
            {vehicle.make} {vehicle.model}
          </h3>

          <span className="inline-flex items-center rounded-full bg-brand-50/80 px-2.5 py-0.5 text-xs font-semibold text-brand-600 dark:bg-brand-950/40 dark:text-brand-400">
            {vehicle.category}
          </span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800/80 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
            ₹{Number(vehicle.price).toLocaleString("en-IN")}
          </p>
          <span
            className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold uppercase tracking-wider ${
              inStock
                ? "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400"
                : "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400"
            }`}
          >
            {inStock ? `${vehicle.quantity} in stock` : "Out of stock"}
          </span>
        </div>

        {/* Purchase button */}
        <Button
          className="w-full"
          variant={inStock ? "primary" : "secondary"}
          size="sm"
          disabled={!inStock || purchaseMutation.isPending}
          isLoading={purchaseMutation.isPending}
          onClick={() => purchaseMutation.mutate(vehicle.id)}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          {inStock ? "Purchase" : "Out of Stock"}
        </Button>
      </div>
    </Card>
  );
};

export const VehiclesPage: React.FC = () => {
  const { data, isLoading, isError, error, refetch } = useVehiclesQuery();

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white sm:text-4xl">
          Vehicle Catalog
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 font-medium">
          Browse and purchase the latest dealership additions
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
        <div className="flex flex-col items-center justify-center rounded-2xl border border-red-200/60 bg-red-50/50 p-12 text-center dark:border-red-900/30 dark:bg-red-950/10 max-w-lg mx-auto">
          <AlertTriangle className="mb-4 h-12 w-12 text-red-500" />
          <h2 className="text-lg font-bold text-red-700 dark:text-red-400">
            Failed to load inventory
          </h2>
          <p className="mt-2 text-sm text-red-600/80 dark:text-red-400/60 leading-relaxed">
            {error?.message || "An unexpected network error occurred."}
          </p>
          <Button
            onClick={() => refetch()}
            className="mt-5"
            size="sm"
          >
            Try Again
          </Button>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !isError && data?.vehicles.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200/80 bg-white/50 dark:bg-gray-900/30 p-16 text-center dark:border-gray-800/80 max-w-lg mx-auto">
          <Package className="mb-4 h-14 w-14 text-gray-400" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Empty inventory</h2>
          <p className="mt-2 text-sm text-gray-500 leading-relaxed max-w-xs">
            There are no vehicles available at this moment. Check back soon.
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
