import { useEffect, useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, ApiError } from '../api/client';
import { downloadEmployeePdf } from '../lib/employeePdf';
import { EmployeePhotoCapture } from '../components/EmployeePhotoCapture';
import type {
  AfpEntity,
  ContributionMode,
  Employee,
  HealthInstitution,
  PensionProductType,
} from '../api/types';

function employeeInitials(employee: Employee): string {
  const first = (employee.socialName || employee.firstName || '').trim()[0] ?? '';
  const last = (employee.lastName || '').trim()[0] ?? '';
  return (first + last).toUpperCase() || '?';
}

type Tab = 'datos' | 'afp' | 'salud' | 'ahorro';

export function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('datos');

  async function load() {
    if (!id) return;
    setEmployee(await api.get<Employee>(`/employees/${id}`));
  }

  useEffect(() => {
    load().catch((err) => setError(err instanceof ApiError ? err.message : 'Error al cargar'));
  }, [id]);

  if (error) return <p className="error">{error}</p>;
  if (!employee) return <p>Cargando...</p>;

  return (
    <div>
      <div className="employee-photo-header">
        <div style={{ flex: 1, minWidth: 0 }}>
          <Link to="/" className="no-print">
            &larr; Volver a colaboradores
          </Link>
          <div className="page-header">
            <h1>
              {employee.socialName || employee.firstName} {employee.lastName}
              <span className="hint"> · {employee.documentType} {employee.documentNumber}</span>
            </h1>
            <div className="row-actions no-print">
              <button onClick={() => window.print()}>Imprimir</button>
              <button onClick={() => downloadEmployeePdf(employee)}>Descargar PDF</button>
            </div>
          </div>

          <div className="tabs no-print">
            <button className={tab === 'datos' ? 'active' : ''} onClick={() => setTab('datos')}>
              Datos personales
            </button>
            <button className={tab === 'afp' ? 'active' : ''} onClick={() => setTab('afp')}>
              AFP
            </button>
            <button className={tab === 'salud' ? 'active' : ''} onClick={() => setTab('salud')}>
              Salud
            </button>
            <button className={tab === 'ahorro' ? 'active' : ''} onClick={() => setTab('ahorro')}>
              Ahorro previsional
            </button>
          </div>
        </div>
        {id && (
          <EmployeePhotoCapture
            employeeId={id}
            photoUrl={employee.photoUrl}
            initials={employeeInitials(employee)}
            onChange={load}
          />
        )}
      </div>

      {tab === 'datos' && <PersonalDataTab employee={employee} />}
      {tab === 'afp' && id && <AfpTab employeeId={id} employee={employee} onChange={load} />}
      {tab === 'salud' && id && <HealthTab employeeId={id} employee={employee} onChange={load} />}
      {tab === 'ahorro' && id && <PensionSavingsTab employeeId={id} employee={employee} onChange={load} />}
    </div>
  );
}

