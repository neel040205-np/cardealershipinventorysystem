import { User, Role } from "@prisma/client";
import { User as UserDomain } from "@domain/entities/User";
import { IUserRepository } from "../ports/IUserRepository";
import { IHashService } from "../ports/IHashService";
import { ConflictError } from "@domain/exceptions/AppError";

export class RegisterUser {
  constructor(
    private userRepo: IUserRepository,
    private hashService: IHashService
  ) {}

  async execute(dto: { name: string; email: string; password: string; role?: Role }): Promise<User> {
    const role = dto.role || Role.SALES_REP;

    // 1. Validate domain invariants using User entity static constructor
    UserDomain.create(dto.name, dto.email, dto.password, role);

    // 2. Verify email uniqueness
    const existing = await this.userRepo.findByEmail(dto.email);
    if (existing) {
      throw new ConflictError("A user with this email address is already registered.");
    }

    // 3. Hash raw password securely
    const passwordHash = await this.hashService.hash(dto.password);

    // 4. Persist to database
    return this.userRepo.create({
      name: dto.name,
      email: dto.email,
      passwordHash,
      role
    });
  }
}
