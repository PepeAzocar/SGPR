import { BadRequestException, ConflictException } from '@nestjs/common';

interface PrismaKnownError {
  code?: string;
}

/**
 * Traduce errores comunes de escritura de Prisma a respuestas HTTP claras.
 * P2003: viola una relación de llave foránea (ej. se envió un id que no existe).
 * P2002: viola una restricción de unicidad (ej. código o período duplicado).
 * Re-lanza cualquier otro error tal cual, para que el filtro global lo maneje.
 */
export function rethrowAsHttpError(err: unknown): never {
  const code = (err as PrismaKnownError)?.code;
  if (code === 'P2003') {
    throw new BadRequestException('Uno de los registros relacionados seleccionados no existe');
  }
  if (code === 'P2002') {
    throw new ConflictException('Ya existe un registro con ese mismo valor único (código, período, etc.)');
  }
  throw err;
}

/**
 * Para delete(): P2003 en un delete significa que otros registros todavía
 * referencian esta fila (restricción RESTRICT), no que falte una relación.
 */
export function rethrowDeleteConflict(err: unknown, message: string): never {
  const code = (err as PrismaKnownError)?.code;
  if (code === 'P2003') {
    throw new ConflictException(message);
  }
  throw err;
}
