import { AuthController } from "@adapters/controllers/AuthController";
import { RegisterUser } from "@usecases/auth/RegisterUser";
import { PrismaUserRepository } from "@adapters/repositories/PrismaUserRepository";
import { BcryptHashService } from "@adapters/services/BcryptHashService";

// Centrally instantiate concrete implementations for the entire backend application
// satisfy dependency inversion ports with clean DI manual mappings
const userRepository = new PrismaUserRepository();
const hashService = new BcryptHashService();

const registerUserUseCase = new RegisterUser(userRepository, hashService);

// Export instantiated controllers for route configurations
export const authController = new AuthController(registerUserUseCase);
