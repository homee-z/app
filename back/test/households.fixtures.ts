import { Household } from '../src/domain/entities/household.entity';
import {
  HouseholdMember,
  HouseholdMemberStatus,
  HouseholdRole,
} from '../src/domain/entities/household-member.entity';
import { User } from '../src/domain/entities/user.entity';
import { Email } from '../src/domain/value-objects/email.value-object';
import { HouseholdCode } from '../src/domain/value-objects/household-code.value-object';
import { HouseholdInMemoryRepository } from '../src/infrastructure/repositories/in-memory/household.in-memory.repository';
import { HouseholdMemberInMemoryRepository } from '../src/infrastructure/repositories/in-memory/household-member.in-memory.repository';
import { UserInMemoryRepository } from '../src/infrastructure/repositories/in-memory/user.in-memory.repository';

// Données de test partagées par les specs des usecases Households (repositories in-memory).
export function householdsTestSetup() {
  const members = new HouseholdMemberInMemoryRepository();
  const households = new HouseholdInMemoryRepository(members);
  const users = new UserInMemoryRepository();
  let seq = 0;

  const addUser = async (id: string, firstName = id) => {
    await users.save(
      new User({
        id,
        email: new Email(`${id}@test.io`),
        passwordHash: 'x',
        firstName,
        lastName: 'Test',
      }),
    );
  };

  const addHousehold = async (
    adminId: string,
    id = `h${++seq}`,
    code = 'ABC234',
  ) => {
    const household = new Household({
      id,
      name: 'Foyer test',
      code: new HouseholdCode(code),
    });
    await households.createWithAdmin(
      household,
      HouseholdMember.createAdmin(`m${++seq}`, adminId, id),
    );
    return household;
  };

  const addMember = async (
    householdId: string,
    userId: string,
    role: HouseholdRole = 'member',
    status: HouseholdMemberStatus = 'active',
  ) => {
    await members.save(
      new HouseholdMember({
        id: `m${++seq}`,
        userId,
        householdId,
        role,
        status,
      }),
    );
  };

  return { households, members, users, addUser, addHousehold, addMember };
}
