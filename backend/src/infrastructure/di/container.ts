import { AuthController } from "@adapters/controllers/AuthController";
import { VehicleController } from "@adapters/controllers/VehicleController";
import { RegisterUser } from "@usecases/auth/RegisterUser";
import { LoginUser } from "@usecases/auth/LoginUser";
import { CreateVehicle } from "@usecases/vehicle/CreateVehicle";
import { ListVehicles } from "@usecases/vehicle/ListVehicles";
import { SearchVehicles } from "@usecases/vehicle/SearchVehicles";
import { UpdateVehicle } from "@usecases/vehicle/UpdateVehicle";
import { DeleteVehicle } from "@usecases/vehicle/DeleteVehicle";
import { PrismaUserRepository } from "@adapters/repositories/PrismaUserRepository";
import { PrismaVehicleRepository } from "@adapters/repositories/PrismaVehicleRepository";
import { BcryptHashService } from "@adapters/services/BcryptHashService";
import { JwtTokenService } from "@adapters/services/JwtTokenService";

// Repositories
const userRepository = new PrismaUserRepository();
const vehicleRepository = new PrismaVehicleRepository();

// Services
const hashService = new BcryptHashService();
export const tokenService = new JwtTokenService();

// Auth Use Cases
const registerUserUseCase = new RegisterUser(userRepository, hashService);
const loginUserUseCase = new LoginUser(userRepository, hashService, tokenService);

// Vehicle Use Cases
const createVehicleUseCase = new CreateVehicle(vehicleRepository);
const listVehiclesUseCase = new ListVehicles(vehicleRepository);
const searchVehiclesUseCase = new SearchVehicles(vehicleRepository);
const updateVehicleUseCase = new UpdateVehicle(vehicleRepository);
const deleteVehicleUseCase = new DeleteVehicle(vehicleRepository);

// Controllers
export const authController = new AuthController(registerUserUseCase, loginUserUseCase);
export const vehicleController = new VehicleController(
  createVehicleUseCase,
  listVehiclesUseCase,
  searchVehiclesUseCase,
  updateVehicleUseCase,
  deleteVehicleUseCase
);
