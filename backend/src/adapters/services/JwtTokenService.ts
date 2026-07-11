import jwt from "jsonwebtoken";
import { ITokenService } from "@usecases/ports/ITokenService";
import { env } from "@infra/config/environment";

export class JwtTokenService implements ITokenService {
  generate(payload: { userId: string; email: string; role: string }): string {
    return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
      expiresIn: "1h"
    });
  }
}
