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
  { key: 'businessUnit.name', label: 'Unidad de negocio' },
  { key: 'parent.name', label: 'División padre' },
  { key: 'effectiveFrom', label: 'Vigencia desde', format: fmtDate },
  { key: 'status', label: 'Estado', render: statusBadge },
];

const fields: FieldConfig[] = [
  { key: 'code', label: 'Código', type: 'text', required: true, maxLength: 50 },
  { key: 'name', label: 'Nombre', type: 'text', required: true, maxLength: 150 },
  { key: 'description', label: 'Descripción', type: 'textarea', maxLength: 500 },
  { key: 'businessUnitId', label: 'Unidad de negocio', type: 'select', required: true, options: { resource: '/business-units' } },
  { key: 'parentDivisionId', label: 'División padre (opcional)', type: 'select', options: { resource: '/divisions' } },
  { key: 'effectiveFrom', label: 'Vigencia desde', type: 'date', required: true },
  { key: 'effectiveTo', label: 'Vigencia hasta', type: 'date' },
  { key: 'status', label: 'Estado', type: 'select', staticOptions: STATUS_OPTIONS },
];

export function DivisionsPage() {
  const { user } = useAuth();
  return (
    <OrgMaintainerPage
      title="Divisiones"
      resource="/divisions"
      columns={columns}
      fields={fields}
      canWrite={user?.role === 'ADMIN'}
    />
  );
}
