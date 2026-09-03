import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { api, ApiError } from '../api/client';
import type { PayrollPeriod } from '../api/types';

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

export function PayrollPeriodsPage() {
  const [periods, setPeriods] = useState<PayrollPeriod[]>([]);
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    setPeriods(await api.get<PayrollPeriod[]>('/payroll-periods'));
  }

  useEffect(() => {
    load().catch((err) => setError(err instanceof ApiError ? err.message : 'Error al cargar'));
  }, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await api.post('/payroll-periods', { month, year });
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo crear el período');
    }
  }

  async function handleCalculate(id: string) {
    setError(null);
    setBusyId(id);
    try {
      await api.post(`/payroll-periods/${id}/calculate`);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo calcular el período');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <h1>Remuneraciones</h1>
      {error && <p className="error">{error}</p>}

      <form className="card inline-form" onSubmit={handleCreate}>
        <select value={month} onChange={(e) => setMonth(Number(e.target.value))}>
          {MONTHS.map((m, i) => (
            <option key={m} value={i + 1}>
              {m}
            </option>
          ))}
        </select>
        <input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} />
        <button type="submit">Crear período</button>
      </form>

      <table className="table">
        <thead>
          <tr>
            <th>Período</th>
            <th>Estado</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {periods.map((p) => (
            <tr key={p.id}>
              <td>
                {MONTHS[p.month - 1]} {p.year}
              </td>
              <td>
                <span className={`badge ${p.status.toLowerCase()}`}>{p.status}</span>
              </td>
              <td className="row-actions">
                <button disabled={busyId === p.id} onClick={() => handleCalculate(p.id)}>
                  {busyId === p.id
                    ? 'Calculando...'
                    : p.status === 'OPEN'
                      ? 'Calcular liquidaciones'
                      : 'Recalcular (genera corrección)'}
                </button>
                <Link to={`/payroll-periods/${p.id}`}>Ver liquidaciones</Link>
              </td>
            </tr>
          ))}
          {periods.length === 0 && (
            <tr>
              <td colSpan={3} className="empty">
                Sin períodos creados.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
