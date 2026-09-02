import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { OrgMaintainerPage, type ColumnConfig, type FieldConfig } from '../components/OrgMaintainer';

type Tab =
  | 'afp'
  | 'health'
  | 'mutuality'
  | 'ccaf'
  | 'indicators'
  | 'brackets'
  | 'laborRegimes'
  | 'contractTypes'
  | 'eventTypes'
  | 'eventReasons'
  | 'banks'
  | 'bankAccountTypes'
  | 'paymentMethods';

function fmtMonth(value: unknown): string {
  return value ? new Date(String(value)).toLocaleDateString('es-CL', { month: 'long', year: 'numeric' }) : '-';
}

function fmtDate(value: unknown): string {
  return value ? new Date(String(value)).toLocaleDateString('es-CL') : '-';
}

function fmtMoney(value: unknown): string {
  return value == null ? '-' : `$${Number(value).toLocaleString('es-CL')}`;
}

function fmtPercent(value: unknown): string {
  return value == null ? '-' : `${value}%`;
}

const afpColumns: ColumnConfig[] = [
  { key: 'name', label: 'Nombre' },
  { key: 'workerRate', label: '% trabajador', format: fmtPercent },
  { key: 'effectiveFrom', label: 'Vigencia desde', format: fmtDate },
  { key: 'isActive', label: 'Estado', format: (v) => (v ? 'Activo' : 'Inactivo') },
];

const afpFields: FieldConfig[] = [
  { key: 'name', label: 'Nombre AFP', type: 'text', required: true, maxLength: 100 },
  { key: 'workerRate', label: '% cotización trabajador', type: 'number', required: true },
  { key: 'effectiveFrom', label: 'Vigencia desde', type: 'date', required: true },
  { key: 'effectiveTo', label: 'Vigencia hasta', type: 'date' },
  { key: 'isActive', label: 'Estado', type: 'boolean' },
];

const healthColumns: ColumnConfig[] = [
  { key: 'name', label: 'Nombre' },
  { key: 'type', label: 'Tipo', format: (v) => (v === 'ISAPRE' ? 'Isapre' : 'Fonasa') },
  { key: 'effectiveFrom', label: 'Vigencia desde', format: fmtDate },
  { key: 'isActive', label: 'Estado', format: (v) => (v ? 'Activo' : 'Inactivo') },
];

const healthFields: FieldConfig[] = [
  { key: 'name', label: 'Nombre institución', type: 'text', required: true, maxLength: 100 },
  {
    key: 'type',
    label: 'Tipo',
    type: 'select',
    required: true,
    staticOptions: [
      { value: 'ISAPRE', label: 'Isapre' },
      { value: 'FONASA', label: 'Fonasa' },
    ],
  },
  { key: 'effectiveFrom', label: 'Vigencia desde', type: 'date', required: true },
  { key: 'effectiveTo', label: 'Vigencia hasta', type: 'date' },
  { key: 'isActive', label: 'Estado', type: 'boolean' },
];

const institutionColumns: ColumnConfig[] = [
  { key: 'code', label: 'Código' },
  { key: 'rut', label: 'RUT' },
  { key: 'legalName', label: 'Razón social' },
  { key: 'tradeName', label: 'Nombre de fantasía' },
  { key: 'phone', label: 'Teléfono' },
  { key: 'effectiveFrom', label: 'Vigencia desde', format: fmtDate },
  { key: 'isActive', label: 'Estado', format: (v) => (v ? 'Activo' : 'Inactivo') },
];

const institutionFields: FieldConfig[] = [
  { key: 'code', label: 'Código', type: 'text', required: true, maxLength: 20 },
  { key: 'rut', label: 'RUT', type: 'text', required: true, maxLength: 12 },
  { key: 'legalName', label: 'Razón social', type: 'text', required: true, maxLength: 150 },
  { key: 'tradeName', label: 'Nombre de fantasía', type: 'text', maxLength: 100 },
  { key: 'address', label: 'Dirección', type: 'text', maxLength: 200 },
  { key: 'phone', label: 'Teléfono', type: 'text', maxLength: 30 },
  { key: 'email', label: 'Correo', type: 'text', maxLength: 150 },
  { key: 'website', label: 'Sitio web', type: 'text', maxLength: 200 },
  { key: 'previredCode', label: 'Código Previred', type: 'text', maxLength: 20 },
  { key: 'effectiveFrom', label: 'Vigencia desde', type: 'date', required: true },
  { key: 'effectiveTo', label: 'Vigencia hasta', type: 'date' },
  { key: 'isActive', label: 'Estado', type: 'boolean' },
];

