import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
  type CSSProperties,
} from "react";
import { Link } from "react-router-dom";
import shopCardPlaceholder from "../assets/shop-card-placeholder.png";
import { TiendaTestBanner } from "../components/TiendaTestBanner";
import { useWheelScrollContainer } from "../hooks/useWheelScrollContainer";
import {
  type ShopifyProductCard,
  fetchStorefrontProducts,
  formatShopifyMoney,
  isShopifyConfigured,
} from "../lib/shopifyStorefront";
import {
  consumeTiendaScrollRestore,
  rememberTiendaScrollBeforeProduct,
  restoreTiendaScroll,
  saveTiendaScroll,
} from "../lib/tiendaScrollPosition";

/** Demo tiles when Storefront env vars are not set (layout matches Figma grid). */
const DEMO_PRODUCTS: ShopifyProductCard[] = Array.from({ length: 8 }, (_, i) => ({
  id: `demo-${i}`,
  handle: `demo-${i}`,
  title: "Lorem ipsum",
  imageUrl: null,
  imageAlt: null,
  firstVariantId: "demo-variant",
  price: { amount: "300", currencyCode: "USD" },
}));

export function TiendaPage() {
  const scrollRef = useWheelScrollContainer();
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

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onScroll = () => saveTiendaScroll(el);
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [loading, products.length]);

  useLayoutEffect(() => {
    if (loading) return;
    if (!consumeTiendaScrollRestore()) return;

    const el = scrollRef.current;
    if (!el) return;

    restoreTiendaScroll(el);
    requestAnimationFrame(() => restoreTiendaScroll(el));
  }, [loading, products.length]);

  return (
    <div className="tiendaPage">
      <TiendaTestBanner />
      {!loading && products.length === 0 ? (
        <p className="tiendaPage__empty">
          No hay productos disponibles en la tienda.
        </p>
      ) : (
        <div
          ref={scrollRef}
          className="tiendaPage__scroll"
          role="region"
          aria-label="Productos"
        >
          <div className="tiendaPage__grid" aria-busy={loading}>
            {products.map((p) => (
              <article key={p.id} className="tiendaCard">
                <Link
                  to={`/tienda/${p.handle}`}
                  className="tiendaCard__hit"
                  aria-label={`${p.title}, ${formatShopifyMoney(p.price)}`}
                  onClick={() => rememberTiendaScrollBeforeProduct(scrollRef.current)}
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
                      {formatShopifyMoney(p.price)}
                    </span>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
