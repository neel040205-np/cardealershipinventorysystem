import jwt from "jsonwebtoken";
import { ITokenService, TokenOptions } from "@usecases/ports/ITokenService";
import { env } from "@infra/config/environment";

export class JwtTokenService implements ITokenService {
  generate(payload: Record<string, unknown>, options?: TokenOptions): string {
    const secret = env.JWT_ACCESS_SECRET;
    return jwt.sign(payload, secret, {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expiresIn: (options?.expiresIn as any) || "1h"
    });
  }
}
