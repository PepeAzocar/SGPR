import { Fragment, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, ApiError } from '../api/client';
import type { PayrollResult, PayrollPeriod } from '../api/types';

interface PeriodWithResults extends PayrollPeriod {
  results: PayrollResult[];
}

export function PayrollPeriodDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [period, setPeriod] = useState<PeriodWithResults | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    api
      .get<PeriodWithResults>(`/payroll-periods/${id}`)
      .then(setPeriod)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Error al cargar'));
  }, [id]);

  if (error) return <p className="error">{error}</p>;
  if (!period) return <p>Cargando...</p>;

  return (
    <div>
      <Link to="/payroll-periods">&larr; Volver a períodos</Link>
      <h1>
        Liquidaciones {period.month}/{period.year}
      </h1>
      <p className="hint">
        Se muestra sólo el resultado vigente de cada colaborador. Para ver el historial completo
        de versiones (correcciones) de una liquidación, usa{' '}
        <Link to="/payslip-lookup">Consulta de Liquidación</Link>.
      </p>
      <table className="table">
        <thead>
          <tr>
            <th>Empleado</th>
            <th>Versión</th>
            <th>Haberes</th>
            <th>Descuentos</th>
            <th>Líquido</th>
            <th>Estado</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {period.results.map((r) => (
            <Fragment key={r.id}>
              <tr>
                <td>
                  {r.employee?.firstName} {r.employee?.lastName}
                </td>
                <td>
                  #{r.resultSequence} {r.resultType === 'CORRECTION' ? '(corrección)' : ''}
                </td>
                <td>${Number(r.totalEarnings).toLocaleString('es-CL')}</td>
                <td>${Number(r.totalDeductions).toLocaleString('es-CL')}</td>
                <td>
                  <strong>${Number(r.netAmount).toLocaleString('es-CL')}</strong>
                </td>
                <td>
                  <span className={`badge ${r.status.toLowerCase()}`}>{r.status}</span>
                </td>
                <td className="row-actions">
                  <button onClick={() => setExpanded(expanded === r.id ? null : r.id)}>
                    {expanded === r.id ? 'Ocultar' : 'Detalle'}
                  </button>
                  <Link to={`/payslip-lookup?employeeId=${r.employeeId}&payrollPeriodId=${period.id}`}>Ver ficha</Link>
                </td>
              </tr>
              {expanded === r.id && (
                <tr>
                  <td colSpan={7}>
                    <table className="table nested">
                      <thead>
                        <tr>
                          <th>Concepto</th>
                          <th>Tipo</th>
                          <th>Monto</th>
                        </tr>
                      </thead>
                      <tbody>
                        {r.details?.map((item) => (
                          <tr key={item.id}>
                            <td>{item.conceptName}</td>
                            <td>{item.conceptType === 'EARNING' ? 'Haber' : 'Descuento'}</td>
                            <td>${Number(item.amount).toLocaleString('es-CL')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
          {period.results.length === 0 && (
            <tr>
              <td colSpan={7} className="empty">
                Este período aún no tiene liquidaciones calculadas.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
