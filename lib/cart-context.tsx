import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'luvlots.cart.v1';

type CartContextValue = {
  listingIds: string[];
  addToCart: (listingId: string) => void;
  removeFromCart: (listingId: string) => void;
  isInCart: (listingId: string) => boolean;
  clearCart: (listingIds?: string[]) => void;
  loaded: boolean;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [listingIds, setListingIds] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) setListingIds(JSON.parse(raw));
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(listingIds)).catch(() => {});
  }, [listingIds, loaded]);

  const addToCart = useCallback((listingId: string) => {
    setListingIds((prev) => (prev.includes(listingId) ? prev : [...prev, listingId]));
  }, []);

  const removeFromCart = useCallback((listingId: string) => {
    setListingIds((prev) => prev.filter((id) => id !== listingId));
  }, []);

  const isInCart = useCallback((listingId: string) => listingIds.includes(listingId), [listingIds]);

  const clearCart = useCallback((idsToRemove?: string[]) => {
    if (!idsToRemove) {
      setListingIds([]);
      return;
    }
    setListingIds((prev) => prev.filter((id) => !idsToRemove.includes(id)));
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({ listingIds, addToCart, removeFromCart, isInCart, clearCart, loaded }),
    [listingIds, addToCart, removeFromCart, isInCart, clearCart, loaded],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider.');
  }
  return context;
}
