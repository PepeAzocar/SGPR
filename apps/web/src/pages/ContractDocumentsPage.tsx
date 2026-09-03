import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { api, ApiError } from '../api/client';
import { OrgMaintainerPage, type ColumnConfig, type FieldConfig } from '../components/OrgMaintainer';
import { TokenPicker } from '../components/TokenPicker';
import type {
  Clause,
  ClauseVersion,
  Contract,
  ContractMatrix,
  ContractMatrixStatus,
  ContractTemplate,
  ContractTemplateVersion,
  ContractType,
  DocumentTokenDefinition,
  Employee,
  GeneratedDocument,
  LaborRegime,
} from '../api/types';

type Tab = 'matrices' | 'templates' | 'clauses' | 'tokens' | 'documents';

const MATRIX_STATUS_LABEL: Record<ContractMatrixStatus, string> = {
  DRAFT: 'Borrador',
  ACTIVE: 'Activa',
  INACTIVE: 'Inactiva',
};

const DOCUMENT_TYPE_OPTIONS = [
  { value: 'CONTRATO', label: 'Contrato' },
  { value: 'ANEXO', label: 'Anexo' },
  { value: 'CERTIFICADO', label: 'Certificado' },
];

function fmtDate(v?: string | null): string {
  return v ? new Date(v).toLocaleDateString('es-CL') : '-';
}
function fmtDateTime(v?: string | null): string {
  return v ? new Date(v).toLocaleString('es-CL') : '-';
}

