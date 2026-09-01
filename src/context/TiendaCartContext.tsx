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
  cartLinesRemove,
  cartLinesUpdate,
  createCartWithLine,
  fetchCartDetails,
  fetchCheckoutUrl,
  isShopifyConfigured,
  type CartDetails,
  type CartLine,
} from "../lib/shopifyStorefront";
import { isTiendaTestMode } from "../lib/tiendaTestMode";

const CART_STORAGE_KEY = "laaa_shopify_cart_id";

type TiendaCartContextValue = {
  itemCount: number;
  lines: CartLine[];
  subtotal: CartDetails["subtotal"];
  checkoutUrl: string | null;
  isDrawerOpen: boolean;
  isConfirmOpen: boolean;
  confirmLineId: string | null;
  openDrawer: () => void;
  closeDrawer: () => void;
  closeConfirm: () => void;
  refreshCart: () => Promise<void>;
  addVariantToCart: (variantGid: string | null) => Promise<void>;
  updateQuantity: (lineId: string, quantity: number) => Promise<void>;
  removeLine: (lineId: string) => Promise<void>;
  goToCheckout: () => Promise<void>;
};

const TiendaCartContext = createContext<TiendaCartContextValue | null>(null);

const DEMO_LINE: CartLine = {
  id: "demo-line-1",
  quantity: 1,
  merchandiseId: "demo-variant",
  productHandle: "demo-0",
  title: "Lorem ipsum",
  variantTitle: null,
  imageUrl: null,
  imageAlt: null,
  price: { amount: "300", currencyCode: "USD" },
  lineTotal: { amount: "300", currencyCode: "USD" },
};

function applyCartDetails(
  details: CartDetails | null,
  setters: {
    setItemCount: (n: number) => void;
    setLines: (lines: CartLine[]) => void;
    setSubtotal: (s: CartDetails["subtotal"]) => void;
    setCheckoutUrl: (url: string | null) => void;
  },
) {
  if (!details) {
    setters.setItemCount(0);
    setters.setLines([]);
    setters.setSubtotal(null);
    setters.setCheckoutUrl(null);
    return;
  }
  setters.setItemCount(details.totalQuantity);
  setters.setLines(details.lines);
  setters.setSubtotal(details.subtotal);
  setters.setCheckoutUrl(details.checkoutUrl);
}

