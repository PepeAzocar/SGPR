import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useAuth } from '../auth/AuthContext';
import { api, ApiError } from '../api/client';
import { OrgMaintainerPage, type ColumnConfig, type FieldConfig } from '../components/OrgMaintainer';
import type {
  LaborRegime,
  LegalEntity,
  PayrollConcept,
  PayrollFormula,
  PayrollFormulaStatus,
  PayrollParameter,
  PayrollTable,
} from '../api/types';

type Tab = 'concepts' | 'variables' | 'parameters' | 'tables' | 'formulas';

const STATUS_LABEL: Record<PayrollFormulaStatus, string> = {
  DRAFT: 'Borrador',
  TESTING: 'En pruebas',
  PENDING_APPROVAL: 'Pendiente de aprobación',
  APPROVED: 'Aprobada',
  ACTIVE: 'Activa',
  INACTIVE: 'Inactiva',
  REJECTED: 'Rechazada',
};

function fmtDate(v?: string | null): string {
  return v ? new Date(v).toLocaleDateString('es-CL') : '-';
}

// Extracción heurística de variables en el cliente, sólo para mostrar chips
// de ayuda al usuario ("Variables detectadas") y armar el formulario del
// simulador. La validación real ocurre en el servidor al guardar/evaluar.
const RESERVED_WORDS = new Set(['IF', 'ROUND', 'MIN', 'MAX', 'SUM', 'ABS', 'LOOKUP', 'AND', 'OR', 'NOT']);
function extractVariablesClientSide(expression: string): string[] {
  const matches = expression.match(/[A-Za-z_][A-Za-z0-9_]*/g) ?? [];
  return Array.from(new Set(matches.filter((m) => !RESERVED_WORDS.has(m.toUpperCase()))));
}

