import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'),
        autoLoadEntities: true,
        // à désactiver dès qu'on aura des migrations — pour l'instant
        // ça crée/actualise les tables automatiquement à partir des entités
        synchronize: config.get<string>('NODE_ENV') !== 'production',
      }),
    }),
  ],
})
export class DatabaseModule {}
