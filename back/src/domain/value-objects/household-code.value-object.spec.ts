import {
  HouseholdCode,
  InvalidHouseholdCodeException,
} from './household-code.value-object';

describe('HouseholdCode Value Object', () => {
  it('génère un code valide de 6 caractères sans 0/O/1/I', () => {
    for (let i = 0; i < 200; i++) {
      const code = new HouseholdCode();
      expect(code.value).toMatch(/^[A-HJ-NP-Z2-9]{6}$/);
    }
  });

  it('normalise un code saisi (majuscules, espaces)', () => {
    expect(new HouseholdCode('  abc234 ').value).toBe('ABC234');
  });

  it('refuse un code invalide', () => {
    expect(() => new HouseholdCode('ABC12')).toThrow(
      InvalidHouseholdCodeException,
    );
    expect(() => new HouseholdCode('ABCDEFG')).toThrow(
      InvalidHouseholdCodeException,
    );
    expect(() => new HouseholdCode('ABC0EF')).toThrow(
      InvalidHouseholdCodeException,
    );
    expect(() => new HouseholdCode('')).toThrow(InvalidHouseholdCodeException);
  });

  it('compare deux codes avec equals()', () => {
    expect(
      new HouseholdCode('abc234').equals(new HouseholdCode('ABC234')),
    ).toBe(true);
    expect(
      new HouseholdCode('ABC234').equals(new HouseholdCode('ABC235')),
    ).toBe(false);
  });
});
