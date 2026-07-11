import { Request, Response, NextFunction } from "express";
import { CreateVehicle } from "@usecases/vehicle/CreateVehicle";
import { ListVehicles } from "@usecases/vehicle/ListVehicles";
import { SearchVehicles } from "@usecases/vehicle/SearchVehicles";
import { UpdateVehicle } from "@usecases/vehicle/UpdateVehicle";
import { DeleteVehicle } from "@usecases/vehicle/DeleteVehicle";
import { PurchaseVehicle } from "@usecases/vehicle/PurchaseVehicle";
import { RestockVehicle } from "@usecases/vehicle/RestockVehicle";
import { sendSuccessResponse } from "@infra/express/utils/response";
import { VehicleMapper } from "@adapters/mappers/VehicleMapper";

export class VehicleController {
  constructor(
    private createUseCase: CreateVehicle,
    private listUseCase: ListVehicles,
    private searchUseCase: SearchVehicles,
    private updateUseCase: UpdateVehicle,
    private deleteUseCase: DeleteVehicle,
    private purchaseUseCase: PurchaseVehicle,
    private restockUseCase: RestockVehicle
  ) {}

  // POST /api/vehicles
  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { make, model, category, price, quantity } = req.body;
      const vehicle = await this.createUseCase.execute({ make, model, category, price, quantity });
      sendSuccessResponse(res, 201, { vehicle: VehicleMapper.toResponseDTO(vehicle) });
    } catch (error) {
      next(error);
    }
  };

  // GET /api/vehicles
  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = req.query.page ? Number(req.query.page) : undefined;
      const limit = req.query.limit ? Number(req.query.limit) : undefined;
      const result = await this.listUseCase.execute({ page, limit });
      sendSuccessResponse(res, 200, {
        vehicles: result.vehicles.map(VehicleMapper.toResponseDTO),
        total: result.total
      });
    } catch (error) {
      next(error);
    }
  };

  // GET /api/vehicles/search
  search = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { make, model, category, minPrice, maxPrice } = req.query;
      const filters = {
        make: make ? String(make) : undefined,
        model: model ? String(model) : undefined,
        category: category ? String(category) : undefined,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined
      };
      const result = await this.searchUseCase.execute(filters);
      sendSuccessResponse(res, 200, {
        vehicles: result.vehicles.map(VehicleMapper.toResponseDTO)
      });
    } catch (error) {
      next(error);
    }
  };

  // PUT /api/vehicles/:id
  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { make, model, category, price, quantity } = req.body;
      const vehicle = await this.updateUseCase.execute(id, { make, model, category, price, quantity });
      sendSuccessResponse(res, 200, { vehicle: VehicleMapper.toResponseDTO(vehicle) });
    } catch (error) {
      next(error);
    }
  };

  // DELETE /api/vehicles/:id
  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.deleteUseCase.execute(id);
      sendSuccessResponse(res, 200, null);
    } catch (error) {
      next(error);
    }
  };

  // POST /api/vehicles/:id/purchase
  purchase = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const vehicle = await this.purchaseUseCase.execute(id);
      sendSuccessResponse(res, 200, { vehicle: VehicleMapper.toResponseDTO(vehicle) });
    } catch (error) {
      next(error);
    }
  };

  // POST /api/vehicles/:id/restock
  restock = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { quantity } = req.body;
      const vehicle = await this.restockUseCase.execute(id, quantity);
      sendSuccessResponse(res, 200, { vehicle: VehicleMapper.toResponseDTO(vehicle) });
    } catch (error) {
      next(error);
    }
  };
}
