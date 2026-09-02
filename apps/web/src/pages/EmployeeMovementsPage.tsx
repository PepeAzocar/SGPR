import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { api, ApiError } from '../api/client';
import { downloadListPdf } from '../lib/listPdf';
import type {
  Contract,
  CostCenter,
  Employee,
  EmployeeEvent,
  EventReason,
  EventType,
  LaborRegime,
  PayrollPeriod,
  Position,
} from '../api/types';

type FieldKind = 'text' | 'number' | 'position' | 'costCenter' | 'laborRegime';

interface EventFieldSpec {
  fieldCode: string;
  label: string;
  kind: FieldKind;
}

// El evento determina qué sección de detalle aparece. Sólo BASE_SALARY,
// WEEKLY_HOURS y LABOR_REGIME tienen un lugar natural en el Contract vigente
// y se aplican de inmediato al guardar; el resto queda registrado en el
// historial pero la reasignación real sigue haciéndose desde el mantenedor
// de Contratos (crear un nuevo contrato), porque Position es un catálogo
// compartido entre colaboradores sin historial propio todavía.
const EVENT_DETAIL_FIELDS: Record<string, EventFieldSpec> = {
  PAY_CHANGE: { fieldCode: 'BASE_SALARY', label: 'Sueldo base', kind: 'number' },
  WORK_SCHEDULE_CHANGE: { fieldCode: 'WEEKLY_HOURS', label: 'Horas semanales', kind: 'number' },
  HOURS_CHANGE: { fieldCode: 'WEEKLY_HOURS', label: 'Horas semanales', kind: 'number' },
  COST_CENTER_CHANGE: { fieldCode: 'COST_CENTER', label: 'Centro de costo', kind: 'costCenter' },
  POSITION_CHANGE: { fieldCode: 'POSITION', label: 'Posición', kind: 'position' },
  JOB_CHANGE: { fieldCode: 'POSITION', label: 'Cargo (posición)', kind: 'position' },
  PROMOTION: { fieldCode: 'POSITION', label: 'Posición', kind: 'position' },
  TRANSFER: { fieldCode: 'POSITION', label: 'Posición', kind: 'position' },
  DEPARTMENT_CHANGE: { fieldCode: 'POSITION', label: 'Posición (define el departamento)', kind: 'position' },
  LABOR_REGIME_CHANGE: { fieldCode: 'LABOR_REGIME', label: 'Régimen jurídico', kind: 'laborRegime' },
};
const DEFAULT_FIELD: EventFieldSpec = { fieldCode: 'OTHER', label: 'Detalle', kind: 'text' };
const AUTO_APPLIED_FIELDS = new Set(['BASE_SALARY', 'WEEKLY_HOURS', 'LABOR_REGIME']);

const EMPLOYEE_STATUS_LABEL: Record<string, string> = {
  ACTIVE: 'Activo',
  ON_LEAVE: 'Con licencia/permiso',
  TERMINATED: 'Terminado',
};

function fmtDate(v: string | null | undefined): string {
  return v ? new Date(v).toLocaleDateString('es-CL') : '-';
}

function fmtMoney(v: string | number | null | undefined): string {
  return v == null ? '-' : `$${Number(v).toLocaleString('es-CL')}`;
}

function currentContractOf(employeeId: string, contracts: Contract[]): Contract | undefined {
  return contracts
    .filter((c) => c.employeeId === employeeId && c.isActive)
    .sort((a, b) => b.startDate.localeCompare(a.startDate))[0];
}

const emptyForm = {
  effectiveDate: '',
  eventTypeId: '',
  eventReasonId: '',
  description: '',
  documentReference: '',
  newValue: '',
  oldValueText: '',
  newValueText: '',
};