const indicatorColumns: ColumnConfig[] = [
  { key: 'period', label: 'Período', format: fmtMonth },
  { key: 'ufValue', label: 'UF', format: fmtMoney },
  { key: 'utmValue', label: 'UTM', format: fmtMoney },
  { key: 'minWage', label: 'Ingreso mínimo', format: fmtMoney },
  { key: 'afpHealthCapUf', label: 'Tope imponible (UF)', format: (v) => `${v} UF` },
];

const indicatorFields: FieldConfig[] = [
  { key: 'period', label: 'Período (primer día del mes)', type: 'date', required: true },
  { key: 'ufValue', label: 'Valor UF', type: 'number', required: true },
  { key: 'utmValue', label: 'Valor UTM', type: 'number', required: true },
  { key: 'minWage', label: 'Ingreso mínimo', type: 'number', required: true },
  { key: 'afpHealthCapUf', label: 'Tope imponible AFP/salud (UF)', type: 'number', required: true },
];

const bracketColumns: ColumnConfig[] = [
  { key: 'validFrom', label: 'Vigente desde', format: fmtDate },
  { key: 'fromUtm', label: 'Desde (UTM)' },
  { key: 'toUtm', label: 'Hasta (UTM)', format: (v) => (v == null ? 'Sin tope' : String(v)) },
  { key: 'factor', label: 'Factor' },
  { key: 'deductionUtm', label: 'Rebaja (UTM)' },
];

const bracketFields: FieldConfig[] = [
  { key: 'validFrom', label: 'Vigente desde', type: 'date', required: true },
  { key: 'fromUtm', label: 'Desde (UTM)', type: 'number', required: true },
  { key: 'toUtm', label: 'Hasta (UTM, vacío = sin tope)', type: 'number' },
  { key: 'factor', label: 'Factor', type: 'number', required: true },
  { key: 'deductionUtm', label: 'Rebaja (UTM)', type: 'number', required: true },
];

const laborRegimeColumns: ColumnConfig[] = [
  { key: 'code', label: 'Código' },
  { key: 'name', label: 'Nombre' },
  { key: 'mainNorm', label: 'Norma principal' },
  { key: 'isActive', label: 'Estado', format: (v) => (v ? 'Activo' : 'Inactivo') },
];

const laborRegimeFields: FieldConfig[] = [
  { key: 'code', label: 'Código', type: 'text', required: true, maxLength: 30 },
  { key: 'name', label: 'Nombre', type: 'text', required: true, maxLength: 150 },
  { key: 'mainNorm', label: 'Norma principal', type: 'text', maxLength: 200 },
  { key: 'isActive', label: 'Estado', type: 'boolean' },
];

const contractTypeColumns: ColumnConfig[] = [
  { key: 'code', label: 'Código' },
  { key: 'name', label: 'Nombre' },
  { key: 'laborRegime.name', label: 'Régimen jurídico' },
  { key: 'requiresEndDate', label: 'Requiere fecha término', format: (v) => (v ? 'Sí' : 'No') },
  { key: 'payrollRelevant', label: 'Va a liquidación', format: (v) => (v ? 'Sí' : 'No') },
  { key: 'isActive', label: 'Estado', format: (v) => (v ? 'Activo' : 'Inactivo') },
];

const contractTypeFields: FieldConfig[] = [
  { key: 'code', label: 'Código', type: 'text', required: true, maxLength: 30 },
  { key: 'name', label: 'Nombre', type: 'text', required: true, maxLength: 100 },
  {
    key: 'laborRegimeId',
    label: 'Régimen jurídico',
    type: 'select',
    required: true,
    options: { resource: '/labor-regimes', labelKey: 'name' },
  },
  { key: 'requiresEndDate', label: 'Requiere fecha de término', type: 'boolean' },
  { key: 'allowsExtension', label: 'Permite prórroga', type: 'boolean' },
  { key: 'allowsIndefiniteConversion', label: 'Permite conversión a indefinido', type: 'boolean' },
  { key: 'payrollRelevant', label: 'Va a liquidación de sueldo', type: 'boolean' },
  { key: 'isActive', label: 'Estado', type: 'boolean' },
];

const eventTypeColumns: ColumnConfig[] = [
  { key: 'code', label: 'Código' },
  { key: 'name', label: 'Nombre' },
  { key: 'payrollRelevant', label: 'Va a liquidación', format: (v) => (v ? 'Sí' : 'No') },
  { key: 'isActive', label: 'Estado', format: (v) => (v ? 'Activo' : 'Inactivo') },
];

