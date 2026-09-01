import { Fragment, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, ApiError } from '../api/client';
import type { Payslip, PayrollPeriod } from '../api/types';

interface PeriodWithPayslips extends PayrollPeriod {
  payslips: Payslip[];
}

export function PayrollPeriodDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [period, setPeriod] = useState<PeriodWithPayslips | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    api
      .get<PeriodWithPayslips>(`/payroll-periods/${id}`)
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
      <table className="table">
        <thead>
          <tr>
            <th>Empleado</th>
            <th>Haberes</th>
            <th>Descuentos</th>
            <th>Líquido</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {period.payslips.map((p) => (
            <Fragment key={p.id}>
              <tr>
                <td>
                  {p.employee?.firstName} {p.employee?.lastName}
                </td>
                <td>${Number(p.totalEarnings).toLocaleString('es-CL')}</td>
                <td>${Number(p.totalDeductions).toLocaleString('es-CL')}</td>
                <td>
                  <strong>${Number(p.netPay).toLocaleString('es-CL')}</strong>
                </td>
                <td>
                  <button onClick={() => setExpanded(expanded === p.id ? null : p.id)}>
                    {expanded === p.id ? 'Ocultar' : 'Detalle'}
                  </button>
                </td>
              </tr>
              {expanded === p.id && (
                <tr>
                  <td colSpan={5}>
                    <table className="table nested">
                      <thead>
                        <tr>
                          <th>Concepto</th>
                          <th>Tipo</th>
                          <th>Monto</th>
                        </tr>
                      </thead>
                      <tbody>
                        {p.items?.map((item) => (
                          <tr key={item.id}>
                            <td>{item.concept.name}</td>
                            <td>{item.concept.type === 'EARNING' ? 'Haber' : 'Descuento'}</td>
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
          {period.payslips.length === 0 && (
            <tr>
              <td colSpan={5} className="empty">
                Este período aún no tiene liquidaciones calculadas.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