export function PayrollFormulasPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const [tab, setTab] = useState<Tab>('formulas');

  return (
    <div>
      <h1>Define Cálculo Nómina</h1>
      <p className="hint">
        Motor de reglas de remuneraciones: los conceptos, variables, parámetros, tablas y fórmulas se administran
        aquí como configuración versionada — el motor de cálculo interpreta un lenguaje de expresiones limitado y
        seguro (sin código arbitrario). Una fórmula nunca se edita una vez que sale de borrador: los cambios crean
        una nueva versión.
      </p>
      <div className="tabs">
        <button className={tab === 'concepts' ? 'active' : ''} onClick={() => setTab('concepts')}>
          Conceptos
        </button>
        <button className={tab === 'variables' ? 'active' : ''} onClick={() => setTab('variables')}>
          Variables
        </button>
        <button className={tab === 'parameters' ? 'active' : ''} onClick={() => setTab('parameters')}>
          Parámetros
        </button>
        <button className={tab === 'tables' ? 'active' : ''} onClick={() => setTab('tables')}>
          Tablas
        </button>
        <button className={tab === 'formulas' ? 'active' : ''} onClick={() => setTab('formulas')}>
          Fórmulas
        </button>
      </div>

      {tab === 'concepts' && <ConceptsTab isAdmin={isAdmin} />}
      {tab === 'variables' && <VariablesTab isAdmin={isAdmin} />}
      {tab === 'parameters' && <ParametersTab isAdmin={isAdmin} />}
      {tab === 'tables' && <TablesTab isAdmin={isAdmin} />}
      {tab === 'formulas' && <FormulasTab isAdmin={isAdmin} />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Conceptos / Variables: catálogos simples, reutilizan el mantenedor genérico.
// ---------------------------------------------------------------------------

const conceptColumns: ColumnConfig[] = [
  { key: 'code', label: 'Código' },
  { key: 'name', label: 'Nombre' },
  { key: 'type', label: 'Tipo', format: (v) => (v === 'EARNING' ? 'Haber' : 'Descuento') },
  { key: 'category', label: 'Categoría' },
];

const conceptFields: FieldConfig[] = [
  { key: 'code', label: 'Código', type: 'text', required: true, maxLength: 50 },
  { key: 'name', label: 'Nombre', type: 'text', required: true, maxLength: 150 },
  {
    key: 'type',
    label: 'Tipo',
    type: 'select',
    required: true,
    staticOptions: [
      { value: 'EARNING', label: 'Haber' },
      { value: 'DEDUCTION', label: 'Descuento' },
    ],
  },
  {
    key: 'category',
    label: 'Categoría',
    type: 'select',
    required: true,
    staticOptions: [
      { value: 'TAXABLE', label: 'Imponible y tributable' },
      { value: 'NON_TAXABLE', label: 'No imponible' },
      { value: 'LEGAL_DEDUCTION', label: 'Descuento legal' },
      { value: 'OTHER_DEDUCTION', label: 'Otro descuento' },
    ],
  },
];

function ConceptsTab({ isAdmin }: { isAdmin: boolean }) {
  // payroll-concepts es un catálogo preexistente al que RRHH ya tenía acceso
  // de escritura por API; se mantiene esa misma regla acá.
  const { user } = useAuth();
  const canWrite = isAdmin || user?.role === 'RRHH';
  return <OrgMaintainerPage title="Concepto" resource="/payroll-concepts" columns={conceptColumns} fields={conceptFields} canWrite={canWrite} />;
}

const variableColumns: ColumnConfig[] = [
  { key: 'code', label: 'Código' },
  { key: 'name', label: 'Nombre' },
  { key: 'source', label: 'Origen' },
  { key: 'isActive', label: 'Estado', format: (v) => (v ? 'Activa' : 'Inactiva') },
];

const variableFields: FieldConfig[] = [
  { key: 'code', label: 'Código', type: 'text', required: true, maxLength: 50 },
  { key: 'name', label: 'Nombre', type: 'text', required: true, maxLength: 150 },
  { key: 'description', label: 'Descripción', type: 'text', maxLength: 300 },
  {
    key: 'source',
    label: 'Origen',
    type: 'select',
    required: true,
    staticOptions: [
      { value: 'EMPLOYEE', label: 'Colaborador' },
      { value: 'CONTRACT', label: 'Contrato' },
      { value: 'INDICATOR', label: 'Indicador económico' },
      { value: 'PARAMETER', label: 'Parámetro' },
      { value: 'TABLE', label: 'Tabla' },
      { value: 'SYSTEM', label: 'Calculada por el sistema' },
    ],
  },
  { key: 'isActive', label: 'Estado', type: 'boolean' },
];

function VariablesTab({ isAdmin }: { isAdmin: boolean }) {
  return (
    <>
      <p className="hint">
        Catálogo documental de las variables que las fórmulas pueden usar (ej. SUELDO_BASE, HORAS_SEMANALES, UF).
      </p>
      <OrgMaintainerPage
        title="Variable"
        resource="/payroll-variables"
        columns={variableColumns}
        fields={variableFields}
        canWrite={isAdmin}
      />
    </>
  );
}

// ---------------------------------------------------------------------------
// Parámetros: catálogo + valores históricos (nunca se sobrescribe un valor).
// ---------------------------------------------------------------------------

function ParametersTab({ isAdmin }: { isAdmin: boolean }) {
  const [parameters, setParameters] = useState<PayrollParameter[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newEffectiveFrom, setNewEffectiveFrom] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ code: '', name: '', description: '' });
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setParameters(await api.get<PayrollParameter[]>('/payroll-parameters'));
  }

  useEffect(() => {
    load().catch((err) => setError(err instanceof ApiError ? err.message : 'Error al cargar'));
  }, []);

  const selected = parameters.find((p) => p.id === selectedId);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await api.post('/payroll-parameters', { code: form.code, name: form.name, description: form.description || undefined });
      setForm({ code: '', name: '', description: '' });
      setShowCreate(false);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo crear el parámetro');
    }
  }

  async function handleAddValue(e: FormEvent) {
    e.preventDefault();
    if (!selectedId) return;
    setError(null);
    try {
      await api.post(`/payroll-parameters/${selectedId}/values`, { value: Number(newValue), effectiveFrom: newEffectiveFrom });
      setNewValue('');
      setNewEffectiveFrom('');
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo registrar el valor');
    }
  }

  return (
    <div>
      {error && <p className="error">{error}</p>}
      <p className="hint">
        Un parámetro puede cambiar de valor (ej. un porcentaje) sin tocar las fórmulas que lo usan: el valor vigente
        anterior se cierra automáticamente al registrar uno nuevo.
      </p>
      {isAdmin && (
        <div className="page-header">
          <button onClick={() => setShowCreate((v) => !v)}>{showCreate ? 'Cancelar' : 'Nuevo parámetro'}</button>
        </div>
      )}
      {showCreate && (
        <form className="card form-grid" onSubmit={handleCreate}>
          <label>
            Código
            <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} maxLength={50} required />
          </label>
          <label>
            Nombre
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={150} required />
          </label>
          <label>
            Descripción
            <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} maxLength={300} />
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
            <th>Valor vigente</th>
          </tr>
        </thead>
        <tbody>
          {parameters.map((p) => {
            const current = p.values?.find((v) => !v.effectiveTo);
            return (
              <tr key={p.id} onClick={() => setSelectedId(p.id)} style={{ cursor: 'pointer', background: p.id === selectedId ? '#eef2ff' : undefined }}>
                <td>{p.code}</td>
                <td>{p.name}</td>
                <td>{current ? current.value : '-'}</td>
              </tr>
            );
          })}
          {parameters.length === 0 && (
            <tr>
              <td colSpan={3} className="empty">
                Sin parámetros registrados.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {selected && (
        <div className="card">
          <h2 style={{ marginTop: 0 }}>{selected.name}</h2>
          {isAdmin && (
            <form className="form-grid" onSubmit={handleAddValue}>
              <label>
                Nuevo valor
                <input type="number" step="any" value={newValue} onChange={(e) => setNewValue(e.target.value)} required />
              </label>
              <label>
                Vigente desde
                <input type="date" value={newEffectiveFrom} onChange={(e) => setNewEffectiveFrom(e.target.value)} required />
              </label>
              <div className="form-actions">
                <button type="submit">Registrar valor</button>
              </div>
            </form>
          )}
          <table className="table">
            <thead>
              <tr>
                <th>Valor</th>
                <th>Desde</th>
                <th>Hasta</th>
              </tr>
            </thead>
            <tbody>
              {(selected.values ?? []).map((v) => (
                <tr key={v.id}>
                  <td>{v.value}</td>
                  <td>{fmtDate(v.effectiveFrom)}</td>
                  <td>{v.effectiveTo ? fmtDate(v.effectiveTo) : 'Vigente'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tablas: catálogo + tramos (LOOKUP).
// ---------------------------------------------------------------------------

function TablesTab({ isAdmin }: { isAdmin: boolean }) {
  const [tables, setTables] = useState<PayrollTable[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ code: '', name: '' });
  const [row, setRow] = useState({ fromValue: '', toValue: '', resultValue: '', effectiveFrom: '' });
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setTables(await api.get<PayrollTable[]>('/payroll-tables'));
  }

  useEffect(() => {
    load().catch((err) => setError(err instanceof ApiError ? err.message : 'Error al cargar'));
  }, []);

  const selected = tables.find((t) => t.id === selectedId);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await api.post('/payroll-tables', form);
      setForm({ code: '', name: '' });
      setShowCreate(false);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo crear la tabla');
    }
  }

  async function handleAddRow(e: FormEvent) {
    e.preventDefault();
    if (!selectedId) return;
    setError(null);
    try {
      await api.post(`/payroll-tables/${selectedId}/rows`, {
        fromValue: Number(row.fromValue),
        toValue: row.toValue ? Number(row.toValue) : undefined,
        resultValue: Number(row.resultValue),
        effectiveFrom: row.effectiveFrom,
      });
      setRow({ fromValue: '', toValue: '', resultValue: '', effectiveFrom: '' });
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo agregar el tramo');
    }
  }

  async function handleRemoveRow(rowId: string) {
    if (!selectedId || !window.confirm('¿Eliminar este tramo?')) return;
    setError(null);
    try {
      await api.delete(`/payroll-tables/${selectedId}/rows/${rowId}`);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo eliminar el tramo');
    }
  }

  return (
    <div>
      {error && <p className="error">{error}</p>}
      <p className="hint">
        Una tabla de tramos se consulta desde una fórmula con LOOKUP(CODIGO_TABLA, valor): busca el tramo donde el
        valor cae entre "desde" y "hasta", y entrega el resultado de ese tramo.
      </p>
      {isAdmin && (
        <div className="page-header">
          <button onClick={() => setShowCreate((v) => !v)}>{showCreate ? 'Cancelar' : 'Nueva tabla'}</button>
        </div>
      )}
      {showCreate && (
        <form className="card form-grid" onSubmit={handleCreate}>
          <label>
            Código
            <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} maxLength={50} required />
          </label>
          <label>
            Nombre
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={150} required />
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
            <th>Tramos</th>
          </tr>
        </thead>
        <tbody>
          {tables.map((t) => (
            <tr key={t.id} onClick={() => setSelectedId(t.id)} style={{ cursor: 'pointer', background: t.id === selectedId ? '#eef2ff' : undefined }}>
              <td>{t.code}</td>
              <td>{t.name}</td>
              <td>{t.rows?.length ?? 0}</td>
            </tr>
          ))}
          {tables.length === 0 && (
            <tr>
              <td colSpan={3} className="empty">
                Sin tablas registradas.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {selected && (
        <div className="card">
          <h2 style={{ marginTop: 0 }}>{selected.name}</h2>
          {isAdmin && (
            <form className="form-grid" onSubmit={handleAddRow}>
              <label>
                Desde
                <input type="number" step="any" value={row.fromValue} onChange={(e) => setRow({ ...row, fromValue: e.target.value })} required />
              </label>
              <label>
                Hasta (vacío = sin tope)
                <input type="number" step="any" value={row.toValue} onChange={(e) => setRow({ ...row, toValue: e.target.value })} />
              </label>
              <label>
                Resultado
                <input type="number" step="any" value={row.resultValue} onChange={(e) => setRow({ ...row, resultValue: e.target.value })} required />
              </label>
              <label>
                Vigente desde
                <input type="date" value={row.effectiveFrom} onChange={(e) => setRow({ ...row, effectiveFrom: e.target.value })} required />
              </label>
              <div className="form-actions">
                <button type="submit">Agregar tramo</button>
              </div>
            </form>
          )}
          <table className="table">
            <thead>
              <tr>
                <th>Desde</th>
                <th>Hasta</th>
                <th>Resultado</th>
                {isAdmin && <th></th>}
              </tr>
            </thead>
            <tbody>
              {(selected.rows ?? []).map((r) => (
                <tr key={r.id}>
                  <td>{r.fromValue}</td>
                  <td>{r.toValue ?? 'Sin tope'}</td>
                  <td>{r.resultValue}</td>
                  {isAdmin && (
                    <td>
                      <button className="danger-btn" onClick={() => handleRemoveRow(r.id)}>
                        Eliminar
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Fórmulas: el centro del módulo — ciclo de vida DRAFT → ... → ACTIVE, con simulador.
// ---------------------------------------------------------------------------

const emptyFormulaForm = {
  conceptId: '',
  laborRegimeId: '',
  legalEntityId: '',
  formulaExpression: '',
  condition: '',
  priority: '500',
  effectiveFrom: '',
  effectiveTo: '',
};

function FormulasTab({ isAdmin }: { isAdmin: boolean }) {
  const [concepts, setConcepts] = useState<PayrollConcept[]>([]);
  const [laborRegimes, setLaborRegimes] = useState<LaborRegime[]>([]);
  const [legalEntities, setLegalEntities] = useState<LegalEntity[]>([]);
  const [formulas, setFormulas] = useState<PayrollFormula[]>([]);
  const [filterConceptId, setFilterConceptId] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyFormulaForm);
  const [error, setError] = useState<string | null>(null);

  const [simVars, setSimVars] = useState<Record<string, string>>({});
  const [simResult, setSimResult] = useState<{ result: number; conditionMet?: boolean } | null>(null);
  const [simError, setSimError] = useState<string | null>(null);

  async function loadFormulas() {
    setFormulas(await api.get<PayrollFormula[]>('/payroll-formulas'));
  }

  useEffect(() => {
    Promise.all([
      api.get<PayrollConcept[]>('/payroll-concepts'),
      api.get<LaborRegime[]>('/labor-regimes'),
      api.get<LegalEntity[]>('/legal-entities'),
    ])
      .then(([c, lr, le]) => {
        setConcepts(c);
        setLaborRegimes(lr);
        setLegalEntities(le);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Error al cargar catálogos'));
    loadFormulas().catch((err) => setError(err instanceof ApiError ? err.message : 'Error al cargar fórmulas'));
  }, []);

  const detectedVariables = useMemo(
    () => extractVariablesClientSide(`${form.formulaExpression} ${form.condition}`),
    [form.formulaExpression, form.condition],
  );

  const filteredFormulas = filterConceptId ? formulas.filter((f) => f.conceptId === filterConceptId) : formulas;

  function startCreate() {
    setForm(emptyFormulaForm);
    setSimResult(null);
    setSimError(null);
    setShowForm(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await api.post('/payroll-formulas', {
        conceptId: form.conceptId,
        laborRegimeId: form.laborRegimeId || undefined,
        legalEntityId: form.legalEntityId || undefined,
        formulaExpression: form.formulaExpression,
        condition: form.condition || undefined,
        priority: Number(form.priority) || undefined,
        effectiveFrom: form.effectiveFrom,
        effectiveTo: form.effectiveTo || undefined,
      });
      setForm(emptyFormulaForm);
      setShowForm(false);
      await loadFormulas();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo guardar la fórmula (revisa la sintaxis)');
    }
  }

  async function handleTest() {
    setSimError(null);
    setSimResult(null);
    try {
      const variables: Record<string, number> = {};
      for (const v of detectedVariables) variables[v] = Number(simVars[v] ?? 0);
      const res = await api.post<{ result: number; conditionMet?: boolean }>('/payroll-formulas/evaluate', {
        formulaExpression: form.formulaExpression,
        condition: form.condition || undefined,
        variables,
      });
      setSimResult(res);
    } catch (err) {
      setSimError(err instanceof ApiError ? err.message : 'No se pudo evaluar la fórmula');
    }
  }

  async function handleAction(id: string, action: string) {
    setError(null);
    try {
      await api.post(`/payroll-formulas/${id}/${action}`);
      await loadFormulas();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo completar la acción');
    }
  }

  async function handleDelete(f: PayrollFormula) {
    if (!window.confirm(`¿Eliminar la versión ${f.version} en borrador de "${f.concept?.name}"?`)) return;
    setError(null);
    try {
      await api.delete(`/payroll-formulas/${f.id}`);
      await loadFormulas();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo eliminar');
    }
  }

  return (
    <div>
      {error && <p className="error">{error}</p>}

      <div className="page-header">
        <select value={filterConceptId} onChange={(e) => setFilterConceptId(e.target.value)}>
          <option value="">Todos los conceptos</option>
          {concepts.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <button onClick={showForm ? () => setShowForm(false) : startCreate}>{showForm ? 'Cancelar' : 'Nueva fórmula'}</button>
      </div>

      {showForm && (
        <form className="card form-grid" onSubmit={handleSubmit}>
          <label>
            Concepto
            <select value={form.conceptId} onChange={(e) => setForm({ ...form, conceptId: e.target.value })} required>
              <option value="">Seleccionar...</option>
              {concepts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>
          </label>
          <label>
            Régimen jurídico (opcional)
            <select value={form.laborRegimeId} onChange={(e) => setForm({ ...form, laborRegimeId: e.target.value })}>
              <option value="">Todos</option>
              {laborRegimes.map((lr) => (
                <option key={lr.id} value={lr.id}>
                  {lr.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Entidad legal (opcional)
            <select value={form.legalEntityId} onChange={(e) => setForm({ ...form, legalEntityId: e.target.value })}>
              <option value="">Todas</option>
              {legalEntities.map((le) => (
                <option key={le.id} value={le.id}>
                  {le.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Prioridad (orden de cálculo)
            <input type="number" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} />
          </label>
          <label>
            Vigencia desde
            <input type="date" value={form.effectiveFrom} onChange={(e) => setForm({ ...form, effectiveFrom: e.target.value })} required />
          </label>
          <label>
            Vigencia hasta
            <input type="date" value={form.effectiveTo} onChange={(e) => setForm({ ...form, effectiveTo: e.target.value })} />
          </label>

          <label style={{ gridColumn: '1 / -1' }}>
            Fórmula
            <textarea
              value={form.formulaExpression}
              onChange={(e) => setForm({ ...form, formulaExpression: e.target.value })}
              placeholder="SUELDO_BASE * PORC_RESPONSABILIDAD"
              rows={3}
              required
            />
          </label>
          <label style={{ gridColumn: '1 / -1' }}>
            Condición (opcional)
            <input
              value={form.condition}
              onChange={(e) => setForm({ ...form, condition: e.target.value })}
              placeholder="CATEGORIA_APS = 1"
            />
          </label>

          {detectedVariables.length > 0 && (
            <div style={{ gridColumn: '1 / -1' }}>
              <p className="hint">Variables detectadas: {detectedVariables.join(', ')}</p>
            </div>
          )}

          <fieldset style={{ gridColumn: '1 / -1' }}>
            <legend>Probar fórmula</legend>
            <div className="form-grid">
              {detectedVariables.map((v) => (
                <label key={v}>
                  {v}
                  <input
                    type="number"
                    step="any"
                    value={simVars[v] ?? ''}
                    onChange={(e) => setSimVars({ ...simVars, [v]: e.target.value })}
                  />
                </label>
              ))}
            </div>
            <div className="row-actions">
              <button type="button" onClick={handleTest} disabled={!form.formulaExpression}>
                Testear
              </button>
              {simResult && (
                <span>
                  Resultado: <strong>{simResult.result}</strong>
                  {simResult.conditionMet !== undefined && (simResult.conditionMet ? ' · condición cumplida' : ' · condición NO cumplida')}
                </span>
              )}
            </div>
            {simError && <p className="error">{simError}</p>}
          </fieldset>

          <div className="form-actions">
            <button type="submit">Guardar como borrador</button>
          </div>
        </form>
      )}

      <table className="table">
        <thead>
          <tr>
            <th>Concepto</th>
            <th>Versión</th>
            <th>Régimen</th>
            <th>Prioridad</th>
            <th>Vigencia</th>
            <th>Estado</th>
            <th>Aprobado por</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredFormulas.map((f) => (
            <tr key={f.id}>
              <td>{f.concept?.name}</td>
              <td>{f.version}</td>
              <td>{f.laborRegime?.name ?? 'Todos'}</td>
              <td>{f.priority}</td>
              <td>
                {fmtDate(f.effectiveFrom)} — {f.effectiveTo ? fmtDate(f.effectiveTo) : 'vigente'}
              </td>
              <td>
                <span className={`badge ${f.status.toLowerCase()}`}>{STATUS_LABEL[f.status]}</span>
              </td>
              <td>{f.approvedBy ?? '-'}</td>
              <td className="row-actions">
                {f.status === 'DRAFT' && (
                  <>
                    <button onClick={() => handleAction(f.id, 'submit-test')}>Enviar a pruebas</button>
                    <button className="danger-btn" onClick={() => handleDelete(f)}>
                      Eliminar
                    </button>
                  </>
                )}
                {f.status === 'TESTING' && <button onClick={() => handleAction(f.id, 'submit-approval')}>Enviar a aprobación</button>}
                {f.status === 'PENDING_APPROVAL' && isAdmin && (
                  <>
                    <button onClick={() => handleAction(f.id, 'approve')}>Aprobar</button>
                    <button className="danger-btn" onClick={() => handleAction(f.id, 'reject')}>
                      Rechazar
                    </button>
                  </>
                )}
                {f.status === 'APPROVED' && isAdmin && <button onClick={() => handleAction(f.id, 'activate')}>Activar</button>}
                {f.status === 'ACTIVE' && isAdmin && (
                  <button className="danger-btn" onClick={() => handleAction(f.id, 'deactivate')}>
                    Desactivar
                  </button>
                )}
              </td>
            </tr>
          ))}
          {filteredFormulas.length === 0 && (
            <tr>
              <td colSpan={8} className="empty">
                Sin fórmulas registradas.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
