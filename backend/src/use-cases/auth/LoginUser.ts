import { User } from "@prisma/client";
import { IUserRepository } from "../ports/IUserRepository";
import { IHashService } from "../ports/IHashService";
import { ITokenService } from "../ports/ITokenService";
import { UnauthorizedError } from "@domain/exceptions/AppError";

export class LoginUser {
  constructor(
    private userRepo: IUserRepository,
    private hashService: IHashService,
    private tokenService: ITokenService
  ) {}

  async execute(dto: { email: string; password: string }): Promise<{ token: string; user: User }> {
    // 1. Find user by email
    const user = await this.userRepo.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedError("Invalid email or password.");
    }

    // 2. Verify hashed password
    const isPasswordValid = await this.hashService.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedError("Invalid email or password.");
    }

    // 3. Generate JWT access token
    const token = this.tokenService.generate({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    return { token, user };
  }
}
