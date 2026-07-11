export interface TokenOptions {
  expiresIn?: string | number;
}

export interface ITokenService {
  generate(payload: Record<string, unknown>, options?: TokenOptions): string;
  verify(token: string, options?: TokenOptions): Record<string, unknown>;
}
