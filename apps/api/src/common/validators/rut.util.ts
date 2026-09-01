/** Utilidades para validar y formatear RUT chileno. */

export function cleanRut(rut: string): string {
  return rut.replace(/[.\s]/g, '').toUpperCase();
}

export function computeVerifierDigit(body: string): string {
  let sum = 0;
  let multiplier = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += Number(body[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }
  const remainder = 11 - (sum % 11);
  if (remainder === 11) return '0';
  if (remainder === 10) return 'K';
  return String(remainder);
}

export function isValidRut(rut: string): boolean {
  const clean = cleanRut(rut).replace('-', '');
  if (clean.length < 2) return false;
  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);
  if (!/^\d+$/.test(body)) return false;
  return computeVerifierDigit(body) === dv;
}

export function formatRut(rut: string): string {
  const clean = cleanRut(rut).replace('-', '');
  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);
  const withDots = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${withDots}-${dv}`;
}
