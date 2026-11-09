import { IsEmail, IsNotEmpty } from 'class-validator';

export class MagicLinkRequestDto {
  @IsEmail({}, { message: 'Veuillez renseigner une adresse email valide' })
  @IsNotEmpty({ message: 'L adresse email est requise' })
  email!: string;
}

