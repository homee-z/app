import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Res,
  HttpCode,
  HttpStatus,
  UseGuards,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { RegisterUserUseCase } from '../../../../application/usecases/register-user.usecase';
import { LoginUserUseCase } from '../../../../application/usecases/login-user.usecase';
import { RefreshTokenUseCase } from '../../../../application/usecases/refresh-token.usecase';
import { RequestMagicLinkUseCase } from '../../../../application/usecases/request-magic-link.usecase';
import { VerifyMagicLinkUseCase } from '../../../../application/usecases/verify-magic-link.usecase';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { MagicLinkRequestDto } from '../dto/magic-link-request.dto';
import { MagicLinkVerifyDto } from '../dto/magic-link-verify.dto';
import { AuthGuard } from '../guards/auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import {
  AccountLockedException,
  InvalidCredentialsException,
  UserAlreadyExistsException,
  UserNotFoundException,
  WeakPasswordException,
} from '../../../../application/exceptions/auth.exceptions';
import { InvalidEmailException } from '../../../../domain/value-objects/email.value-object';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly loginUserUseCase: LoginUserUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly requestMagicLinkUseCase: RequestMagicLinkUseCase,
    private readonly verifyMagicLinkUseCase: VerifyMagicLinkUseCase,
    private readonly jwtService: JwtService,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  public async register(@Body() dto: RegisterDto) {
    try {
      const result = await this.registerUserUseCase.execute(dto);
      return {
        message: 'Compte créé avec succès',
        user: result,
      };
    } catch (error) {
      if (error instanceof UserAlreadyExistsException) {
        throw new ConflictException(error.message);
      }
      if (
        error instanceof WeakPasswordException ||
        error instanceof InvalidEmailException
      ) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  public async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    try {
      const user = await this.loginUserUseCase.execute(dto);

      const payload = {
        sub: user.userId,
        email: user.email,
        firstName: user.firstName,
        role: user.role,
        householdId: (user as any).householdId ?? null,
      };

      const accessToken = await this.jwtService.signAsync(payload, {
        expiresIn: '15m',
      });

      const refreshToken = await this.jwtService.signAsync(payload, {
        expiresIn: '7d',
      });

      response.cookie('access_token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000,
        path: '/',
      });

      response.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/',
      });

      return {
        message: 'Connexion réussie',
        user: {
          id: user.userId,
          firstName: user.firstName,
          email: user.email,
          role: user.role,
          householdId: (user as any).householdId ?? null,
        },
      };
    } catch (error) {
      if (error instanceof InvalidCredentialsException) {
        throw new UnauthorizedException('Identifiants incorrects');
      }
      if (error instanceof AccountLockedException) {
        throw new ForbiddenException('Compte temporairement bloqué suite à un nombre trop élevé de tentatives.');
      }
      throw error;
    }
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  public async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const rawRefreshToken = request.cookies?.['refresh_token'];
    if (!rawRefreshToken) {
      throw new UnauthorizedException('Refresh token manquant');
    }

    try {
      const payload = await this.jwtService.verifyAsync(rawRefreshToken);
      const user = await this.refreshTokenUseCase.execute({ userId: payload.sub });

      const newPayload = {
        sub: user.userId,
        email: user.email,
        firstName: user.firstName,
        role: user.role,
        householdId: (user as any).householdId ?? null,
      };

      const newAccessToken = await this.jwtService.signAsync(newPayload, {
        expiresIn: '15m',
      });

      const newRefreshToken = await this.jwtService.signAsync(newPayload, {
        expiresIn: '7d',
      });

      response.cookie('access_token', newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000,
        path: '/',
      });

      response.cookie('refresh_token', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/',
      });

      return { message: 'Session renouvelée avec succès' };
    } catch {
      throw new UnauthorizedException('Session expirée, veuillez vous reconnecter');
    }
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  public async logout(@Res({ passthrough: true }) response: Response) {
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
    };

    response.clearCookie('access_token', cookieOptions);
    response.clearCookie('refresh_token', cookieOptions);

    return { message: 'Déconnexion réussie' };
  }

  @Get('me')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  public async me(@CurrentUser() user: any) {
    return {
      id: user.sub,
      firstName: user.firstName,
      role: user.role,
      householdId: user.householdId ?? null,
    };
  }

  @Post('magic-link/request')
  @HttpCode(HttpStatus.OK)
  public async requestMagicLink(@Body() dto: MagicLinkRequestDto) {
    try {
      const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000';

      const magicToken = await this.jwtService.signAsync(
        { email: dto.email, type: 'magic_link' },
        { expiresIn: '15m' },
      );

      const magicLinkUrl = `${frontendUrl}/auth/verify?token=${magicToken}`;

      await this.requestMagicLinkUseCase.execute({
        email: dto.email,
        magicLinkUrl,
      });

      return {
        message: 'Si cette adresse est associée à un compte, un lien de connexion a été envoyé.',
      };
    } catch (error) {
      if (
        error instanceof UserNotFoundException ||
        error instanceof AccountLockedException
      ) {
        // Protection contre l'énumération d'utilisateurs (OWASP) :
        // On retourne la même réponse générique que l'utilisateur existe ou non.
        return {
          message: 'Si cette adresse est associée à un compte, un lien de connexion a été envoyé.',
        };
      }
      if (error instanceof InvalidEmailException) {
        throw new BadRequestException('Format d adresse email invalide');
      }
      throw error;
    }
  }

  @Post('magic-link/verify')
  @HttpCode(HttpStatus.OK)
  public async verifyMagicLink(
    @Body() dto: MagicLinkVerifyDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    try {
      const payload = await this.jwtService.verifyAsync(dto.token);

      if (payload.type !== 'magic_link' || !payload.email) {
        throw new UnauthorizedException('Lien de connexion invalide ou expiré');
      }

      const user = await this.verifyMagicLinkUseCase.execute({
        email: payload.email,
      });

      const tokenPayload = {
        sub: user.userId,
        email: user.email,
        firstName: user.firstName,
        role: user.role,
        householdId: (user as any).householdId ?? null,
      };

      const accessToken = await this.jwtService.signAsync(tokenPayload, {
        expiresIn: '15m',
      });

      const refreshToken = await this.jwtService.signAsync(tokenPayload, {
        expiresIn: '7d',
      });

      response.cookie('access_token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000,
        path: '/',
      });

      response.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/',
      });

      return {
        message: 'Connexion réussie',
        user: {
          id: user.userId,
          firstName: user.firstName,
          email: user.email,
          role: user.role,
          householdId: (user as any).householdId ?? null,
        },
      };
    } catch {
      throw new UnauthorizedException('Lien de connexion invalide ou expiré');
    }
  }
}
