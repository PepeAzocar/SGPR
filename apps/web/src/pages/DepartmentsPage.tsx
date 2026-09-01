import { useEffect, useState, type FormEvent } from 'react';
import { api, ApiError } from '../api/client';
import type { Department } from '../api/types';

export function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setDepartments(await api.get<Department[]>('/departments'));
  }

  useEffect(() => {
    load().catch((err) => setError(err instanceof ApiError ? err.message : 'Error al cargar'));
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await api.post('/departments', { name });
      setName('');
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo crear el departamento');
    }
  }

  return (
    <div>
      <h1>Departamentos</h1>
      {error && <p className="error">{error}</p>}
      <form className="card inline-form" onSubmit={handleSubmit}>
        <input placeholder="Nombre del departamento" value={name} onChange={(e) => setName(e.target.value)} required />
        <button type="submit">Agregar</button>
      </form>
      <table className="table">
        <thead>
          <tr>
            <th>Nombre</th>
          </tr>
        </thead>
        <tbody>
          {departments.map((d) => (
            <tr key={d.id}>
              <td>{d.name}</td>
            </tr>
          ))}
          {departments.length === 0 && (
            <tr>
              <td className="empty">Sin departamentos registrados.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
