import { HouseholdMember } from './household-member.entity';
import { DomainError } from '../errors/domain.error';

describe('HouseholdMember', () => {
  it('createAdmin crée un admin actif', () => {
    const m = HouseholdMember.createAdmin('m1', 'u1', 'h1');
    expect(m.role).toBe('admin');
    expect(m.isActive()).toBe(true);
    expect(m.isAdmin()).toBe(true);
  });

  it('requestToJoin crée un membre en attente, sans droits admin', () => {
    const m = HouseholdMember.requestToJoin('m1', 'u1', 'h1');
    expect(m.role).toBe('member');
    expect(m.isPending()).toBe(true);
    expect(m.isAdmin()).toBe(false);
  });

  it('un admin en attente ne compte pas comme admin', () => {
    const m = new HouseholdMember({
      id: 'm1',
      userId: 'u1',
      householdId: 'h1',
      role: 'admin',
      status: 'pending',
    });
    expect(m.isAdmin()).toBe(false);
  });

  it('approve active une demande, une seule fois', () => {
    const m = HouseholdMember.requestToJoin('m1', 'u1', 'h1');
    m.approve();
    expect(m.isActive()).toBe(true);
    expect(() => m.approve()).toThrow(DomainError);
  });

  it('changeRole est refusé tant que la demande est en attente', () => {
    const m = HouseholdMember.requestToJoin('m1', 'u1', 'h1');
    expect(() => m.changeRole('admin')).toThrow(DomainError);
    m.approve();
    m.changeRole('guest');
    expect(m.role).toBe('guest');
  });
});
