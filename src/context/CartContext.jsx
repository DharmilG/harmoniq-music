import React, { createContext, useContext, useMemo, useState, useCallback, useEffect } from 'react'
<<<<<<< HEAD
=======
import { useAuth } from './AuthContext'
import { api } from './apiClient'
>>>>>>> 290fa6ca4b404c4517359c72053dc28160a053b4

const CartContext = createContext()
export const useCart = () => useContext(CartContext)

export function CartProvider({ children }){
<<<<<<< HEAD
  const [items, setItems] = useState(() => {
    try {
      const localCart = window.localStorage.getItem('harmoniq-cart');
      return localCart ? JSON.parse(localCart) : [];
    } catch (error) {
      console.error("Could not parse cart from localStorage", error);
      return [];
    }
  });

  // Persist cart to localStorage whenever it changes
  useEffect(() => {
    window.localStorage.setItem('harmoniq-cart', JSON.stringify(items));
  }, [items]);

    const clear = useCallback(async () => {
    setItems([]);
  }, []);


const add = useCallback(async (product) => {
  setItems(prev => {
    const existing = prev.find(i => i.id === product.id);
    if (existing) {
      // Increment quantity if item already exists
      return prev.map(i =>
        i.id === product.id ? { ...i, qty: i.qty + 1 } : i
      );
    }
    // Add new item to cart
    return [...prev, { ...product, qty: 1 }];
  });
  }, []);

  const remove = useCallback(async (id) => {
    setItems(prev => prev.filter(i => i.id !== id));
  }, []);

  const inc = useCallback(async (id) => {
    setItems(prev =>
      prev.map(i => (i.id === id ? { ...i, qty: i.qty + 1 } : i))
    );
  }, []);

  const dec = useCallback(async (id) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === id);
      if (existing && existing.qty > 1) {
        // Decrement quantity if it's more than 1
        return prev.map(i =>
          i.id === id ? { ...i, qty: i.qty - 1 } : i
        );
      } else {
        // Remove item if quantity is 1
        return prev.filter(i => i.id !== id);
      }
    });
  }, []);
=======
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

  const add = useCallback(async (product) => {
    const { item: updatedItem } = await api('/api/cart', {
      method: 'POST',
      body: { productId: product.id, qty: 1 }
    })
    setItems(prev => {
      const existing = prev.find(i => i.id === updatedItem.id)
      if (existing) {
        return prev.map(i => i.id === updatedItem.id ? { ...i, qty: updatedItem.qty } : i)
      }
      return [...prev, updatedItem]
    })
  }, [])

  const remove = useCallback(async (id) => {
    // This will be a new endpoint if we want to remove single items
    // For now, we can use the update endpoint with qty 0 or a negative value
    // Or, for simplicity, we'll just clear the whole cart as an example
    console.warn("Single item remove not implemented on backend yet. Clearing cart instead.");
    await api('/api/cart', { method: 'DELETE' })
    fetchCart()
  }, [fetchCart])

  const inc = useCallback(async (id) => add({ id }), [add])

  const dec = useCallback(async (id) => {
    // TODO: Implement decrement on backend
    console.warn("Decrement not implemented on backend yet.");
  }, [])

  const clear = useCallback(async () => {
    await api('/api/cart', { method: 'DELETE' })
    setItems([])
  }, [])
>>>>>>> 290fa6ca4b404c4517359c72053dc28160a053b4

  const total = useMemo(()=> items.reduce((s,i)=> s + i.price * i.qty, 0), [items])
  const value = { items, add, remove, inc, dec, clear, total }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
<<<<<<< HEAD
}
=======
}
>>>>>>> 290fa6ca4b404c4517359c72053dc28160a053b4
