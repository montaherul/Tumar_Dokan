import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '../AuthContext/AuthContext'; // Assuming AuthContext is available

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { user, firebaseUser, loading: authLoading } = useAuth();
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = "http://localhost:5000/api";

  // Function to fetch the user's cart from the backend
  const fetchCart = useCallback(async () => {
    if (!user || !firebaseUser) {
      setCart({ items: [] }); // Clear cart if no user
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const token = await firebaseUser.getIdToken();
      const response = await fetch(`${API_BASE_URL}/cart`, {
        headers: {
          'x-auth-token': token,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setCart(data);
      } else {
        throw new Error(data.message || 'Failed to fetch cart.');
      }
    } catch (err) {
      console.error("Error fetching cart:", err);
      setError("Failed to load cart.");
      setCart({ items: [] });
    } finally {
      setLoading(false);
    }
  }, [user, firebaseUser]);

  useEffect(() => {
    if (!authLoading) {
      fetchCart();
    }
  }, [authLoading, fetchCart]);

  // Function to add an item to the cart
  const addItemToCart = async (productId, quantity = 1) => {
    if (!user || !firebaseUser) {
      alert("Please log in to add items to your cart.");
      return { success: false, message: "Not authenticated." };
    }

    try {
      const token = await firebaseUser.getIdToken();
      const response = await fetch(`${API_BASE_URL}/cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({ productId, quantity }),
      });
      const data = await response.json();
      if (response.ok) {
        setCart(data);
        return { success: true, message: "Item added to cart!" };
      } else {
        throw new Error(data.message || 'Failed to add item to cart.');
      }
    } catch (err) {
      console.error("Error adding item to cart:", err);
      setError(err.message);
      return { success: false, message: err.message };
    }
  };

  // Function to update the quantity of an item in the cart
  const updateItemQuantity = async (productId, quantity) => {
    if (!user || !firebaseUser) {
      alert("Please log in to modify your cart.");
      return { success: false, message: "Not authenticated." };
    }
    if (quantity <= 0) {
      return removeItemFromCart(productId); // Remove if quantity is 0 or less
    }

    try {
      const token = await firebaseUser.getIdToken();
      const response = await fetch(`${API_BASE_URL}/cart/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({ quantity }),
      });
      const data = await response.json();
      if (response.ok) {
        setCart(data);
        return { success: true, message: "Cart updated!" };
      } else {
        throw new Error(data.message || 'Failed to update cart item quantity.');
      }
    } catch (err) {
      console.error("Error updating cart item quantity:", err);
      setError(err.message);
      return { success: false, message: err.message };
    }
  };

  // Function to remove an item from the cart
  const removeItemFromCart = async (productId) => {
    if (!user || !firebaseUser) {
      alert("Please log in to modify your cart.");
      return { success: false, message: "Not authenticated." };
    }

    try {
      const token = await firebaseUser.getIdToken();
      const response = await fetch(`${API_BASE_URL}/cart/${productId}`, {
        method: 'DELETE',
        headers: {
          'x-auth-token': token,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setCart(data);
        return { success: true, message: "Item removed from cart." };
      } else {
        throw new Error(data.message || 'Failed to remove item from cart.');
      }
    } catch (err) {
      console.error("Error removing item from cart:", err);
      setError(err.message);
      return { success: false, message: err.message };
    }
  };

  // Function to clear the entire cart
  const clearCart = async () => {
    if (!user || !firebaseUser) {
      alert("Please log in to clear your cart.");
      return { success: false, message: "Not authenticated." };
    }

    try {
      const token = await firebaseUser.getIdToken();
      const response = await fetch(`${API_BASE_URL}/cart/clear`, {
        method: 'DELETE',
        headers: {
          'x-auth-token': token,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setCart(data); // Should return an empty cart
        return { success: true, message: "Cart cleared." };
      } else {
        throw new Error(data.message || 'Failed to clear cart.');
      }
    } catch (err) {
      console.error("Error clearing cart:", err);
      setError(err.message);
      return { success: false, message: err.message };
    }
  };

  const cartTotalItems = cart.items.reduce((total, item) => total + item.quantity, 0);
  const cartTotalPrice = cart.items.reduce((total, item) => {
    // Calculate discounted price for each item
    const itemPrice = item.productId.discountPercentage > 0 
      ? item.productId.price * (1 - item.productId.discountPercentage / 100)
      : item.productId.price;
    return total + (itemPrice * item.quantity);
  }, 0);

  const contextValue = {
    cart,
    cartTotalItems,
    cartTotalPrice,
    loading,
    error,
    addItemToCart,
    updateItemQuantity,
    removeItemFromCart,
    clearCart,
    fetchCart, // Expose fetchCart for manual refresh if needed
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};