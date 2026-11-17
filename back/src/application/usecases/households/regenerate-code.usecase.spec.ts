import { RegenerateCodeUsecase } from './regenerate-code.usecase';
import { ForbiddenError } from '../../../domain/errors/forbidden.error';
import { householdsTestSetup } from '../../../../test/households.fixtures';

describe('RegenerateCodeUsecase', () => {
  const setup = async () => {
    const t = householdsTestSetup();
    await t.addHousehold('admin', 'h1', 'ABC234');
    await t.addMember('h1', 'u2');
    return {
      ...t,
      regenerate: new RegenerateCodeUsecase(t.households, t.members),
    };
  };

  it("remplace le code : l'ancien ne trouve plus le foyer", async () => {
    const t = await setup();
    const { code } = await t.regenerate.execute('admin', 'h1');

    expect(code).not.toBe('ABC234');
    expect(await t.households.findByCode('ABC234')).toBeNull();
    expect((await t.households.findByCode(code))?.id).toBe('h1');
  });

  it('membre non admin : 403, le code ne change pas', async () => {
    const t = await setup();
    await expect(t.regenerate.execute('u2', 'h1')).rejects.toThrow(
      ForbiddenError,
    );
    expect((await t.households.findById('h1'))?.code.value).toBe('ABC234');
  });
});
