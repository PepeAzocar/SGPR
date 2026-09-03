import { PrismaService } from '../prisma/prisma.service.js';

const PREFIX_BY_DOCUMENT_TYPE: Record<string, string> = {
  CONTRATO: 'CTR',
  ANEXO: 'ANX',
  CERTIFICADO: 'CER',
};

function prefixFor(documentType: string): string {
  return PREFIX_BY_DOCUMENT_TYPE[documentType] ?? documentType.slice(0, 3).toUpperCase();
}

/** Correlativo por (tipo de documento, año), ej. "CTR-2026-000123". Mismo idioma que Contract.sequenceNumber / EmployeeEvent.sequenceNumber. */
export async function nextDocumentNumber(prisma: PrismaService, documentType: string, year: number): Promise<string> {
  const base = `${prefixFor(documentType)}-${year}-`;
  const last = await prisma.generatedDocument.findFirst({
    where: { documentNumber: { startsWith: base } },
    orderBy: { documentNumber: 'desc' },
  });
  const lastSeq = last ? Number(last.documentNumber.slice(base.length)) : 0;
  const seq = Number.isFinite(lastSeq) ? lastSeq + 1 : 1;
  return `${base}${String(seq).padStart(6, '0')}`;
}
