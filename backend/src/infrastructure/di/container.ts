import { AuthController } from "@adapters/controllers/AuthController";
import { RegisterUser } from "@usecases/auth/RegisterUser";
import { LoginUser } from "@usecases/auth/LoginUser";
import { PrismaUserRepository } from "@adapters/repositories/PrismaUserRepository";
import { BcryptHashService } from "@adapters/services/BcryptHashService";
import { JwtTokenService } from "@adapters/services/JwtTokenService";

// Centrally instantiate concrete implementations for the entire backend application
// satisfy dependency inversion ports with clean DI manual mappings
const userRepository = new PrismaUserRepository();
const hashService = new BcryptHashService();
const tokenService = new JwtTokenService();

const registerUserUseCase = new RegisterUser(userRepository, hashService);
const loginUserUseCase = new LoginUser(userRepository, hashService, tokenService);

// Export instantiated controllers for route configurations
export const authController = new AuthController(registerUserUseCase, loginUserUseCase);
