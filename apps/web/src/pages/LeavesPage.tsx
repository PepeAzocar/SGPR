import { useEffect, useState, type FormEvent } from 'react';
import { api, ApiError } from '../api/client';
import type { Employee, Leave } from '../api/types';

const LEAVE_TYPES: Leave['type'][] = ['VACATION', 'SICK_LEAVE', 'PARENTAL', 'UNPAID', 'OTHER'];

const emptyForm = {
  employeeId: '',
  type: 'VACATION' as Leave['type'],
  startDate: '',
  endDate: '',
  days: '',
  reason: '',
};

export function LeavesPage() {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  async function load() {
    const [l, e] = await Promise.all([api.get<Leave[]>('/leaves'), api.get<Employee[]>('/employees')]);
    setLeaves(l);
    setEmployees(e);
  }

  useEffect(() => {
    load().catch((err) => setError(err instanceof ApiError ? err.message : 'Error al cargar'));
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await api.post('/leaves', {
        employeeId: form.employeeId,
        type: form.type,
        startDate: form.startDate,
        endDate: form.endDate,
        days: Number(form.days),
        reason: form.reason || undefined,
      });
      setForm(emptyForm);
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo registrar la ausencia');
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Ausencias</h1>
        <button onClick={() => setShowForm((v) => !v)}>{showForm ? 'Cancelar' : 'Nueva ausencia'}</button>
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
                  {emp.firstName} {emp.lastName}
                </option>
              ))}
            </select>
          </label>
          <label>
            Tipo
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as Leave['type'] })}>
              {LEAVE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          <label>
            Desde
            <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required />
          </label>
          <label>
            Hasta
            <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} required />
          </label>
          <label>
            Días
            <input type="number" min={1} value={form.days} onChange={(e) => setForm({ ...form, days: e.target.value })} required />
          </label>
          <label>
            Motivo
            <input value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
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
            <th>Tipo</th>
            <th>Desde</th>
            <th>Hasta</th>
            <th>Días</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {leaves.map((l) => (
            <tr key={l.id}>
              <td>
                {l.employee?.firstName} {l.employee?.lastName}
              </td>
              <td>{l.type}</td>
              <td>{new Date(l.startDate).toLocaleDateString('es-CL')}</td>
              <td>{new Date(l.endDate).toLocaleDateString('es-CL')}</td>
              <td>{l.days}</td>
              <td>{l.status}</td>
            </tr>
          ))}
          {leaves.length === 0 && (
            <tr>
              <td colSpan={6} className="empty">
                Sin ausencias registradas.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
