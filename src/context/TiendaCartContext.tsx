import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  addCartLines,
  createCartWithLine,
  fetchCartTotalQuantity,
  isShopifyConfigured,
} from "../lib/shopifyStorefront";

const CART_STORAGE_KEY = "laaa_shopify_cart_id";

type TiendaCartContextValue = {
  /** Total line-item quantity (Shopify `totalQuantity`) or demo mock total */
  itemCount: number;
  /** Refresh count from Shopify using stored cart id */
  refreshCart: () => Promise<void>;
  /** Add variant to cart (Shopify) or increment demo basket when Storefront is not configured */
  addVariantToCart: (variantGid: string | null) => Promise<void>;
};

const TiendaCartContext = createContext<TiendaCartContextValue | null>(null);

export function TiendaCartProvider({ children }: { children: ReactNode }) {
  const [cartId, setCartId] = useState<string | null>(() =>
    typeof window !== "undefined"
      ? window.localStorage.getItem(CART_STORAGE_KEY)
      : null,
  );
  const [itemCount, setItemCount] = useState(0);
  const [mockCount, setMockCount] = useState(0);

  const shopify = isShopifyConfigured();

  const refreshCart = useCallback(async () => {
    if (!shopify || !cartId) return;
    const qty = await fetchCartTotalQuantity(cartId);
    if (qty !== null) setItemCount(qty);
  }, [cartId, shopify]);

  useEffect(() => {
    if (!shopify) {
      setItemCount(mockCount);
      return;
    }
    if (!cartId) {
      setItemCount(0);
      return;
    }
    void (async () => {
      const qty = await fetchCartTotalQuantity(cartId);
      if (qty !== null) setItemCount(qty);
    })();
  }, [cartId, mockCount, shopify]);

  const addVariantToCart = useCallback(
    async (variantGid: string | null) => {
      if (!variantGid) return;

      if (!shopify) {
        setMockCount((c) => c + 1);
        return;
      }

      if (cartId) {
        const result = await addCartLines(cartId, [
          { merchandiseId: variantGid, quantity: 1 },
        ]);
        if (result) setItemCount(result.totalQuantity);
        return;
      }

      const created = await createCartWithLine(variantGid, 1);
      if (!created) return;
      window.localStorage.setItem(CART_STORAGE_KEY, created.cartId);
      setCartId(created.cartId);
      setItemCount(created.totalQuantity);
    },
    [cartId, shopify],
  );

  const value = useMemo<TiendaCartContextValue>(
    () => ({
      itemCount: shopify ? itemCount : mockCount,
      refreshCart,
      addVariantToCart,
    }),
    [addVariantToCart, itemCount, mockCount, refreshCart, shopify],
  );

  return (
    <TiendaCartContext.Provider value={value}>
      {children}
    </TiendaCartContext.Provider>
  );
}

export function useTiendaCart(): TiendaCartContextValue {
  const ctx = useContext(TiendaCartContext);
  if (!ctx) {
    throw new Error("useTiendaCart must be used within TiendaCartProvider");
  }
  return ctx;
}
