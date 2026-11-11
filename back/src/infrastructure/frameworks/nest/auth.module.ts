import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { InMemoryUserRepository } from '../../repositories/in-memory/in-memory-user.repository';
import { BcryptPasswordHasher } from '../../services/bcrypt-password-hasher';
import { NodemailerMailSender } from '../../services/nodemailer-mail-sender';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '../../../application/repositories/user.repository.interface';
import {
  IPasswordHasher,
  PASSWORD_HASHER,
} from '../../../application/services/password-hasher.interface';
import {
  IMailSender,
  MAIL_SENDER,
} from '../../../application/services/mail-sender.interface';
import { RegisterUserUseCase } from '../../../application/usecases/register-user.usecase';
import { LoginUserUseCase } from '../../../application/usecases/login-user.usecase';
import { RefreshTokenUseCase } from '../../../application/usecases/refresh-token.usecase';
import { RequestMagicLinkUseCase } from '../../../application/usecases/request-magic-link.usecase';
import { VerifyMagicLinkUseCase } from '../../../application/usecases/verify-magic-link.usecase';
import { AuthController } from './controllers/auth.controller';
import { AuthGuard } from './guards/auth.guard';
import { RolesGuard } from './guards/roles.guard';

@Module({
  imports: [
    UsersModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const secret = config.get<string>('JWT_SECRET');
        if (!secret) {
          throw new Error('Variable d environnement JWT_SECRET manquante.');
        }
        return {
          secret,
          signOptions: { expiresIn: '15m' },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthGuard,
    RolesGuard,
    InMemoryUserRepository,
    {
      provide: PASSWORD_HASHER,
      useClass: BcryptPasswordHasher,
    },
    {
      provide: MAIL_SENDER,
      useClass: NodemailerMailSender,
    },
    {
      provide: RegisterUserUseCase,
      useFactory: (userRepo: IUserRepository, hasher: IPasswordHasher) =>
        new RegisterUserUseCase(userRepo, hasher),
      inject: [USER_REPOSITORY, PASSWORD_HASHER],
    },
    {
      provide: LoginUserUseCase,
      useFactory: (userRepo: IUserRepository, hasher: IPasswordHasher) =>
        new LoginUserUseCase(userRepo, hasher),
      inject: [USER_REPOSITORY, PASSWORD_HASHER],
    },
    {
      provide: RefreshTokenUseCase,
      useFactory: (userRepo: IUserRepository) =>
        new RefreshTokenUseCase(userRepo),
      inject: [USER_REPOSITORY],
    },
    {
      provide: RequestMagicLinkUseCase,
      useFactory: (userRepo: IUserRepository, mailSender: IMailSender) =>
        new RequestMagicLinkUseCase(userRepo, mailSender),
      inject: [USER_REPOSITORY, MAIL_SENDER],
    },
    {
      provide: VerifyMagicLinkUseCase,
      useFactory: (userRepo: IUserRepository) =>
        new VerifyMagicLinkUseCase(userRepo),
      inject: [USER_REPOSITORY],
    },
  ],
  exports: [PASSWORD_HASHER, MAIL_SENDER, AuthGuard, RolesGuard, JwtModule],
})
export class AuthModule {}
