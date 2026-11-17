import { IsIn, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import {
  HOUSEHOLD_ROLES,
  type HouseholdRole,
} from '../../../../domain/entities/household-member.entity';
import { HOUSEHOLD_NAME_MAX } from '../../../../domain/entities/household.entity';

// Validation de forme uniquement : les règles métier (2 à 50 caractères après trim,
// format du code) restent dans le domaine.
export class CreateHouseholdDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(HOUSEHOLD_NAME_MAX)
  name: string;
}

// Même validation de forme qu'à la création.
export class RenameHouseholdDto extends CreateHouseholdDto {}

export class JoinHouseholdDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  code: string;
}

export class UpdateMemberRoleDto {
  @IsIn(HOUSEHOLD_ROLES)
  role: HouseholdRole;
}
