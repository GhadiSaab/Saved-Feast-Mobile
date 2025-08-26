import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  restaurant?: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (meal: { id: number; name: string; price: number; image?: string; restaurant?: string }) => void;
  removeFromCart: (mealId: number) => void;
  updateQuantity: (mealId: number, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getItemCount: () => number;
}

const CartContext = createContext<CartContextType | null>(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const addToCart = (meal: { id: number; name: string; price: number; image?: string; restaurant?: string }) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === meal.id);
      if (existingItem) {
        return prevItems.map(item =>
          item.id === meal.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prevItems, { ...meal, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (mealId: number) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== mealId));
  };

  const updateQuantity = (mealId: number, quantity: number) => {
    setCartItems(prevItems => {
      if (quantity <= 0) {
        return prevItems.filter(item => item.id !== mealId);
      } else {
        return prevItems.map(item =>
          item.id === mealId ? { ...item, quantity } : item
        );
      }
    });
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartTotal = (): number => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getItemCount = (): number => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  const contextValue: CartContextType = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getItemCount,
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};
