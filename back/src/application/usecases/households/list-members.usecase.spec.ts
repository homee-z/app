import { ListMembersUsecase } from './list-members.usecase';
import { NotFoundError } from '../../../domain/errors/not-found.error';
import { householdsTestSetup } from '../../../../test/households.fixtures';

describe('ListMembersUsecase', () => {
  const setup = async () => {
    const t = householdsTestSetup();
    await t.addUser('admin', 'Alice');
    await t.addUser('u2', 'Bob');
    await t.addUser('u3', 'Carol');
    await t.addHousehold('admin', 'h1');
    await t.addMember('h1', 'u2');
    await t.addMember('h1', 'u3', 'member', 'pending');
    return { ...t, list: new ListMembersUsecase(t.members, t.users) };
  };

  it("l'admin voit aussi les demandes en attente, avec les noms", async () => {
    const t = await setup();
    const views = await t.list.execute('admin', 'h1');
    expect(views).toHaveLength(3);
    expect(views.find((v) => v.userId === 'u3')).toMatchObject({
      firstName: 'Carol',
      status: 'pending',
    });
  });

  it('un membre ne voit que les membres actifs', async () => {
    const t = await setup();
    const views = await t.list.execute('u2', 'h1');
    expect(views.map((v) => v.userId).sort()).toEqual(['admin', 'u2']);
  });

  it('demande en attente ou non-membre : 404', async () => {
    const t = await setup();
    await expect(t.list.execute('u3', 'h1')).rejects.toThrow(NotFoundError);
    await expect(t.list.execute('inconnu', 'h1')).rejects.toThrow(
      NotFoundError,
    );
  });
});
