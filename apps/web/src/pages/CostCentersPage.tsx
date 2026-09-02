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
  { key: 'legalEntity.name', label: 'Entidad legal' },
  { key: 'parent.name', label: 'Centro de costo padre' },
  { key: 'effectiveFrom', label: 'Vigencia desde', format: fmtDate },
  { key: 'status', label: 'Estado', render: statusBadge },
];

const fields: FieldConfig[] = [
  { key: 'code', label: 'Código', type: 'text', required: true, maxLength: 50 },
  { key: 'name', label: 'Nombre', type: 'text', required: true, maxLength: 150 },
  { key: 'description', label: 'Descripción', type: 'textarea', maxLength: 500 },
  { key: 'legalEntityId', label: 'Entidad legal (opcional)', type: 'select', options: { resource: '/legal-entities' } },
  { key: 'parentId', label: 'Centro de costo padre (opcional)', type: 'select', options: { resource: '/cost-centers' } },
  { key: 'effectiveFrom', label: 'Vigencia desde', type: 'date', required: true },
  { key: 'effectiveTo', label: 'Vigencia hasta', type: 'date' },
  { key: 'status', label: 'Estado', type: 'select', staticOptions: STATUS_OPTIONS },
];

export function CostCentersPage() {
  const { user } = useAuth();
  return (
    <OrgMaintainerPage
      title="Centros de costo"
      resource="/cost-centers"
      columns={columns}
      fields={fields}
      canWrite={user?.role === 'ADMIN'}
    />
  );
}
