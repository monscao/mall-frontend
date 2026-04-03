import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { clearCartRequest, fetchCart, normalizeCartItemsForSync, syncCart } from "services/api";
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
  const [cartReady, setCartReady] = useState(false);
  const guestCartRef = useRef([]);
  const serverMode = Boolean(session?.token);

  useEffect(() => {
    if (!authReady) {
      return;
    }

    const localItems = readStoredCart(cartStorageKey);
    setItems(localItems);

    if (!serverMode || !session?.token) {
      guestCartRef.current = localItems;
      setCartReady(true);
      return;
    }

    let active = true;

    async function hydrateServerCart() {
      try {
        const guestItems = readStoredCart(`${CART_STORAGE_KEY_PREFIX}:guest`);
        const mergedItems = [...guestItems, ...localItems];
        const cart = mergedItems.length > 0
          ? await syncCart(normalizeCartItemsForSync(mergedItems), session.token)
          : await fetchCart(session.token);
        if (!active) {
          return;
        }
        const nextItems = cart.items || [];
        setItems(nextItems);
        writeStoredCart(cartStorageKey, nextItems);
        window.localStorage.removeItem(`${CART_STORAGE_KEY_PREFIX}:guest`);
        guestCartRef.current = [];
      } catch (_error) {
        if (!active) {
          return;
        }
        setItems(localItems);
      } finally {
        if (active) {
          setCartReady(true);
        }
      }
    }

    setCartReady(false);
    hydrateServerCart();

    return () => {
      active = false;
    };
  }, [authReady, cartStorageKey, serverMode, session?.token]);

  const value = useMemo(() => {
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => sum + Number(item.salePrice) * item.quantity, 0);

    function persistLocal(nextItems) {
      setItems(nextItems);
      writeStoredCart(cartStorageKey, nextItems);
      if (!serverMode) {
        guestCartRef.current = nextItems;
      }
    }

    async function persistServer(nextItems) {
      const cart = await syncCart(normalizeCartItemsForSync(nextItems), session.token);
      const syncedItems = cart.items || [];
      setItems(syncedItems);
      writeStoredCart(cartStorageKey, syncedItems);
      return syncedItems;
    }

    return {
      cartReady,
      items,
      totalItems,
      subtotal,
      async addItem(item) {
        const existingIndex = items.findIndex((entry) => entry.skuCode === item.skuCode);
        const nextItems = existingIndex >= 0
          ? items.map((entry, index) =>
              index === existingIndex
                ? {
                    ...entry,
                    quantity: Math.min(entry.quantity + (item.quantity || 1), entry.stock || 99)
                  }
                : entry
            )
          : [...items, { ...item, quantity: item.quantity || 1 }];

        if (serverMode && session?.token) {
          await persistServer(nextItems);
          return;
        }

        persistLocal(nextItems);
      },
      async updateQuantity(skuCode, quantity) {
        const nextItems = items.map((item) =>
          item.skuCode !== skuCode
            ? item
            : {
                ...item,
                quantity: Math.max(1, Math.min(quantity, item.stock || 99))
              }
        );

        if (serverMode && session?.token) {
          await persistServer(nextItems);
          return;
        }

        persistLocal(nextItems);
      },
      async removeItem(skuCode) {
        const nextItems = items.filter((item) => item.skuCode !== skuCode);
        if (serverMode && session?.token) {
          await persistServer(nextItems);
          return;
        }
        persistLocal(nextItems);
      },
      async clearCart() {
        if (serverMode && session?.token) {
          const cart = await clearCartRequest(session.token);
          const nextItems = cart.items || [];
          setItems(nextItems);
          writeStoredCart(cartStorageKey, nextItems);
          return;
        }
        persistLocal([]);
      }
    };
  }, [cartReady, cartStorageKey, items, serverMode, session?.token]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }

  return context;
}
