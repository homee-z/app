import { Module } from '@nestjs/common';
import { AuthModule } from '../auth.module';
import { UsersModule } from './users.module';
import { UsersController } from './users.controller';

// Module séparé : AuthModule importe déjà UsersModule, donc mettre le controller
// (qui a besoin d'AuthGuard / JwtService) dans UsersModule créerait une dépendance circulaire.
@Module({
  imports: [UsersModule, AuthModule],
  controllers: [UsersController],
})
export class UsersHttpModule {}
