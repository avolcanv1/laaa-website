import { useEffect } from "react";
import shopCardPlaceholder from "../assets/shop-card-placeholder.png";
import { useTiendaCart } from "../context/TiendaCartContext";
import { formatShopifyMoney } from "../lib/shopifyStorefront";

export function TiendaCartConfirmPopup() {
  const {
    isConfirmOpen,
    confirmLineId,
    closeConfirm,
    lines,
    subtotal,
    removeLine,
    goToCheckout,
  } = useTiendaCart();

  const line = lines.find((l) => l.id === confirmLineId) ?? null;

  useEffect(() => {
    if (!isConfirmOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeConfirm();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [closeConfirm, isConfirmOpen]);

  useEffect(() => {
    if (isConfirmOpen && confirmLineId && !line) {
      closeConfirm();
    }
  }, [closeConfirm, confirmLineId, isConfirmOpen, line]);

  if (!isConfirmOpen || !line) return null;

  const onRemove = () => {
    void removeLine(line.id);
    closeConfirm();
  };

  const onCheckout = () => {
    closeConfirm();
    void goToCheckout();
  };

  return (
    <>
      <button
        type="button"
        className="tiendaCartConfirmScrim"
        aria-label="Cerrar confirmación"
        onClick={closeConfirm}
      />
      <aside
        className="tiendaCartConfirm"
        aria-label="Producto agregado al carrito"
        role="dialog"
        aria-modal="true"
      >
        <div className="tiendaCartConfirm__header">
          <button
            type="button"
            className="tiendaCartConfirm__close"
            onClick={closeConfirm}
          >
            Cerrar
          </button>
        </div>

        <div className="tiendaCartConfirm__product">
          <div className="tiendaCartConfirm__media">
            {line.imageUrl ? (
              <img
                src={line.imageUrl}
                alt={line.imageAlt ?? ""}
                className="tiendaCartConfirm__img"
              />
            ) : (
              <img
                src={shopCardPlaceholder}
                alt=""
                className="tiendaCartConfirm__img tiendaCartConfirm__img--placeholder"
              />
            )}
          </div>
          <div className="tiendaCartConfirm__details">
            <span className="tiendaCartConfirm__title">{line.title}</span>
            <span className="tiendaCartConfirm__price">
              {formatShopifyMoney(line.price)}
            </span>
            <span className="tiendaCartConfirm__qty">QTY: {line.quantity}</span>
            <button
              type="button"
              className="tiendaCartConfirm__remove"
              onClick={onRemove}
            >
              Quitar
            </button>
          </div>
        </div>

        <div className="tiendaCartConfirm__total">
          Total {formatShopifyMoney(subtotal)}
        </div>

        <button
          type="button"
          className="tiendaCartConfirm__checkout"
          onClick={onCheckout}
        >
          Hacer checkout
        </button>
      </aside>
    </>
  );
}
