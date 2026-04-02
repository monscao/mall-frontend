import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "context/AuthContext";

const CartContext = createContext(null);
const CART_STORAGE_KEY_PREFIX = "mall-frontend-cart";

function readStoredCart(storageKey) {
  try {
    const raw = window.localStorage.getItem(storageKey);
    return raw ? JSON.parse(raw) : [];
  } catch (_error) {
    return [];
  }
}

function writeStoredCart(storageKey, items) {
  window.localStorage.setItem(storageKey, JSON.stringify(items));
}

export function CartProvider({ children }) {
  const { authReady, session } = useAuth();
  const cartStorageKey = useMemo(() => {
    const identity = session?.currentUser?.username || session?.username || "guest";
    return `${CART_STORAGE_KEY_PREFIX}:${identity}`;
  }, [session]);
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!authReady) {
      return;
    }

    setItems(readStoredCart(cartStorageKey));
  }, [authReady, cartStorageKey]);

  const value = useMemo(() => {
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => sum + Number(item.salePrice) * item.quantity, 0);

    return {
      items,
      totalItems,
      subtotal,
      addItem(item) {
        setItems((currentItems) => {
          const existingIndex = currentItems.findIndex((entry) => entry.skuCode === item.skuCode);
          let nextItems = currentItems;

          if (existingIndex >= 0) {
            nextItems = currentItems.map((entry, index) =>
              index === existingIndex
                ? {
                    ...entry,
                    quantity: Math.min(entry.quantity + (item.quantity || 1), entry.stock || 99)
                  }
                : entry
            );
          } else {
            nextItems = [...currentItems, { ...item, quantity: item.quantity || 1 }];
          }

          writeStoredCart(cartStorageKey, nextItems);
          return nextItems;
        });
      },
      updateQuantity(skuCode, quantity) {
        setItems((currentItems) => {
          const nextItems = currentItems
            .map((item) => {
              if (item.skuCode !== skuCode) {
                return item;
              }

              return {
                ...item,
                quantity: Math.max(1, Math.min(quantity, item.stock || 99))
              };
            })
            .filter(Boolean);

          writeStoredCart(cartStorageKey, nextItems);
          return nextItems;
        });
      },
      removeItem(skuCode) {
        setItems((currentItems) => {
          const nextItems = currentItems.filter((item) => item.skuCode !== skuCode);
          writeStoredCart(cartStorageKey, nextItems);
          return nextItems;
        });
      },
      clearCart() {
        setItems([]);
        writeStoredCart(cartStorageKey, []);
      }
    };
  }, [cartStorageKey, items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }

  return context;
}
