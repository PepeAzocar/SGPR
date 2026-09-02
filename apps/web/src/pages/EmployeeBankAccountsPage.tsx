import { useEffect, useState, type FormEvent } from 'react';
import { api, ApiError } from '../api/client';
import { downloadListPdf } from '../lib/listPdf';
import type { Bank, BankAccountType, Employee, EmployeeBankAccount, PaymentMethod } from '../api/types';

const CURRENCIES = ['CLP', 'USD'];

function maskAccountNumber(num: string): string {
  return num.length <= 4 ? num : `****${num.slice(-4)}`;
}

function emptyForm(employee?: Employee) {
  return {
    bankId: '',
    accountTypeId: '',
    paymentMethodId: '',
    accountNumber: '',
    accountHolderName: employee ? `${employee.firstName} ${employee.lastName}` : '',
    accountHolderRut: employee?.rut ?? '',
    currencyCode: 'CLP',
    isPrimary: true,
    effectiveFrom: '',
    notes: '',
  };
}

export function EmployeeBankAccountsPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [accountTypes, setAccountTypes] = useState<BankAccountType[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [history, setHistory] = useState<EmployeeBankAccount[]>([]);

  const [employeeId, setEmployeeId] = useState('');
  const [form, setForm] = useState(emptyForm());
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reveal, setReveal] = useState<Record<string, boolean>>({});

  useEffect(() => {
    Promise.all([
      api.get<Employee[]>('/employees'),
      api.get<Bank[]>('/banks'),
      api.get<BankAccountType[]>('/bank-account-types'),
      api.get<PaymentMethod[]>('/payment-methods'),
    ])
      .then(([e, b, t, m]) => {
        setEmployees(e);
        setBanks(b);
        setAccountTypes(t);
        setPaymentMethods(m);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Error al cargar catálogos'));
  }, []);

  async function loadHistory(empId: string) {
    if (!empId) return;
    setHistory(await api.get<EmployeeBankAccount[]>(`/employee-bank-accounts?employeeId=${empId}`));
  }

  const employee = employees.find((e) => e.id === employeeId);

  useEffect(() => {
    setShowForm(false);
    setForm(emptyForm(employee));
    if (employeeId) loadHistory(employeeId).catch((err) => setError(err instanceof ApiError ? err.message : 'Error al cargar historial'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeId]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!employeeId) return;
    setError(null);
    try {
      await api.post('/employee-bank-accounts', {
        employeeId,
        bankId: form.bankId,
        accountTypeId: form.accountTypeId,
        paymentMethodId: form.paymentMethodId,
        accountNumber: form.accountNumber,
        accountHolderName: form.accountHolderName,
        accountHolderRut: form.accountHolderRut,
        currencyCode: form.currencyCode,
        isPrimary: form.isPrimary,
        effectiveFrom: form.effectiveFrom,
        notes: form.notes || undefined,
      });
      setForm(emptyForm(employee));
      setShowForm(false);
      await loadHistory(employeeId);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo registrar la cuenta bancaria');
    }
  }

  function handlePdf() {
    if (!employee) return;
    downloadListPdf(
      `Registro bancario - ${employee.firstName} ${employee.lastName}`,
      [
        { header: 'Desde', accessor: (r) => new Date((r as EmployeeBankAccount).effectiveFrom).toLocaleDateString('es-CL') },
        {
          header: 'Hasta',
          accessor: (r) => { const d = (r as EmployeeBankAccount).effectiveTo; return d ? new Date(d).toLocaleDateString('es-CL') : 'Vigente'; },
        },
        { header: 'Banco', accessor: (r) => (r as EmployeeBankAccount).bank?.name ?? '-' },
        { header: 'Tipo cuenta', accessor: (r) => (r as EmployeeBankAccount).accountType?.name ?? '-' },
        { header: 'Cuenta', accessor: (r) => maskAccountNumber((r as EmployeeBankAccount).accountNumber) },
        { header: 'Titular', accessor: (r) => (r as EmployeeBankAccount).accountHolderName },
        { header: 'Principal', accessor: (r) => ((r as EmployeeBankAccount).isPrimary ? 'Sí' : 'No') },
        { header: 'Estado', accessor: (r) => (r as EmployeeBankAccount).status },
      ],
      history,
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1>Registro bancario</h1>
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
              <span className="hint"> · RUT {employee.rut ?? employee.documentNumber}</span>
            </h2>
            <p className="hint">
              Historial de cuentas bancarias. La cuenta principal vigente anterior se cierra automáticamente al
              registrar una nueva cuenta principal — nunca se sobrescribe.
            </p>
            <div className="row-actions">
              <button onClick={handlePdf}>Generar PDF</button>
              <button onClick={() => setShowForm((v) => !v)}>{showForm ? 'Cancelar' : 'Registrar cuenta bancaria'}</button>
            </div>
          </div>

          {showForm && (
            <form className="card form-grid" onSubmit={handleSubmit}>
              <label>
                Banco
                <select value={form.bankId} onChange={(e) => setForm({ ...form, bankId: e.target.value })} required>
                  <option value="">Seleccionar...</option>
                  {banks.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Tipo de cuenta
                <select
                  value={form.accountTypeId}
                  onChange={(e) => setForm({ ...form, accountTypeId: e.target.value })}
                  required
                >
                  <option value="">Seleccionar...</option>
                  {accountTypes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Número de cuenta
                <input
                  value={form.accountNumber}
                  onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
                  maxLength={30}
                  required
                />
              </label>
              <label>
                Titular
                <input
                  value={form.accountHolderName}
                  onChange={(e) => setForm({ ...form, accountHolderName: e.target.value })}
                  maxLength={150}
                  required
                />
              </label>
              <label>
                RUT titular
                <input
                  value={form.accountHolderRut}
                  onChange={(e) => setForm({ ...form, accountHolderRut: e.target.value })}
                  placeholder="12.345.678-9"
                  required
                />
              </label>
              <label>
                Moneda
                <select value={form.currencyCode} onChange={(e) => setForm({ ...form, currencyCode: e.target.value })}>
                  {CURRENCIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Forma de pago
                <select
                  value={form.paymentMethodId}
                  onChange={(e) => setForm({ ...form, paymentMethodId: e.target.value })}
                  required
                >
                  <option value="">Seleccionar...</option>
                  {paymentMethods.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Fecha efectiva desde
                <input
                  type="date"
                  value={form.effectiveFrom}
                  onChange={(e) => setForm({ ...form, effectiveFrom: e.target.value })}
                  required
                />
              </label>
              <label>
                Cuenta principal
                <select
                  value={form.isPrimary ? 'true' : 'false'}
                  onChange={(e) => setForm({ ...form, isPrimary: e.target.value === 'true' })}
                >
                  <option value="true">Sí</option>
                  <option value="false">No</option>
                </select>
              </label>
              <label>
                Observación
                <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} maxLength={500} />
              </label>
              <div className="form-actions">
                <button type="submit">Guardar</button>
              </div>
            </form>
          )}

          <table className="table">
            <thead>
              <tr>
                <th>Desde</th>
                <th>Hasta</th>
                <th>Banco</th>
                <th>Tipo cuenta</th>
                <th>Cuenta</th>
                <th>Titular</th>
                <th>Principal</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h) => (
                <tr key={h.id}>
                  <td>{new Date(h.effectiveFrom).toLocaleDateString('es-CL')}</td>
                  <td>{h.effectiveTo ? new Date(h.effectiveTo).toLocaleDateString('es-CL') : 'Vigente'}</td>
                  <td>{h.bank?.name}</td>
                  <td>{h.accountType?.name}</td>
                  <td>
                    <span style={{ fontFamily: 'monospace' }}>{reveal[h.id] ? h.accountNumber : maskAccountNumber(h.accountNumber)}</span>{' '}
                    <button type="button" onClick={() => setReveal({ ...reveal, [h.id]: !reveal[h.id] })}>
                      {reveal[h.id] ? 'Ocultar' : 'Ver'}
                    </button>
                  </td>
                  <td>{h.accountHolderName}</td>
                  <td>{h.isPrimary ? 'Sí' : 'No'}</td>
                  <td>
                    <span className={`badge ${h.status.toLowerCase()}`}>{h.status === 'ACTIVE' ? 'Activa' : h.status}</span>
                  </td>
                </tr>
              ))}
              {history.length === 0 && (
                <tr>
                  <td colSpan={8} className="empty">
                    Sin cuentas bancarias registradas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
