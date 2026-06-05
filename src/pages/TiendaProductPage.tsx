import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
} from "react";
import { Link, useParams } from "react-router-dom";
import shopCardPlaceholder from "../assets/shop-card-placeholder.png";
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
  const [activeImageIndex, setActiveImageIndex] = useState(0);
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
    setActiveImageIndex(0);
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
    ? isProductSoldOut(product) ||
      (selectedVariant ? !selectedVariant.availableForSale : false)
    : false;

  const images = product?.images.length
    ? product.images
    : [{ url: "", altText: null }];

  const activeImage = images[activeImageIndex] ?? images[0];

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
        <Link to="/tienda" className="tiendaProduct__back">
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
        <div className="tiendaProduct__gallery">
          <div
            className={
              activeImage?.url
                ? "tiendaProduct__hero"
                : "tiendaProduct__hero tiendaProduct__hero--placeholder"
            }
            style={
              activeImage?.url
                ? undefined
                : ({
                    "--tienda-placeholder-mask": `url(${shopCardPlaceholder})`,
                  } as CSSProperties)
            }
          >
            {activeImage?.url ? (
              <img
                src={activeImage.url}
                alt={activeImage.altText ?? product.title}
                className="tiendaProduct__heroImg"
              />
            ) : (
              <img
                src={shopCardPlaceholder}
                alt=""
                className="tiendaProduct__heroImg tiendaProduct__heroImg--placeholder"
              />
            )}
          </div>
          {product.images.length > 1 ? (
            <ul className="tiendaProduct__thumbs" aria-label="Imágenes">
              {product.images.map((img, i) => (
                <li key={img.url + i}>
                  <button
                    type="button"
                    className={[
                      "tiendaProduct__thumb",
                      i === activeImageIndex
                        ? "tiendaProduct__thumb--active"
                        : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={() => setActiveImageIndex(i)}
                    aria-label={`Imagen ${i + 1}`}
                    aria-current={i === activeImageIndex ? "true" : undefined}
                  >
                    <img src={img.url} alt="" />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div className="tiendaProduct__info">
          <Link to="/tienda" className="tiendaProduct__back">
            ← Tienda
          </Link>
          <h1 className="tiendaProduct__title">{product.title}</h1>
          <p className="tiendaProduct__price">
            {formatShopifyMoney(displayPrice)}
          </p>

          {showVariantPicker ? (
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
          ) : null}

          {product.descriptionHtml ? (
            <div
              className="tiendaProduct__description"
              dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
            />
          ) : null}

          <button
            type="button"
            className="tiendaProduct__addBtn"
            disabled={soldOut || adding || !selectedVariant}
            onClick={() => void onAdd()}
          >
            {soldOut
              ? "Agotado"
              : adding
                ? "Añadiendo…"
                : isTiendaTestMode()
                  ? "Añadir al carrito (prueba)"
                  : "Añadir al carrito"}
          </button>
        </div>
      </div>
    </div>
  );
}
