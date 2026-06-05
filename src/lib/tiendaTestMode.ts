export function isTiendaTestMode(): boolean {
  return import.meta.env.VITE_TIENDA_TEST_MODE === "true";
}
