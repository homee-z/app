import { ShoppingItemEntity } from './shopping-item.entity';

describe('ShoppingItemEntity', () => {
  const baseProps = {
    id: 'item-1',
    shoppingListId: 'list-1',
    name: 'Tomates',
  };

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('creates a shopping item with default values', () => {
    const item = new ShoppingItemEntity(baseProps);

    expect(item.id).toBe('item-1');
    expect(item.shoppingListId).toBe('list-1');
    expect(item.name).toBe('Tomates');
    expect(item.quantity).toBeNull();
    expect(item.isChecked).toBe(false);
    expect(item.recipeIngredientId).toBeNull();
    expect(item.createdAt).toBeInstanceOf(Date);
    expect(item.updatedAt).toBeInstanceOf(Date);
  });

  it('creates a shopping item with explicit quantity and recipeIngredientId', () => {
    const item = new ShoppingItemEntity({
      ...baseProps,
      quantity: '2 kg',
      recipeIngredientId: 'ingredient-1',
    });

    expect(item.quantity).toBe('2 kg');
    expect(item.recipeIngredientId).toBe('ingredient-1');
  });

  describe('rename', () => {
    it('updates the name and bumps updatedAt', () => {
      const item = new ShoppingItemEntity(baseProps);
      const previousUpdatedAt = item.updatedAt;

      jest.advanceTimersByTime(1000);
      item.rename('Tomates cerises');

      expect(item.name).toBe('Tomates cerises');
      expect(item.updatedAt.getTime()).toBeGreaterThan(
        previousUpdatedAt.getTime(),
      );
    });
  });

  describe('updateQuantity', () => {
    it('updates the quantity and bumps updatedAt', () => {
      const item = new ShoppingItemEntity(baseProps);
      const previousUpdatedAt = item.updatedAt;

      jest.advanceTimersByTime(1000);
      item.updateQuantity('500 g');

      expect(item.quantity).toBe('500 g');
      expect(item.updatedAt.getTime()).toBeGreaterThan(
        previousUpdatedAt.getTime(),
      );
    });
  });

  describe('toggleChecked', () => {
    it('flips isChecked from false to true and back', () => {
      const item = new ShoppingItemEntity(baseProps);

      item.toggleChecked();
      expect(item.isChecked).toBe(true);

      item.toggleChecked();
      expect(item.isChecked).toBe(false);
    });

    it('bumps updatedAt', () => {
      const item = new ShoppingItemEntity(baseProps);
      const previousUpdatedAt = item.updatedAt;

      jest.advanceTimersByTime(1000);
      item.toggleChecked();

      expect(item.updatedAt.getTime()).toBeGreaterThan(
        previousUpdatedAt.getTime(),
      );
    });
  });

  describe('linkToRecipeIngredient / unlinkFromRecipeIngredient', () => {
    it('sets and clears the recipeIngredientId', () => {
      const item = new ShoppingItemEntity(baseProps);

      item.linkToRecipeIngredient('ingredient-2');
      expect(item.recipeIngredientId).toBe('ingredient-2');

      item.unlinkFromRecipeIngredient();
      expect(item.recipeIngredientId).toBeNull();
    });
  });
});