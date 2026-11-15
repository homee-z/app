import { User } from '../../../../domain/entities/user.entity';
import { Email } from '../../../../domain/value-objects/email.value-object';
import { NotFoundError } from '../../../../domain/errors/not-found.error';
import { UserInMemoryRepository } from '../../../repositories/in-memory/user.in-memory.repository';
import { GetProfileUsecase } from '../../../../application/usecases/users/get-profile.usecase';
import { UpdateProfileUsecase } from '../../../../application/usecases/users/update-profile.usecase';
import { DeleteAccountUsecase } from '../../../../application/usecases/users/delete-account.usecase';
import { UsersController } from './users.controller';

describe('UsersController', () => {
  let repo: UserInMemoryRepository;
  let controller: UsersController;
  const me = { sub: '1' };

  beforeEach(async () => {
    repo = new UserInMemoryRepository();
    controller = new UsersController(
      new GetProfileUsecase(repo),
      new UpdateProfileUsecase(repo),
      new DeleteAccountUsecase(repo),
    );
    await repo.save(
      new User({
        id: '1',
        email: new Email('lyly@homeez.fr'),
        passwordHash: 'hash',
        firstName: 'Lyly',
        lastName: 'Martin',
      }),
    );
  });

  it('returns the profile of the connected user', async () => {
    const profile = await controller.get(me);
    expect(profile.email).toBe('lyly@homeez.fr');
    expect(profile).not.toHaveProperty('passwordHash');
  });

  it('updates the profile of the connected user', async () => {
    const profile = await controller.update(me, { lastName: 'Durand' });
    expect(profile.name).toBe('Lyly Durand');
  });

  it('deletes the account and clears the auth cookies', async () => {
    const res = { clearCookie: jest.fn() };
    await controller.remove(me, res as never);
    expect(await repo.findById('1')).toBeNull();
    expect(res.clearCookie).toHaveBeenCalledWith(
      'access_token',
      expect.objectContaining({ httpOnly: true, path: '/' }),
    );
    expect(res.clearCookie).toHaveBeenCalledWith(
      'refresh_token',
      expect.objectContaining({ httpOnly: true, path: '/' }),
    );
  });

  it('does not clear cookies when the account does not exist', async () => {
    const res = { clearCookie: jest.fn() };
    await expect(
      controller.remove({ sub: '999' }, res as never),
    ).rejects.toBeInstanceOf(NotFoundError);
    expect(res.clearCookie).not.toHaveBeenCalled();
  });
});
