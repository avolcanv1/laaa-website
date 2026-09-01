import { Link } from "react-router-dom";
import shopCardPlaceholder from "../assets/shop-card-placeholder.png";
import { NavPlusIcon } from "../components/NavGlyph";
import { TiendaTestBanner } from "../components/TiendaTestBanner";
import { useTiendaCart } from "../context/TiendaCartContext";
import { isTiendaTestMode } from "../lib/tiendaTestMode";
import { formatShopifyMoney } from "../lib/shopifyStorefront";

export function TiendaCartDrawer() {
  const {
    isDrawerOpen,
    closeDrawer,
    lines,
    subtotal,
    itemCount,
    updateQuantity,
    removeLine,
    goToCheckout,
  } = useTiendaCart();

  if (!isDrawerOpen) return null;

  return (
    <>
      <button
        type="button"
        className="tiendaCartScrim"
        aria-label="Cerrar carrito"
        onClick={closeDrawer}
      />
      <aside
        className="tiendaCartDrawer"
        aria-label="Carrito"
        role="dialog"
        aria-modal="true"
      >
        <header className="tiendaCartDrawer__header">
          <h2 className="tiendaCartDrawer__title">Carrito</h2>
          <button
            type="button"
            className="tiendaCartDrawer__close"
            onClick={closeDrawer}
            aria-label="Cerrar carrito"
          >
            <span className="navGlyph navGlyph--plusWrap tiendaCartDrawer__closeGlyph">
              <NavPlusIcon />
            </span>
          </button>
        </header>

        {lines.length === 0 ? (
          <p className="tiendaCartDrawer__empty">Tu carrito está vacío.</p>
        ) : (
          <>
            <ul className="tiendaCartDrawer__lines">
              {lines.map((line) => (
                <li key={line.id} className="tiendaCartLine">
                  <Link
                    to={
                      line.productHandle
                        ? `/tienda/${line.productHandle}`
                        : "/tienda"
                    }
                    className="tiendaCartLine__media"
                    onClick={closeDrawer}
                  >
                    {line.imageUrl ? (
                      <img
                        src={line.imageUrl}
                        alt={line.imageAlt ?? ""}
                        className="tiendaCartLine__img"
                      />
                    ) : (
                      <img
                        src={shopCardPlaceholder}
                        alt=""
                        className="tiendaCartLine__img tiendaCartLine__img--placeholder"
                      />
                    )}
                  </Link>
                  <div className="tiendaCartLine__body">
                    <Link
                      to={
                        line.productHandle
                          ? `/tienda/${line.productHandle}`
                          : "/tienda"
                      }
                      className="tiendaCartLine__title"
                      onClick={closeDrawer}
                    >
                      {line.title}
                      {line.variantTitle ? (
                        <span className="tiendaCartLine__variant">
                          {line.variantTitle}
                        </span>
                      ) : null}
                    </Link>
                    <span className="tiendaCartLine__price">
                      {formatShopifyMoney(line.lineTotal)}
                    </span>
                    <div className="tiendaCartLine__actions">
                      <div className="tiendaCartLine__qty">
                        <button
                          type="button"
                          className="tiendaCartLine__qtyBtn"
                          aria-label="Disminuir cantidad"
                          disabled={line.quantity <= 1}
                          onClick={() =>
                            void updateQuantity(line.id, line.quantity - 1)
                          }
                        >
                          −
                        </button>
                        <span className="tiendaCartLine__qtyVal">
                          {line.quantity}
                        </span>
                        <button
                          type="button"
                          className="tiendaCartLine__qtyBtn"
                          aria-label="Aumentar cantidad"
                          onClick={() =>
                            void updateQuantity(line.id, line.quantity + 1)
                          }
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        className="tiendaCartLine__remove"
                        onClick={() => void removeLine(line.id)}
                      >
                        Quitar
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <footer className="tiendaCartDrawer__footer">
              <TiendaTestBanner />
              <div className="tiendaCartDrawer__subtotal">
                <span>Subtotal</span>
                <span>{formatShopifyMoney(subtotal)}</span>
              </div>
              <button
                type="button"
                className="tiendaCartDrawer__checkout"
                disabled={itemCount === 0}
                onClick={() => void goToCheckout()}
              >
                {isTiendaTestMode() ? "Probar checkout" : "Finalizar compra"}
              </button>
            </footer>
          </>
        )}
      </aside>
    </>
  );
}
