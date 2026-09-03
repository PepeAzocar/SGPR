import { useAuth } from '../auth/AuthContext';
import { OrgMaintainerPage, STATUS_OPTIONS, type ColumnConfig, type FieldConfig } from '../components/OrgMaintainer';

function fmtDate(value: unknown): string {
  return value ? new Date(String(value)).toLocaleDateString('es-CL') : '-';
}

function statusBadge(row: any) {
  const active = row.status === 'ACTIVE';
  return <span className={`badge ${active ? 'active' : 'terminated'}`}>{active ? 'Activo' : 'Inactivo'}</span>;
}

const columns: ColumnConfig[] = [
  { key: 'code', label: 'Código' },
  { key: 'name', label: 'Nombre' },
  { key: 'rut', label: 'RUT' },
  { key: 'legalName', label: 'Razón social' },
  { key: 'effectiveFrom', label: 'Vigencia desde', format: fmtDate },
  { key: 'status', label: 'Estado', render: statusBadge },
];

const fields: FieldConfig[] = [
  { key: 'code', label: 'Código', type: 'text', required: true, maxLength: 50 },
  { key: 'name', label: 'Nombre', type: 'text', required: true, maxLength: 150 },
  { key: 'description', label: 'Descripción', type: 'textarea', maxLength: 500 },
  { key: 'rut', label: 'RUT', type: 'text', maxLength: 12 },
  { key: 'legalName', label: 'Razón social', type: 'text', maxLength: 200 },
  { key: 'address', label: 'Domicilio', type: 'text', maxLength: 300 },
  { key: 'city', label: 'Ciudad', type: 'text', maxLength: 100 },
  { key: 'legalRepresentativeName', label: 'Representante legal', type: 'text', maxLength: 200 },
  { key: 'legalRepresentativeRut', label: 'RUT representante legal', type: 'text', maxLength: 12 },
  { key: 'effectiveFrom', label: 'Vigencia desde', type: 'date', required: true },
  { key: 'effectiveTo', label: 'Vigencia hasta', type: 'date' },
  { key: 'status', label: 'Estado', type: 'select', staticOptions: STATUS_OPTIONS },
];

export function LegalEntitiesPage() {
  const { user } = useAuth();
  return (
    <OrgMaintainerPage
      title="Entidades legales"
      resource="/legal-entities"
      columns={columns}
      fields={fields}
      canWrite={user?.role === 'ADMIN'}
    />
  );
}
