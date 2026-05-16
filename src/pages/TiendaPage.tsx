import {
  useCallback,
  useEffect,
  useState,
  type CSSProperties,
} from "react";
import shopCardPlaceholder from "../assets/shop-card-placeholder.png";
import { useTiendaCart } from "../context/TiendaCartContext";
import {
  type ShopifyProductCard,
  fetchStorefrontProducts,
  isShopifyConfigured,
} from "../lib/shopifyStorefront";

function formatMoney(
  price: { amount: string; currencyCode: string } | null,
): string {
  if (!price) return "—";
  const n = Number(price.amount);
  if (Number.isNaN(n)) return "—";
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: price.currencyCode,
    }).format(n);
  } catch {
    return `$${price.amount}`;
  }
}

/** Demo tiles when Storefront env vars are not set (layout matches Figma grid). */
const DEMO_PRODUCTS: ShopifyProductCard[] = Array.from({ length: 8 }, (_, i) => ({
  id: `demo-${i}`,
  title: "Lorem ipsum",
  imageUrl: null,
  imageAlt: null,
  firstVariantId: null,
  price: { amount: "300", currencyCode: "USD" },
}));

export function TiendaPage() {
  const { addVariantToCart } = useTiendaCart();
  const [products, setProducts] = useState<ShopifyProductCard[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    if (!isShopifyConfigured()) {
      setProducts(DEMO_PRODUCTS);
      setLoading(false);
      return;
    }
    const list = await fetchStorefrontProducts(24);
    setProducts(list);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="tiendaPage">
      {!loading && products.length === 0 ? (
        <p className="tiendaPage__empty">
          No hay productos disponibles en la tienda.
        </p>
      ) : (
        <div className="tiendaPage__scroll" role="region" aria-label="Productos">
          <div className="tiendaPage__grid" aria-busy={loading}>
            {products.map((p) => (
              <article key={p.id} className="tiendaCard">
                <button
                  type="button"
                  className="tiendaCard__hit"
                  onClick={() => void addVariantToCart(p.firstVariantId)}
                  aria-label={`${p.title}, ${formatMoney(p.price)} — añadir al carrito`}
                >
                  <div
                    className={
                      p.imageUrl
                        ? "tiendaCard__media"
                        : "tiendaCard__media tiendaCard__media--placeholder"
                    }
                    style={
                      p.imageUrl
                        ? undefined
                        : ({
                            "--tienda-placeholder-mask": `url(${shopCardPlaceholder})`,
                          } as CSSProperties)
                    }
                  >
                    {p.imageUrl ? (
                      <img
                        src={p.imageUrl}
                        alt={p.imageAlt ?? ""}
                        className="tiendaCard__img"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <img
                        src={shopCardPlaceholder}
                        alt=""
                        className="tiendaCard__img tiendaCard__img--placeholder"
                        loading="lazy"
                        decoding="async"
                      />
                    )}
                  </div>
                  <div className="tiendaCard__meta">
                    <span className="tiendaCard__title">{p.title}</span>
                    <span className="tiendaCard__price">
                      {formatMoney(p.price)}
                    </span>
                  </div>
                </button>
              </article>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
