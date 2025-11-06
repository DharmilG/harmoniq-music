import React, { createContext, useContext, useMemo, useState, useCallback, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { api } from './apiClient'

const CartContext = createContext()
export const useCart = () => useContext(CartContext)

export function CartProvider({ children }){
  const { user } = useAuth()
  const [items, setItems] = useState([]) // {id, name, price, qty}

  const fetchCart = useCallback(async () => {
    if (!user) return
    try {
      const data = await api('/api/cart')
      setItems(data.items || [])
    } catch (e) {
      console.error("Failed to fetch cart", e)
      setItems([])
    }
  }, [user])

  useEffect(() => {
    if (user) {
      fetchCart()
    } else {
      setItems([])
    }
  }, [user, fetchCart])

  const add = useCallback(async (product, quantity = 1) => {
    if (user) {
      // --- API-based cart for logged-in users ---
      const { item: updatedItem } = await api('/api/cart', {
        method: 'POST',
        body: { productId: product.id, qty: quantity }
      });
      setItems(prev => {
        const existing = prev.find(i => i.id === updatedItem.id);
        if (existing) {
          return prev.map(i => i.id === updatedItem.id ? { ...i, qty: updatedItem.qty } : i);
        }
        return [...prev, updatedItem];
      });
    } else {
      // --- Local state cart for guests ---
      setItems(prev => {
        const existing = prev.find(i => i.id === product.id);
        if (existing) {
          return prev.map(i =>
            i.id === product.id ? { ...i, qty: i.qty + quantity } : i
          );
        }
        return [...prev, { ...product, qty: quantity }];
      });
    }
  }, [user]);

  const remove = useCallback(async (id) => {
    // This will be a new endpoint if we want to remove single items
    // For now, we can use the update endpoint with qty 0 or a negative value
    // Or, for simplicity, we'll just clear the whole cart as an example
    console.warn("Single item remove not implemented on backend yet. Clearing cart instead.");
    await api('/api/cart', { method: 'DELETE' })
    setItems([]); // Clear local state immediately
  }, []);

  const inc = useCallback(async (id) => {
    if (user) {
      await add({ id });
    } else {
      setItems(prev => prev.map(i => i.id === id ? { ...i, qty: i.qty + 1 } : i));
    }
  }, [user, add]);

  const dec = useCallback(async (id) => {
    if (user) {
      // TODO: Implement decrement on backend
      console.warn("Decrement not implemented on backend yet.");
    } else {
      setItems(prev => {
        const existing = prev.find(i => i.id === id);
        if (existing && existing.qty > 1) {
          return prev.map(i => i.id === id ? { ...i, qty: i.qty - 1 } : i);
        }
        // Remove item if quantity is 1
        return prev.filter(i => i.id !== id);
      });
    }
  }, [user]);

  const clear = useCallback(async () => {
    if (user) {
      await api('/api/cart', { method: 'DELETE' });
    }
    setItems([]);
  }, [user]);

  const total = useMemo(()=> items.reduce((s,i)=> s + i.price * i.qty, 0), [items])
  const value = { items, add, remove, inc, dec, clear, total }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}