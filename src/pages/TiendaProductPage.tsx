import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
} from "react";
import { Link, useParams } from "react-router-dom";
import shopCardPlaceholder from "../assets/shop-card-placeholder.png";
import { TiendaProductGalleryFrame } from "../components/TiendaProductGalleryFrame";
import { TiendaTestBanner } from "../components/TiendaTestBanner";
import { useTiendaCart } from "../context/TiendaCartContext";
import { isTiendaTestMode } from "../lib/tiendaTestMode";
import {
  fetchProductByHandle,
  formatShopifyMoney,
  isProductSoldOut,
  isShopifyConfigured,
  type ShopifyProductDetail,
  type ShopifyProductVariant,
} from "../lib/shopifyStorefront";
import { markTiendaScrollRestore } from "../lib/tiendaScrollPosition";

const DEMO_PRODUCT: ShopifyProductDetail = {
  id: "demo-product",
  handle: "demo-0",
  title: "Lorem ipsum",
  descriptionHtml:
    "<p>Producto de demostración para la tienda Laaa.</p>",
  availableForSale: true,
  images: [],
  variants: [
    {
      id: "demo-variant",
      title: "Default Title",
      availableForSale: true,
      price: { amount: "300", currencyCode: "USD" },
    },
  ],
  price: { amount: "300", currencyCode: "USD" },
};

function variantLabel(v: ShopifyProductVariant): string {
  return v.title === "Default Title" ? "" : v.title;
}

export function TiendaProductPage() {
  const { handle = "" } = useParams();
  const { addVariantToCart } = useTiendaCart();
  const [product, setProduct] = useState<ShopifyProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    null,
  );
  const [adding, setAdding] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    if (!isShopifyConfigured()) {
      setProduct({ ...DEMO_PRODUCT, handle: handle || DEMO_PRODUCT.handle });
      setLoading(false);
      return;
    }
    const p = await fetchProductByHandle(handle);
    setProduct(p);
    setLoading(false);
  }, [handle]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    setSelectedVariantId(null);
  }, [handle]);

  const variants = product?.variants ?? [];
  const showVariantPicker =
    variants.length > 1 ||
    (variants.length === 1 && variantLabel(variants[0]!) !== "");

  const selectedVariant = useMemo(() => {
    if (!variants.length) return null;
    if (selectedVariantId) {
      return variants.find((v) => v.id === selectedVariantId) ?? variants[0]!;
    }
    return variants[0]!;
  }, [selectedVariantId, variants]);

  useEffect(() => {
    if (product && variants.length && !selectedVariantId) {
      setSelectedVariantId(variants[0]!.id);
    }
  }, [product, selectedVariantId, variants]);

  const soldOut = product
    ? isProductSoldOut(product, {
        ignoreCatalogSoldOut: isTiendaTestMode(),
      }) ||
      (selectedVariant ? !selectedVariant.availableForSale : false)
    : false;

  const images = product?.images.length
    ? product.images
    : [{ url: "", altText: null }];

  const onAdd = async () => {
    if (!selectedVariant || soldOut) return;
    setAdding(true);
    await addVariantToCart(selectedVariant.id);
    setAdding(false);
  };

  if (loading) {
    return (
      <div className="tiendaProduct" aria-busy="true">
        <p className="tiendaProduct__loading">Cargando producto…</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="tiendaProduct tiendaProduct--empty">
        <p className="tiendaProduct__missing">Producto no encontrado.</p>
        <Link
          to="/tienda"
          className="tiendaProduct__back"
          onClick={() => markTiendaScrollRestore()}
        >
          Volver a la tienda
        </Link>
      </div>
    );
  }

  const displayPrice = selectedVariant?.price ?? product.price;

  return (
    <div className="tiendaProduct">
      <TiendaTestBanner />
      <div className="tiendaProduct__layout">
        <div
          className="tiendaProduct__gallery"
          aria-label="Imágenes del producto"
        >
          {images.map((img, i) =>
            img.url ? (
              <TiendaProductGalleryFrame key={img.url + i}>
                <img
                  src={img.url}
                  alt={img.altText ?? `${product.title} — imagen ${i + 1}`}
                  className="tiendaProduct__galleryImg"
                />
                <div className="tiendaProduct__galleryMat" aria-hidden />
              </TiendaProductGalleryFrame>
            ) : (
              <TiendaProductGalleryFrame key="placeholder">
                <img
                  src={shopCardPlaceholder}
                  alt=""
                  className="tiendaProduct__galleryImg tiendaProduct__galleryImg--placeholder"
                  style={
                    {
                      "--tienda-placeholder-mask": `url(${shopCardPlaceholder})`,
                    } as CSSProperties
                  }
                />
                <div className="tiendaProduct__galleryMat" aria-hidden />
              </TiendaProductGalleryFrame>
            ),
          )}
        </div>

        <div className="tiendaProduct__info">
          <section className="tiendaProduct__section tiendaProduct__section--back">
            <Link
              to="/tienda"
              className="tiendaProduct__back"
              onClick={() => markTiendaScrollRestore()}
            >
              &lt;-- Tienda
            </Link>
          </section>

          <section className="tiendaProduct__section">
            <h1 className="tiendaProduct__title">{product.title}</h1>
          </section>

          {product.descriptionHtml ? (
            <section className="tiendaProduct__section">
              <div
                className="tiendaProduct__description"
                dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
              />
            </section>
          ) : null}

          {showVariantPicker ? (
            <section className="tiendaProduct__section">
              <div className="tiendaProduct__variants">
                <span className="tiendaProduct__variantsLabel">Variante</span>
                <div className="tiendaProduct__variantList">
                  {variants.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      className={[
                        "tiendaProduct__variantBtn",
                        v.id === selectedVariant?.id
                          ? "tiendaProduct__variantBtn--active"
                          : "",
                        !v.availableForSale
                          ? "tiendaProduct__variantBtn--disabled"
                          : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      disabled={!v.availableForSale}
                      onClick={() => setSelectedVariantId(v.id)}
                    >
                      {variantLabel(v) || v.title}
                    </button>
                  ))}
                </div>
              </div>
            </section>
          ) : null}

          <section className="tiendaProduct__section">
            <p className="tiendaProduct__price">
              {formatShopifyMoney(displayPrice)}
            </p>
          </section>

          <section className="tiendaProduct__section tiendaProduct__section--cta">
            <button
              type="button"
              className="tiendaProduct__addBtn"
              disabled={soldOut || adding || !selectedVariant}
              onClick={() => void onAdd()}
            >
              {soldOut
                ? "Agotado"
                : adding
                  ? "Agregando…"
                  : isTiendaTestMode()
                    ? "Agregar al carrito (prueba)"
                    : "Agregar al carrito"}
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
