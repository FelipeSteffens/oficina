/** Normaliza placa (Mercosul ou antiga) para somente letras/dígitos em caixa alta. */
export function normalizePlate(value = '') {
  return String(value).replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
}

/** ABC1D23 -> ABC-1D23 | ABC1234 -> ABC-1234 */
export function formatPlate(value = '') {
  const plate = normalizePlate(value);
  if (plate.length !== 7) return plate;
  return `${plate.slice(0, 3)}-${plate.slice(3)}`;
}

export function onlyDigits(value = '') {
  return String(value ?? '').replace(/\D/g, '');
}

export function formatPhone(value = '') {
  const d = onlyDigits(value);
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return String(value ?? '');
}

export function formatCpf(value = '') {
  const d = onlyDigits(value);
  if (d.length !== 11) return String(value ?? '');
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

export function formatCnpj(value = '') {
  const d = onlyDigits(value);
  if (d.length !== 14) return String(value ?? '');
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
}

export function toIsoDate(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

export function safeNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}
