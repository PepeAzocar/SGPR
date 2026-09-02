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
  { key: 'division.name', label: 'División' },
  { key: 'costCenter.name', label: 'Centro de costo' },
  { key: 'parent.name', label: 'Departamento padre' },
  { key: 'effectiveFrom', label: 'Vigencia desde', format: fmtDate },
  { key: 'status', label: 'Estado', render: statusBadge },
];

const fields: FieldConfig[] = [
  { key: 'code', label: 'Código', type: 'text', required: true, maxLength: 50 },
  { key: 'name', label: 'Nombre', type: 'text', required: true, maxLength: 150 },
  { key: 'description', label: 'Descripción', type: 'textarea', maxLength: 500 },
  { key: 'divisionId', label: 'División', type: 'select', required: true, options: { resource: '/divisions' } },
  { key: 'costCenterId', label: 'Centro de costo (opcional)', type: 'select', options: { resource: '/cost-centers' } },
  { key: 'parentId', label: 'Departamento padre (opcional)', type: 'select', options: { resource: '/departments' } },
  { key: 'effectiveFrom', label: 'Vigencia desde', type: 'date', required: true },
  { key: 'effectiveTo', label: 'Vigencia hasta', type: 'date' },
  { key: 'status', label: 'Estado', type: 'select', staticOptions: STATUS_OPTIONS },
];

export function DepartmentsPage() {
  const { user } = useAuth();
  return (
    <OrgMaintainerPage
      title="Departamentos"
      resource="/departments"
      columns={columns}
      fields={fields}
      canWrite={user?.role === 'ADMIN'}
    />
  );
}
