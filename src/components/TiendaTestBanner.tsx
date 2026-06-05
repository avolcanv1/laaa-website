import { isTiendaTestMode } from "../lib/tiendaTestMode";

export function TiendaTestBanner() {
  if (!isTiendaTestMode()) return null;

  return (
    <p className="tiendaTestBanner" role="status">
      Modo prueba — esta tienda usa pagos de prueba de Shopify; no son ventas
      reales.
    </p>
  );
}
