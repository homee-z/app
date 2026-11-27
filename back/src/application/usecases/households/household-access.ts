import { HouseholdMember } from '../../../domain/entities/household-member.entity';
import { Household } from '../../../domain/entities/household.entity';
import { HouseholdCode } from '../../../domain/value-objects/household-code.value-object';
import { ConflictError } from '../../../domain/errors/conflict.error';
import { ForbiddenError } from '../../../domain/errors/forbidden.error';
import { NotFoundError } from '../../../domain/errors/not-found.error';
import {
  DefaultHouseholdRepositoryInterface,
  HouseholdMemberRepositoryInterface,
} from '../../repositories/household-member.repository.interface';
import { HouseholdRepositoryInterface } from '../../repositories/household.repository.interface';

// Un non-membre (ou une demande en attente) reçoit 404 : on ne révèle pas l'existence du foyer.
export async function requireActiveMember(
  members: HouseholdMemberRepositoryInterface,
  householdId: string,
  userId: string,
): Promise<HouseholdMember> {
  const membership = await members.findOne(householdId, userId);
  if (!membership || !membership.isActive()) {
    throw new NotFoundError('Household not found');
  }
  return membership;
}

// Membre actif mais pas admin : 403.
export async function requireActiveAdmin(
  members: HouseholdMemberRepositoryInterface,
  householdId: string,
  userId: string,
): Promise<HouseholdMember> {
  const membership = await requireActiveMember(members, householdId, userId);
  if (!membership.isAdmin()) {
    throw new ForbiddenError('Only an admin can do this');
  }
  return membership;
}

export async function requireTargetMember(
  members: HouseholdMemberRepositoryInterface,
  householdId: string,
  userId: string,
): Promise<HouseholdMember> {
  const target = await members.findOne(householdId, userId);
  if (!target) throw new NotFoundError('Member not found');
  return target;
}

// Retirer ou rétrograder `target` ne doit pas laisser le foyer sans admin actif.
export async function assertNotLastAdmin(
  members: HouseholdMemberRepositoryInterface,
  target: HouseholdMember,
): Promise<void> {
  if (!target.isAdmin()) return;
  const admins = await members.countActiveAdmins(target.householdId);
  if (admins <= 1) {
    throw new ConflictError('A household must keep at least one admin');
  }
}

// Foyer par défaut parmi les adhésions d'un utilisateur : celle marquée, sinon la plus
// ancienne adhésion active (undefined s'il n'a aucun foyer actif).
export function pickDefaultMembership(
  memberships: HouseholdMember[],
): HouseholdMember | undefined {
  const active = memberships.filter((m) => m.isActive());
  if (active.length === 0) return undefined;
  return (
    active.find((m) => m.isDefault) ??
    active.reduce((a, b) => (b.createdAt < a.createdAt ? b : a))
  );
}

// Garantit qu'un utilisateur qui a au moins un foyer actif en a un par défaut.
// À appeler après tout changement qui peut lui en donner un premier (validation)
// ou lui retirer le sien (départ, exclusion, suppression du foyer).
export async function ensureDefaultHousehold(
  members: DefaultHouseholdRepositoryInterface,
  userId: string,
): Promise<void> {
  const picked = pickDefaultMembership(await members.findByUser(userId));
  if (picked && !picked.isDefault) {
    await members.setDefault(userId, picked.householdId);
  }
}

const MAX_CODE_ATTEMPTS = 5;

// 32^6 ≈ 1 milliard de codes : une collision est très rare, on réessaie quelques fois.
export async function generateUniqueCode(
  households: HouseholdRepositoryInterface,
): Promise<HouseholdCode> {
  for (let attempt = 0; attempt < MAX_CODE_ATTEMPTS; attempt++) {
    const code = new HouseholdCode();
    if (!(await households.findByCode(code))) return code;
  }
  throw new Error('Could not generate a unique household code');
}

export async function requireHousehold(
  households: HouseholdRepositoryInterface,
  householdId: string,
): Promise<Household> {
  const household = await households.findById(householdId);
  if (!household) throw new NotFoundError('Household not found');
  return household;
}
