import { useEffect, useState, type FormEvent } from 'react';
import { api, ApiError } from '../api/client';
import { downloadListPdf } from '../lib/listPdf';
import type { Contract, ContractType, Employee, LaborRegime, LegalEntity, Position } from '../api/types';

type Mode = 'closed' | 'create' | 'edit' | 'view';

const emptyForm = {
  employeeId: '',
  positionId: '',
  legalEntityId: '',
  laborRegimeId: '',
  contractTypeId: '',
  contractNumber: '',
  sequenceNumber: '1',
  startDate: '',
  endDate: '',
  baseSalary: '',
  weeklyHours: '45',
  isActive: 'true',
};

function contractToForm(c: Contract): typeof emptyForm {
  return {
    employeeId: c.employeeId,
    positionId: c.positionId,
    legalEntityId: c.legalEntityId,
    laborRegimeId: c.laborRegimeId,
    contractTypeId: c.contractTypeId,
    contractNumber: c.contractNumber,
    sequenceNumber: String(c.sequenceNumber),
    startDate: c.startDate.slice(0, 10),
    endDate: c.endDate ? c.endDate.slice(0, 10) : '',
    baseSalary: c.baseSalary,
    weeklyHours: String(c.weeklyHours),
    isActive: String(c.isActive),
  };
}

function positionLabel(p: Position): string {
  return `${p.title}${p.department?.name ? ` — ${p.department.name}` : ''}`;
}