export function EmployeeMovementsPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [laborRegimes, setLaborRegimes] = useState<LaborRegime[]>([]);
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [eventReasons, setEventReasons] = useState<EventReason[]>([]);
  const [payrollPeriods, setPayrollPeriods] = useState<PayrollPeriod[]>([]);
  const [events, setEvents] = useState<EmployeeEvent[]>([]);

  const [employeeId, setEmployeeId] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [filterYear, setFilterYear] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterEventTypeId, setFilterEventTypeId] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPayroll, setFilterPayroll] = useState('');
  const [filterRetroactive, setFilterRetroactive] = useState('');

  useEffect(() => {
    Promise.all([
      api.get<Employee[]>('/employees'),
      api.get<Contract[]>('/contracts'),
      api.get<Position[]>('/positions'),
      api.get<CostCenter[]>('/cost-centers'),
      api.get<LaborRegime[]>('/labor-regimes'),
      api.get<EventType[]>('/event-types'),
      api.get<EventReason[]>('/event-reasons'),
      api.get<PayrollPeriod[]>('/payroll-periods'),
    ])
      .then(([e, c, p, cc, lr, et, er, pp]) => {
        setEmployees(e);
        setContracts(c);
        setPositions(p);
        setCostCenters(cc);
        setLaborRegimes(lr);
        setEventTypes(et);
        setEventReasons(er);
        setPayrollPeriods(pp);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Error al cargar catálogos'));
  }, []);

  async function loadEvents(empId: string) {
    if (!empId) return;
    setEvents(await api.get<EmployeeEvent[]>(`/employee-events?employeeId=${empId}`));
  }

  useEffect(() => {
    if (employeeId) loadEvents(employeeId).catch((err) => setError(err instanceof ApiError ? err.message : 'Error al cargar movimientos'));
    setForm(emptyForm);
  }, [employeeId]);

  const employee = employees.find((e) => e.id === employeeId);
  const currentContract = employeeId ? currentContractOf(employeeId, contracts) : undefined;
  const currentPosition = currentContract ? positions.find((p) => p.id === currentContract.positionId) : undefined;
  const currentCostCenter = currentPosition?.costCenter ?? currentPosition?.department?.costCenter ?? null;

  const selectedEventType = eventTypes.find((et) => et.id === form.eventTypeId);
  const reasonOptions = eventReasons.filter((r) => r.eventTypeId === form.eventTypeId);
  const fieldSpec = selectedEventType ? EVENT_DETAIL_FIELDS[selectedEventType.code] ?? DEFAULT_FIELD : DEFAULT_FIELD;

  const oldValueDisplay = useMemo(() => {
    switch (fieldSpec.kind) {
      case 'number':
        if (fieldSpec.fieldCode === 'BASE_SALARY') return currentContract ? fmtMoney(currentContract.baseSalary) : '-';
        if (fieldSpec.fieldCode === 'WEEKLY_HOURS') return currentContract ? `${currentContract.weeklyHours} hrs` : '-';
        return '-';
      case 'costCenter':
        return currentCostCenter?.name ?? '-';
      case 'position':
        return currentPosition?.title ?? '-';
      case 'laborRegime':
        return currentContract?.laborRegime?.name ?? '-';
      default:
        return form.oldValueText;
    }
  }, [fieldSpec, currentContract, currentCostCenter, currentPosition, form.oldValueText]);

  const processedPeriods = payrollPeriods.filter((p) => p.status === 'CALCULATED' || p.status === 'CLOSED' || p.status === 'PAID');
  const retroactivePreview = useMemo(() => {
    if (!form.effectiveDate || processedPeriods.length === 0) return false;
    const latest = [...processedPeriods].sort((a, b) => b.year - a.year || b.month - a.month)[0];
    const periodEnd = new Date(Date.UTC(latest.year, latest.month, 0, 23, 59, 59));
    return new Date(form.effectiveDate).getTime() <= periodEnd.getTime();
  }, [form.effectiveDate, processedPeriods]);

  function resetChangeInputs() {
    setForm((f) => ({ ...f, newValue: '', oldValueText: '', newValueText: '' }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!employeeId) return;
    setError(null);
    setSaving(true);
    try {
      let change: Record<string, unknown> | null = null;
      if (fieldSpec.kind === 'number') {
        change = { fieldCode: fieldSpec.fieldCode, oldValue: oldValueDisplay, newValue: form.newValue };
      } else if (fieldSpec.kind === 'costCenter') {
        const cc = costCenters.find((c) => c.id === form.newValue);
        change = {
          fieldCode: fieldSpec.fieldCode,
          oldValue: currentCostCenter?.name ?? '',
          newValue: cc?.name ?? '',
          oldReferenceId: currentCostCenter?.id,
          newReferenceId: cc?.id,
        };
      } else if (fieldSpec.kind === 'position') {
        const pos = positions.find((p) => p.id === form.newValue);
        change = {
          fieldCode: fieldSpec.fieldCode,
          oldValue: currentPosition?.title ?? '',
          newValue: pos?.title ?? '',
          oldReferenceId: currentPosition?.id,
          newReferenceId: pos?.id,
        };
      } else if (fieldSpec.kind === 'laborRegime') {
        const lr = laborRegimes.find((r) => r.id === form.newValue);
        change = {
          fieldCode: fieldSpec.fieldCode,
          oldValue: currentContract?.laborRegime?.name ?? '',
          newValue: lr?.name ?? '',
          oldReferenceId: currentContract?.laborRegimeId,
          newReferenceId: lr?.id,
        };
      } else if (form.oldValueText || form.newValueText) {
        change = { fieldCode: 'OTHER', oldValue: form.oldValueText, newValue: form.newValueText };
      }

      await api.post('/employee-events', {
        employeeId,
        effectiveDate: form.effectiveDate,
        eventTypeId: form.eventTypeId,
        eventReasonId: form.eventReasonId,
        description: form.description || undefined,
        documentReference: form.documentReference || undefined,
        changes: change ? [change] : undefined,
      });

      setForm(emptyForm);
      await Promise.all([
        loadEvents(employeeId),
        api.get<Contract[]>('/contracts').then(setContracts),
      ]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo guardar el movimiento');
    } finally {
      setSaving(false);
    }
  }

  async function handleCancel(ev: EmployeeEvent) {
    if (!window.confirm('¿Anular este movimiento? Queda marcado como cancelado en el historial.')) return;
    setError(null);
    try {
      await api.patch(`/employee-events/${ev.id}/cancel`);
      await loadEvents(employeeId);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo anular el movimiento');
    }
  }

  const filteredEvents = events.filter((ev) => {
    const d = new Date(ev.effectiveDate);
    if (filterYear && d.getUTCFullYear() !== Number(filterYear)) return false;
    if (filterMonth && d.getUTCMonth() + 1 !== Number(filterMonth)) return false;
    if (filterEventTypeId && ev.eventTypeId !== filterEventTypeId) return false;
    if (filterStatus && ev.status !== filterStatus) return false;
    if (filterPayroll && String(ev.payrollRelevant) !== filterPayroll) return false;
    if (filterRetroactive && String(ev.retroactive) !== filterRetroactive) return false;
    return true;
  });

  function changeSummary(ev: EmployeeEvent): { field: string; old: string; nu: string } {
    const first = ev.changes?.[0];
    if (!first) return { field: '-', old: '-', nu: '-' };
    const extra = (ev.changes?.length ?? 0) > 1 ? ` (+${(ev.changes!.length - 1)})` : '';
    return { field: first.fieldCode + extra, old: first.oldValue ?? '-', nu: first.newValue ?? '-' };
  }

  function handlePdf() {
    if (!employee) return;
    downloadListPdf(
      `Movimientos - ${employee.firstName} ${employee.lastName}`,
      [
        { header: 'Fecha efectiva', accessor: (r) => fmtDate((r as EmployeeEvent).effectiveDate) },
        { header: 'Evento', accessor: (r) => (r as EmployeeEvent).eventType?.name ?? '-' },
        { header: 'Motivo', accessor: (r) => (r as EmployeeEvent).eventReason?.name ?? '-' },
        { header: 'Campo', accessor: (r) => changeSummary(r as EmployeeEvent).field },
        { header: 'Anterior', accessor: (r) => changeSummary(r as EmployeeEvent).old },
        { header: 'Nuevo', accessor: (r) => changeSummary(r as EmployeeEvent).nu },
        { header: 'Payroll', accessor: (r) => ((r as EmployeeEvent).payrollRelevant ? 'Sí' : 'No') },
        { header: 'Estado', accessor: (r) => (r as EmployeeEvent).status },
      ],
      filteredEvents,
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1>Movimientos del colaborador</h1>
      </div>
      {error && <p className="error">{error}</p>}

      <label>
        Colaborador
        <select value={employeeId} onChange={(e) => setEmployeeId(e.target.value)}>
          <option value="">Seleccionar...</option>
          {employees.map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.firstName} {emp.lastName} ({emp.documentNumber})
            </option>
          ))}
        </select>
      </label>

      {employee && (
        <>
          <div className="card">
            <h2 style={{ marginTop: 0 }}>
              {employee.firstName} {employee.lastName}
            </h2>
            <table className="table">
              <tbody>
                <tr>
                  <td>RUT</td>
                  <td>{employee.rut ?? employee.documentNumber}</td>
                  <td>Régimen laboral</td>
                  <td>{currentContract?.laborRegime?.name ?? 'Sin contrato vigente'}</td>
                </tr>
                <tr>
                  <td>Estado laboral</td>
                  <td>{EMPLOYEE_STATUS_LABEL[employee.status] ?? employee.status}</td>
                  <td>Contrato vigente</td>
                  <td>{currentContract ? `${currentContract.contractNumber} — ${currentContract.contractType?.name ?? ''}` : '-'}</td>
                </tr>
                <tr>
                  <td>Cargo actual</td>
                  <td>{currentPosition?.title ?? '-'}</td>
                  <td>Centro de costo actual</td>
                  <td>{currentCostCenter?.name ?? '-'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="card">
            <h2 style={{ marginTop: 0 }}>Nuevo movimiento</h2>
            <form className="form-grid" onSubmit={handleSubmit}>
              <label>
                Fecha efectiva
                <input
                  type="date"
                  value={form.effectiveDate}
                  onChange={(e) => setForm({ ...form, effectiveDate: e.target.value })}
                  required
                />
              </label>
              <label>
                Evento
                <select
                  value={form.eventTypeId}
                  onChange={(e) => {
                    setForm({ ...form, eventTypeId: e.target.value, eventReasonId: '' });
                    resetChangeInputs();
                  }}
                  required
                >
                  <option value="">Seleccionar...</option>
                  {eventTypes.map((et) => (
                    <option key={et.id} value={et.id}>
                      {et.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Motivo
                <select
                  value={form.eventReasonId}
                  disabled={!form.eventTypeId}
                  onChange={(e) => setForm({ ...form, eventReasonId: e.target.value })}
                  required
                >
                  <option value="">Seleccionar...</option>
                  {reasonOptions.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </label>

              {selectedEventType && (
                <>
                  <fieldset style={{ gridColumn: '1 / -1' }}>
                    <legend>Detalle del cambio — {fieldSpec.label}</legend>
                    {fieldSpec.kind === 'text' ? (
                      <div className="form-grid">
                        <label>
                          Valor anterior
                          <input value={form.oldValueText} onChange={(e) => setForm({ ...form, oldValueText: e.target.value })} />
                        </label>
                        <label>
                          Valor nuevo
                          <input value={form.newValueText} onChange={(e) => setForm({ ...form, newValueText: e.target.value })} />
                        </label>
                      </div>
                    ) : (
                      <div className="form-grid">
                        <label>
                          Valor vigente
                          <input value={oldValueDisplay} disabled />
                        </label>
                        <label>
                          Nuevo valor
                          {fieldSpec.kind === 'number' && (
                            <input
                              type="number"
                              min={0}
                              value={form.newValue}
                              onChange={(e) => setForm({ ...form, newValue: e.target.value })}
                              required
                            />
                          )}
                          {fieldSpec.kind === 'costCenter' && (
                            <select value={form.newValue} onChange={(e) => setForm({ ...form, newValue: e.target.value })} required>
                              <option value="">Seleccionar...</option>
                              {costCenters.map((c) => (
                                <option key={c.id} value={c.id}>
                                  {c.name}
                                </option>
                              ))}
                            </select>
                          )}
                          {fieldSpec.kind === 'position' && (
                            <select value={form.newValue} onChange={(e) => setForm({ ...form, newValue: e.target.value })} required>
                              <option value="">Seleccionar...</option>
                              {positions.map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.title}
                                </option>
                              ))}
                            </select>
                          )}
                          {fieldSpec.kind === 'laborRegime' && (
                            <select value={form.newValue} onChange={(e) => setForm({ ...form, newValue: e.target.value })} required>
                              <option value="">Seleccionar...</option>
                              {laborRegimes.map((r) => (
                                <option key={r.id} value={r.id}>
                                  {r.name}
                                </option>
                              ))}
                            </select>
                          )}
                        </label>
                      </div>
                    )}
                    {!AUTO_APPLIED_FIELDS.has(fieldSpec.fieldCode) && fieldSpec.fieldCode !== 'OTHER' && (
                      <p className="hint">
                        Este cambio queda registrado en el historial. La reasignación real se formaliza creando un nuevo
                        contrato en el mantenedor de Contratos.
                      </p>
                    )}
                  </fieldset>

                  <fieldset style={{ gridColumn: '1 / -1' }}>
                    <legend>Impacto</legend>
                    <p>{selectedEventType.payrollRelevant ? '✓ Afecta remuneraciones' : '○ No afecta remuneraciones'}</p>
                    <p>{retroactivePreview ? '⚠ Retroactivo: SÍ — afecta un período ya calculado' : '○ Retroactivo: NO'}</p>
                  </fieldset>
                </>
              )}

              <label>
                Observación
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} maxLength={500} />
              </label>
              <label>
                Referencia de documento
                <input
                  value={form.documentReference}
                  onChange={(e) => setForm({ ...form, documentReference: e.target.value })}
                  maxLength={200}
                  placeholder="N° de resolución, anexo, etc."
                />
              </label>

              <div className="form-actions">
                <button type="submit" disabled={saving}>
                  {saving ? 'Guardando...' : 'Guardar movimiento'}
                </button>
              </div>
            </form>
          </div>

          <div className="card">
            <div className="page-header">
              <h2 style={{ margin: 0 }}>Historial de movimientos</h2>
              <button onClick={handlePdf}>Generar PDF</button>
            </div>
            <div className="row-actions" style={{ marginBottom: '1rem' }}>
              <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)}>
                <option value="">Año</option>
                {Array.from(new Set(events.map((ev) => new Date(ev.effectiveDate).getUTCFullYear()))).sort((a, b) => b - a).map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
              <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)}>
                <option value="">Mes</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              <select value={filterEventTypeId} onChange={(e) => setFilterEventTypeId(e.target.value)}>
                <option value="">Evento</option>
                {eventTypes.map((et) => (
                  <option key={et.id} value={et.id}>
                    {et.name}
                  </option>
                ))}
              </select>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="">Estado</option>
                <option value="APPLIED">Aplicado</option>
                <option value="CANCELLED">Cancelado</option>
              </select>
              <select value={filterPayroll} onChange={(e) => setFilterPayroll(e.target.value)}>
                <option value="">Payroll relevante</option>
                <option value="true">Sí</option>
                <option value="false">No</option>
              </select>
              <select value={filterRetroactive} onChange={(e) => setFilterRetroactive(e.target.value)}>
                <option value="">Retroactivo</option>
                <option value="true">Sí</option>
                <option value="false">No</option>
              </select>
            </div>

            <table className="table">
              <thead>
                <tr>
                  <th>Fecha efectiva</th>
                  <th>Evento</th>
                  <th>Motivo</th>
                  <th>Campo</th>
                  <th>Anterior</th>
                  <th>Nuevo</th>
                  <th>Payroll</th>
                  <th>Retroactivo</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map((ev) => {
                  const s = changeSummary(ev);
                  return (
                    <tr key={ev.id}>
                      <td>{fmtDate(ev.effectiveDate)}</td>
                      <td>{ev.eventType?.name}</td>
                      <td>{ev.eventReason?.name}</td>
                      <td>{s.field}</td>
                      <td>{s.old}</td>
                      <td>{s.nu}</td>
                      <td>{ev.payrollRelevant ? 'Sí' : 'No'}</td>
                      <td>{ev.retroactive ? 'Sí' : 'No'}</td>
                      <td>
                        <span className={`badge ${ev.status.toLowerCase()}`}>{ev.status === 'APPLIED' ? 'Aplicado' : 'Cancelado'}</span>
                      </td>
                      <td>
                        {ev.status === 'APPLIED' && (
                          <button className="danger-btn" onClick={() => handleCancel(ev)}>
                            Anular
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {filteredEvents.length === 0 && (
                  <tr>
                    <td colSpan={10} className="empty">
                      Sin movimientos registrados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
