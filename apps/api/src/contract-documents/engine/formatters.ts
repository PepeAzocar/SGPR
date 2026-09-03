/**
 * Funciones de formato para el motor de plantillas ({{token|formatter}} /
 * {{token|formatter:arg}}). Cada una recibe el valor crudo ya resuelto por un
 * token resolver y un argumento de pipe opcional (siempre string, tal como
 * viene escrito en la plantilla).
 */
import { formatRut } from '../../common/validators/rut.util.js';

const MONTHS_ES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

function toDate(value: unknown): Date | null {
  if (value instanceof Date) return value;
  if (typeof value === 'string' && value) {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return null;
}

/** "1 de septiembre de 2026" */
export function dateLong(value: unknown): string {
  const d = toDate(value);
  if (!d) return '';
  return `${d.getUTCDate()} de ${MONTHS_ES[d.getUTCMonth()]} de ${d.getUTCFullYear()}`;
}

/** "$1.250.000" */
export function currencyCLP(value: unknown): string {
  const n = Math.round(Number(value) || 0);
  return `$${n.toLocaleString('es-CL')}`;
}

const UNITS = ['', 'un', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'];
const TEENS = ['diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve'];
const TENS = ['', '', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
const HUNDREDS = ['', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos'];

function threeDigitsToWords(n: number): string {
  if (n === 0) return '';
  if (n === 100) return 'cien';
  const h = Math.floor(n / 100);
  const rest = n % 100;
  const parts: string[] = [];
  if (h > 0) parts.push(HUNDREDS[h]);
  if (rest > 0) {
    if (rest < 10) parts.push(UNITS[rest]);
    else if (rest < 20) parts.push(TEENS[rest - 10]);
    else {
      const t = Math.floor(rest / 10);
      const u = rest % 10;
      parts.push(u === 0 ? TENS[t] : `${TENS[t]} y ${UNITS[u]}`);
    }
  }
  return parts.join(' ');
}

function integerToWords(n: number): string {
  if (n === 0) return 'cero';
  if (n < 0) return `menos ${integerToWords(-n)}`;

  const millones = Math.floor(n / 1_000_000);
  const miles = Math.floor((n % 1_000_000) / 1000);
  const resto = n % 1000;

  const parts: string[] = [];
  if (millones > 0) {
    parts.push(millones === 1 ? 'un millón' : `${integerToWords(millones)} millones`);
  }
  if (miles > 0) {
    parts.push(miles === 1 ? 'mil' : `${threeDigitsToWords(miles)} mil`);
  }
  if (resto > 0) {
    parts.push(threeDigitsToWords(resto));
  }
  return parts.join(' ');
}

/** "$1.250.000 (un millón doscientos cincuenta mil pesos)" */
export function currencyClpWords(value: unknown): string {
  const n = Math.round(Number(value) || 0);
  const words = integerToWords(Math.abs(n));
  return `${n < 0 ? 'menos ' : ''}${words} pesos`;
}

export function rut(value: unknown): string {
  if (!value) return '';
  try {
    return formatRut(String(value));
  } catch {
    return String(value);
  }
}

export function uppercase(value: unknown): string {
  return value == null ? '' : String(value).toUpperCase();
}

export function decimal(value: unknown, arg?: string): string {
  const digits = arg ? Number(arg) : 2;
  const n = Number(value);
  if (Number.isNaN(n)) return '';
  return n.toFixed(Number.isFinite(digits) ? digits : 2);
}

export type Formatter = (value: unknown, arg?: string) => string;

export const FORMATTERS: Record<string, Formatter> = {
  dateLong,
  currencyCLP,
  currencyCLPWords: currencyClpWords,
  rut,
  uppercase,
  decimal,
};