export function TiendaCartProvider({ children }: { children: ReactNode }) {
  const [cartId, setCartId] = useState<string | null>(() =>
    typeof window !== "undefined"
      ? window.localStorage.getItem(CART_STORAGE_KEY)
      : null,
  );
  const [itemCount, setItemCount] = useState(0);
  const [lines, setLines] = useState<CartLine[]>([]);
  const [subtotal, setSubtotal] = useState<CartDetails["subtotal"]>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmLineId, setConfirmLineId] = useState<string | null>(null);
  const [mockLines, setMockLines] = useState<CartLine[]>([]);

  const shopify = isShopifyConfigured();

  const openDrawer = useCallback(() => {
    setIsConfirmOpen(false);
    setIsDrawerOpen(true);
  }, []);
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);
  const closeConfirm = useCallback(() => {
    setIsConfirmOpen(false);
    setConfirmLineId(null);
  }, []);

  const openConfirmForLine = useCallback((lineId: string) => {
    setConfirmLineId(lineId);
    setIsConfirmOpen(true);
  }, []);

  const refreshCart = useCallback(async () => {
    if (!shopify || !cartId) return;
    const details = await fetchCartDetails(cartId);
    applyCartDetails(details, {
      setItemCount,
      setLines,
      setSubtotal,
      setCheckoutUrl,
    });
  }, [cartId, shopify]);

  useEffect(() => {
    if (!shopify) {
      setItemCount(mockLines.reduce((sum, l) => sum + l.quantity, 0));
      setLines(mockLines);
      setSubtotal(
        mockLines.length > 0
          ? {
              amount: String(
                mockLines.reduce(
                  (sum, l) => sum + Number(l.lineTotal.amount),
                  0,
                ),
              ),
              currencyCode: mockLines[0]?.price.currencyCode ?? "USD",
            }
          : null,
      );
      setCheckoutUrl(null);
      return;
    }
    if (!cartId) {
      setItemCount(0);
      setLines([]);
      setSubtotal(null);
      setCheckoutUrl(null);
      return;
    }
    void refreshCart();
  }, [cartId, mockLines, refreshCart, shopify]);

  useEffect(() => {
    if (isDrawerOpen && shopify && cartId) {
      void refreshCart();
    }
  }, [isDrawerOpen, cartId, refreshCart, shopify]);

  const addVariantToCart = useCallback(
    async (variantGid: string | null) => {
      if (!variantGid) return;

      if (!shopify) {
        let addedLineId: string | null = null;
        setMockLines((prev) => {
          const existing = prev.find((l) => l.merchandiseId === variantGid);
          if (existing) {
            addedLineId = existing.id;
            const qty = existing.quantity + 1;
            const amount = String(Number(existing.price.amount) * qty);
            return prev.map((l) =>
              l.id === existing.id
                ? {
                    ...l,
                    quantity: qty,
                    lineTotal: { ...l.lineTotal, amount },
                  }
                : l,
            );
          }
          const newLine = {
            ...DEMO_LINE,
            id: `demo-${Date.now()}`,
            merchandiseId: variantGid,
          };
          addedLineId = newLine.id;
          return [...prev, newLine];
        });
        if (addedLineId) {
          openConfirmForLine(addedLineId);
        }
        return;
      }

      let details: CartDetails | null;
      if (cartId) {
        details = await addCartLines(cartId, [
          { merchandiseId: variantGid, quantity: 1 },
        ]);
      } else {
        details = await createCartWithLine(variantGid, 1);
        if (details?.id) {
          window.localStorage.setItem(CART_STORAGE_KEY, details.id);
          setCartId(details.id);
        }
      }

      if (details) {
        applyCartDetails(details, {
          setItemCount,
          setLines,
          setSubtotal,
          setCheckoutUrl,
        });
        const addedLine = details.lines.find(
          (l) => l.merchandiseId === variantGid,
        );
        if (addedLine) {
          openConfirmForLine(addedLine.id);
        }
      }
    },
    [cartId, openConfirmForLine, shopify],
  );

  const updateQuantity = useCallback(
    async (lineId: string, quantity: number) => {
      if (quantity < 1) return;

      if (!shopify) {
        setMockLines((prev) =>
          prev.map((l) => {
            if (l.id !== lineId) return l;
            const amount = String(Number(l.price.amount) * quantity);
            return {
              ...l,
              quantity,
              lineTotal: { ...l.lineTotal, amount },
            };
          }),
        );
        return;
      }

      if (!cartId) return;
      const details = await cartLinesUpdate(cartId, [{ id: lineId, quantity }]);
      if (details) {
        applyCartDetails(details, {
          setItemCount,
          setLines,
          setSubtotal,
          setCheckoutUrl,
        });
      }
    },
    [cartId, shopify],
  );

  const removeLine = useCallback(
    async (lineId: string) => {
      if (!shopify) {
        setMockLines((prev) => prev.filter((l) => l.id !== lineId));
        return;
      }

      if (!cartId) return;
      const details = await cartLinesRemove(cartId, [lineId]);
      if (details) {
        applyCartDetails(details, {
          setItemCount,
          setLines,
          setSubtotal,
          setCheckoutUrl,
        });
      }
    },
    [cartId, shopify],
  );

  const goToCheckout = useCallback(async () => {
    if (!shopify || !cartId || itemCount === 0) return;

    if (
      isTiendaTestMode() &&
      !window.confirm(
        "Vas a entrar al checkout de prueba de Shopify. ¿Continuar?",
      )
    ) {
      return;
    }

    const url =
      checkoutUrl ?? (await fetchCheckoutUrl(cartId));
    if (url) {
      window.location.href = url;
    }
  }, [cartId, checkoutUrl, itemCount, shopify]);

  const value = useMemo<TiendaCartContextValue>(
    () => ({
      itemCount: shopify
        ? itemCount
        : mockLines.reduce((sum, l) => sum + l.quantity, 0),
      lines: shopify ? lines : mockLines,
      subtotal: shopify
        ? subtotal
        : mockLines.length > 0
          ? {
              amount: String(
                mockLines.reduce(
                  (sum, l) => sum + Number(l.lineTotal.amount),
                  0,
                ),
              ),
              currencyCode: mockLines[0]?.price.currencyCode ?? "USD",
            }
          : null,
      checkoutUrl,
      isDrawerOpen,
      isConfirmOpen,
      confirmLineId,
      openDrawer,
      closeDrawer,
      closeConfirm,
      refreshCart,
      addVariantToCart,
      updateQuantity,
      removeLine,
      goToCheckout,
    }),
    [
      addVariantToCart,
      checkoutUrl,
      closeConfirm,
      closeDrawer,
      confirmLineId,
      isConfirmOpen,
      isDrawerOpen,
      itemCount,
      lines,
      mockLines,
      openDrawer,
      refreshCart,
      removeLine,
      shopify,
      subtotal,
      updateQuantity,
      goToCheckout,
    ],
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
