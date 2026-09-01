import { useEffect, useState, type FormEvent } from 'react';
import { api, ApiError } from '../api/client';
import type { Contract, Employee, Position } from '../api/types';

const CONTRACT_TYPES: Contract['type'][] = ['INDEFINIDO', 'PLAZO_FIJO', 'POR_OBRA_O_FAENA', 'HONORARIOS'];

const emptyForm = {
  employeeId: '',
  positionId: '',
  type: 'INDEFINIDO' as Contract['type'],
  startDate: '',
  baseSalary: '',
};

export function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  async function load() {
    const [c, e, p] = await Promise.all([
      api.get<Contract[]>('/contracts'),
      api.get<Employee[]>('/employees'),
      api.get<Position[]>('/positions'),
    ]);
    setContracts(c);
    setEmployees(e);
    setPositions(p);
  }

  useEffect(() => {
    load().catch((err) => setError(err instanceof ApiError ? err.message : 'Error al cargar'));
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await api.post('/contracts', {
        employeeId: form.employeeId,
        positionId: form.positionId,
        type: form.type,
        startDate: form.startDate,
        baseSalary: Number(form.baseSalary),
      });
      setForm(emptyForm);
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo crear el contrato');
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Contratos</h1>
        <button onClick={() => setShowForm((v) => !v)}>{showForm ? 'Cancelar' : 'Nuevo contrato'}</button>
      </div>
      {error && <p className="error">{error}</p>}

      {showForm && (
        <form className="card form-grid" onSubmit={handleSubmit}>
          <label>
            Empleado
            <select value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} required>
              <option value="">Seleccionar...</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.firstName} {emp.lastName} ({emp.documentNumber})
                </option>
              ))}
            </select>
          </label>
          <label>
            Cargo
            <select value={form.positionId} onChange={(e) => setForm({ ...form, positionId: e.target.value })} required>
              <option value="">Seleccionar...</option>
              {positions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </label>
          <label>
            Tipo de contrato
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as Contract['type'] })}>
              {CONTRACT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          <label>
            Fecha de inicio
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              required
            />
          </label>
          <label>
            Sueldo base (CLP)
            <input
              type="number"
              min={0}
              value={form.baseSalary}
              onChange={(e) => setForm({ ...form, baseSalary: e.target.value })}
              required
            />
          </label>
          <div className="form-actions">
            <button type="submit">Guardar</button>
          </div>
        </form>
      )}

      <table className="table">
        <thead>
          <tr>
            <th>Empleado</th>
            <th>Cargo</th>
            <th>Tipo</th>
            <th>Inicio</th>
            <th>Sueldo base</th>
          </tr>
        </thead>
        <tbody>
          {contracts.map((c) => (
            <tr key={c.id}>
              <td>
                {c.employee?.firstName} {c.employee?.lastName}
              </td>
              <td>{c.position?.title}</td>
              <td>{c.type}</td>
              <td>{new Date(c.startDate).toLocaleDateString('es-CL')}</td>
              <td>${Number(c.baseSalary).toLocaleString('es-CL')}</td>
            </tr>
          ))}
          {contracts.length === 0 && (
            <tr>
              <td colSpan={5} className="empty">
                Sin contratos registrados.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
