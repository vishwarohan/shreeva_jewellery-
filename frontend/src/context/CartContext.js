import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loadingCart, setLoadingCart] = useState(false);

  // Fetch cart when user changes
  useEffect(() => {
    if (user) fetchCart();
    else { setCart([]); setWishlist([]); }
  }, [user]);

  const fetchCart = async () => {
    try {
      const { data } = await api.get('/cart');
      setCart(data.cart || []);
    } catch {}
  };

  const addToCart = async (productId, quantity = 1, size = '') => {
    if (!user) { toast.error('Please log in to add to cart'); return; }
    try {
      setLoadingCart(true);
      const { data } = await api.post('/cart', { productId, quantity, size });
      setCart(data.cart);
      toast.success('Added to cart!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add to cart');
    } finally {
      setLoadingCart(false);
    }
  };

  const updateQty = async (itemId, quantity) => {
    try {
      const { data } = await api.put(`/cart/${itemId}`, { quantity });
      setCart(data.cart);
    } catch {}
  };

  const removeFromCart = async (itemId) => {
    try {
      const { data } = await api.delete(`/cart/${itemId}`);
      setCart(data.cart);
      toast.success('Removed from cart');
    } catch {}
  };

  const toggleWishlist = async (productId) => {
    if (!user) { toast.error('Please log in'); return; }
    try {
      const { data } = await api.post(`/cart/wishlist/${productId}`);
      setWishlist(data.wishlist);
    } catch {}
  };

  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);
  const cartTotal = cart.reduce((sum, i) => sum + (i.product?.price || 0) * i.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, wishlist, cartCount, cartTotal, loadingCart, addToCart, updateQty, removeFromCart, toggleWishlist, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
