import React from 'react';
import { render, act } from '@testing-library/react-native';
import { View, Text } from 'react-native';
import { CartProvider, useCart } from '../../context/CartContext';

// Test component to access cart context
const TestComponent = () => {
  const cart = useCart();
  return (
    <View>
      <Text testID="itemCount">{cart.itemCount}</Text>
      <Text testID="total">{cart.total}</Text>
      <Text testID="items">{JSON.stringify(cart.items)}</Text>
    </View>
  );
};

describe('CartContext', () => {
  describe('CartProvider', () => {
    it('should provide initial empty cart state', () => {
      const { getByTestId } = render(
        <CartProvider>
          <TestComponent />
        </CartProvider>
      );

      expect(getByTestId('itemCount').children[0]).toBe('0');
      expect(getByTestId('total').children[0]).toBe('0');
      expect(getByTestId('items').children[0]).toBe('[]');
    });

    it('should throw error when useCart is used outside CartProvider', () => {
      // Suppress console.error for this test
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      expect(() => {
        render(<TestComponent />);
      }).toThrow('useCart must be used within a CartProvider');

      consoleSpy.mockRestore();
    });
  });

  describe('Cart operations', () => {
    let cartContext: any;

    const TestComponentWithMethods = () => {
      cartContext = useCart();
      return (
        <View>
          <Text testID="itemCount">{cartContext.itemCount}</Text>
          <Text testID="total">{cartContext.total}</Text>
          <Text testID="items">{JSON.stringify(cartContext.items)}</Text>
        </View>
      );
    };

    beforeEach(() => {
      render(
        <CartProvider>
          <TestComponentWithMethods />
        </CartProvider>
      );
    });

    it('should add item to cart', () => {
      const mockMeal = {
        id: 1,
        title: 'Pizza',
        price: 15.99,
        description: 'Delicious pizza',
        image: 'pizza.jpg',
        category: 'Italian',
        restaurant_id: 1,
        is_available: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      act(() => {
        cartContext.addToCart(mockMeal);
      });

      expect(cartContext.items).toHaveLength(1);
      expect(cartContext.items[0]).toEqual({
        ...mockMeal,
        quantity: 1,
      });
      expect(cartContext.itemCount).toBe(1);
      expect(cartContext.total).toBeCloseTo(15.99, 2);
    });

    it('should increase quantity when adding existing item', () => {
      const mockMeal = {
        id: 1,
        title: 'Pizza',
        price: 15.99,
        description: 'Delicious pizza',
        image: 'pizza.jpg',
        category: 'Italian',
        restaurant_id: 1,
        is_available: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      act(() => {
        cartContext.addToCart(mockMeal);
        cartContext.addToCart(mockMeal);
      });

      expect(cartContext.items).toHaveLength(1);
      expect(cartContext.items[0].quantity).toBe(2);
      expect(cartContext.itemCount).toBe(2);
      expect(cartContext.total).toBeCloseTo(31.98, 2);
    });

    it('should remove item from cart', () => {
      const mockMeal = {
        id: 1,
        title: 'Pizza',
        price: 15.99,
        description: 'Delicious pizza',
        image: 'pizza.jpg',
        category: 'Italian',
        restaurant_id: 1,
        is_available: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      act(() => {
        cartContext.addToCart(mockMeal);
        cartContext.removeFromCart(1);
      });

      expect(cartContext.items).toHaveLength(0);
      expect(cartContext.itemCount).toBe(0);
      expect(cartContext.total).toBe(0);
    });

    it('should update item quantity', () => {
      const mockMeal = {
        id: 1,
        title: 'Pizza',
        price: 15.99,
        description: 'Delicious pizza',
        image: 'pizza.jpg',
        category: 'Italian',
        restaurant_id: 1,
        is_available: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      act(() => {
        cartContext.addToCart(mockMeal);
        cartContext.updateQuantity(1, 3);
      });

      expect(cartContext.items[0].quantity).toBe(3);
      expect(cartContext.itemCount).toBe(3);
      expect(cartContext.total).toBeCloseTo(47.97, 2);
    });

    it('should remove item when quantity is set to 0', () => {
      const mockMeal = {
        id: 1,
        title: 'Pizza',
        price: 15.99,
        description: 'Delicious pizza',
        image: 'pizza.jpg',
        category: 'Italian',
        restaurant_id: 1,
        is_available: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      act(() => {
        cartContext.addToCart(mockMeal);
        cartContext.updateQuantity(1, 0);
      });

      expect(cartContext.items).toHaveLength(0);
      expect(cartContext.itemCount).toBe(0);
      expect(cartContext.total).toBe(0);
    });

    it('should clear cart', () => {
      const mockMeal1 = {
        id: 1,
        title: 'Pizza',
        price: 15.99,
        description: 'Delicious pizza',
        image: 'pizza.jpg',
        category: 'Italian',
        restaurant_id: 1,
        is_available: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      const mockMeal2 = {
        id: 2,
        title: 'Burger',
        price: 12.5,
        description: 'Tasty burger',
        image: 'burger.jpg',
        category: 'American',
        restaurant_id: 1,
        is_available: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      act(() => {
        cartContext.addToCart(mockMeal1);
        cartContext.addToCart(mockMeal2);
        cartContext.clearCart();
      });

      expect(cartContext.items).toHaveLength(0);
      expect(cartContext.itemCount).toBe(0);
      expect(cartContext.total).toBe(0);
    });

    it('should handle multiple different items', () => {
      const mockMeal1 = {
        id: 1,
        title: 'Pizza',
        price: 15.99,
        description: 'Delicious pizza',
        image: 'pizza.jpg',
        category: 'Italian',
        restaurant_id: 1,
        is_available: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      const mockMeal2 = {
        id: 2,
        title: 'Burger',
        price: 12.5,
        description: 'Tasty burger',
        image: 'burger.jpg',
        category: 'American',
        restaurant_id: 1,
        is_available: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      act(() => {
        cartContext.addToCart(mockMeal1);
        cartContext.addToCart(mockMeal2);
        cartContext.addToCart(mockMeal1); // Add pizza again
      });

      expect(cartContext.items).toHaveLength(2);
      expect(cartContext.items[0].quantity).toBe(2); // Pizza quantity
      expect(cartContext.items[1].quantity).toBe(1); // Burger quantity
      expect(cartContext.itemCount).toBe(3);
      expect(cartContext.total).toBeCloseTo(44.48, 2); // 15.99 * 2 + 12.50 * 1
    });

    it('should handle non-existent item operations gracefully', () => {
      act(() => {
        cartContext.removeFromCart(999);
        cartContext.updateQuantity(999, 2);
      });

      expect(cartContext.items).toHaveLength(0);
      expect(cartContext.itemCount).toBe(0);
      expect(cartContext.total).toBe(0);
    });
  });
});