function PersonalDataTab({ employee }: { employee: Employee }) {
  const rows: Array<[string, string]> = [
    ['Tipo de documento', employee.documentType],
    ['Número de documento', employee.documentNumber],
    ['RUT', employee.rut ?? '-'],
    ['Nombres', employee.firstName],
    ['Apellido paterno', employee.lastName],
    ['Apellido materno', employee.secondLastName ?? '-'],
    ['Nombre social', employee.socialName ?? '-'],
    ['País de nacimiento', employee.birthCountry ?? '-'],
    ['Región de nacimiento', employee.birthRegion ?? '-'],
    ['Comuna de nacimiento', employee.birthCommune ?? '-'],
    ['Correo', employee.email ?? '-'],
    ['Estado', employee.status],
  ];
  return (
    <table className="table">
      <tbody>
        {rows.map(([label, value]) => (
          <tr key={label}>
            <th>{label}</th>
            <td>{value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const emptyAfpForm = {
  afpId: '',
  affiliationDate: '',
  afpJoinDate: '',
  effectiveFrom: '',
  mandatoryContributionPct: '10',
  afpCommissionPct: '',
  additionalContributionPct: '',
  fundType: '',
  heavyWork: false,
  heavyWorkPct: '',
  notes: '',
};

function AfpTab({ employeeId, employee, onChange }: { employeeId: string; employee: Employee; onChange: () => Promise<void> }) {
  const [afps, setAfps] = useState<AfpEntity[]>([]);
  const [form, setForm] = useState(emptyAfpForm);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get<AfpEntity[]>('/afp-entities').then(setAfps).catch(() => setAfps([]));
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await api.post('/employee-afp', {
        employeeId,
        afpId: form.afpId,
        affiliationDate: form.affiliationDate,
        afpJoinDate: form.afpJoinDate,
        effectiveFrom: form.effectiveFrom,
        mandatoryContributionPct: Number(form.mandatoryContributionPct),
        afpCommissionPct: form.afpCommissionPct ? Number(form.afpCommissionPct) : undefined,
        additionalContributionPct: form.additionalContributionPct ? Number(form.additionalContributionPct) : undefined,
        fundType: form.fundType || undefined,
        heavyWork: form.heavyWork,
        heavyWorkPct: form.heavyWorkPct ? Number(form.heavyWorkPct) : undefined,
        notes: form.notes || undefined,
      });
      setForm(emptyAfpForm);
      setShowForm(false);
      await onChange();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo registrar la afiliación AFP');
    }
  }

  const history = employee.afpAffiliations ?? [];

  return (
    <div>
      {error && <p className="error">{error}</p>}
      <div className="page-header">
        <p className="hint">Historial de afiliación AFP. La afiliación anterior se cierra automáticamente al registrar una nueva.</p>
        <button onClick={() => setShowForm((v) => !v)}>{showForm ? 'Cancelar' : 'Registrar cambio de AFP'}</button>
      </div>

      {showForm && (
        <form className="card form-grid" onSubmit={handleSubmit}>
          <label>
            AFP
            <select value={form.afpId} onChange={(e) => setForm({ ...form, afpId: e.target.value })} required>
              <option value="">Seleccionar...</option>
              {afps.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Fecha afiliación al sistema
            <input
              type="date"
              value={form.affiliationDate}
              onChange={(e) => setForm({ ...form, affiliationDate: e.target.value })}
              required
            />
          </label>
          <label>
            Fecha incorporación a esta AFP
            <input
              type="date"
              value={form.afpJoinDate}
              onChange={(e) => setForm({ ...form, afpJoinDate: e.target.value })}
              required
            />
          </label>
          <label>
            Vigente desde
            <input
              type="date"
              value={form.effectiveFrom}
              onChange={(e) => setForm({ ...form, effectiveFrom: e.target.value })}
              required
            />
          </label>
          <label>
            Cotización obligatoria (%)
            <input
              type="number"
              step="0.001"
              value={form.mandatoryContributionPct}
              onChange={(e) => setForm({ ...form, mandatoryContributionPct: e.target.value })}
              required
            />
          </label>
          <label>
            Comisión AFP (%)
            <input
              type="number"
              step="0.001"
              value={form.afpCommissionPct}
              onChange={(e) => setForm({ ...form, afpCommissionPct: e.target.value })}
            />
          </label>
          <label>
            Cotización adicional (%)
            <input
              type="number"
              step="0.001"
              value={form.additionalContributionPct}
              onChange={(e) => setForm({ ...form, additionalContributionPct: e.target.value })}
            />
          </label>
          <label>
            Tipo de fondo
            <select value={form.fundType} onChange={(e) => setForm({ ...form, fundType: e.target.value })}>
              <option value="">-</option>
              {['A', 'B', 'C', 'D', 'E'].map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </label>
          <label>
            Trabajo pesado
            <select
              value={form.heavyWork ? 'true' : 'false'}
              onChange={(e) => setForm({ ...form, heavyWork: e.target.value === 'true' })}
            >
              <option value="false">No</option>
              <option value="true">Sí</option>
            </select>
          </label>
          {form.heavyWork && (
            <label>
              % trabajo pesado
              <input
                type="number"
                step="0.01"
                value={form.heavyWorkPct}
                onChange={(e) => setForm({ ...form, heavyWorkPct: e.target.value })}
              />
            </label>
          )}
          <label>
            Observaciones
            <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </label>
          <div className="form-actions">
            <button type="submit">Guardar</button>
          </div>
        </form>
      )}

      <table className="table">
        <thead>
          <tr>
            <th>AFP</th>
            <th>Vigente desde</th>
            <th>Vigente hasta</th>
            <th>Cotización obligatoria</th>
            <th>Comisión</th>
            <th>Fondo</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {history.map((h) => (
            <tr key={h.id}>
              <td>{h.afp?.name}</td>
              <td>{new Date(h.effectiveFrom).toLocaleDateString('es-CL')}</td>
              <td>{h.effectiveTo ? new Date(h.effectiveTo).toLocaleDateString('es-CL') : 'Vigente'}</td>
              <td>{h.mandatoryContributionPct}%</td>
              <td>{h.afpCommissionPct ? `${h.afpCommissionPct}%` : '-'}</td>
              <td>{h.fundType ?? '-'}</td>
              <td>
                <span className={`badge ${h.status.toLowerCase()}`}>{h.status}</span>
              </td>
            </tr>
          ))}
          {history.length === 0 && (
            <tr>
              <td colSpan={7} className="empty">
                Sin afiliación AFP registrada.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

const emptyHealthForm = {
  healthInstitutionId: '',
  planUfValue: '',
  effectiveFrom: '',
  notes: '',
};

function HealthTab({ employeeId, employee, onChange }: { employeeId: string; employee: Employee; onChange: () => Promise<void> }) {
  const [institutions, setInstitutions] = useState<HealthInstitution[]>([]);
  const [form, setForm] = useState(emptyHealthForm);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get<HealthInstitution[]>('/health-institutions').then(setInstitutions).catch(() => setInstitutions([]));
  }, []);

  const selectedInstitution = institutions.find((i) => i.id === form.healthInstitutionId);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await api.post('/health-affiliations', {
        employeeId,
        healthInstitutionId: form.healthInstitutionId,
        planUfValue: form.planUfValue ? Number(form.planUfValue) : undefined,
        effectiveFrom: form.effectiveFrom,
        notes: form.notes || undefined,
      });
      setForm(emptyHealthForm);
      setShowForm(false);
      await onChange();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo registrar la afiliación de salud');
    }
  }

  const history = employee.healthAffiliations ?? [];

  return (
    <div>
      {error && <p className="error">{error}</p>}
      <div className="page-header">
        <p className="hint">Historial de afiliación de salud (Fonasa/Isapre). Registra la fecha exacta del cambio.</p>
        <button onClick={() => setShowForm((v) => !v)}>{showForm ? 'Cancelar' : 'Registrar cambio de salud'}</button>
      </div>

      {showForm && (
        <form className="card form-grid" onSubmit={handleSubmit}>
          <label>
            Institución
            <select
              value={form.healthInstitutionId}
              onChange={(e) => setForm({ ...form, healthInstitutionId: e.target.value })}
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
          {selectedInstitution?.type === 'ISAPRE' && (
            <label>
              Valor del plan (UF)
              <input
                type="number"
                step="0.0001"
                value={form.planUfValue}
                onChange={(e) => setForm({ ...form, planUfValue: e.target.value })}
              />
            </label>
          )}
          <label>
            Vigente desde
            <input
              type="date"
              value={form.effectiveFrom}
              onChange={(e) => setForm({ ...form, effectiveFrom: e.target.value })}
              required
            />
          </label>
          <label>
            Observaciones
            <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </label>
          <div className="form-actions">
            <button type="submit">Guardar</button>
          </div>
        </form>
      )}

      <table className="table">
        <thead>
          <tr>
            <th>Institución</th>
            <th>Plan (UF)</th>
            <th>Vigente desde</th>
            <th>Vigente hasta</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {history.map((h) => (
            <tr key={h.id}>
              <td>{h.healthInstitution?.name}</td>
              <td>{h.planUfValue ?? '-'}</td>
              <td>{new Date(h.effectiveFrom).toLocaleDateString('es-CL')}</td>
              <td>{h.effectiveTo ? new Date(h.effectiveTo).toLocaleDateString('es-CL') : 'Vigente'}</td>
              <td>
                <span className={`badge ${h.status.toLowerCase()}`}>{h.status}</span>
              </td>
            </tr>
          ))}
          {history.length === 0 && (
            <tr>
              <td colSpan={5} className="empty">
                Sin afiliación de salud registrada.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

const PRODUCT_TYPES: PensionProductType[] = ['APV', 'CAV', 'COTIZACION_VOLUNTARIA', 'DEPOSITO_CONVENIDO'];
const CONTRIBUTION_MODES: ContributionMode[] = ['MONTO', 'PORCENTAJE'];

const emptyPensionForm = {
  productType: 'APV' as PensionProductType,
  institutionId: '',
  taxRegime: '',
  contributionMode: 'MONTO' as ContributionMode,
  amount: '',
  percentage: '',
  fundType: '',
  effectiveFrom: '',
  contractNumber: '',
  notes: '',
};

function PensionSavingsTab({ employeeId, employee, onChange }: { employeeId: string; employee: Employee; onChange: () => Promise<void> }) {
  const [afps, setAfps] = useState<AfpEntity[]>([]);
  const [form, setForm] = useState(emptyPensionForm);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get<AfpEntity[]>('/afp-entities').then(setAfps).catch(() => setAfps([]));
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await api.post('/employee-pension-savings', {
        employeeId,
        productType: form.productType,
        institutionId: form.institutionId,
        taxRegime: form.productType === 'APV' && form.taxRegime ? form.taxRegime : undefined,
        contributionMode: form.contributionMode,
        amount: form.contributionMode === 'MONTO' && form.amount ? Number(form.amount) : undefined,
        percentage: form.contributionMode === 'PORCENTAJE' && form.percentage ? Number(form.percentage) : undefined,
        fundType: form.fundType || undefined,
        effectiveFrom: form.effectiveFrom,
        contractNumber: form.contractNumber || undefined,
        notes: form.notes || undefined,
      });
      setForm(emptyPensionForm);
      setShowForm(false);
      await onChange();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo registrar el producto de ahorro');
    }
  }

  const products = employee.pensionSavings ?? [];

  return (
    <div>
      {error && <p className="error">{error}</p>}
      <div className="page-header">
        <p className="hint">
          Productos de ahorro previsional voluntario (APV, Cuenta 2, cotización voluntaria, depósito convenido). Un
          colaborador puede tener varios simultáneamente.
        </p>
        <button onClick={() => setShowForm((v) => !v)}>{showForm ? 'Cancelar' : 'Agregar producto'}</button>
      </div>

      {showForm && (
        <form className="card form-grid" onSubmit={handleSubmit}>
          <label>
            Tipo de producto
            <select value={form.productType} onChange={(e) => setForm({ ...form, productType: e.target.value as PensionProductType })}>
              {PRODUCT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          <label>
            Institución
            <select value={form.institutionId} onChange={(e) => setForm({ ...form, institutionId: e.target.value })} required>
              <option value="">Seleccionar...</option>
              {afps.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </label>
          {form.productType === 'APV' && (
            <label>
              Régimen tributario
              <select value={form.taxRegime} onChange={(e) => setForm({ ...form, taxRegime: e.target.value })}>
                <option value="">-</option>
                <option value="A">A</option>
                <option value="B">B</option>
              </select>
            </label>
          )}
          <label>
            Modalidad de aporte
            <select
              value={form.contributionMode}
              onChange={(e) => setForm({ ...form, contributionMode: e.target.value as ContributionMode })}
            >
              {CONTRIBUTION_MODES.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </label>
          {form.contributionMode === 'MONTO' ? (
            <label>
              Monto (CLP)
              <input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
            </label>
          ) : (
            <label>
              Porcentaje (%)
              <input
                type="number"
                step="0.0001"
                value={form.percentage}
                onChange={(e) => setForm({ ...form, percentage: e.target.value })}
              />
            </label>
          )}
          <label>
            Tipo de fondo
            <select value={form.fundType} onChange={(e) => setForm({ ...form, fundType: e.target.value })}>
              <option value="">-</option>
              {['A', 'B', 'C', 'D', 'E'].map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </label>
          <label>
            Vigente desde
            <input
              type="date"
              value={form.effectiveFrom}
              onChange={(e) => setForm({ ...form, effectiveFrom: e.target.value })}
              required
            />
          </label>
          <label>
            N° de contrato/convenio
            <input value={form.contractNumber} onChange={(e) => setForm({ ...form, contractNumber: e.target.value })} />
          </label>
          <label>
            Observaciones
            <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </label>
          <div className="form-actions">
            <button type="submit">Guardar</button>
          </div>
        </form>
      )}

      <table className="table">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Institución</th>
            <th>Modalidad</th>
            <th>Monto / %</th>
            <th>Vigente desde</th>
            <th>Vigente hasta</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td>{p.productType}</td>
              <td>{p.institution?.name}</td>
              <td>{p.contributionMode}</td>
              <td>{p.contributionMode === 'MONTO' ? `$${Number(p.amount).toLocaleString('es-CL')}` : `${p.percentage}%`}</td>
              <td>{new Date(p.effectiveFrom).toLocaleDateString('es-CL')}</td>
              <td>{p.effectiveTo ? new Date(p.effectiveTo).toLocaleDateString('es-CL') : 'Vigente'}</td>
              <td>
                <span className={`badge ${p.status.toLowerCase()}`}>{p.status}</span>
              </td>
            </tr>
          ))}
          {products.length === 0 && (
            <tr>
              <td colSpan={7} className="empty">
                Sin productos de ahorro previsional registrados.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