export function ContractDocumentsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const [tab, setTab] = useState<Tab>('matrices');
  const [tokens, setTokens] = useState<DocumentTokenDefinition[]>([]);

  useEffect(() => {
    api.get<DocumentTokenDefinition[]>('/document-tokens').then(setTokens).catch(() => {});
  }, []);

  return (
    <div>
      <h1>Gestión Contractual</h1>
      <p className="hint">
        Motor de documentos contractuales: una matriz decide qué plantilla usar según tipo de documento, régimen
        jurídico y tipo de contrato; la plantilla y las cláusulas nunca se editan una vez publicadas — todo cambio
        crea una nueva versión. Al generar un documento, el HTML final y cada dato usado quedan congelados de forma
        permanente, aunque el colaborador cambie después de sueldo, cargo o dirección.
      </p>
      <div className="tabs">
        <button className={tab === 'matrices' ? 'active' : ''} onClick={() => setTab('matrices')}>
          Matrices
        </button>
        <button className={tab === 'templates' ? 'active' : ''} onClick={() => setTab('templates')}>
          Plantillas
        </button>
        <button className={tab === 'clauses' ? 'active' : ''} onClick={() => setTab('clauses')}>
          Cláusulas
        </button>
        <button className={tab === 'tokens' ? 'active' : ''} onClick={() => setTab('tokens')}>
          Tokens
        </button>
        <button className={tab === 'documents' ? 'active' : ''} onClick={() => setTab('documents')}>
          Documentos generados
        </button>
      </div>

      {tab === 'matrices' && <MatricesTab isAdmin={isAdmin} />}
      {tab === 'templates' && <TemplatesTab isAdmin={isAdmin} tokens={tokens} />}
      {tab === 'clauses' && <ClausesTab isAdmin={isAdmin} tokens={tokens} />}
      {tab === 'tokens' && <TokensTab isAdmin={isAdmin} />}
      {tab === 'documents' && <DocumentsTab />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Matrices: enrutamiento (qué plantilla usar) + cláusulas asignadas.
// ---------------------------------------------------------------------------

const emptyMatrixForm = {
  code: '',
  name: '',
  documentType: 'CONTRATO',
  legalRegimeId: '',
  contractTypeId: '',
  templateId: '',
  priority: '500',
  validFrom: '',
  validTo: '',
};

function MatricesTab({ isAdmin }: { isAdmin: boolean }) {
  const [matrices, setMatrices] = useState<ContractMatrix[]>([]);
  const [laborRegimes, setLaborRegimes] = useState<LaborRegime[]>([]);
  const [contractTypes, setContractTypes] = useState<ContractType[]>([]);
  const [templates, setTemplates] = useState<ContractTemplate[]>([]);
  const [clauses, setClauses] = useState<Clause[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyMatrixForm);
  const [selectedId, setSelectedId] = useState('');
  const [newClause, setNewClause] = useState({ clauseId: '', sequence: '10', mandatory: 'true' });
  const [error, setError] = useState<string | null>(null);

  async function loadMatrices() {
    setMatrices(await api.get<ContractMatrix[]>('/contract-matrices'));
  }

  useEffect(() => {
    Promise.all([
      api.get<LaborRegime[]>('/labor-regimes'),
      api.get<ContractType[]>('/contract-types'),
      api.get<ContractTemplate[]>('/contract-templates'),
      api.get<Clause[]>('/clauses'),
    ])
      .then(([lr, ct, tpl, cl]) => {
        setLaborRegimes(lr);
        setContractTypes(ct);
        setTemplates(tpl);
        setClauses(cl);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Error al cargar catálogos'));
    loadMatrices().catch((err) => setError(err instanceof ApiError ? err.message : 'Error al cargar matrices'));
  }, []);

  const selected = matrices.find((m) => m.id === selectedId);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await api.post('/contract-matrices', {
        code: form.code,
        name: form.name,
        documentType: form.documentType,
        legalRegimeId: form.legalRegimeId || undefined,
        contractTypeId: form.contractTypeId || undefined,
        templateId: form.templateId,
        priority: Number(form.priority) || undefined,
        validFrom: form.validFrom,
        validTo: form.validTo || undefined,
      });
      setForm(emptyMatrixForm);
      setShowForm(false);
      await loadMatrices();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo guardar la matriz');
    }
  }

  async function handleAction(id: string, action: 'activate' | 'deactivate') {
    setError(null);
    try {
      await api.post(`/contract-matrices/${id}/${action}`);
      await loadMatrices();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo completar la acción');
    }
  }

  async function handleDelete(m: ContractMatrix) {
    if (!window.confirm(`¿Eliminar la matriz "${m.name}" (borrador)?`)) return;
    setError(null);
    try {
      await api.delete(`/contract-matrices/${m.id}`);
      await loadMatrices();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo eliminar');
    }
  }

  async function handleAddClause(e: FormEvent) {
    e.preventDefault();
    if (!selectedId || !newClause.clauseId) return;
    setError(null);
    try {
      await api.post(`/contract-matrices/${selectedId}/clauses`, {
        clauseId: newClause.clauseId,
        sequence: Number(newClause.sequence) || 0,
        mandatory: newClause.mandatory === 'true',
      });
      setNewClause({ clauseId: '', sequence: '10', mandatory: 'true' });
      await loadMatrices();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo agregar la cláusula');
    }
  }

  async function handleRemoveClause(matrixClauseId: string) {
    if (!selectedId) return;
    setError(null);
    try {
      await api.delete(`/contract-matrices/${selectedId}/clauses/${matrixClauseId}`);
      await loadMatrices();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo quitar la cláusula');
    }
  }

  return (
    <div>
      {error && <p className="error">{error}</p>}
      <p className="hint">
        La matriz sólo decide qué plantilla corresponde según tipo de documento, régimen jurídico y tipo de
        contrato; el texto legal vive en la plantilla y sus cláusulas. Editable sólo en BORRADOR — para reemplazar
        una matriz ACTIVA, desactívela y cree una nueva.
      </p>
      <div className="page-header">
        <button onClick={() => setShowForm((v) => !v)}>{showForm ? 'Cancelar' : 'Nueva matriz'}</button>
      </div>

      {showForm && (
        <form className="card form-grid" onSubmit={handleSubmit}>
          <label>
            Código
            <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} maxLength={80} required />
          </label>
          <label>
            Nombre
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={200} required />
          </label>
          <label>
            Tipo de documento
            <select value={form.documentType} onChange={(e) => setForm({ ...form, documentType: e.target.value })} required>
              {DOCUMENT_TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Plantilla
            <select value={form.templateId} onChange={(e) => setForm({ ...form, templateId: e.target.value })} required>
              <option value="">Seleccionar...</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.code})
                </option>
              ))}
            </select>
          </label>
          <label>
            Régimen jurídico (opcional)
            <select value={form.legalRegimeId} onChange={(e) => setForm({ ...form, legalRegimeId: e.target.value })}>
              <option value="">Todos</option>
              {laborRegimes.map((lr) => (
                <option key={lr.id} value={lr.id}>
                  {lr.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Tipo de contrato (opcional)
            <select value={form.contractTypeId} onChange={(e) => setForm({ ...form, contractTypeId: e.target.value })}>
              <option value="">Todos</option>
              {contractTypes.map((ct) => (
                <option key={ct.id} value={ct.id}>
                  {ct.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Prioridad
            <input type="number" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} />
          </label>
          <label>
            Vigente desde
            <input type="date" value={form.validFrom} onChange={(e) => setForm({ ...form, validFrom: e.target.value })} required />
          </label>
          <label>
            Vigente hasta
            <input type="date" value={form.validTo} onChange={(e) => setForm({ ...form, validTo: e.target.value })} />
          </label>
          <div className="form-actions">
            <button type="submit">Guardar como borrador</button>
          </div>
        </form>
      )}

      <table className="table">
        <thead>
          <tr>
            <th>Código</th>
            <th>Nombre</th>
            <th>Tipo doc.</th>
            <th>Régimen</th>
            <th>Plantilla</th>
            <th>Vigencia</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {matrices.map((m) => (
            <tr key={m.id} onClick={() => setSelectedId(m.id)} style={{ cursor: 'pointer', background: m.id === selectedId ? '#eef2ff' : undefined }}>
              <td>{m.code}</td>
              <td>{m.name}</td>
              <td>{m.documentType}</td>
              <td>{m.legalRegime?.name ?? 'Todos'}</td>
              <td>{m.template?.name}</td>
              <td>
                {fmtDate(m.validFrom)} — {m.validTo ? fmtDate(m.validTo) : 'vigente'}
              </td>
              <td>
                <span className={`badge ${m.status.toLowerCase()}`}>{MATRIX_STATUS_LABEL[m.status]}</span>
              </td>
              <td className="row-actions" onClick={(e) => e.stopPropagation()}>
                {m.status === 'DRAFT' && isAdmin && (
                  <>
                    <button onClick={() => handleAction(m.id, 'activate')}>Activar</button>
                    <button className="danger-btn" onClick={() => handleDelete(m)}>
                      Eliminar
                    </button>
                  </>
                )}
                {m.status === 'ACTIVE' && isAdmin && (
                  <button className="danger-btn" onClick={() => handleAction(m.id, 'deactivate')}>
                    Desactivar
                  </button>
                )}
              </td>
            </tr>
          ))}
          {matrices.length === 0 && (
            <tr>
              <td colSpan={8} className="empty">
                Sin matrices registradas.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {selected && (
        <div className="card">
          <h2 style={{ marginTop: 0 }}>Cláusulas de "{selected.name}"</h2>
          {selected.status === 'DRAFT' && (
            <form className="inline-form" onSubmit={handleAddClause}>
              <select value={newClause.clauseId} onChange={(e) => setNewClause({ ...newClause, clauseId: e.target.value })} required>
                <option value="">Seleccionar cláusula...</option>
                {clauses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
              <input
                type="number"
                style={{ width: '70px' }}
                value={newClause.sequence}
                onChange={(e) => setNewClause({ ...newClause, sequence: e.target.value })}
                title="Orden"
              />
              <select value={newClause.mandatory} onChange={(e) => setNewClause({ ...newClause, mandatory: e.target.value })}>
                <option value="true">Obligatoria</option>
                <option value="false">Opcional</option>
              </select>
              <button type="submit">Agregar</button>
            </form>
          )}
          <table className="table nested">
            <thead>
              <tr>
                <th>Orden</th>
                <th>Cláusula</th>
                <th>Carácter</th>
                {selected.status === 'DRAFT' && <th></th>}
              </tr>
            </thead>
            <tbody>
              {(selected.clauses ?? []).map((mc) => (
                <tr key={mc.id}>
                  <td>{mc.sequence}</td>
                  <td>{mc.clause?.name}</td>
                  <td>{mc.mandatory ? 'Obligatoria' : 'Opcional'}</td>
                  {selected.status === 'DRAFT' && (
                    <td>
                      <button className="danger-btn" onClick={() => handleRemoveClause(mc.id)}>
                        Quitar
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              {(selected.clauses ?? []).length === 0 && (
                <tr>
                  <td colSpan={4} className="empty">
                    Sin cláusulas asignadas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Plantillas: header (ContractTemplate) + versiones (contenido HTML con tokens).
// ---------------------------------------------------------------------------

function TemplatesTab({ isAdmin, tokens }: { isAdmin: boolean; tokens: DocumentTokenDefinition[] }) {
  const [templates, setTemplates] = useState<ContractTemplate[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ code: '', name: '', documentType: 'CONTRATO' });
  const [newContent, setNewContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  async function load() {
    setTemplates(await api.get<ContractTemplate[]>('/contract-templates'));
  }

  useEffect(() => {
    load().catch((err) => setError(err instanceof ApiError ? err.message : 'Error al cargar plantillas'));
  }, []);

  const selected = templates.find((t) => t.id === selectedId);
  const draftVersion = selected?.versions?.find((v) => v.status === 'DRAFT');

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await api.post('/contract-templates', form);
      setForm({ code: '', name: '', documentType: 'CONTRATO' });
      setShowCreate(false);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo crear la plantilla');
    }
  }

  async function handleNewVersion(e: FormEvent) {
    e.preventDefault();
    if (!selectedId) return;
    setError(null);
    try {
      await api.post(`/contract-templates/${selectedId}/versions`, { content: newContent });
      setNewContent('');
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo crear la versión (revise los tokens usados)');
    }
  }

  async function handleSaveDraft(versionId: string, content: string) {
    setError(null);
    try {
      await api.patch(`/contract-templates/versions/${versionId}`, { content });
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo guardar el borrador');
    }
  }

  async function handlePublish(versionId: string) {
    if (!window.confirm('¿Publicar esta versión? Una vez publicada no podrá editarse.')) return;
    setError(null);
    try {
      await api.post(`/contract-templates/versions/${versionId}/publish`);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo publicar');
    }
  }

  async function handleRetire(versionId: string) {
    setError(null);
    try {
      await api.post(`/contract-templates/versions/${versionId}/retire`);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo retirar');
    }
  }

  return (
    <div>
      {error && <p className="error">{error}</p>}
      <div className="page-header">
        <button onClick={() => setShowCreate((v) => !v)}>{showCreate ? 'Cancelar' : 'Nueva plantilla'}</button>
      </div>
      {showCreate && (
        <form className="card form-grid" onSubmit={handleCreate}>
          <label>
            Código
            <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} maxLength={80} required />
          </label>
          <label>
            Nombre
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={200} required />
          </label>
          <label>
            Tipo de documento
            <select value={form.documentType} onChange={(e) => setForm({ ...form, documentType: e.target.value })}>
              {DOCUMENT_TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <div className="form-actions">
            <button type="submit">Crear</button>
          </div>
        </form>
      )}

      <table className="table">
        <thead>
          <tr>
            <th>Código</th>
            <th>Nombre</th>
            <th>Tipo doc.</th>
            <th>Versiones</th>
          </tr>
        </thead>
        <tbody>
          {templates.map((t) => (
            <tr key={t.id} onClick={() => setSelectedId(t.id)} style={{ cursor: 'pointer', background: t.id === selectedId ? '#eef2ff' : undefined }}>
              <td>{t.code}</td>
              <td>{t.name}</td>
              <td>{t.documentType}</td>
              <td>{t.versions?.length ?? 0}</td>
            </tr>
          ))}
          {templates.length === 0 && (
            <tr>
              <td colSpan={4} className="empty">
                Sin plantillas registradas.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {selected && (
        <div className="card">
          <h2 style={{ marginTop: 0 }}>Versiones de "{selected.name}"</h2>
          <table className="table nested">
            <thead>
              <tr>
                <th>Versión</th>
                <th>Estado</th>
                <th>Publicada</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {(selected.versions ?? []).map((v) => (
                <TemplateVersionRow
                  key={v.id}
                  version={v}
                  isAdmin={isAdmin}
                  tokens={tokens}
                  onSaveDraft={handleSaveDraft}
                  onPublish={handlePublish}
                  onRetire={handleRetire}
                />
              ))}
              {(selected.versions ?? []).length === 0 && (
                <tr>
                  <td colSpan={4} className="empty">
                    Sin versiones.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {!draftVersion && (
            <>
              <h3>Nueva versión</h3>
              <form onSubmit={handleNewVersion}>
                <div className="token-editor-layout">
                  <TokenPicker tokens={tokens} textareaRef={textareaRef} value={newContent} onChange={setNewContent} />
                  <textarea
                    ref={textareaRef}
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    rows={14}
                    placeholder="<h1>CONTRATO DE TRABAJO</h1>&#10;{{clauses}}"
                    style={{ width: '100%', fontFamily: 'monospace' }}
                  />
                </div>
                <div className="form-actions" style={{ marginTop: '0.75rem' }}>
                  <button type="submit" disabled={!newContent}>
                    Crear versión (borrador)
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function TemplateVersionRow({
  version,
  isAdmin,
  tokens,
  onSaveDraft,
  onPublish,
  onRetire,
}: {
  version: ContractTemplateVersion;
  isAdmin: boolean;
  tokens: DocumentTokenDefinition[];
  onSaveDraft: (id: string, content: string) => void;
  onPublish: (id: string) => void;
  onRetire: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState(version.content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  return (
    <>
      <tr>
        <td>v{version.versionNumber}</td>
        <td>
          <span className={`badge ${version.status.toLowerCase()}`}>{version.status}</span>
        </td>
        <td>{fmtDateTime(version.publishedAt)}</td>
        <td className="row-actions">
          {version.status === 'DRAFT' && (
            <>
              <button onClick={() => setEditing((v) => !v)}>{editing ? 'Cerrar' : 'Editar'}</button>
              <button onClick={() => onPublish(version.id)}>Publicar</button>
            </>
          )}
          {version.status === 'PUBLISHED' && isAdmin && (
            <button className="danger-btn" onClick={() => onRetire(version.id)}>
              Retirar
            </button>
          )}
        </td>
      </tr>
      {editing && (
        <tr>
          <td colSpan={4}>
            <div className="token-editor-layout">
              <TokenPicker tokens={tokens} textareaRef={textareaRef} value={content} onChange={setContent} />
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={14}
                style={{ width: '100%', fontFamily: 'monospace' }}
              />
            </div>
            <div className="form-actions" style={{ marginTop: '0.5rem' }}>
              <button onClick={() => onSaveDraft(version.id, content)}>Guardar borrador</button>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Cláusulas: mismo patrón que Plantillas, para Clause/ClauseVersion.
// ---------------------------------------------------------------------------

function ClausesTab({ isAdmin, tokens }: { isAdmin: boolean; tokens: DocumentTokenDefinition[] }) {
  const [clausesList, setClausesList] = useState<Clause[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ code: '', name: '', description: '' });
  const [newContent, setNewContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  async function load() {
    setClausesList(await api.get<Clause[]>('/clauses'));
  }

  useEffect(() => {
    load().catch((err) => setError(err instanceof ApiError ? err.message : 'Error al cargar cláusulas'));
  }, []);

  const selected = clausesList.find((c) => c.id === selectedId);
  const draftVersion = selected?.versions?.find((v) => v.status === 'DRAFT');

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await api.post('/clauses', { code: form.code, name: form.name, description: form.description || undefined });
      setForm({ code: '', name: '', description: '' });
      setShowCreate(false);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo crear la cláusula');
    }
  }

  async function handleNewVersion(e: FormEvent) {
    e.preventDefault();
    if (!selectedId) return;
    setError(null);
    try {
      await api.post(`/clauses/${selectedId}/versions`, { content: newContent });
      setNewContent('');
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo crear la versión (revise los tokens usados)');
    }
  }

  async function handleSaveDraft(versionId: string, content: string) {
    setError(null);
    try {
      await api.patch(`/clauses/versions/${versionId}`, { content });
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo guardar el borrador');
    }
  }

  async function handlePublish(versionId: string) {
    if (!window.confirm('¿Publicar esta versión? Una vez publicada no podrá editarse.')) return;
    setError(null);
    try {
      await api.post(`/clauses/versions/${versionId}/publish`);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo publicar');
    }
  }

  async function handleRetire(versionId: string) {
    setError(null);
    try {
      await api.post(`/clauses/versions/${versionId}/retire`);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo retirar');
    }
  }

  return (
    <div>
      {error && <p className="error">{error}</p>}
      <div className="page-header">
        <button onClick={() => setShowCreate((v) => !v)}>{showCreate ? 'Cancelar' : 'Nueva cláusula'}</button>
      </div>
      {showCreate && (
        <form className="card form-grid" onSubmit={handleCreate}>
          <label>
            Código
            <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} maxLength={80} required />
          </label>
          <label>
            Nombre
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={200} required />
          </label>
          <label style={{ gridColumn: '1 / -1' }}>
            Descripción
            <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} maxLength={500} />
          </label>
          <div className="form-actions">
            <button type="submit">Crear</button>
          </div>
        </form>
      )}

      <table className="table">
        <thead>
          <tr>
            <th>Código</th>
            <th>Nombre</th>
            <th>Versiones</th>
          </tr>
        </thead>
        <tbody>
          {clausesList.map((c) => (
            <tr key={c.id} onClick={() => setSelectedId(c.id)} style={{ cursor: 'pointer', background: c.id === selectedId ? '#eef2ff' : undefined }}>
              <td>{c.code}</td>
              <td>{c.name}</td>
              <td>{c.versions?.length ?? 0}</td>
            </tr>
          ))}
          {clausesList.length === 0 && (
            <tr>
              <td colSpan={3} className="empty">
                Sin cláusulas registradas.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {selected && (
        <div className="card">
          <h2 style={{ marginTop: 0 }}>Versiones de "{selected.name}"</h2>
          <table className="table nested">
            <thead>
              <tr>
                <th>Versión</th>
                <th>Estado</th>
                <th>Publicada</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {(selected.versions ?? []).map((v) => (
                <ClauseVersionRow
                  key={v.id}
                  version={v}
                  isAdmin={isAdmin}
                  tokens={tokens}
                  onSaveDraft={handleSaveDraft}
                  onPublish={handlePublish}
                  onRetire={handleRetire}
                />
              ))}
              {(selected.versions ?? []).length === 0 && (
                <tr>
                  <td colSpan={4} className="empty">
                    Sin versiones.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {!draftVersion && (
            <>
              <h3>Nueva versión</h3>
              <form onSubmit={handleNewVersion}>
                <div className="token-editor-layout">
                  <TokenPicker tokens={tokens} textareaRef={textareaRef} value={newContent} onChange={setNewContent} />
                  <textarea
                    ref={textareaRef}
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    rows={10}
                    placeholder="<p>{{employee.fullName}} ...</p>"
                    style={{ width: '100%', fontFamily: 'monospace' }}
                  />
                </div>
                <div className="form-actions" style={{ marginTop: '0.75rem' }}>
                  <button type="submit" disabled={!newContent}>
                    Crear versión (borrador)
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function ClauseVersionRow({
  version,
  isAdmin,
  tokens,
  onSaveDraft,
  onPublish,
  onRetire,
}: {
  version: ClauseVersion;
  isAdmin: boolean;
  tokens: DocumentTokenDefinition[];
  onSaveDraft: (id: string, content: string) => void;
  onPublish: (id: string) => void;
  onRetire: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState(version.content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  return (
    <>
      <tr>
        <td>v{version.versionNumber}</td>
        <td>
          <span className={`badge ${version.status.toLowerCase()}`}>{version.status}</span>
        </td>
        <td>{fmtDateTime(version.publishedAt)}</td>
        <td className="row-actions">
          {version.status === 'DRAFT' && (
            <>
              <button onClick={() => setEditing((v) => !v)}>{editing ? 'Cerrar' : 'Editar'}</button>
              <button onClick={() => onPublish(version.id)}>Publicar</button>
            </>
          )}
          {version.status === 'PUBLISHED' && isAdmin && (
            <button className="danger-btn" onClick={() => onRetire(version.id)}>
              Retirar
            </button>
          )}
        </td>
      </tr>
      {editing && (
        <tr>
          <td colSpan={4}>
            <div className="token-editor-layout">
              <TokenPicker tokens={tokens} textareaRef={textareaRef} value={content} onChange={setContent} />
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={10}
                style={{ width: '100%', fontFamily: 'monospace' }}
              />
            </div>
            <div className="form-actions" style={{ marginTop: '0.5rem' }}>
              <button onClick={() => onSaveDraft(version.id, content)}>Guardar borrador</button>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Tokens: catálogo, reutiliza el mantenedor genérico.
// ---------------------------------------------------------------------------

const tokenColumns: ColumnConfig[] = [
  { key: 'namespace', label: 'Namespace' },
  { key: 'code', label: 'Código' },
  { key: 'name', label: 'Nombre' },
  { key: 'dataType', label: 'Tipo' },
  { key: 'required', label: 'Obligatorio', format: (v) => (v ? 'Sí' : 'No') },
  { key: 'active', label: 'Activo', format: (v) => (v ? 'Sí' : 'No') },
];

const tokenFields: FieldConfig[] = [
  { key: 'code', label: 'Código', type: 'text', required: true, maxLength: 100 },
  { key: 'namespace', label: 'Namespace', type: 'text', required: true, maxLength: 50 },
  { key: 'name', label: 'Nombre', type: 'text', required: true, maxLength: 150 },
  {
    key: 'dataType',
    label: 'Tipo de dato',
    type: 'select',
    required: true,
    staticOptions: [
      { value: 'STRING', label: 'Texto' },
      { value: 'DATE', label: 'Fecha' },
      { value: 'DECIMAL', label: 'Número' },
      { value: 'BOOLEAN', label: 'Sí/No' },
    ],
  },
  { key: 'description', label: 'Descripción', type: 'text', maxLength: 300 },
  { key: 'sourceEntity', label: 'Entidad origen', type: 'text', maxLength: 50 },
  { key: 'required', label: 'Obligatorio', type: 'boolean' },
  { key: 'sensitive', label: 'Sensible', type: 'boolean' },
  { key: 'active', label: 'Activo', type: 'boolean' },
];

function TokensTab({ isAdmin }: { isAdmin: boolean }) {
  return (
    <>
      <p className="hint">
        Catálogo de los tokens disponibles para plantillas y cláusulas (ej. employee.fullName, contract.startDate,
        compensation.baseSalary). Alimenta el selector "Insertar token" del editor.
      </p>
      <OrgMaintainerPage title="Token" resource="/document-tokens" columns={tokenColumns} fields={tokenFields} canWrite={isAdmin} />
    </>
  );
}

// ---------------------------------------------------------------------------
// Documentos generados: formulario de emisión + historial.
// ---------------------------------------------------------------------------

function currentContractOf(employeeId: string, contracts: Contract[]): Contract | undefined {
  return contracts
    .filter((c) => c.employeeId === employeeId && c.isActive)
    .sort((a, b) => b.startDate.localeCompare(a.startDate))[0];
}

const today = new Date().toISOString().slice(0, 10);

function DocumentsTab() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [matrices, setMatrices] = useState<ContractMatrix[]>([]);
  const [documents, setDocuments] = useState<GeneratedDocument[]>([]);
  const [employeeId, setEmployeeId] = useState('');
  const [matrixId, setMatrixId] = useState('');
  const [documentDate, setDocumentDate] = useState(today);
  const [effectiveDate, setEffectiveDate] = useState(today);
  const [preview, setPreview] = useState<{ content: string; missingTokens: string[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function loadDocuments() {
    setDocuments(await api.get<GeneratedDocument[]>('/generated-documents'));
  }

  useEffect(() => {
    Promise.all([
      api.get<Employee[]>('/employees'),
      api.get<Contract[]>('/contracts'),
      api.get<ContractMatrix[]>('/contract-matrices?status=ACTIVE'),
    ])
      .then(([emp, con, mat]) => {
        setEmployees(emp);
        setContracts(con);
        setMatrices(mat);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Error al cargar catálogos'));
    loadDocuments().catch((err) => setError(err instanceof ApiError ? err.message : 'Error al cargar documentos'));
  }, []);

  const contract = employeeId ? currentContractOf(employeeId, contracts) : undefined;
  const canSubmit = !!employeeId && !!matrixId && !!contract && !!documentDate && !!effectiveDate;

  function payload() {
    return { matrixId, employeeId, contractId: contract!.id, documentDate, effectiveDate };
  }

  async function handlePreview() {
    if (!canSubmit) return;
    setError(null);
    setPreview(null);
    setBusy(true);
    try {
      const res = await api.post<{ content: string; missingTokens: string[] }>('/generated-documents/preview', payload());
      setPreview(res);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo generar la vista previa');
    } finally {
      setBusy(false);
    }
  }

  async function handleGenerate(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setError(null);
    setBusy(true);
    try {
      await api.post('/generated-documents/generate', payload());
      setPreview(null);
      await loadDocuments();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo generar el documento');
    } finally {
      setBusy(false);
    }
  }

  async function handleCancel(doc: GeneratedDocument) {
    const reason = window.prompt(`¿Anular el documento ${doc.documentNumber}? Indique el motivo:`);
    if (reason === null) return;
    setError(null);
    try {
      await api.post(`/generated-documents/${doc.id}/cancel`, { reason: reason || undefined });
      await loadDocuments();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo anular el documento');
    }
  }

  return (
    <div>
      {error && <p className="error">{error}</p>}

      <form className="card form-grid" onSubmit={handleGenerate}>
        <label>
          Colaborador
          <select value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} required>
            <option value="">Seleccionar...</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.firstName} {e.lastName}
              </option>
            ))}
          </select>
        </label>
        <label>
          Matriz
          <select value={matrixId} onChange={(e) => setMatrixId(e.target.value)} required>
            <option value="">Seleccionar...</option>
            {matrices.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Fecha del documento
          <input type="date" value={documentDate} onChange={(e) => setDocumentDate(e.target.value)} required />
        </label>
        <label>
          Fecha efectiva
          <input type="date" value={effectiveDate} onChange={(e) => setEffectiveDate(e.target.value)} required />
        </label>
        {employeeId && !contract && (
          <div style={{ gridColumn: '1 / -1' }}>
            <p className="error">Este colaborador no tiene un contrato activo.</p>
          </div>
        )}
        <div className="form-actions row-actions">
          <button type="button" onClick={handlePreview} disabled={!canSubmit || busy}>
            Vista previa
          </button>
          <button type="submit" disabled={!canSubmit || busy}>
            Generar
          </button>
        </div>
      </form>

      {preview && (
        <div className="card">
          <h2 style={{ marginTop: 0 }}>Vista previa</h2>
          {preview.missingTokens.length > 0 && (
            <p className="error">Tokens sin datos disponibles: {preview.missingTokens.join(', ')}</p>
          )}
          <div className="document-preview" dangerouslySetInnerHTML={{ __html: preview.content }} />
        </div>
      )}

      <table className="table">
        <thead>
          <tr>
            <th>N° documento</th>
            <th>Colaborador</th>
            <th>Matriz</th>
            <th>Fecha</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {documents.map((d) => (
            <tr key={d.id}>
              <td>{d.documentNumber}</td>
              <td>
                {d.employee?.firstName} {d.employee?.lastName}
              </td>
              <td>{d.matrixCodeSnapshot}</td>
              <td>{fmtDate(d.documentDate)}</td>
              <td>
                <span className={`badge ${d.status.toLowerCase()}`}>{d.status === 'GENERATED' ? 'Generado' : 'Anulado'}</span>
              </td>
              <td className="row-actions">
                <Link to={`/contract-documents/${d.id}/preview`}>Ver</Link>
                {d.status === 'GENERATED' && (
                  <button className="danger-btn" onClick={() => handleCancel(d)}>
                    Anular
                  </button>
                )}
              </td>
            </tr>
          ))}
          {documents.length === 0 && (
            <tr>
              <td colSpan={6} className="empty">
                Sin documentos generados.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
