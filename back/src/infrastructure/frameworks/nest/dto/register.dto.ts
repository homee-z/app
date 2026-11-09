import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Format email invalide' })
  @IsNotEmpty({ message: 'L email est requis' })
  email: string;

  @IsString()
  @MinLength(12, { message: 'Le mot de passe doit comporter au moins 12 caractères' })
  @IsNotEmpty({ message: 'Le mot de passe est requis' })
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'Le prénom est requis' })
  firstName: string;

  @IsString()
  @IsNotEmpty({ message: 'Le nom est requis' })
  lastName: string;
}