const eventTypeFields: FieldConfig[] = [
  { key: 'code', label: 'Código', type: 'text', required: true, maxLength: 40 },
  { key: 'name', label: 'Nombre', type: 'text', required: true, maxLength: 150 },
  { key: 'payrollRelevant', label: 'Va a liquidación de sueldo', type: 'boolean' },
  { key: 'isActive', label: 'Estado', type: 'boolean' },
];

const eventReasonColumns: ColumnConfig[] = [
  { key: 'code', label: 'Código' },
  { key: 'name', label: 'Nombre' },
  { key: 'eventType.name', label: 'Tipo de evento' },
  { key: 'isActive', label: 'Estado', format: (v) => (v ? 'Activo' : 'Inactivo') },
];

const eventReasonFields: FieldConfig[] = [
  { key: 'code', label: 'Código', type: 'text', required: true, maxLength: 40 },
  { key: 'name', label: 'Nombre', type: 'text', required: true, maxLength: 150 },
  {
    key: 'eventTypeId',
    label: 'Tipo de evento',
    type: 'select',
    required: true,
    options: { resource: '/event-types', labelKey: 'name' },
  },
  { key: 'isActive', label: 'Estado', type: 'boolean' },
];

const bankColumns: ColumnConfig[] = [
  { key: 'code', label: 'Código' },
  { key: 'name', label: 'Nombre' },
  { key: 'regulatorCode', label: 'Código SBIF/CMF' },
  { key: 'isActive', label: 'Estado', format: (v) => (v ? 'Activo' : 'Inactivo') },
];

const bankFields: FieldConfig[] = [
  { key: 'code', label: 'Código', type: 'text', required: true, maxLength: 10 },
  { key: 'name', label: 'Nombre', type: 'text', required: true, maxLength: 100 },
  { key: 'regulatorCode', label: 'Código SBIF/CMF', type: 'text', maxLength: 20 },
  { key: 'isActive', label: 'Estado', type: 'boolean' },
];

const bankAccountTypeColumns: ColumnConfig[] = [
  { key: 'code', label: 'Código' },
  { key: 'name', label: 'Nombre' },
  { key: 'isActive', label: 'Estado', format: (v) => (v ? 'Activo' : 'Inactivo') },
];

const bankAccountTypeFields: FieldConfig[] = [
  { key: 'code', label: 'Código', type: 'text', required: true, maxLength: 30 },
  { key: 'name', label: 'Nombre', type: 'text', required: true, maxLength: 100 },
  { key: 'isActive', label: 'Estado', type: 'boolean' },
];

const paymentMethodColumns: ColumnConfig[] = [
  { key: 'code', label: 'Código' },
  { key: 'name', label: 'Nombre' },
  { key: 'isActive', label: 'Estado', format: (v) => (v ? 'Activo' : 'Inactivo') },
];

const paymentMethodFields: FieldConfig[] = [
  { key: 'code', label: 'Código', type: 'text', required: true, maxLength: 30 },
  { key: 'name', label: 'Nombre', type: 'text', required: true, maxLength: 100 },
  { key: 'isActive', label: 'Estado', type: 'boolean' },
];

