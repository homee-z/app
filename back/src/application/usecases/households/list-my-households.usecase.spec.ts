import { ListMyHouseholdsUsecase } from './list-my-households.usecase';
import { householdsTestSetup } from '../../../../test/households.fixtures';

describe('ListMyHouseholdsUsecase', () => {
  it('liste vide si aucun foyer', async () => {
    const t = householdsTestSetup();
    const list = new ListMyHouseholdsUsecase(t.households, t.members);
    expect(await list.execute('u1')).toEqual([]);
  });

  it('renvoie chaque foyer avec le rôle, le statut et le nombre de membres actifs', async () => {
    const t = householdsTestSetup();
    await t.addHousehold('u1', 'h1', 'AAAAAA');
    await t.addMember('h1', 'u2');
    await t.addMember('h1', 'u3', 'member', 'pending');
    await t.addHousehold('u9', 'h2', 'BBBBBB');
    await t.addMember('h2', 'u1', 'member', 'pending');
    await t.addHousehold('u9', 'h3', 'CCCCCC');

    const views = await new ListMyHouseholdsUsecase(
      t.households,
      t.members,
    ).execute('u1');

    expect(views).toHaveLength(2);
    const h1 = views.find((v) => v.id === 'h1')!;
    const h2 = views.find((v) => v.id === 'h2')!;
    expect(h1).toMatchObject({
      role: 'admin',
      status: 'active',
      memberCount: 2,
    });
    expect(h1.code).toBe('AAAAAA');
    expect(h2).toMatchObject({
      role: 'member',
      status: 'pending',
      memberCount: 1,
    });
    expect(h2.code).toBeUndefined();
  });
});
