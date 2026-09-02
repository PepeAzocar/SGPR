import { useAuth } from '../auth/AuthContext';
import { OrgMaintainerPage, STATUS_OPTIONS, type ColumnConfig, type FieldConfig } from '../components/OrgMaintainer';

function statusBadge(row: any) {
  const active = row.status === 'ACTIVE';
  return <span className={`badge ${active ? 'active' : 'terminated'}`}>{active ? 'Activo' : 'Inactivo'}</span>;
}

const columns: ColumnConfig[] = [
  { key: 'code', label: 'Código' },
  { key: 'title', label: 'Nombre de la posición' },
  { key: 'cargo.name', label: 'Cargo' },
  { key: 'department.name', label: 'Departamento' },
  { key: 'costCenter.name', label: 'Centro de costo' },
  { key: 'status', label: 'Estado', render: statusBadge },
];

const fields: FieldConfig[] = [
  { key: 'code', label: 'Código', type: 'text', required: true, maxLength: 50 },
  { key: 'title', label: 'Nombre de la posición', type: 'text', required: true, maxLength: 150 },
  { key: 'description', label: 'Descripción', type: 'textarea', maxLength: 500 },
  { key: 'cargoId', label: 'Cargo', type: 'select', required: true, options: { resource: '/cargos' } },
  { key: 'departmentId', label: 'Departamento', type: 'select', required: true, options: { resource: '/departments' } },
  { key: 'costCenterId', label: 'Centro de costo (opcional)', type: 'select', options: { resource: '/cost-centers' } },
  { key: 'effectiveFrom', label: 'Vigencia desde', type: 'date', required: true },
  { key: 'effectiveTo', label: 'Vigencia hasta', type: 'date' },
  { key: 'status', label: 'Estado', type: 'select', staticOptions: STATUS_OPTIONS },
];

export function PositionsPage() {
  const { user } = useAuth();
  return (
    <OrgMaintainerPage
      title="Posiciones"
      resource="/positions"
      columns={columns}
      fields={fields}
      canWrite={user?.role === 'ADMIN'}
      rowLabel={(row) => row.title}
    />
  );
}
