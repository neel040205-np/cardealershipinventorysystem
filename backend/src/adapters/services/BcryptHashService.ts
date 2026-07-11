import bcrypt from "bcrypt";
import { IHashService } from "@usecases/ports/IHashService";

export class BcryptHashService implements IHashService {
  private readonly saltRounds = 12;

  async hash(plaintext: string): Promise<string> {
    return bcrypt.hash(plaintext, this.saltRounds);
  }

  async compare(plaintext: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plaintext, hash);
  }
}
