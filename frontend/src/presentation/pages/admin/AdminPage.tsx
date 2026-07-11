import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { vehicleService } from "@infra/api/vehicle-service";
import { Vehicle } from "@core/entities/Vehicle";
import { useToast } from "@adapters/context/toast-context";
import { Modal } from "@presentation/components/shared/Modal";
import { Input } from "@presentation/components/shared/Input";
import { Button } from "@presentation/components/shared/Button";
import { Spinner } from "@presentation/components/shared/Spinner";
import {
  Plus,
  Pencil,
  Trash2,
  PackagePlus,
  AlertTriangle,
  Car
} from "lucide-react";

// ─── Zod Schemas ────────────────────────────────────────────────────

const vehicleSchema = z.object({
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  category: z.string().min(1, "Category is required"),
  price: z.coerce.number().positive("Price must be greater than zero"),
  quantity: z.coerce.number().int().nonnegative("Quantity must be non-negative")
});

type VehicleFormValues = z.infer<typeof vehicleSchema>;

const restockSchema = z.object({
  quantity: z.coerce.number().int("Must be an integer").positive("Quantity must be greater than zero")
});

type RestockFormValues = z.infer<typeof restockSchema>;

// ─── Add Vehicle Modal ──────────────────────────────────────────────

const AddVehicleModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose
}) => {
  const queryClient = useQueryClient();
  const toast = useToast();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleSchema)
  });

  const mutation = useMutation({
    mutationFn: (data: VehicleFormValues) => vehicleService.create(data),
    onSuccess: (vehicle) => {
      toast.success(`${vehicle.make} ${vehicle.model} added to inventory.`);
      queryClient.invalidateQueries({ queryKey: ["admin-vehicles"] });
      reset();
      onClose();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || "Failed to add vehicle.");
    }
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Vehicle">
      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
        <Input label="Make" placeholder="e.g. Toyota" error={errors.make?.message} {...register("make")} />
        <Input label="Model" placeholder="e.g. Camry" error={errors.model?.message} {...register("model")} />
        <Input label="Category" placeholder="e.g. Sedan" error={errors.category?.message} {...register("category")} />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Price" type="number" placeholder="25000" error={errors.price?.message} {...register("price")} />
          <Input label="Quantity" type="number" placeholder="10" error={errors.quantity?.message} {...register("quantity")} />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" isLoading={mutation.isPending}>Add Vehicle</Button>
        </div>
      </form>
    </Modal>
  );
};

// ─── Edit Vehicle Modal ─────────────────────────────────────────────

const EditVehicleModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle | null;
}> = ({ isOpen, onClose, vehicle }) => {
  const queryClient = useQueryClient();
  const toast = useToast();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleSchema),
    values: vehicle
      ? { make: vehicle.make, model: vehicle.model, category: vehicle.category, price: vehicle.price, quantity: vehicle.quantity }
      : undefined
  });

  const mutation = useMutation({
    mutationFn: (data: VehicleFormValues) => vehicleService.update(vehicle!.id, data),
    onSuccess: (updated) => {
      toast.success(`${updated.make} ${updated.model} updated.`);
      queryClient.invalidateQueries({ queryKey: ["admin-vehicles"] });
      reset();
      onClose();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || "Failed to update vehicle.");
    }
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Vehicle">
      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
        <Input label="Make" error={errors.make?.message} {...register("make")} />
        <Input label="Model" error={errors.model?.message} {...register("model")} />
        <Input label="Category" error={errors.category?.message} {...register("category")} />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Price" type="number" error={errors.price?.message} {...register("price")} />
          <Input label="Quantity" type="number" error={errors.quantity?.message} {...register("quantity")} />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" isLoading={mutation.isPending}>Save Changes</Button>
        </div>
      </form>
    </Modal>
  );
};

// ─── Delete Vehicle Modal ───────────────────────────────────────────

const DeleteVehicleModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle | null;
}> = ({ isOpen, onClose, vehicle }) => {
  const queryClient = useQueryClient();
  const toast = useToast();

  const mutation = useMutation({
    mutationFn: () => vehicleService.delete(vehicle!.id),
    onSuccess: () => {
      toast.success(`${vehicle!.make} ${vehicle!.model} removed from inventory.`);
      queryClient.invalidateQueries({ queryKey: ["admin-vehicles"] });
      onClose();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || "Failed to delete vehicle.");
    }
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Vehicle">
      <div className="space-y-4">
        <div className="rounded-xl bg-red-50 p-4 dark:bg-red-950/20">
          <p className="text-sm text-red-700 dark:text-red-400">
            Are you sure you want to permanently delete{" "}
            <span className="font-bold">{vehicle?.make} {vehicle?.model}</span>? This action cannot be undone.
          </p>
        </div>
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            type="button"
            variant="danger"
            isLoading={mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            Delete Vehicle
          </Button>
        </div>
      </div>
    </Modal>
  );
};

// ─── Restock Vehicle Modal ──────────────────────────────────────────

const RestockVehicleModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle | null;
}> = ({ isOpen, onClose, vehicle }) => {
  const queryClient = useQueryClient();
  const toast = useToast();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<RestockFormValues>({
    resolver: zodResolver(restockSchema)
  });

  const mutation = useMutation({
    mutationFn: (data: RestockFormValues) => vehicleService.restock(vehicle!.id, data.quantity),
    onSuccess: (updated) => {
      toast.success(`${updated.make} ${updated.model} restocked. New quantity: ${updated.quantity}`);
      queryClient.invalidateQueries({ queryKey: ["admin-vehicles"] });
      reset();
      onClose();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || "Failed to restock vehicle.");
    }
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Restock ${vehicle?.make ?? ""} ${vehicle?.model ?? ""}`}>
      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Current stock: <span className="font-bold text-gray-900 dark:text-white">{vehicle?.quantity ?? 0}</span>
        </p>
        <Input
          label="Quantity to Add"
          type="number"
          placeholder="e.g. 10"
          error={errors.quantity?.message}
          {...register("quantity")}
        />
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" isLoading={mutation.isPending}>Restock</Button>
        </div>
      </form>
    </Modal>
  );
};

// ─── Admin Page ─────────────────────────────────────────────────────

export const AdminPage: React.FC = () => {
  const [addOpen, setAddOpen] = useState(false);
  const [editVehicle, setEditVehicle] = useState<Vehicle | null>(null);
  const [deleteVehicle, setDeleteVehicle] = useState<Vehicle | null>(null);
  const [restockVehicle, setRestockVehicle] = useState<Vehicle | null>(null);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["admin-vehicles"],
    queryFn: () => vehicleService.getAll()
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Admin Panel
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage vehicle inventory
          </p>
        </div>
        <Button onClick={() => setAddOpen(true)}>
          <Plus className="mr-1.5 h-4 w-4" />
          Add Vehicle
        </Button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50 p-12 text-center dark:border-red-900/30 dark:bg-red-950/10">
          <AlertTriangle className="mb-4 h-12 w-12 text-red-400" />
          <h2 className="text-lg font-bold text-red-600 dark:text-red-400">Failed to load vehicles</h2>
          <p className="mt-1 text-sm text-red-500/80">{(error as Error)?.message}</p>
          <button onClick={() => refetch()} className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors">
            Try Again
          </button>
        </div>
      )}

      {/* Table */}
      {!isLoading && !isError && data && (
        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/50">
                <th className="px-6 py-3 font-semibold text-gray-500 dark:text-gray-400">Vehicle</th>
                <th className="px-6 py-3 font-semibold text-gray-500 dark:text-gray-400">Category</th>
                <th className="px-6 py-3 font-semibold text-gray-500 dark:text-gray-400 text-right">Price</th>
                <th className="px-6 py-3 font-semibold text-gray-500 dark:text-gray-400 text-right">Stock</th>
                <th className="px-6 py-3 font-semibold text-gray-500 dark:text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.vehicles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <Car className="mx-auto mb-3 h-10 w-10 text-gray-300 dark:text-gray-600" />
                    <p className="font-medium text-gray-500">No vehicles in inventory</p>
                  </td>
                </tr>
              ) : (
                data.vehicles.map((vehicle) => (
                  <tr
                    key={vehicle.id}
                    className="border-b border-gray-100 last:border-0 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900 dark:text-white">
                        {vehicle.make} {vehicle.model}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-600 dark:bg-brand-900/20 dark:text-brand-500">
                        {vehicle.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-gray-900 dark:text-white">
                      ${vehicle.price.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span
                        className={`text-xs font-bold uppercase tracking-wider ${
                          vehicle.quantity > 0
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-500 dark:text-red-400"
                        }`}
                      >
                        {vehicle.quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setRestockVehicle(vehicle)}
                          className="rounded-lg p-2 text-gray-400 hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-950/20 dark:hover:text-green-400 transition-colors"
                          title="Restock"
                        >
                          <PackagePlus className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setEditVehicle(vehicle)}
                          className="rounded-lg p-2 text-gray-400 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/20 dark:hover:text-blue-400 transition-colors"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteVehicle(vehicle)}
                          className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20 dark:hover:text-red-400 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      <AddVehicleModal isOpen={addOpen} onClose={() => setAddOpen(false)} />
      <EditVehicleModal isOpen={!!editVehicle} onClose={() => setEditVehicle(null)} vehicle={editVehicle} />
      <DeleteVehicleModal isOpen={!!deleteVehicle} onClose={() => setDeleteVehicle(null)} vehicle={deleteVehicle} />
      <RestockVehicleModal isOpen={!!restockVehicle} onClose={() => setRestockVehicle(null)} vehicle={restockVehicle} />
    </div>
  );
};
