import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { api, ApiError } from '../api/client';
import type { Employee } from '../api/types';

const DOCUMENT_TYPES = ['RUT', 'PASAPORTE', 'DNI', 'OTRO'];

const emptyForm = {
  documentType: 'RUT',
  documentNumber: '',
  rut: '',
  firstName: '',
  lastName: '',
  secondLastName: '',
  socialName: '',
  birthDate: '',
  nationality: 'Chilena',
  birthCountry: '',
  birthRegion: '',
  birthCommune: '',
  photoUrl: '',
  email: '',
};

function employeeToForm(emp: Employee): typeof emptyForm {
  return {
    documentType: emp.documentType,
    documentNumber: emp.documentNumber,
    rut: emp.rut ?? '',
    firstName: emp.firstName,
    lastName: emp.lastName,
    secondLastName: emp.secondLastName ?? '',
    socialName: emp.socialName ?? '',
    birthDate: '',
    nationality: '',
    birthCountry: emp.birthCountry ?? '',
    birthRegion: emp.birthRegion ?? '',
    birthCommune: emp.birthCommune ?? '',
    photoUrl: emp.photoUrl ?? '',
    email: emp.email ?? '',
  };
}

export function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function loadAll() {
    setEmployees(await api.get<Employee[]>('/employees'));
  }

  useEffect(() => {
    loadAll().catch((err) => setError(err instanceof ApiError ? err.message : 'Error al cargar datos'));
  }, []);

  function startCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function startEdit(emp: Employee) {
    setEditingId(emp.id);
    setForm(employeeToForm(emp));
    setShowForm(true);
  }

  function cancelForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const payload = {
      documentType: form.documentType,
      documentNumber: form.documentNumber,
      rut: form.documentType === 'RUT' ? form.documentNumber : form.rut || undefined,
      firstName: form.firstName,
      lastName: form.lastName,
      secondLastName: form.secondLastName || undefined,
      socialName: form.socialName || undefined,
      birthDate: form.birthDate || undefined,
      nationality: form.nationality || undefined,
      birthCountry: form.birthCountry || undefined,
      birthRegion: form.birthRegion || undefined,
      birthCommune: form.birthCommune || undefined,
      photoUrl: form.photoUrl || undefined,
      email: form.email || undefined,
    };
    try {
      if (editingId) {
        await api.patch(`/employees/${editingId}`, payload);
      } else {
        await api.post('/employees', payload);
      }
      cancelForm();
      await loadAll();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo guardar el empleado');
    }
  }

  async function handleDelete(emp: Employee) {
    const label = `${emp.socialName || emp.firstName} ${emp.lastName}`;
    if (!window.confirm(`¿Eliminar a ${label}? Esta acción no se puede deshacer.`)) return;
    setError(null);
    setDeletingId(emp.id);
    try {
      await api.delete(`/employees/${emp.id}`);
      await loadAll();
    } catch (err) {
      // Un 409 significa que hay registros asociados (contratos, liquidaciones, etc.)
      // y el backend impide borrar para no romper la integridad referencial.
      setError(err instanceof ApiError ? err.message : 'No se pudo eliminar el empleado');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Empleados</h1>
        <button onClick={showForm ? cancelForm : startCreate}>{showForm ? 'Cancelar' : 'Nuevo empleado'}</button>
      </div>

      {error && <p className="error">{error}</p>}

      {showForm && (
        <form className="card form-grid" onSubmit={handleSubmit}>
          <label>
            Tipo de documento
            <select value={form.documentType} onChange={(e) => setForm({ ...form, documentType: e.target.value })}>
              {DOCUMENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          <label>
            {form.documentType === 'RUT' ? 'RUT' : 'Número de documento'}
            <input
              placeholder={form.documentType === 'RUT' ? '12.345.678-9' : undefined}
              value={form.documentNumber}
              onChange={(e) => setForm({ ...form, documentNumber: e.target.value })}
              required
            />
          </label>
          <label>
            Nombres
            <input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
          </label>
          <label>
            Apellido paterno
            <input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
          </label>
          <label>
            Apellido materno
            <input value={form.secondLastName} onChange={(e) => setForm({ ...form, secondLastName: e.target.value })} />
          </label>
          <label>
            Nombre social
            <input value={form.socialName} onChange={(e) => setForm({ ...form, socialName: e.target.value })} />
          </label>
          <label>
            Fecha de nacimiento
            <input type="date" value={form.birthDate} onChange={(e) => setForm({ ...form, birthDate: e.target.value })} />
          </label>
          <label>
            Nacionalidad
            <input value={form.nationality} onChange={(e) => setForm({ ...form, nationality: e.target.value })} />
          </label>
          <label>
            País de nacimiento
            <input value={form.birthCountry} onChange={(e) => setForm({ ...form, birthCountry: e.target.value })} />
          </label>
          <label>
            Región de nacimiento
            <input value={form.birthRegion} onChange={(e) => setForm({ ...form, birthRegion: e.target.value })} />
          </label>
          <label>
            Comuna de nacimiento
            <input value={form.birthCommune} onChange={(e) => setForm({ ...form, birthCommune: e.target.value })} />
          </label>
          <label>
            Fotografía (URL)
            <input value={form.photoUrl} onChange={(e) => setForm({ ...form, photoUrl: e.target.value })} />
          </label>
          <label>
            Correo
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </label>
          <div className="form-actions">
            <button type="submit">{editingId ? 'Guardar cambios' : 'Guardar'}</button>
          </div>
        </form>
      )}

      <p className="hint">
        La AFP, la afiliación de salud y el ahorro previsional voluntario se administran en la
        ficha de cada empleado ("Afiliaciones"), ya que son datos con vigencia histórica.
      </p>

      <table className="table">
        <thead>
          <tr>
            <th>Documento</th>
            <th>Nombre</th>
            <th>Correo</th>
            <th>Estado</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp) => (
            <tr key={emp.id}>
              <td>
                {emp.documentNumber}
                <span className="hint"> ({emp.documentType})</span>
              </td>
              <td>
                {emp.socialName || emp.firstName} {emp.lastName}
              </td>
              <td>{emp.email ?? '-'}</td>
              <td>
                <span className={`badge ${emp.status.toLowerCase()}`}>{emp.status}</span>
              </td>
              <td className="row-actions">
                <Link to={`/employees/${emp.id}`}>Ver ficha</Link>
                <button onClick={() => startEdit(emp)}>Editar</button>
                <button disabled={deletingId === emp.id} onClick={() => handleDelete(emp)}>
                  {deletingId === emp.id ? 'Eliminando...' : 'Eliminar'}
                </button>
              </td>
            </tr>
          ))}
          {employees.length === 0 && (
            <tr>
              <td colSpan={5} className="empty">
                Sin empleados registrados.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
