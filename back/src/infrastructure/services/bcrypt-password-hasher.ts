import * as bcrypt from 'bcrypt';
import { IPasswordHasher } from '../../application/services/password-hasher.interface';

export class BcryptPasswordHasher implements IPasswordHasher {
  private readonly saltRounds = 12;

  public async hash(plainText: string): Promise<string> {
    return bcrypt.hash(plainText, this.saltRounds);
  }

  public async compare(plainText: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plainText, hash);
  }
}
