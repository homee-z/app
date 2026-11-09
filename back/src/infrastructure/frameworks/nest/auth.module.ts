import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserTypeOrmEntity } from '../../repositories/postgres/entities/user.typeorm-entity';
import { TypeOrmUserRepository } from '../../repositories/postgres/typeorm-user.repository';
import { InMemoryUserRepository } from '../../repositories/in-memory/in-memory-user.repository';
import { BcryptPasswordHasher } from '../../services/bcrypt-password-hasher';
import { NodemailerMailSender } from '../../services/nodemailer-mail-sender';
import { USER_REPOSITORY } from '../../../application/repositories/user.repository.interface';
import { PASSWORD_HASHER } from '../../../application/services/password-hasher.interface';
import { MAIL_SENDER } from '../../../application/services/mail-sender.interface';
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
    TypeOrmModule.forFeature([UserTypeOrmEntity]),
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
      provide: USER_REPOSITORY,
      useClass: TypeOrmUserRepository,
    },
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
      useFactory: (
        userRepo: TypeOrmUserRepository,
        hasher: BcryptPasswordHasher,
      ) => new RegisterUserUseCase(userRepo, hasher),
      inject: [USER_REPOSITORY, PASSWORD_HASHER],
    },
    {
      provide: LoginUserUseCase,
      useFactory: (
        userRepo: TypeOrmUserRepository,
        hasher: BcryptPasswordHasher,
      ) => new LoginUserUseCase(userRepo, hasher),
      inject: [USER_REPOSITORY, PASSWORD_HASHER],
    },
    {
      provide: RefreshTokenUseCase,
      useFactory: (userRepo: TypeOrmUserRepository) =>
        new RefreshTokenUseCase(userRepo),
      inject: [USER_REPOSITORY],
    },
    {
      provide: RequestMagicLinkUseCase,
      useFactory: (userRepo: TypeOrmUserRepository, mailSender: NodemailerMailSender) =>
        new RequestMagicLinkUseCase(userRepo, mailSender),
      inject: [USER_REPOSITORY, MAIL_SENDER],
    },
    {
      provide: VerifyMagicLinkUseCase,
      useFactory: (userRepo: TypeOrmUserRepository) =>
        new VerifyMagicLinkUseCase(userRepo),
      inject: [USER_REPOSITORY],
    },
  ],
  exports: [USER_REPOSITORY, PASSWORD_HASHER, MAIL_SENDER, AuthGuard, RolesGuard, JwtModule],
})
export class AuthModule {}
