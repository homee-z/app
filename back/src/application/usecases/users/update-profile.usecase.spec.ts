import { User } from '../../../domain/entities/user.entity';
import { Email } from '../../../domain/value-objects/email.value-object';
import { ConflictError } from '../../../domain/errors/conflict.error';
import { NotFoundError } from '../../../domain/errors/not-found.error';
import { UserInMemoryRepository } from '../../../infrastructure/repositories/in-memory/user.in-memory.repository';
import { UpdateProfileUsecase } from './update-profile.usecase';

const makeUser = (id: string, email: string) =>
  new User({
    id,
    email: new Email(email),
    passwordHash: 'hash',
    firstName: 'Lyly',
    lastName: 'Martin',
  });

describe('UpdateProfileUsecase', () => {
  let repo: UserInMemoryRepository;
  let usecase: UpdateProfileUsecase;

  beforeEach(async () => {
    repo = new UserInMemoryRepository();
    usecase = new UpdateProfileUsecase(repo);
    await repo.save(makeUser('1', 'lyly@homeez.fr'));
    await repo.save(makeUser('2', 'karen@homeez.fr'));
  });

  it('updates the first name and keeps the last name', async () => {
    const profile = await usecase.execute('1', { firstName: 'Lytween' });
    expect(profile.firstName).toBe('Lytween');
    expect(profile.lastName).toBe('Martin');
    expect(profile.name).toBe('Lytween Martin');
  });

  it('allows keeping its own email', async () => {
    const profile = await usecase.execute('1', { email: 'LYLY@homeez.fr' });
    expect(profile.email).toBe('lyly@homeez.fr');
  });

  it('rejects an email used by another user', async () => {
    await expect(
      usecase.execute('1', { email: 'karen@homeez.fr' }),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it('throws NotFoundError for an unknown user', async () => {
    await expect(
      usecase.execute('999', { firstName: 'X' }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it('never exposes the password hash', async () => {
    const profile = await usecase.execute('1', {});
    expect(profile).not.toHaveProperty('passwordHash');
    expect(profile).not.toHaveProperty('verificationToken');
    expect(profile).not.toHaveProperty('twoFactorSecret');
  });

  it('does not persist anything when the email conflicts', async () => {
    await expect(
      usecase.execute('1', {
        firstName: 'Changed',
        email: 'karen@homeez.fr',
      }),
    ).rejects.toBeInstanceOf(ConflictError);

    const user = await repo.findById('1');
    expect(user?.firstName).toBe('Lyly');
  });
});
