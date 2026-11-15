import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthGuard } from '../guards/auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { GetProfileUsecase } from '../../../../application/usecases/users/get-profile.usecase';
import { UpdateProfileUsecase } from '../../../../application/usecases/users/update-profile.usecase';
import { DeleteAccountUsecase } from '../../../../application/usecases/users/delete-account.usecase';
import { UpdateProfileDto } from './update-profile.dto';

// Mêmes options que le logout de l'auth : sinon le navigateur peut ne pas effacer les cookies.
const authCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

// La validation du DTO est assurée par le ValidationPipe global (main.ts).
@Controller('users/me')
@UseGuards(AuthGuard)
export class UsersController {
  constructor(
    private readonly getProfile: GetProfileUsecase,
    private readonly updateProfile: UpdateProfileUsecase,
    private readonly deleteAccount: DeleteAccountUsecase,
  ) {}

  @Get()
  get(@CurrentUser() user: { sub: string }) {
    return this.getProfile.execute(user.sub);
  }

  @Patch()
  update(@CurrentUser() user: { sub: string }, @Body() dto: UpdateProfileDto) {
    return this.updateProfile.execute(user.sub, dto);
  }

  @Delete()
  async remove(
    @CurrentUser() user: { sub: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.deleteAccount.execute(user.sub);
    res.clearCookie('access_token', authCookieOptions);
    res.clearCookie('refresh_token', authCookieOptions);
  }
}
