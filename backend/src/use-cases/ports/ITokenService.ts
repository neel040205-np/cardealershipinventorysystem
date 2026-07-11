export interface ITokenService {
  generate(payload: { userId: string; email: string; role: string }): string;
}
