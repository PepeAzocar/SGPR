import { useEffect, useState, type FormEvent } from 'react';
import { api, ApiError } from '../api/client';
import type { ApsBiennium, ApsLaborInstitution, ApsRecognizedService, Employee } from '../api/types';

const STATUS_LABEL: Record<string, string> = {
  IN_PROGRESS: 'En curso',
  COMPLETED: 'Completado',
  RECOGNIZED: 'Reconocido',
  SUSPENDED: 'Suspendido',
  ANNULLED: 'Anulado',
};

function fmtDate(v?: string | null): string {
  return v ? new Date(v).toLocaleDateString('es-CL') : '-';
}

function employeeName(e?: { firstName: string; lastName: string; secondLastName?: string | null }): string {
  return e ? `${e.firstName} ${e.lastName}${e.secondLastName ? ' ' + e.secondLastName : ''}` : '-';
}

const emptyBienniumForm = { employeeId: '', bienniumNumber: '1', periodStartDate: '' };
const emptyServiceForm = {
  institutionId: '',
  serviceType: 'TITULAR',
  startDate: '',
  endDate: '',
  calendarDays: '',
  recognizedDays: '',
};

export function ApsBienniumsPage() {
  const [bienniums, setBienniums] = useState<ApsBiennium[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [institutions, setInstitutions] = useState<ApsLaborInstitution[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(emptyBienniumForm);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selected, setSelected] = useState<ApsBiennium | null>(null);
  const [showAddService, setShowAddService] = useState(false);
  const [serviceForm, setServiceForm] = useState(emptyServiceForm);
  const [expandedServiceId, setExpandedServiceId] = useState<string | null>(null);
  const [exclusionForm, setExclusionForm] = useState({ exclusionType: 'UNPAID_LEAVE', startDate: '', endDate: '', days: '', reason: '' });

  async function loadList() {
    setBienniums(await api.get<ApsBiennium[]>('/aps-bienniums'));
  }

  async function loadDetail(id: string) {
    setSelected(await api.get<ApsBiennium>(`/aps-bienniums/${id}`));
  }

  useEffect(() => {
    Promise.all([
      loadList(),
      api.get<Employee[]>('/employees').then(setEmployees),
      api.get<ApsLaborInstitution[]>('/aps-labor-institutions').then(setInstitutions),
    ]).catch((err) => setError(err instanceof ApiError ? err.message : 'Error al cargar'));
  }, []);

  useEffect(() => {
    if (selectedId) loadDetail(selectedId).catch((err) => setError(err instanceof ApiError ? err.message : 'Error al cargar el bienio'));
    else setSelected(null);
  }, [selectedId]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const created = await api.post<ApsBiennium>('/aps-bienniums', {
        employeeId: form.employeeId,
        bienniumNumber: Number(form.bienniumNumber),
        periodStartDate: form.periodStartDate,
      });
      setForm(emptyBienniumForm);
      setShowCreate(false);
      await loadList();
      setSelectedId(created.id);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo crear el bienio');
    }
  }

  async function handleDelete(b: ApsBiennium) {
    if (!window.confirm(`¿Eliminar el bienio N°${b.bienniumNumber} de ${employeeName(b.employee)}?`)) return;
    setError(null);
    try {
      await api.delete(`/aps-bienniums/${b.id}`);
      if (selectedId === b.id) setSelectedId(null);
      await loadList();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo eliminar el bienio');
    }
  }

  async function handleAddService(e: FormEvent) {
    e.preventDefault();
    if (!selectedId) return;
    setError(null);
    try {
      await api.post(`/aps-bienniums/${selectedId}/services`, {
        institutionId: serviceForm.institutionId,
        serviceType: serviceForm.serviceType,
        startDate: serviceForm.startDate,
        endDate: serviceForm.endDate || undefined,
        calendarDays: Number(serviceForm.calendarDays),
        recognizedDays: Number(serviceForm.recognizedDays),
        effectiveFrom: serviceForm.startDate,
      });
      setServiceForm(emptyServiceForm);
      setShowAddService(false);
      await loadDetail(selectedId);
      await loadList();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo registrar el servicio');
    }
  }

  async function handleRemoveService(serviceId: string) {
    if (!selectedId || !window.confirm('¿Eliminar este servicio reconocido?')) return;
    setError(null);
    try {
      await api.delete(`/aps-bienniums/${selectedId}/services/${serviceId}`);
      await loadDetail(selectedId);
      await loadList();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo eliminar el servicio');
    }
  }

  async function handleAddExclusion(serviceId: string, e: FormEvent) {
    e.preventDefault();
    if (!selectedId) return;
    setError(null);
    try {
      await api.post(`/aps-bienniums/${selectedId}/services/${serviceId}/exclusions`, {
        exclusionType: exclusionForm.exclusionType,
        startDate: exclusionForm.startDate,
        endDate: exclusionForm.endDate,
        days: Number(exclusionForm.days),
        reason: exclusionForm.reason || undefined,
      });
      setExclusionForm({ exclusionType: 'UNPAID_LEAVE', startDate: '', endDate: '', days: '', reason: '' });
      await loadDetail(selectedId);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo registrar la exclusión');
    }
  }

  async function handleRemoveExclusion(serviceId: string, exclusionId: string) {
    if (!selectedId || !window.confirm('¿Eliminar esta exclusión?')) return;
    setError(null);
    try {
      await api.delete(`/aps-bienniums/${selectedId}/services/${serviceId}/exclusions/${exclusionId}`);
      await loadDetail(selectedId);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo eliminar la exclusión');
    }
  }

  return (
    <div>
      <h1>Control Bienal</h1>
      <p className="hint">
        Cada bienio (maestro) se compone de los servicios reconocidos (detalle) que suman sus días — el sistema no
        recalcula automáticamente la fecha de cumplimiento ni el puntaje todavía; regístralos aquí a medida que se
        van reconociendo por resolución.
      </p>
      {error && <p className="error">{error}</p>}

      <div className="page-header">
        <button onClick={() => setShowCreate((v) => !v)}>{showCreate ? 'Cancelar' : 'Nuevo bienio'}</button>
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
            N° de bienio
            <input
              type="number"
              min={1}
              max={15}
              value={form.bienniumNumber}
              onChange={(e) => setForm({ ...form, bienniumNumber: e.target.value })}
              required
            />
          </label>
          <label>
            Fecha de inicio del período
            <input
              type="date"
              value={form.periodStartDate}
              onChange={(e) => setForm({ ...form, periodStartDate: e.target.value })}
              required
            />
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
            <th>N° bienio</th>
            <th>Inicio período</th>
            <th>Días reconocidos</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {bienniums.map((b) => (
            <tr key={b.id} style={{ background: b.id === selectedId ? '#eef2ff' : undefined }}>
              <td>{employeeName(b.employee)}</td>
              <td>{b.bienniumNumber}</td>
              <td>{fmtDate(b.periodStartDate)}</td>
              <td>{b.recognizedServiceDays}</td>
              <td>
                <span className={`badge ${b.status.toLowerCase()}`}>{STATUS_LABEL[b.status]}</span>
              </td>
              <td className="row-actions">
                <button onClick={() => setSelectedId(b.id === selectedId ? null : b.id)}>
                  {b.id === selectedId ? 'Cerrar' : 'Ver detalle'}
                </button>
                <button className="danger-btn" onClick={() => handleDelete(b)}>
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
          {bienniums.length === 0 && (
            <tr>
              <td colSpan={6} className="empty">
                Sin bienios registrados.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {selected && (
        <div className="card">
          <h2 style={{ marginTop: 0 }}>
            Bienio N°{selected.bienniumNumber} — {employeeName(selected.employee)}
          </h2>

          <div className="page-header">
            <h3 style={{ margin: 0 }}>Servicios reconocidos</h3>
            <button onClick={() => setShowAddService((v) => !v)}>{showAddService ? 'Cancelar' : 'Agregar servicio'}</button>
          </div>

          {showAddService && (
            <form className="form-grid" onSubmit={handleAddService}>
              <label>
                Institución
                <select
                  value={serviceForm.institutionId}
                  onChange={(e) => setServiceForm({ ...serviceForm, institutionId: e.target.value })}
                  required
                >
                  <option value="">Seleccionar...</option>
                  {institutions.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Tipo de servicio
                <input
                  value={serviceForm.serviceType}
                  onChange={(e) => setServiceForm({ ...serviceForm, serviceType: e.target.value })}
                  placeholder="TITULAR, CONTRATA, HONORARIOS..."
                  required
                />
              </label>
              <label>
                Fecha de inicio
                <input
                  type="date"
                  value={serviceForm.startDate}
                  onChange={(e) => setServiceForm({ ...serviceForm, startDate: e.target.value })}
                  required
                />
              </label>
              <label>
                Fecha de término
                <input
                  type="date"
                  value={serviceForm.endDate}
                  onChange={(e) => setServiceForm({ ...serviceForm, endDate: e.target.value })}
                />
              </label>
              <label>
                Días del período
                <input
                  type="number"
                  min={0}
                  value={serviceForm.calendarDays}
                  onChange={(e) => setServiceForm({ ...serviceForm, calendarDays: e.target.value })}
                  required
                />
              </label>
              <label>
                Días reconocidos
                <input
                  type="number"
                  min={0}
                  value={serviceForm.recognizedDays}
                  onChange={(e) => setServiceForm({ ...serviceForm, recognizedDays: e.target.value })}
                  required
                />
              </label>
              <div className="form-actions">
                <button type="submit">Guardar servicio</button>
              </div>
            </form>
          )}

          <table className="table">
            <thead>
              <tr>
                <th>Institución</th>
                <th>Tipo</th>
                <th>Desde</th>
                <th>Hasta</th>
                <th>Días reconocidos</th>
                <th>Exclusiones</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {(selected.recognizedServices ?? []).map((s: ApsRecognizedService) => (
                <>
                  <tr key={s.id}>
                    <td>{s.institution?.name}</td>
                    <td>{s.serviceType}</td>
                    <td>{fmtDate(s.startDate)}</td>
                    <td>{fmtDate(s.endDate)}</td>
                    <td>{s.recognizedDays}</td>
                    <td>{s.exclusions?.length ?? 0}</td>
                    <td className="row-actions">
                      <button onClick={() => setExpandedServiceId(expandedServiceId === s.id ? null : s.id)}>
                        {expandedServiceId === s.id ? 'Cerrar' : 'Exclusiones'}
                      </button>
                      <button className="danger-btn" onClick={() => handleRemoveService(s.id)}>
                        Eliminar
                      </button>
                    </td>
                  </tr>
                  {expandedServiceId === s.id && (
                    <tr>
                      <td colSpan={7}>
                        <div className="card" style={{ margin: 0 }}>
                          <p className="hint">
                            Períodos que no cuentan para este servicio (licencias sin goce, interrupciones).
                          </p>
                          <table className="table">
                            <thead>
                              <tr>
                                <th>Tipo</th>
                                <th>Desde</th>
                                <th>Hasta</th>
                                <th>Días</th>
                                <th>Motivo</th>
                                <th></th>
                              </tr>
                            </thead>
                            <tbody>
                              {(s.exclusions ?? []).map((ex) => (
                                <tr key={ex.id}>
                                  <td>{ex.exclusionType}</td>
                                  <td>{fmtDate(ex.startDate)}</td>
                                  <td>{fmtDate(ex.endDate)}</td>
                                  <td>{ex.days}</td>
                                  <td>{ex.reason ?? '-'}</td>
                                  <td>
                                    <button className="danger-btn" onClick={() => handleRemoveExclusion(s.id, ex.id)}>
                                      Eliminar
                                    </button>
                                  </td>
                                </tr>
                              ))}
                              {(s.exclusions ?? []).length === 0 && (
                                <tr>
                                  <td colSpan={6} className="empty">
                                    Sin exclusiones.
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                          <form className="form-grid" onSubmit={(e) => handleAddExclusion(s.id, e)}>
                            <label>
                              Tipo
                              <select
                                value={exclusionForm.exclusionType}
                                onChange={(e) => setExclusionForm({ ...exclusionForm, exclusionType: e.target.value })}
                              >
                                <option value="UNPAID_LEAVE">Permiso sin goce</option>
                                <option value="UNRECOGNIZED_SERVICE">Servicio no reconocido</option>
                                <option value="SERVICE_INTERRUPTION">Interrupción de servicio</option>
                                <option value="OTHER">Otro</option>
                              </select>
                            </label>
                            <label>
                              Desde
                              <input
                                type="date"
                                value={exclusionForm.startDate}
                                onChange={(e) => setExclusionForm({ ...exclusionForm, startDate: e.target.value })}
                                required
                              />
                            </label>
                            <label>
                              Hasta
                              <input
                                type="date"
                                value={exclusionForm.endDate}
                                onChange={(e) => setExclusionForm({ ...exclusionForm, endDate: e.target.value })}
                                required
                              />
                            </label>
                            <label>
                              Días
                              <input
                                type="number"
                                min={0}
                                value={exclusionForm.days}
                                onChange={(e) => setExclusionForm({ ...exclusionForm, days: e.target.value })}
                                required
                              />
                            </label>
                            <label style={{ gridColumn: '1 / -1' }}>
                              Motivo
                              <input
                                value={exclusionForm.reason}
                                onChange={(e) => setExclusionForm({ ...exclusionForm, reason: e.target.value })}
                              />
                            </label>
                            <div className="form-actions">
                              <button type="submit">Agregar exclusión</button>
                            </div>
                          </form>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
              {(selected.recognizedServices ?? []).length === 0 && (
                <tr>
                  <td colSpan={7} className="empty">
                    Sin servicios registrados para este bienio.
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
