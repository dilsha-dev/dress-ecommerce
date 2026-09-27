import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CartItem, Dress } from '@/lib/supabase';

interface CartContextValue {
  items: CartItem[];
  addItem: (dress: Dress, size: string, color: string, quantity?: number) => void;
  removeItem: (index: number) => void;
  updateQuantity: (index: number, quantity: number) => void;
  clearCart: () => void;
  totalCount: number;
  totalPrice: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

const STORAGE_KEY = 'dress-shop-cart';

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(loadCart);
  const [isOpen, setIsOpen] = useState(false);

  const persist = (next: CartItem[]) => {
    setItems(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  const addItem = useCallback(
    (dress: Dress, size: string, color: string, quantity = 1) => {
      setItems((prev) => {
        const idx = prev.findIndex(
          (i) => i.dress.id === dress.id && i.size === size && i.color === color,
        );
        let next: CartItem[];
        if (idx >= 0) {
          next = [...prev];
          next[idx] = { ...next[idx], quantity: next[idx].quantity + quantity };
        } else {
          next = [...prev, { dress, size, color, quantity }];
        }
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {
          // ignore
        }
        return next;
      });
      setIsOpen(true);
    },
    [],
  );

  const removeItem = useCallback((index: number) => {
    setItems((prev) => {
      const next = prev.filter((_, i) => i !== index);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const updateQuantity = useCallback((index: number, quantity: number) => {
    setItems((prev) => {
      if (quantity <= 0) {
        const next = prev.filter((_, i) => i !== index);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {
          // ignore
        }
        return next;
      }
      const next = [...prev];
      next[index] = { ...next[index], quantity };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const clearCart = useCallback(() => persist([]), []);

  const totalCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.dress.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalCount,
        totalPrice,
        isOpen,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
