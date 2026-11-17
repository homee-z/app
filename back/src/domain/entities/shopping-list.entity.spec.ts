import { ShoppingListEntity } from './shopping-list.entity';

describe('ShoppingListEntity', () => {
  const baseProps = {
    id: 'list-1',
    householdId: 'household-1',
    name: 'Courses de la semaine',
  };

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('creates a shopping list with default values', () => {
    const list = new ShoppingListEntity(baseProps);

    expect(list.id).toBe('list-1');
    expect(list.householdId).toBe('household-1');
    expect(list.name).toBe('Courses de la semaine');
    expect(list.choreId).toBeNull();
    expect(list.createdAt).toBeInstanceOf(Date);
    expect(list.updatedAt).toBeInstanceOf(Date);
  });

  it('creates a shopping list with an explicit choreId', () => {
    const list = new ShoppingListEntity({ ...baseProps, choreId: 'chore-1' });

    expect(list.choreId).toBe('chore-1');
  });

  describe('rename', () => {
    it('updates the name and bumps updatedAt', () => {
      const list = new ShoppingListEntity(baseProps);
      const previousUpdatedAt = list.updatedAt;

      jest.advanceTimersByTime(1000);
      list.rename('Courses du mois');

      expect(list.name).toBe('Courses du mois');
      expect(list.updatedAt.getTime()).toBeGreaterThan(
        previousUpdatedAt.getTime(),
      );
    });
  });

  describe('linkToChore', () => {
    it('sets the choreId and bumps updatedAt', () => {
      const list = new ShoppingListEntity(baseProps);
      const previousUpdatedAt = list.updatedAt;

      jest.advanceTimersByTime(1000);
      list.linkToChore('chore-2');

      expect(list.choreId).toBe('chore-2');
      expect(list.updatedAt.getTime()).toBeGreaterThan(
        previousUpdatedAt.getTime(),
      );
    });
  });

  describe('unlinkFromChore', () => {
    it('resets choreId to null and bumps updatedAt', () => {
      const list = new ShoppingListEntity({ ...baseProps, choreId: 'chore-3' });
      const previousUpdatedAt = list.updatedAt;

      jest.advanceTimersByTime(1000);
      list.unlinkFromChore();

      expect(list.choreId).toBeNull();
      expect(list.updatedAt.getTime()).toBeGreaterThan(
        previousUpdatedAt.getTime(),
      );
    });
  });
});