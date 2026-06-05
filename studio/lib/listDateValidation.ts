/** Valida fechas de listado en formato numérico AAAA.MM.DD (ej. 2026.12.31). */
export function validateListDate(value: string | undefined): string | true {
  if (!value?.trim()) {
    return "La fecha es obligatoria.";
  }

  if (!/^\d{4}\.\d{2}\.\d{2}$/.test(value)) {
    return "Usa solo números con el formato 2026.12.31";
  }

  const [year, month, day] = value.split(".").map(Number);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return "Fecha no válida.";
  }

  return true;
}
