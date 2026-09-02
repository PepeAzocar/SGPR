import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { OrgMaintainerPage, type ColumnConfig, type FieldConfig } from '../components/OrgMaintainer';

type Tab = 'countries' | 'regions' | 'communes' | 'nationalities';

function fmtActive(v: unknown): string {
  return v ? 'Activo' : 'Inactivo';
}

const countryColumns: ColumnConfig[] = [
  { key: 'code', label: 'Código' },
  { key: 'name', label: 'Nombre' },
  { key: 'isActive', label: 'Estado', format: fmtActive },
];

const countryFields: FieldConfig[] = [
  { key: 'code', label: 'Código', type: 'text', required: true, maxLength: 10 },
  { key: 'name', label: 'Nombre', type: 'text', required: true, maxLength: 100 },
  { key: 'isActive', label: 'Estado', type: 'boolean' },
];

const regionColumns: ColumnConfig[] = [
  { key: 'code', label: 'Código' },
  { key: 'name', label: 'Nombre' },
  { key: 'country.name', label: 'País' },
  { key: 'isActive', label: 'Estado', format: fmtActive },
];

const regionFields: FieldConfig[] = [
  { key: 'code', label: 'Código', type: 'text', maxLength: 20 },
  { key: 'name', label: 'Nombre', type: 'text', required: true, maxLength: 100 },
  { key: 'countryId', label: 'País', type: 'select', required: true, options: { resource: '/countries', labelKey: 'name' } },
  { key: 'isActive', label: 'Estado', type: 'boolean' },
];

const communeColumns: ColumnConfig[] = [
  { key: 'code', label: 'Código' },
  { key: 'name', label: 'Nombre' },
  { key: 'region.name', label: 'Región' },
  { key: 'region.country.name', label: 'País' },
  { key: 'isActive', label: 'Estado', format: fmtActive },
];

const communeFields: FieldConfig[] = [
  { key: 'code', label: 'Código', type: 'text', maxLength: 20 },
  { key: 'name', label: 'Nombre', type: 'text', required: true, maxLength: 100 },
  { key: 'regionId', label: 'Región', type: 'select', required: true, options: { resource: '/regions', labelKey: 'displayName' } },
  { key: 'isActive', label: 'Estado', type: 'boolean' },
];

const nationalityColumns: ColumnConfig[] = [
  { key: 'code', label: 'Código' },
  { key: 'name', label: 'Nombre' },
  { key: 'isActive', label: 'Estado', format: fmtActive },
];

const nationalityFields: FieldConfig[] = [
  { key: 'code', label: 'Código', type: 'text', maxLength: 10 },
  { key: 'name', label: 'Nombre', type: 'text', required: true, maxLength: 100 },
  { key: 'isActive', label: 'Estado', type: 'boolean' },
];

export function GeoCatalogsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const [tab, setTab] = useState<Tab>('countries');

  return (
    <div>
      <h1>Catálogos geográficos</h1>
      <p className="hint">
        País, región y comuna forman una jerarquía de dependencia: cada región pertenece a un país y cada comuna
        pertenece a una región. Estos catálogos son la fuente de los selectores usados en las fichas de colaboradores.
      </p>
      <div className="tabs">
        <button className={tab === 'countries' ? 'active' : ''} onClick={() => setTab('countries')}>
          País
        </button>
        <button className={tab === 'regions' ? 'active' : ''} onClick={() => setTab('regions')}>
          Región
        </button>
        <button className={tab === 'communes' ? 'active' : ''} onClick={() => setTab('communes')}>
          Comuna
        </button>
        <button className={tab === 'nationalities' ? 'active' : ''} onClick={() => setTab('nationalities')}>
          Nacionalidad
        </button>
      </div>

      {tab === 'countries' && (
        <OrgMaintainerPage title="País" resource="/countries" columns={countryColumns} fields={countryFields} canWrite={isAdmin} />
      )}
      {tab === 'regions' && (
        <OrgMaintainerPage title="Región" resource="/regions" columns={regionColumns} fields={regionFields} canWrite={isAdmin} />
      )}
      {tab === 'communes' && (
        <OrgMaintainerPage title="Comuna" resource="/communes" columns={communeColumns} fields={communeFields} canWrite={isAdmin} />
      )}
      {tab === 'nationalities' && (
        <OrgMaintainerPage
          title="Nacionalidad"
          resource="/nationalities"
          columns={nationalityColumns}
          fields={nationalityFields}
          canWrite={isAdmin}
        />
      )}
    </div>
  );
}
