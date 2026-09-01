import { useEffect, useState, type FormEvent } from 'react';
import { api, ApiError } from '../api/client';
import type { Department, Position } from '../api/types';

export function PositionsPage() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [title, setTitle] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const [pos, dept] = await Promise.all([
      api.get<Position[]>('/positions'),
      api.get<Department[]>('/departments'),
    ]);
    setPositions(pos);
    setDepartments(dept);
  }

  useEffect(() => {
    load().catch((err) => setError(err instanceof ApiError ? err.message : 'Error al cargar'));
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await api.post('/positions', { title, departmentId });
      setTitle('');
      setDepartmentId('');
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo crear el cargo');
    }
  }

  return (
    <div>
      <h1>Cargos</h1>
      {error && <p className="error">{error}</p>}
      <form className="card inline-form" onSubmit={handleSubmit}>
        <input placeholder="Nombre del cargo" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} required>
          <option value="">Departamento...</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
        <button type="submit">Agregar</button>
      </form>
      <table className="table">
        <thead>
          <tr>
            <th>Cargo</th>
            <th>Departamento</th>
          </tr>
        </thead>
        <tbody>
          {positions.map((p) => (
            <tr key={p.id}>
              <td>{p.title}</td>
              <td>{p.department?.name ?? '-'}</td>
            </tr>
          ))}
          {positions.length === 0 && (
            <tr>
              <td colSpan={2} className="empty">
                Sin cargos registrados.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
