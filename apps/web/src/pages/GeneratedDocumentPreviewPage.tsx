import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api, ApiError } from '../api/client';
import type { GeneratedDocument } from '../api/types';

export function GeneratedDocumentPreviewPage() {
  const { id } = useParams<{ id: string }>();
  const [doc, setDoc] = useState<GeneratedDocument | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    api
      .get<GeneratedDocument>(`/generated-documents/${id}`)
      .then(setDoc)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'No se pudo cargar el documento'));
  }, [id]);

  if (error) return <p className="error">{error}</p>;
  if (!doc) return <p>Cargando...</p>;

  return (
    <div>
      <div className="page-header no-print">
        <h1>{doc.documentNumber}</h1>
        <div className="row-actions">
          {doc.status === 'CANCELLED' && <span className="badge cancelled">Anulado</span>}
          <button onClick={() => window.print()}>Imprimir / Guardar PDF</button>
        </div>
      </div>
      <p className="hint no-print">
        Hash SHA-256: <code>{doc.contentHash}</code> · Generado el {new Date(doc.generatedAt).toLocaleString('es-CL')}
        {doc.generatedBy ? ` por ${doc.generatedBy}` : ''}
      </p>
      <div className="document-preview" dangerouslySetInnerHTML={{ __html: doc.content }} />
    </div>
  );
}
