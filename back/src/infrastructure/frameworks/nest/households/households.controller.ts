import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../guards/auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { CreateHouseholdUsecase } from '../../../../application/usecases/households/create-household.usecase';
import { JoinHouseholdUsecase } from '../../../../application/usecases/households/join-household.usecase';
import { ListMyHouseholdsUsecase } from '../../../../application/usecases/households/list-my-households.usecase';
import { ListMembersUsecase } from '../../../../application/usecases/households/list-members.usecase';
import { ApproveMemberUsecase } from '../../../../application/usecases/households/approve-member.usecase';
import { RejectMemberUsecase } from '../../../../application/usecases/households/reject-member.usecase';
import { UpdateMemberRoleUsecase } from '../../../../application/usecases/households/update-member-role.usecase';
import { KickMemberUsecase } from '../../../../application/usecases/households/kick-member.usecase';
import { RegenerateCodeUsecase } from '../../../../application/usecases/households/regenerate-code.usecase';
import { RenameHouseholdUsecase } from '../../../../application/usecases/households/rename-household.usecase';
import { DeleteHouseholdUsecase } from '../../../../application/usecases/households/delete-household.usecase';
import {
  CreateHouseholdDto,
  JoinHouseholdDto,
  RenameHouseholdDto,
  UpdateMemberRoleDto,
} from './household.dto';

type AuthUser = { sub: string };

// ParseUUIDPipe : un id mal formé renvoie 400 au lieu d'une erreur Postgres (500).
const uuid = new ParseUUIDPipe();

@Controller('households')
@UseGuards(AuthGuard)
export class HouseholdsController {
  constructor(
    private readonly createHousehold: CreateHouseholdUsecase,
    private readonly joinHousehold: JoinHouseholdUsecase,
    private readonly listMyHouseholds: ListMyHouseholdsUsecase,
    private readonly listMembers: ListMembersUsecase,
    private readonly approveMember: ApproveMemberUsecase,
    private readonly rejectMember: RejectMemberUsecase,
    private readonly updateMemberRole: UpdateMemberRoleUsecase,
    private readonly kickMember: KickMemberUsecase,
    private readonly regenerateCode: RegenerateCodeUsecase,
    private readonly renameHousehold: RenameHouseholdUsecase,
    private readonly deleteHousehold: DeleteHouseholdUsecase,
  ) {}

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateHouseholdDto) {
    return this.createHousehold.execute(user.sub, dto);
  }

  @Post('join')
  join(@CurrentUser() user: AuthUser, @Body() dto: JoinHouseholdDto) {
    return this.joinHousehold.execute(user.sub, dto);
  }

  @Get('me')
  mine(@CurrentUser() user: AuthUser) {
    return this.listMyHouseholds.execute(user.sub);
  }

  @Patch(':id')
  rename(
    @CurrentUser() user: AuthUser,
    @Param('id', uuid) id: string,
    @Body() dto: RenameHouseholdDto,
  ) {
    return this.renameHousehold.execute(user.sub, id, dto);
  }

  // Supprime le foyer et toutes ses adhésions, même s'il reste d'autres membres (admin).
  @Delete(':id')
  deleteOne(@CurrentUser() user: AuthUser, @Param('id', uuid) id: string) {
    return this.deleteHousehold.execute(user.sub, id);
  }

  @Get(':id/members')
  members(@CurrentUser() user: AuthUser, @Param('id', uuid) id: string) {
    return this.listMembers.execute(user.sub, id);
  }

  @Post(':id/members/:userId/approve')
  @HttpCode(HttpStatus.OK)
  approve(
    @CurrentUser() user: AuthUser,
    @Param('id', uuid) id: string,
    @Param('userId', uuid) userId: string,
  ) {
    return this.approveMember.execute(user.sub, id, userId);
  }

  // Refuser une demande en attente (la ligne est supprimée, l'utilisateur peut redemander).
  @Delete(':id/members/:userId/request')
  reject(
    @CurrentUser() user: AuthUser,
    @Param('id', uuid) id: string,
    @Param('userId', uuid) userId: string,
  ) {
    return this.rejectMember.execute(user.sub, id, userId);
  }

  @Patch(':id/members/:userId')
  updateRole(
    @CurrentUser() user: AuthUser,
    @Param('id', uuid) id: string,
    @Param('userId', uuid) userId: string,
    @Body() dto: UpdateMemberRoleDto,
  ) {
    return this.updateMemberRole.execute(user.sub, id, userId, dto.role);
  }

  // Sur soi-même : quitter le foyer (ou annuler sa demande). Sur un autre : l'exclure (admin).
  @Delete(':id/members/:userId')
  remove(
    @CurrentUser() user: AuthUser,
    @Param('id', uuid) id: string,
    @Param('userId', uuid) userId: string,
  ) {
    return this.kickMember.execute(user.sub, id, userId);
  }

  @Post(':id/code/regenerate')
  @HttpCode(HttpStatus.OK)
  regenerate(@CurrentUser() user: AuthUser, @Param('id', uuid) id: string) {
    return this.regenerateCode.execute(user.sub, id);
  }
}
