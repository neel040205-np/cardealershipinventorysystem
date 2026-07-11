import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { vehicleService, SearchFilters } from "@infra/api/vehicle-service";
import { useDebounce } from "@adapters/hooks/useDebounce";
import { Vehicle } from "@core/entities/Vehicle";
import { Card } from "@presentation/components/shared/Card";
import { Input } from "@presentation/components/shared/Input";
import { Car, Search, AlertTriangle, Package, SlidersHorizontal } from "lucide-react";

// Result card (reused from VehiclesPage pattern)
const VehicleResultCard: React.FC<{ vehicle: Vehicle }> = ({ vehicle }) => {
  const inStock = vehicle.quantity > 0;
  return (
    <Card hoverable>
      <div className="mb-4 flex h-36 items-center justify-center rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-850">
        <Car className="h-14 w-14 text-gray-300 dark:text-gray-600" />
      </div>
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
              inStock ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"
            }`}
          >
            {inStock ? `${vehicle.quantity} in stock` : "Out of stock"}
          </span>
        </div>
      </div>
    </Card>
  );
};

// Skeleton
const ResultSkeleton: React.FC = () => (
  <div className="animate-pulse rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
    <div className="mb-4 flex h-36 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800" />
    <div className="space-y-3">
      <div className="h-5 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
      <div className="h-4 w-1/2 rounded bg-gray-200 dark:bg-gray-700" />
      <div className="flex justify-between pt-2">
        <div className="h-6 w-24 rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-6 w-16 rounded bg-gray-200 dark:bg-gray-700" />
      </div>
    </div>
  </div>
);

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Initialize form state from URL query params
  const [make, setMake] = useState(searchParams.get("make") || "");
  const [model, setModel] = useState(searchParams.get("model") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");

  // Debounce all inputs by 400ms
  const debouncedMake = useDebounce(make, 400);
  const debouncedModel = useDebounce(model, 400);
  const debouncedCategory = useDebounce(category, 400);
  const debouncedMinPrice = useDebounce(minPrice, 400);
  const debouncedMaxPrice = useDebounce(maxPrice, 400);

  // Build filters from debounced values
  const filters: SearchFilters = useMemo(
    () => ({
      make: debouncedMake || undefined,
      model: debouncedModel || undefined,
      category: debouncedCategory || undefined,
      minPrice: debouncedMinPrice ? Number(debouncedMinPrice) : undefined,
      maxPrice: debouncedMaxPrice ? Number(debouncedMaxPrice) : undefined
    }),
    [debouncedMake, debouncedModel, debouncedCategory, debouncedMinPrice, debouncedMaxPrice]
  );

  const hasFilters = Object.values(filters).some((v) => v !== undefined);

  // Sync debounced values to URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedMake) params.set("make", debouncedMake);
    if (debouncedModel) params.set("model", debouncedModel);
    if (debouncedCategory) params.set("category", debouncedCategory);
    if (debouncedMinPrice) params.set("minPrice", debouncedMinPrice);
    if (debouncedMaxPrice) params.set("maxPrice", debouncedMaxPrice);
    setSearchParams(params, { replace: true });
  }, [debouncedMake, debouncedModel, debouncedCategory, debouncedMinPrice, debouncedMaxPrice, setSearchParams]);

  // Query — only fires when at least one filter is present
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["vehicles-search", filters],
    queryFn: () => vehicleService.search(filters),
    enabled: hasFilters
  });

  const handleClear = () => {
    setMake("");
    setModel("");
    setCategory("");
    setMinPrice("");
    setMaxPrice("");
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          Search Vehicles
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Filter the inventory by make, model, category, or price range
        </p>
      </div>

      {/* Filter panel */}
      <Card>
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <Input
            label="Make"
            placeholder="e.g. Toyota"
            value={make}
            onChange={(e) => setMake(e.target.value)}
          />
          <Input
            label="Model"
            placeholder="e.g. Camry"
            value={model}
            onChange={(e) => setModel(e.target.value)}
          />
          <Input
            label="Category"
            placeholder="e.g. Sedan"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
          <Input
            label="Min Price"
            type="number"
            placeholder="0"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          />
          <Input
            label="Max Price"
            type="number"
            placeholder="100000"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
        </div>
        {hasFilters && (
          <button
            onClick={handleClear}
            className="mt-4 text-xs font-semibold text-brand-500 hover:text-brand-600 transition-colors"
          >
            Clear all filters
          </button>
        )}
      </Card>

      {/* No filters prompt */}
      {!hasFilters && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-16 text-center dark:border-gray-800 dark:bg-gray-900">
          <Search className="mb-4 h-16 w-16 text-gray-300 dark:text-gray-600" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Start searching</h2>
          <p className="mt-1 text-sm text-gray-500">
            Enter at least one filter above to search the inventory
          </p>
        </div>
      )}

      {/* Loading skeletons */}
      {hasFilters && isLoading && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <ResultSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Error state */}
      {hasFilters && isError && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50 p-12 text-center dark:border-red-900/30 dark:bg-red-950/10">
          <AlertTriangle className="mb-4 h-12 w-12 text-red-400" />
          <h2 className="text-lg font-bold text-red-600 dark:text-red-400">Search failed</h2>
          <p className="mt-1 text-sm text-red-500/80 dark:text-red-400/60">
            {(error as Error)?.message || "An unexpected error occurred."}
          </p>
        </div>
      )}

      {/* Empty results */}
      {hasFilters && !isLoading && !isError && data?.vehicles.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-16 text-center dark:border-gray-800 dark:bg-gray-900">
          <Package className="mb-4 h-16 w-16 text-gray-300 dark:text-gray-600" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">No results found</h2>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your filters for broader results
          </p>
        </div>
      )}

      {/* Results grid */}
      {hasFilters && !isLoading && !isError && data && data.vehicles.length > 0 && (
        <>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Found <span className="font-bold text-gray-900 dark:text-white">{data.total}</span>{" "}
            {data.total === 1 ? "vehicle" : "vehicles"}
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data.vehicles.map((vehicle) => (
              <VehicleResultCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
