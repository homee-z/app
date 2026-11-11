import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { AuthController } from './auth.controller';
import { RegisterUserUseCase } from '../../../../application/usecases/register-user.usecase';
import { LoginUserUseCase } from '../../../../application/usecases/login-user.usecase';
import { RefreshTokenUseCase } from '../../../../application/usecases/refresh-token.usecase';
import { RequestMagicLinkUseCase } from '../../../../application/usecases/request-magic-link.usecase';
import { VerifyMagicLinkUseCase } from '../../../../application/usecases/verify-magic-link.usecase';
import { InMemoryUserRepository } from '../../../repositories/in-memory/in-memory-user.repository';
import { BcryptPasswordHasher } from '../../../services/bcrypt-password-hasher';
import { IMailSender, SendMailOptions } from '../../../../application/services/mail-sender.interface';

class MockMailSender implements IMailSender {
  public sentMails: SendMailOptions[] = [];
  async sendMail(options: SendMailOptions): Promise<void> {
    this.sentMails.push(options);
  }
}

describe('AuthController - Flux Magic Link', () => {
  let controller: AuthController;
  let userRepo: InMemoryUserRepository;
  let hasher: BcryptPasswordHasher;
  let mailSender: MockMailSender;
  let jwtService: JwtService;

  beforeEach(() => {
    userRepo = new InMemoryUserRepository();
    hasher = new BcryptPasswordHasher();
    mailSender = new MockMailSender();
    jwtService = new JwtService({ secret: 'test_jwt_secret_key_123456789' });

    const registerUseCase = new RegisterUserUseCase(userRepo, hasher);
    const loginUseCase = new LoginUserUseCase(userRepo, hasher);
    const refreshUseCase = new RefreshTokenUseCase(userRepo);
    const requestMagicLinkUseCase = new RequestMagicLinkUseCase(userRepo, mailSender);
    const verifyMagicLinkUseCase = new VerifyMagicLinkUseCase(userRepo);

    controller = new AuthController(
      registerUseCase,
      loginUseCase,
      refreshUseCase,
      requestMagicLinkUseCase,
      verifyMagicLinkUseCase,
      jwtService,
    );
  });

  it('devrait envoyer un magic link par email puis valider la connexion', async () => {
    // 1. Créer un utilisateur
    await controller.register({
      firstName: 'Karen',
      lastName: 'ESGI',
      email: 'karen@homeez.fr',
      password: 'StrongP@ssw0rd123!',
    });

    // 2. Demander un Magic Link
    const requestResult = await controller.requestMagicLink({
      email: 'karen@homeez.fr',
    });

    expect(requestResult.message).toContain('lien de connexion');
    expect(mailSender.sentMails).toHaveLength(1);
    expect(mailSender.sentMails[0].to).toBe('karen@homeez.fr');

    // On extrait le token du mail généré
    const match = mailSender.sentMails[0].html.match(/token=([a-zA-Z0-9._-]+)/);
    expect(match).not.toBeNull();
    const token = match![1];

    // 3. Valider le token (simulation de la réponse HTTP avec cookies)
    const cookiesSet: Record<string, { val: string; options: any }> = {};
    const mockResponse = {
      cookie: (name: string, val: string, options: any) => {
        cookiesSet[name] = { val, options };
      },
    } as unknown as Response;

    const verifyResult = await controller.verifyMagicLink(
      { token },
      mockResponse,
    );

    expect(verifyResult.message).toBe('Connexion réussie');
    expect(verifyResult.user.firstName).toBe('Karen');
    expect(verifyResult.user.email).toBe('karen@homeez.fr');

    // Vérifier que les cookies sont bien posés
    expect(cookiesSet['access_token']).toBeDefined();
    expect(cookiesSet['access_token'].options.httpOnly).toBe(true);
    expect(cookiesSet['access_token'].options.path).toBe('/');
    expect(cookiesSet['access_token'].options.sameSite).toBe('lax');

    expect(cookiesSet['refresh_token']).toBeDefined();
    expect(cookiesSet['refresh_token'].options.httpOnly).toBe(true);
    expect(cookiesSet['refresh_token'].options.path).toBe('/');
  });
});