export function CatalogsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const [tab, setTab] = useState<Tab>('afp');

  return (
    <div>
      <h1>Catálogos</h1>
      <div className="tabs">
        <button className={tab === 'afp' ? 'active' : ''} onClick={() => setTab('afp')}>
          AFP
        </button>
        <button className={tab === 'health' ? 'active' : ''} onClick={() => setTab('health')}>
          Instituciones de salud
        </button>
        <button className={tab === 'mutuality' ? 'active' : ''} onClick={() => setTab('mutuality')}>
          Mutualidad
        </button>
        <button className={tab === 'ccaf' ? 'active' : ''} onClick={() => setTab('ccaf')}>
          Caja de compensación
        </button>
        <button className={tab === 'laborRegimes' ? 'active' : ''} onClick={() => setTab('laborRegimes')}>
          Régimen jurídico
        </button>
        <button className={tab === 'contractTypes' ? 'active' : ''} onClick={() => setTab('contractTypes')}>
          Tipo de contrato
        </button>
        <button className={tab === 'eventTypes' ? 'active' : ''} onClick={() => setTab('eventTypes')}>
          Tipo de evento
        </button>
        <button className={tab === 'eventReasons' ? 'active' : ''} onClick={() => setTab('eventReasons')}>
          Motivo de evento
        </button>
        <button className={tab === 'banks' ? 'active' : ''} onClick={() => setTab('banks')}>
          Banco
        </button>
        <button className={tab === 'bankAccountTypes' ? 'active' : ''} onClick={() => setTab('bankAccountTypes')}>
          Tipo de cuenta
        </button>
        <button className={tab === 'paymentMethods' ? 'active' : ''} onClick={() => setTab('paymentMethods')}>
          Forma de pago
        </button>
        {isAdmin && (
          <button className={tab === 'indicators' ? 'active' : ''} onClick={() => setTab('indicators')}>
            Indicadores económicos
          </button>
        )}
        {isAdmin && (
          <button className={tab === 'brackets' ? 'active' : ''} onClick={() => setTab('brackets')}>
            Tabla impuesto único
          </button>
        )}
      </div>

      {tab === 'afp' && (
        <OrgMaintainerPage title="AFP" resource="/afp-entities" columns={afpColumns} fields={afpFields} canWrite={isAdmin} />
      )}
      {tab === 'health' && (
        <OrgMaintainerPage
          title="Instituciones de salud"
          resource="/health-institutions"
          columns={healthColumns}
          fields={healthFields}
          canWrite={isAdmin}
        />
      )}
      {tab === 'mutuality' && (
        <OrgMaintainerPage
          title="Mutualidad"
          resource="/mutualities"
          columns={institutionColumns}
          fields={institutionFields}
          canWrite={isAdmin}
          rowLabel={(row) => row.legalName}
        />
      )}
      {tab === 'ccaf' && (
        <OrgMaintainerPage
          title="Caja de compensación"
          resource="/ccafs"
          columns={institutionColumns}
          fields={institutionFields}
          canWrite={isAdmin}
          rowLabel={(row) => row.legalName}
        />
      )}
      {tab === 'laborRegimes' && (
        <>
          <p className="hint">
            Régimen jurídico de la relación laboral. Este despliegue opera bajo Código del Trabajo; el resto del
            catálogo queda disponible por si a futuro se necesita activar un régimen estatutario.
          </p>
          <OrgMaintainerPage
            title="Régimen jurídico"
            resource="/labor-regimes"
            columns={laborRegimeColumns}
            fields={laborRegimeFields}
            canWrite={isAdmin}
          />
        </>
      )}
      {tab === 'contractTypes' && (
        <OrgMaintainerPage
          title="Tipo de contrato"
          resource="/contract-types"
          columns={contractTypeColumns}
          fields={contractTypeFields}
          canWrite={isAdmin}
        />
      )}
      {tab === 'eventTypes' && (
        <OrgMaintainerPage
          title="Tipo de evento"
          resource="/event-types"
          columns={eventTypeColumns}
          fields={eventTypeFields}
          canWrite={isAdmin}
        />
      )}
      {tab === 'eventReasons' && (
        <OrgMaintainerPage
          title="Motivo de evento"
          resource="/event-reasons"
          columns={eventReasonColumns}
          fields={eventReasonFields}
          canWrite={isAdmin}
        />
      )}
      {tab === 'banks' && (
        <OrgMaintainerPage title="Banco" resource="/banks" columns={bankColumns} fields={bankFields} canWrite={isAdmin} />
      )}
      {tab === 'bankAccountTypes' && (
        <OrgMaintainerPage
          title="Tipo de cuenta"
          resource="/bank-account-types"
          columns={bankAccountTypeColumns}
          fields={bankAccountTypeFields}
          canWrite={isAdmin}
        />
      )}
      {tab === 'paymentMethods' && (
        <OrgMaintainerPage
          title="Forma de pago"
          resource="/payment-methods"
          columns={paymentMethodColumns}
          fields={paymentMethodFields}
          canWrite={isAdmin}
        />
      )}
      {tab === 'indicators' && isAdmin && (
        <>
          <p className="hint">
            Estos valores deben actualizarse mensualmente con las cifras vigentes publicadas por el SII / Previred.
          </p>
          <OrgMaintainerPage
            title="Indicadores económicos"
            resource="/economic-indicators"
            columns={indicatorColumns}
            fields={indicatorFields}
            canWrite={isAdmin}
            rowLabel={(row) => fmtMonth(row.period)}
          />
        </>
      )}
      {tab === 'brackets' && isAdmin && (
        <>
          <p className="hint">Tabla de impuesto único de segunda categoría (tramos en UTM). Verificar vigencia en sii.cl.</p>
          <OrgMaintainerPage
            title="Tabla impuesto único"
            resource="/tax-brackets"
            columns={bracketColumns}
            fields={bracketFields}
            canWrite={isAdmin}
            rowLabel={(row) => `Tramo ${row.fromUtm}-${row.toUtm ?? '∞'} UTM`}
          />
        </>
      )}
    </div>
  );
}