export function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [legalEntities, setLegalEntities] = useState<LegalEntity[]>([]);
  const [laborRegimes, setLaborRegimes] = useState<LaborRegime[]>([]);
  const [contractTypes, setContractTypes] = useState<ContractType[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>('closed');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function load() {
    const [c, e, p, le, lr, ct] = await Promise.all([
      api.get<Contract[]>('/contracts'),
      api.get<Employee[]>('/employees'),
      api.get<Position[]>('/positions'),
      api.get<LegalEntity[]>('/legal-entities'),
      api.get<LaborRegime[]>('/labor-regimes'),
      api.get<ContractType[]>('/contract-types'),
    ]);
    setContracts(c);
    setEmployees(e);
    setPositions(p);
    setLegalEntities(le);
    setLaborRegimes(lr);
    setContractTypes(ct);
  }

  useEffect(() => {
    load().catch((err) => setError(err instanceof ApiError ? err.message : 'Error al cargar'));
  }, []);

  const contractTypeOptions = contractTypes.filter((ct) => ct.laborRegimeId === form.laborRegimeId);
  const readOnly = mode === 'view';

  function startCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setMode('create');
  }

  function startEdit(c: Contract) {
    setEditingId(c.id);
    setForm(contractToForm(c));
    setMode('edit');
  }

  function startView(c: Contract) {
    setEditingId(c.id);
    setForm(contractToForm(c));
    setMode('view');
  }

  function closeForm() {
    setMode('closed');
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const payload = {
      employeeId: form.employeeId,
      positionId: form.positionId,
      legalEntityId: form.legalEntityId,
      laborRegimeId: form.laborRegimeId,
      contractTypeId: form.contractTypeId,
      contractNumber: form.contractNumber,
      sequenceNumber: Number(form.sequenceNumber) || 1,
      startDate: form.startDate,
      endDate: form.endDate || undefined,
      baseSalary: Number(form.baseSalary),
      weeklyHours: Number(form.weeklyHours) || undefined,
      isActive: form.isActive === 'true',
    };
    try {
      if (mode === 'edit' && editingId) {
        await api.patch(`/contracts/${editingId}`, payload);
      } else {
        await api.post('/contracts', payload);
      }
      closeForm();
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo guardar el contrato');
    }
  }

  async function handleDelete(c: Contract) {
    const label = `${c.employee?.firstName ?? ''} ${c.employee?.lastName ?? ''} (${c.contractNumber})`;
    if (!window.confirm(`¿Eliminar el contrato de ${label}? Esta acción no se puede deshacer.`)) return;
    setError(null);
    setDeletingId(c.id);
    try {
      await api.delete(`/contracts/${c.id}`);
      await load();
    } catch (err) {
      // Un 409 significa que el contrato tiene registros asociados y el
      // backend impide borrar para no romper la integridad referencial.
      setError(err instanceof ApiError ? err.message : 'No se pudo eliminar el contrato');
    } finally {
      setDeletingId(null);
    }
  }

  function handlePdf() {
    downloadListPdf(
      'Contratos',
      [
        { header: 'Empleado', accessor: (r) => { const c = r as Contract; return `${c.employee?.firstName ?? ''} ${c.employee?.lastName ?? ''}`; } },
        { header: 'Posición', accessor: (r) => (r as Contract).position?.title ?? '-' },
        { header: 'N° contrato', accessor: (r) => (r as Contract).contractNumber },
        { header: 'Régimen jurídico', accessor: (r) => (r as Contract).laborRegime?.name ?? '-' },
        { header: 'Tipo', accessor: (r) => (r as Contract).contractType?.name ?? '-' },
        { header: 'Entidad empleadora', accessor: (r) => (r as Contract).legalEntity?.name ?? '-' },
        { header: 'Inicio', accessor: (r) => new Date((r as Contract).startDate).toLocaleDateString('es-CL') },
        { header: 'Término', accessor: (r) => { const d = (r as Contract).endDate; return d ? new Date(d).toLocaleDateString('es-CL') : '-'; } },
        { header: 'Sueldo base', accessor: (r) => `$${Number((r as Contract).baseSalary).toLocaleString('es-CL')}` },
        { header: 'Estado', accessor: (r) => ((r as Contract).isActive ? 'Activo' : 'Inactivo') },
      ],
      contracts,
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1>Contratos</h1>
        <div className="row-actions">
          <button onClick={handlePdf}>Generar PDF</button>
          <button onClick={mode === 'closed' ? startCreate : closeForm}>{mode === 'closed' ? 'Nuevo contrato' : 'Cancelar'}</button>
        </div>
      </div>
      {error && <p className="error">{error}</p>}

      {mode !== 'closed' && (
        <form className="card form-grid" onSubmit={handleSubmit}>
          <label>
            Empleado
            <select
              value={form.employeeId}
              disabled={readOnly}
              onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
              required
            >
              <option value="">Seleccionar...</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.firstName} {emp.lastName} ({emp.documentNumber})
                </option>
              ))}
            </select>
          </label>
          <label>
            Posición
            <select
              value={form.positionId}
              disabled={readOnly}
              onChange={(e) => setForm({ ...form, positionId: e.target.value })}
              required
            >
              <option value="">Seleccionar...</option>
              {positions.map((p) => (
                <option key={p.id} value={p.id}>
                  {positionLabel(p)}
                </option>
              ))}
            </select>
          </label>
          <label>
            Entidad empleadora
            <select
              value={form.legalEntityId}
              disabled={readOnly}
              onChange={(e) => setForm({ ...form, legalEntityId: e.target.value })}
              required
            >
              <option value="">Seleccionar...</option>
              {legalEntities.map((le) => (
                <option key={le.id} value={le.id}>
                  {le.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Número de contrato
            <input
              value={form.contractNumber}
              disabled={readOnly}
              onChange={(e) => setForm({ ...form, contractNumber: e.target.value })}
              maxLength={30}
              required
            />
          </label>
          <label>
            Régimen jurídico
            <select
              value={form.laborRegimeId}
              disabled={readOnly}
              onChange={(e) => setForm({ ...form, laborRegimeId: e.target.value, contractTypeId: '' })}
              required
            >
              <option value="">Seleccionar...</option>
              {laborRegimes.map((lr) => (
                <option key={lr.id} value={lr.id}>
                  {lr.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Tipo de contrato
            <select
              value={form.contractTypeId}
              disabled={readOnly || !form.laborRegimeId}
              onChange={(e) => setForm({ ...form, contractTypeId: e.target.value })}
              required
            >
              <option value="">Seleccionar...</option>
              {contractTypeOptions.map((ct) => (
                <option key={ct.id} value={ct.id}>
                  {ct.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Fecha de inicio
            <input
              type="date"
              value={form.startDate}
              disabled={readOnly}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              required
            />
          </label>
          <label>
            Fecha de término
            <input
              type="date"
              value={form.endDate}
              disabled={readOnly}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            />
          </label>
          <label>
            Sueldo base (CLP)
            <input
              type="number"
              min={0}
              value={form.baseSalary}
              disabled={readOnly}
              onChange={(e) => setForm({ ...form, baseSalary: e.target.value })}
              required
            />
          </label>
          <label>
            Horas semanales
            <input
              type="number"
              min={0}
              value={form.weeklyHours}
              disabled={readOnly}
              onChange={(e) => setForm({ ...form, weeklyHours: e.target.value })}
            />
          </label>
          <label>
            Secuencia
            <input
              type="number"
              min={1}
              value={form.sequenceNumber}
              disabled={readOnly}
              onChange={(e) => setForm({ ...form, sequenceNumber: e.target.value })}
            />
          </label>
          <label>
            Estado
            <select value={form.isActive} disabled={readOnly} onChange={(e) => setForm({ ...form, isActive: e.target.value })}>
              <option value="true">Activo</option>
              <option value="false">Inactivo</option>
            </select>
          </label>
          <div className="form-actions row-actions">
            {!readOnly && <button type="submit">{mode === 'edit' ? 'Guardar cambios' : 'Guardar'}</button>}
            <button type="button" onClick={closeForm}>
              {readOnly ? 'Cerrar' : 'Cancelar'}
            </button>
          </div>
        </form>
      )}

      <table className="table">
        <thead>
          <tr>
            <th>Empleado</th>
            <th>Posición</th>
            <th>N° contrato</th>
            <th>Régimen jurídico</th>
            <th>Tipo</th>
            <th>Inicio</th>
            <th>Sueldo base</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {contracts.map((c) => (
            <tr key={c.id}>
              <td>
                {c.employee?.firstName} {c.employee?.lastName}
              </td>
              <td>{c.position?.title}</td>
              <td>{c.contractNumber}</td>
              <td>{c.laborRegime?.name ?? '-'}</td>
              <td>{c.contractType?.name ?? '-'}</td>
              <td>{new Date(c.startDate).toLocaleDateString('es-CL')}</td>
              <td>${Number(c.baseSalary).toLocaleString('es-CL')}</td>
              <td>
                <span className={`badge ${c.isActive ? 'active' : 'inactive'}`}>{c.isActive ? 'Activo' : 'Inactivo'}</span>
              </td>
              <td className="row-actions">
                <button onClick={() => startView(c)}>Ver</button>
                <button onClick={() => startEdit(c)}>Editar</button>
                <button className="danger-btn" disabled={deletingId === c.id} onClick={() => handleDelete(c)}>
                  {deletingId === c.id ? 'Eliminando...' : 'Eliminar'}
                </button>
              </td>
            </tr>
          ))}
          {contracts.length === 0 && (
            <tr>
              <td colSpan={9} className="empty">
                Sin contratos registrados.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
