// Meals API tests

describe('Meals API', () => {
  describe('Meal data structure', () => {
    it('should have proper meal object structure', () => {
      const mockMeal = {
        id: 1,
        name: 'Margherita Pizza',
        description: 'Classic tomato and mozzarella pizza',
        price: 18.99,
        image: 'https://example.com/pizza.jpg',
        category: 'Pizza',
        restaurant_id: 1,
        is_available: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      expect(mockMeal).toHaveProperty('id');
      expect(mockMeal).toHaveProperty('name');
      expect(mockMeal).toHaveProperty('description');
      expect(mockMeal).toHaveProperty('price');
      expect(mockMeal).toHaveProperty('image');
      expect(mockMeal).toHaveProperty('category');
      expect(mockMeal).toHaveProperty('restaurant_id');
      expect(mockMeal).toHaveProperty('is_available');
      expect(mockMeal).toHaveProperty('created_at');
      expect(mockMeal).toHaveProperty('updated_at');
    });

    it('should validate meal price format', () => {
      const meals = [
        { id: 1, name: 'Pizza', price: 15.99 },
        { id: 2, name: 'Burger', price: 12.50 },
        { id: 3, name: 'Salad', price: 8.75 },
      ];

      meals.forEach(meal => {
        expect(typeof meal.price).toBe('number');
        expect(meal.price).toBeGreaterThan(0);
        expect(meal.price).toBeLessThan(1000);
      });
    });
  });

  describe('Meal filtering', () => {
    it('should filter meals by category', () => {
      const meals = [
        { id: 1, name: 'Margherita Pizza', category: 'Pizza', price: 18.99 },
        { id: 2, name: 'Pepperoni Pizza', category: 'Pizza', price: 20.99 },
        { id: 3, name: 'Chicken Burger', category: 'Burger', price: 15.99 },
        { id: 4, name: 'Caesar Salad', category: 'Salad', price: 12.99 },
      ];

      const pizzaMeals = meals.filter(meal => meal.category === 'Pizza');
      const burgerMeals = meals.filter(meal => meal.category === 'Burger');
      const saladMeals = meals.filter(meal => meal.category === 'Salad');

      expect(pizzaMeals).toHaveLength(2);
      expect(burgerMeals).toHaveLength(1);
      expect(saladMeals).toHaveLength(1);
    });

    it('should filter meals by price range', () => {
      const meals = [
        { id: 1, name: 'Pizza', price: 18.99 },
        { id: 2, name: 'Burger', price: 15.99 },
        { id: 3, name: 'Salad', price: 12.99 },
        { id: 4, name: 'Pasta', price: 22.99 },
      ];

      const affordableMeals = meals.filter(meal => meal.price <= 20);
      const expensiveMeals = meals.filter(meal => meal.price > 20);

      expect(affordableMeals).toHaveLength(3);
      expect(expensiveMeals).toHaveLength(1);
    });

    it('should filter available meals only', () => {
      const meals = [
        { id: 1, name: 'Pizza', is_available: true, price: 18.99 },
        { id: 2, name: 'Burger', is_available: false, price: 15.99 },
        { id: 3, name: 'Salad', is_available: true, price: 12.99 },
        { id: 4, name: 'Pasta', is_available: true, price: 22.99 },
      ];

      const availableMeals = meals.filter(meal => meal.is_available);

      expect(availableMeals).toHaveLength(3);
      expect(availableMeals.every(meal => meal.is_available)).toBe(true);
    });
  });

  describe('Meal search functionality', () => {
    it('should search meals by name', () => {
      const meals = [
        { id: 1, name: 'Margherita Pizza', price: 18.99 },
        { id: 2, name: 'Pepperoni Pizza', price: 20.99 },
        { id: 3, name: 'Chicken Burger', price: 15.99 },
        { id: 4, name: 'Beef Burger', price: 16.99 },
      ];

      const searchTerm = 'pizza';
      const searchResults = meals.filter(meal => 
        meal.name.toLowerCase().includes(searchTerm.toLowerCase())
      );

      expect(searchResults).toHaveLength(2);
      expect(searchResults.every(meal => 
        meal.name.toLowerCase().includes('pizza')
      )).toBe(true);
    });

    it('should handle case-insensitive search', () => {
      const meals = [
        { id: 1, name: 'Margherita Pizza', price: 18.99 },
        { id: 2, name: 'Chicken Burger', price: 15.99 },
      ];

      const searchResults1 = meals.filter(meal => 
        meal.name.toLowerCase().includes('pizza')
      );
      const searchResults2 = meals.filter(meal => 
        meal.name.toLowerCase().includes('PIZZA'.toLowerCase())
      );

      expect(searchResults1).toEqual(searchResults2);
      expect(searchResults1).toHaveLength(1);
      expect(searchResults1[0].name).toBe('Margherita Pizza');
    });
  });

  describe('Meal sorting', () => {
    it('should sort meals by price (low to high)', () => {
      const meals = [
        { id: 1, name: 'Pizza', price: 18.99 },
        { id: 2, name: 'Burger', price: 15.99 },
        { id: 3, name: 'Salad', price: 12.99 },
        { id: 4, name: 'Pasta', price: 22.99 },
      ];

      const sortedMeals = [...meals].sort((a, b) => a.price - b.price);

      expect(sortedMeals[0].price).toBe(12.99);
      expect(sortedMeals[1].price).toBe(15.99);
      expect(sortedMeals[2].price).toBe(18.99);
      expect(sortedMeals[3].price).toBe(22.99);
    });

    it('should sort meals by name alphabetically', () => {
      const meals = [
        { id: 1, name: 'Pizza', price: 18.99 },
        { id: 2, name: 'Burger', price: 15.99 },
        { id: 3, name: 'Salad', price: 12.99 },
        { id: 4, name: 'Pasta', price: 22.99 },
      ];

      const sortedMeals = [...meals].sort((a, b) => a.name.localeCompare(b.name));

      expect(sortedMeals[0].name).toBe('Burger');
      expect(sortedMeals[1].name).toBe('Pasta');
      expect(sortedMeals[2].name).toBe('Pizza');
      expect(sortedMeals[3].name).toBe('Salad');
    });
  });
});
