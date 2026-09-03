import { useEffect, useState, type FormEvent } from 'react';
import { api, ApiError } from '../api/client';
import type { ApsEmployeeTrainingYear, ApsTrainingActivity, Employee } from '../api/types';

function fmtDate(v?: string | null): string {
  return v ? new Date(v).toLocaleDateString('es-CL') : '-';
}

function employeeName(e?: { firstName: string; lastName: string; secondLastName?: string | null }): string {
  return e ? `${e.firstName} ${e.lastName}${e.secondLastName ? ' ' + e.secondLastName : ''}` : '-';
}

const emptyYearForm = { employeeId: '', year: String(new Date().getFullYear()), annualLimit: '' };
const emptyTrainingForm = { trainingActivityId: '', registrationDate: '', careerYear: String(new Date().getFullYear()) };

export function ApsTrainingYearsPage() {
  const [years, setYears] = useState<ApsEmployeeTrainingYear[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [activities, setActivities] = useState<ApsTrainingActivity[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(emptyYearForm);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selected, setSelected] = useState<ApsEmployeeTrainingYear | null>(null);
  const [showAddTraining, setShowAddTraining] = useState(false);
  const [trainingForm, setTrainingForm] = useState(emptyTrainingForm);

  async function loadList() {
    setYears(await api.get<ApsEmployeeTrainingYear[]>('/aps-employee-training-years'));
  }

  async function loadDetail(id: string) {
    setSelected(await api.get<ApsEmployeeTrainingYear>(`/aps-employee-training-years/${id}`));
  }

  useEffect(() => {
    Promise.all([
      loadList(),
      api.get<Employee[]>('/employees').then(setEmployees),
      api.get<ApsTrainingActivity[]>('/aps-training-activities').then(setActivities),
    ]).catch((err) => setError(err instanceof ApiError ? err.message : 'Error al cargar'));
  }, []);

  useEffect(() => {
    if (selectedId) loadDetail(selectedId).catch((err) => setError(err instanceof ApiError ? err.message : 'Error al cargar el control anual'));
    else setSelected(null);
  }, [selectedId]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const created = await api.post<ApsEmployeeTrainingYear>('/aps-employee-training-years', {
        employeeId: form.employeeId,
        year: Number(form.year),
        annualLimit: form.annualLimit ? Number(form.annualLimit) : undefined,
      });
      setForm(emptyYearForm);
      setShowCreate(false);
      await loadList();
      setSelectedId(created.id);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo crear el control anual');
    }
  }

  async function handleDelete(y: ApsEmployeeTrainingYear) {
    if (!window.confirm(`¿Eliminar el control de capacitación ${y.year} de ${employeeName(y.employee)}? Se eliminan también sus cursos registrados.`)) return;
    setError(null);
    try {
      await api.delete(`/aps-employee-training-years/${y.id}`);
      if (selectedId === y.id) setSelectedId(null);
      await loadList();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo eliminar el control anual');
    }
  }

  async function handleClose(y: ApsEmployeeTrainingYear) {
    setError(null);
    try {
      await api.patch(`/aps-employee-training-years/${y.id}`, { closed: !y.closed, closingDate: !y.closed ? new Date().toISOString() : null });
      await loadList();
      if (selectedId === y.id) await loadDetail(y.id);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo actualizar el cierre');
    }
  }

  async function handleAddTraining(e: FormEvent) {
    e.preventDefault();
    if (!selectedId) return;
    setError(null);
    try {
      await api.post(`/aps-employee-training-years/${selectedId}/trainings`, {
        trainingActivityId: trainingForm.trainingActivityId,
        registrationDate: trainingForm.registrationDate,
        careerYear: Number(trainingForm.careerYear),
      });
      setTrainingForm(emptyTrainingForm);
      setShowAddTraining(false);
      await loadDetail(selectedId);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo registrar el curso');
    }
  }

  async function handleRemoveTraining(trainingId: string) {
    if (!selectedId || !window.confirm('¿Eliminar este curso del control anual?')) return;
    setError(null);
    try {
      await api.delete(`/aps-employee-training-years/${selectedId}/trainings/${trainingId}`);
      await loadDetail(selectedId);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo eliminar el curso');
    }
  }

  return (
    <div>
      <h1>Control de Capacitación</h1>
      <p className="hint">
        Un control anual (maestro) por funcionario agrupa los cursos tomados ese año (detalle). El puntaje calculado
        y el reconocido se registran por curso; hoy se ingresan manualmente — el cálculo automático de factores queda
        para una siguiente etapa.
      </p>
      {error && <p className="error">{error}</p>}

      <div className="page-header">
        <button onClick={() => setShowCreate((v) => !v)}>{showCreate ? 'Cancelar' : 'Nuevo control anual'}</button>
      </div>

      {showCreate && (
        <form className="card form-grid" onSubmit={handleCreate}>
          <label>
            Funcionario
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
            Año
            <input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} required />
          </label>
          <label>
            Tope anual de puntaje (opcional)
            <input type="number" value={form.annualLimit} onChange={(e) => setForm({ ...form, annualLimit: e.target.value })} />
          </label>
          <div className="form-actions">
            <button type="submit">Crear</button>
          </div>
        </form>
      )}

      <table className="table">
        <thead>
          <tr>
            <th>Funcionario</th>
            <th>Año</th>
            <th>Puntaje ganado</th>
            <th>Puntaje reconocido</th>
            <th>Acumulado carrera</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {years.map((y) => (
            <tr key={y.id} style={{ background: y.id === selectedId ? '#eef2ff' : undefined }}>
              <td>{employeeName(y.employee)}</td>
              <td>{y.year}</td>
              <td>{y.earnedPoints}</td>
              <td>{y.recognizedPoints}</td>
              <td>{y.careerAccumulatedPoints}</td>
              <td>
                <span className={`badge ${y.closed ? 'inactive' : 'active'}`}>{y.closed ? 'Cerrado' : 'Abierto'}</span>
              </td>
              <td className="row-actions">
                <button onClick={() => setSelectedId(y.id === selectedId ? null : y.id)}>
                  {y.id === selectedId ? 'Cerrar vista' : 'Ver detalle'}
                </button>
                <button onClick={() => handleClose(y)}>{y.closed ? 'Reabrir' : 'Cerrar año'}</button>
                <button className="danger-btn" onClick={() => handleDelete(y)}>
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
          {years.length === 0 && (
            <tr>
              <td colSpan={7} className="empty">
                Sin controles anuales registrados.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {selected && (
        <div className="card">
          <h2 style={{ marginTop: 0 }}>
            Capacitación {selected.year} — {employeeName(selected.employee)}
          </h2>

          <div className="page-header">
            <h3 style={{ margin: 0 }}>Cursos tomados este año</h3>
            <button onClick={() => setShowAddTraining((v) => !v)}>{showAddTraining ? 'Cancelar' : 'Agregar curso'}</button>
          </div>

          {showAddTraining && (
            <form className="form-grid" onSubmit={handleAddTraining}>
              <label>
                Curso
                <select
                  value={trainingForm.trainingActivityId}
                  onChange={(e) => setTrainingForm({ ...trainingForm, trainingActivityId: e.target.value })}
                  required
                >
                  <option value="">Seleccionar...</option>
                  {activities.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.pedagogicalHours} hrs)
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Fecha de inscripción
                <input
                  type="date"
                  value={trainingForm.registrationDate}
                  onChange={(e) => setTrainingForm({ ...trainingForm, registrationDate: e.target.value })}
                  required
                />
              </label>
              <label>
                Año de carrera
                <input
                  type="number"
                  value={trainingForm.careerYear}
                  onChange={(e) => setTrainingForm({ ...trainingForm, careerYear: e.target.value })}
                  required
                />
              </label>
              <div className="form-actions">
                <button type="submit">Guardar curso</button>
              </div>
            </form>
          )}

          <table className="table">
            <thead>
              <tr>
                <th>Curso</th>
                <th>Inscripción</th>
                <th>Asistencia</th>
                <th>Nota</th>
                <th>Puntaje calculado</th>
                <th>Puntaje reconocido</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {(selected.trainings ?? []).map((t) => (
                <tr key={t.id}>
                  <td>{t.trainingActivity?.name}</td>
                  <td>{fmtDate(t.registrationDate)}</td>
                  <td>{t.attendancePercentage ?? '-'}</td>
                  <td>{t.finalGrade ?? '-'}</td>
                  <td>{t.calculatedPoints ?? '-'}</td>
                  <td>{t.recognizedPoints ?? '-'}</td>
                  <td>{t.status}</td>
                  <td>
                    <button className="danger-btn" onClick={() => handleRemoveTraining(t.id)}>
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
              {(selected.trainings ?? []).length === 0 && (
                <tr>
                  <td colSpan={8} className="empty">
                    Sin cursos registrados este año.
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
