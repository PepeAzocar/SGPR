/**
 * Prisma 7 exige DateTime ISO-8601 completo; los <input type="date"> del
 * frontend y @IsDateString() solo garantizan "YYYY-MM-DD". Esta función
 * completa el resto del ISO string antes de pasarlo al cliente de Prisma.
 */
export function toIsoDateTime(value?: string): string | undefined {
  if (!value) return undefined;
  return new Date(value).toISOString();
}

export function normalizeEffectiveDates<T extends { effectiveFrom?: string; effectiveTo?: string }>(
  dto: T,
): T {
  return {
    ...dto,
    ...(dto.effectiveFrom !== undefined ? { effectiveFrom: toIsoDateTime(dto.effectiveFrom) } : {}),
    ...(dto.effectiveTo !== undefined ? { effectiveTo: toIsoDateTime(dto.effectiveTo) } : {}),
  };
}
