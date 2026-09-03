import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api, ApiError } from '../api/client';
import type { Employee, PayrollPeriod, PayrollResult } from '../api/types';

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const RESULT_STATUS_LABEL: Record<PayrollResult['status'], string> = {
  CALCULATED: 'Calculada',
  SUPERSEDED: 'Reemplazada por corrección',
  FINAL: 'Final',
  CANCELLED: 'Anulada',
};

function fmtMoney(v: string | number | null | undefined): string {
  return `$${Number(v ?? 0).toLocaleString('es-CL')}`;
}

function fmtDateTime(v?: string | null): string {
  return v ? new Date(v).toLocaleString('es-CL') : '-';
}

export function PayslipLookupPage() {
  const [searchParams] = useSearchParams();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [periods, setPeriods] = useState<PayrollPeriod[]>([]);
  const [employeeId, setEmployeeId] = useState(searchParams.get('employeeId') ?? '');
  const [payrollPeriodId, setPayrollPeriodId] = useState(searchParams.get('payrollPeriodId') ?? '');

  const [result, setResult] = useState<PayrollResult | null>(null);
  const [history, setHistory] = useState<PayrollResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([api.get<Employee[]>('/employees'), api.get<PayrollPeriod[]>('/payroll-periods')])
      .then(([emp, per]) => {
        setEmployees(emp);
        setPeriods(per);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Error al cargar catálogos'));
  }, []);

  async function loadCurrent() {
    if (!employeeId || !payrollPeriodId) return;
    setError(null);
    setHistory(null);
    setLoading(true);
    try {
      const current = await api.get<PayrollResult[]>(
        `/payroll-results?employeeId=${employeeId}&payrollPeriodId=${payrollPeriodId}&current=true`,
      );
      if (current.length === 0) {
        setResult(null);
        setError('No hay una liquidación calculada para este colaborador en este período.');
        return;
      }
      const full = await api.get<PayrollResult>(`/payroll-results/${current[0].id}`);
      setResult(full);
    } catch (err) {
      setResult(null);
      setError(err instanceof ApiError ? err.message : 'No se pudo cargar la liquidación');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCurrent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeId, payrollPeriodId]);

  async function loadHistory() {
    if (!employeeId || !payrollPeriodId) return;
    setError(null);
    try {
      const all = await api.get<PayrollResult[]>(
        `/payroll-results?employeeId=${employeeId}&payrollPeriodId=${payrollPeriodId}&current=false`,
      );
      setHistory(all);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo cargar el historial');
    }
  }

  async function openVersion(id: string) {
    setError(null);
    try {
      const full = await api.get<PayrollResult>(`/payroll-results/${id}`);
      setResult(full);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo abrir esa versión');
    }
  }

  const earnings = result?.details?.filter((d) => d.conceptType === 'EARNING') ?? [];
  const deductions = result?.details?.filter((d) => d.conceptType === 'DEDUCTION') ?? [];
  const employment = result?.employment;

  return (
    <div>
      <h1>Consulta de Liquidación</h1>
      <p className="hint">
        Muestra el resultado vigente de la nómina versionada. Cada corrección crea un resultado
        nuevo — nada se sobrescribe; el historial completo queda disponible más abajo.
      </p>

      <div className="card form-grid no-print">
        <label>
          Colaborador
          <select value={employeeId} onChange={(e) => setEmployeeId(e.target.value)}>
            <option value="">Seleccionar...</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.firstName} {e.lastName}
              </option>
            ))}
          </select>
        </label>
        <label>
          Período
          <select value={payrollPeriodId} onChange={(e) => setPayrollPeriodId(e.target.value)}>
            <option value="">Seleccionar...</option>
            {periods.map((p) => (
              <option key={p.id} value={p.id}>
                {MONTHS[p.month - 1]} {p.year}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error && <p className="error">{error}</p>}
      {loading && <p>Cargando...</p>}

      {result && (
        <>
          <div className="page-header no-print">
            <div className="row-actions">
              <span className={`badge ${result.status.toLowerCase()}`}>{RESULT_STATUS_LABEL[result.status]}</span>
              {!result.isCurrent && <span className="badge inactive">No vigente</span>}
            </div>
            <div className="row-actions">
              <button onClick={loadHistory}>Ver historial</button>
              <button onClick={() => window.print()}>Imprimir / Guardar PDF</button>
            </div>
          </div>

          <div className="document-preview">
            <h2 style={{ marginTop: 0, textAlign: 'center' }}>LIQUIDACIÓN DE SUELDO</h2>
            <table className="table nested">
              <tbody>
                <tr>
                  <th>Empresa</th>
                  <td>{employment?.legalEntityName ?? '-'}</td>
                  <th>Período</th>
                  <td>
                    {result.payrollPeriod ? `${MONTHS[result.payrollPeriod.month - 1]} ${result.payrollPeriod.year}` : '-'}
                  </td>
                </tr>
                <tr>
                  <th>Colaborador</th>
                  <td>
                    {result.employee?.firstName} {result.employee?.lastName}
                  </td>
                  <th>RUT</th>
                  <td>{result.employee?.rut ?? '-'}</td>
                </tr>
                <tr>
                  <th>Cargo</th>
                  <td>{employment?.positionTitle ?? '-'}</td>
                  <th>Centro de costo</th>
                  <td>{employment?.costCenterName ?? '-'}</td>
                </tr>
                <tr>
                  <th>Tipo de contrato</th>
                  <td>{employment?.contractTypeName ?? '-'}</td>
                  <th>Jornada semanal</th>
                  <td>{employment?.weeklyHours ? `${employment.weeklyHours} hrs` : '-'}</td>
                </tr>
                <tr>
                  <th>Versión</th>
                  <td>
                    #{result.resultSequence} ({result.resultType === 'CORRECTION' ? 'corrección' : 'regular'})
                  </td>
                  <th>Fecha de cálculo</th>
                  <td>{fmtDateTime(result.calculationDate)}</td>
                </tr>
              </tbody>
            </table>

            <h3>Haberes</h3>
            <table className="table nested">
              <thead>
                <tr>
                  <th>Concepto</th>
                  <th>Monto</th>
                </tr>
              </thead>
              <tbody>
                {earnings.map((d) => (
                  <tr key={d.id}>
                    <td>{d.conceptName}</td>
                    <td>{fmtMoney(d.amount)}</td>
                  </tr>
                ))}
                {earnings.length === 0 && (
                  <tr>
                    <td colSpan={2} className="empty">Sin haberes.</td>
                  </tr>
                )}
              </tbody>
            </table>

            <h3>Descuentos</h3>
            <table className="table nested">
              <thead>
                <tr>
                  <th>Concepto</th>
                  <th>Monto</th>
                </tr>
              </thead>
              <tbody>
                {deductions.map((d) => (
                  <tr key={d.id}>
                    <td>{d.conceptName}</td>
                    <td>{fmtMoney(d.amount)}</td>
                  </tr>
                ))}
                {deductions.length === 0 && (
                  <tr>
                    <td colSpan={2} className="empty">Sin descuentos.</td>
                  </tr>
                )}
              </tbody>
            </table>

            <table className="table nested">
              <tbody>
                <tr>
                  <th>Total haberes</th>
                  <td>{fmtMoney(result.totalEarnings)}</td>
                </tr>
                <tr>
                  <th>Total descuentos</th>
                  <td>{fmtMoney(result.totalDeductions)}</td>
                </tr>
                <tr>
                  <th>Líquido a pagar</th>
                  <td>
                    <strong>{fmtMoney(result.netAmount)}</strong>
                  </td>
                </tr>
                {result.resultType === 'CORRECTION' && (
                  <>
                    <tr>
                      <th>Líquido anterior</th>
                      <td>{fmtMoney(result.previousNetAmount)}</td>
                    </tr>
                    <tr>
                      <th>Diferencia</th>
                      <td>{fmtMoney(result.differenceAmount)}</td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {history && (
        <div className="card no-print">
          <h2 style={{ marginTop: 0 }}>Historial de versiones</h2>
          <table className="table">
            <thead>
              <tr>
                <th>Versión</th>
                <th>Tipo</th>
                <th>Fecha de cálculo</th>
                <th>Líquido</th>
                <th>Diferencia</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {history.map((h) => (
                <tr key={h.id} style={{ background: h.id === result?.id ? '#eef2ff' : undefined }}>
                  <td>#{h.resultSequence}</td>
                  <td>{h.resultType === 'CORRECTION' ? 'Corrección' : 'Regular'}</td>
                  <td>{fmtDateTime(h.calculationDate)}</td>
                  <td>{fmtMoney(h.netAmount)}</td>
                  <td>{h.differenceAmount != null ? fmtMoney(h.differenceAmount) : '-'}</td>
                  <td>
                    <span className={`badge ${h.status.toLowerCase()}`}>{RESULT_STATUS_LABEL[h.status]}</span>
                  </td>
                  <td>
                    <button onClick={() => openVersion(h.id)}>Ver</button>
                  </td>
                </tr>
              ))}
              {history.length === 0 && (
                <tr>
                  <td colSpan={7} className="empty">Sin historial.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
