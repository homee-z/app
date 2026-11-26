import { Household, InvalidHouseholdNameException } from './household.entity';
import { HouseholdCode } from '../value-objects/household-code.value-object';

describe('Household', () => {
  it('nettoie le nom et génère un code si absent', () => {
    const h = new Household({ id: 'h1', name: '  Foyer Martin ' });
    expect(h.name).toBe('Foyer Martin');
    expect(HouseholdCode.isValid(h.code.value)).toBe(true);
    expect(h.createdAt).toBeInstanceOf(Date);
  });

  it('garde le code fourni', () => {
    const h = new Household({
      id: 'h1',
      name: 'Foyer',
      code: new HouseholdCode('ABC234'),
    });
    expect(h.code.value).toBe('ABC234');
  });

  it('refuse un nom trop court ou trop long, à la création comme au renommage', () => {
    expect(() => new Household({ id: 'h1', name: ' a ' })).toThrow(
      InvalidHouseholdNameException,
    );
    expect(() => new Household({ id: 'h1', name: 'a'.repeat(51) })).toThrow(
      InvalidHouseholdNameException,
    );
    const h = new Household({ id: 'h1', name: 'Foyer' });
    expect(() => h.rename('x')).toThrow(InvalidHouseholdNameException);
    expect(h.name).toBe('Foyer');
  });

  it('régénère un code valide et différent', () => {
    const h = new Household({
      id: 'h1',
      name: 'Foyer',
      code: new HouseholdCode('ABC234'),
    });
    h.regenerateCode();
    expect(h.code.value).not.toBe('ABC234');
    expect(HouseholdCode.isValid(h.code.value)).toBe(true);
  });
});
