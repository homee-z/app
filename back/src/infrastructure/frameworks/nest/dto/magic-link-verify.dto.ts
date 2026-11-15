import { IsNotEmpty, IsString } from 'class-validator';

export class MagicLinkVerifyDto {
  @IsString({ message: 'Le token doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Le token de vérification est requis' })
  token!: string;
}

