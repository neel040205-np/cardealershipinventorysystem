import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useSearchVehiclesQuery } from "@adapters/hooks/useVehicles";
import { useDebounce } from "@adapters/hooks/useDebounce";
import { Vehicle } from "@core/entities/Vehicle";
import { Card } from "@presentation/components/shared/Card";
import { Input } from "@presentation/components/shared/Input";
import { Car, Search, AlertTriangle, Package, SlidersHorizontal } from "lucide-react";
import { SearchFilters } from "@infra/api/vehicle-service";

// Result card (matching VehiclesPage styles for visual consistency)
const VehicleResultCard: React.FC<{ vehicle: Vehicle }> = ({ vehicle }) => {
  const inStock = vehicle.quantity > 0;
  return (
    <Card hoverable className="flex flex-col h-full justify-between">
      <div>
        <div className="group relative mb-4 flex h-40 items-center justify-center rounded-xl bg-gradient-to-br from-brand-50/50 via-gray-100 to-gray-50 dark:from-brand-950/20 dark:via-gray-800/60 dark:to-gray-900 overflow-hidden border border-gray-100 dark:border-gray-800/30">
          <div className="absolute inset-0 bg-brand-500/0 group-hover:bg-brand-500/5 dark:group-hover:bg-brand-500/10 transition-colors duration-300" />
          <Car className="h-14 w-14 text-gray-300 dark:text-gray-600 group-hover:scale-110 group-hover:text-brand-500/40 dark:group-hover:text-brand-400/30 transition-all duration-500" />
        </div>
        <div className="space-y-1.5">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate" title={`${vehicle.make} ${vehicle.model}`}>
            {vehicle.make} {vehicle.model}
          </h3>
          <span className="inline-flex items-center rounded-full bg-brand-50/85 px-2.5 py-0.5 text-xs font-semibold text-brand-600 dark:bg-brand-950/40 dark:text-brand-400">
            {vehicle.category}
          </span>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800/80 flex flex-wrap items-center justify-between gap-2">
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
    </Card>
  );
};

// Skeleton card shown during loading with pulsing gradient effect
const ResultSkeleton: React.FC = () => (
  <div className="animate-pulse rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800/80 dark:bg-gray-900/60">
    <div className="mb-4 h-40 rounded-xl bg-gray-100 dark:bg-gray-800/80" />
    <div className="space-y-3">
      <div className="h-5 w-3/4 rounded bg-gray-200 dark:bg-gray-850" />
      <div className="h-4 w-1/4 rounded bg-gray-200 dark:bg-gray-850" />
      <div className="flex justify-between items-center pt-3 border-t border-gray-100 dark:border-gray-800">
        <div className="h-6 w-24 rounded bg-gray-200 dark:bg-gray-850" />
        <div className="h-4 w-16 rounded bg-gray-200 dark:bg-gray-850" />
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

  // Debounce all inputs by 400ms to reduce API load
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
  const { data, isLoading, isError, error } = useSearchVehiclesQuery(filters, hasFilters);

  const handleClear = () => {
    setMake("");
    setModel("");
    setCategory("");
    setMinPrice("");
    setMaxPrice("");
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white sm:text-4xl">
          Search Catalog
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 font-medium">
          Filter the dealership catalog dynamically using the attributes below
        </p>
      </div>

      {/* Filter panel */}
      <Card className="shadow-md bg-white/70 dark:bg-gray-900/40 backdrop-blur-md">
        <div className="mb-5 flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300">
          <SlidersHorizontal className="h-4 w-4 text-brand-500" />
          Filters Configuration
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
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
          <div className="mt-4 flex justify-start">
            <button
              onClick={handleClear}
              className="text-xs font-bold text-brand-500 hover:text-brand-600 dark:text-brand-400 dark:hover:text-brand-300 transition-colors focus:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </Card>

      {/* No filters prompt */}
      {!hasFilters && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200/80 bg-white/50 dark:bg-gray-900/30 p-16 text-center dark:border-gray-800/80 max-w-lg mx-auto">
          <Search className="mb-4 h-14 w-14 text-gray-400" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Start searching</h2>
          <p className="mt-2 text-sm text-gray-500 leading-relaxed max-w-xs">
            Enter at least one search filter above to load matching vehicles
          </p>
        </div>
      )}

      {/* Loading skeletons */}
      {hasFilters && isLoading && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <ResultSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Error state */}
      {hasFilters && isError && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-red-200/60 bg-red-50/50 p-12 text-center dark:border-red-900/30 dark:bg-red-950/10 max-w-lg mx-auto">
          <AlertTriangle className="mb-4 h-12 w-12 text-red-500" />
          <h2 className="text-lg font-bold text-red-700 dark:text-red-400">Search failed</h2>
          <p className="mt-2 text-sm text-red-600/80 dark:text-red-400/60 leading-relaxed">
            {error?.message || "An unexpected error occurred."}
          </p>
        </div>
      )}

      {/* Empty results */}
      {hasFilters && !isLoading && !isError && data?.vehicles.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200/80 bg-white/50 dark:bg-gray-900/30 p-16 text-center dark:border-gray-800/80 max-w-lg mx-auto">
          <Package className="mb-4 h-14 w-14 text-gray-400" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">No results found</h2>
          <p className="mt-2 text-sm text-gray-500 leading-relaxed max-w-xs">
            Try adjusting your pricing limits or query spellings for broader results
          </p>
        </div>
      )}

      {/* Results grid */}
      {hasFilters && !isLoading && !isError && data && data.vehicles.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
            Found <span className="text-gray-900 dark:text-white font-bold">{data.total}</span>{" "}
            {data.total === 1 ? "vehicle" : "vehicles"} matching your criteria
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data.vehicles.map((vehicle) => (
              <VehicleResultCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
