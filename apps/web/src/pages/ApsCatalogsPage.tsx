import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { OrgMaintainerPage } from '../components/OrgMaintainer';

type Tab =
  | 'categories'
  | 'professions'
  | 'facilityTypes'
  | 'healthServices'
  | 'facilities'
  | 'laborInstitutions'
  | 'institutionTypes'
  | 'institutions'
  | 'educationTypes'
  | 'trainingTypes'
  | 'technicalLevels'
  | 'evaluationLevels'
  | 'durationRules'
  | 'trainingActivities';

const TABS: { key: Tab; label: string }[] = [
  { key: 'categories', label: 'Categorías funcionarias' },
  { key: 'professions', label: 'Profesiones' },
  { key: 'facilityTypes', label: 'Tipos de establecimiento' },
  { key: 'healthServices', label: 'Servicios de Salud' },
  { key: 'facilities', label: 'Establecimientos' },
  { key: 'laborInstitutions', label: 'Instituciones laborales' },
  { key: 'institutionTypes', label: 'Tipos de institución académica' },
  { key: 'institutions', label: 'Instituciones académicas' },
  { key: 'educationTypes', label: 'Tipos de formación' },
  { key: 'trainingTypes', label: 'Tipos de capacitación' },
  { key: 'technicalLevels', label: 'Niveles técnicos' },
  { key: 'evaluationLevels', label: 'Niveles de evaluación' },
  { key: 'durationRules', label: 'Tramos de horas' },
  { key: 'trainingActivities', label: 'Cursos' },
];

const INSTITUTION_TYPE_OPTIONS = [
  { value: 'MUNICIPALITY', label: 'Municipalidad' },
  { value: 'HEALTH_SERVICE', label: 'Servicio de Salud' },
  { value: 'MUNICIPAL_CORPORATION', label: 'Corporación Municipal' },
  { value: 'PUBLIC_SERVICE', label: 'Servicio público' },
  { value: 'PRIVATE', label: 'Privada' },
  { value: 'OTHER', label: 'Otra' },
];

const URBAN_RURAL_OPTIONS = [
  { value: 'URBAN', label: 'Urbano' },
  { value: 'RURAL', label: 'Rural' },
];

const TRAINING_ACTIVITY_STATUS_OPTIONS = [
  { value: 'DRAFT', label: 'Borrador' },
  { value: 'ACTIVE', label: 'Activo' },
  { value: 'INACTIVE', label: 'Inactivo' },
];

export function ApsCatalogsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const isRrhh = user?.role === 'RRHH';
  const [tab, setTab] = useState<Tab>('categories');

  return (
    <div>
      <h1>Carrera Funcionaria APS — Catálogos</h1>
      <p className="hint">
        Mantenedores del submódulo de Carrera Funcionaria APS (Ley N°19.378). Estos catálogos alimentan la Hoja de
        Carrera Funcionaria, el Control Bienal y el Control de Capacitación en Gestión de Personas.
      </p>
      <div className="tabs" style={{ flexWrap: 'wrap' }}>
        {TABS.map((t) => (
          <button key={t.key} className={tab === t.key ? 'active' : ''} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'categories' && (
        <OrgMaintainerPage
          title="Categoría funcionaria"
          resource="/aps-employee-categories"
          canWrite={isAdmin}
          columns={[
            { key: 'code', label: 'Código' },
            { key: 'name', label: 'Nombre' },
            { key: 'qualificationLevel', label: 'Nivel de calificación' },
            { key: 'professionalRequired', label: 'Requiere título', format: (v) => (v ? 'Sí' : 'No') },
            { key: 'active', label: 'Estado', format: (v) => (v ? 'Activa' : 'Inactiva') },
          ]}
          fields={[
            { key: 'code', label: 'Código (A–F)', type: 'text', required: true, maxLength: 5 },
            { key: 'name', label: 'Nombre', type: 'text', required: true, maxLength: 200 },
            { key: 'description', label: 'Descripción', type: 'textarea', maxLength: 500 },
            { key: 'qualificationLevel', label: 'Nivel de calificación', type: 'text', maxLength: 50 },
            { key: 'professionalRequired', label: 'Requiere título profesional', type: 'boolean' },
            { key: 'minimumSemesters', label: 'Semestres mínimos', type: 'number' },
            { key: 'effectiveFrom', label: 'Vigente desde', type: 'date', required: true },
            { key: 'effectiveTo', label: 'Vigente hasta', type: 'date' },
            { key: 'active', label: 'Activa', type: 'boolean' },
          ]}
        />
      )}

      {tab === 'professions' && (
        <OrgMaintainerPage
          title="Profesión"
          resource="/aps-professions"
          canWrite={isAdmin}
          columns={[
            { key: 'code', label: 'Código' },
            { key: 'name', label: 'Nombre' },
            { key: 'category.name', label: 'Categoría' },
            { key: 'healthRegistryRequired', label: 'Registro de prestadores', format: (v) => (v ? 'Sí' : 'No') },
          ]}
          fields={[
            { key: 'code', label: 'Código', type: 'text', required: true, maxLength: 40 },
            { key: 'name', label: 'Nombre', type: 'text', required: true, maxLength: 150 },
            { key: 'categoryId', label: 'Categoría funcionaria', type: 'select', required: true, options: { resource: '/aps-employee-categories' } },
            { key: 'professionalTitleRequired', label: 'Requiere título profesional', type: 'boolean' },
            { key: 'minimumSemesters', label: 'Semestres mínimos', type: 'number' },
            { key: 'healthRegistryRequired', label: 'Requiere registro de prestadores', type: 'boolean' },
            { key: 'effectiveFrom', label: 'Vigente desde', type: 'date', required: true },
            { key: 'effectiveTo', label: 'Vigente hasta', type: 'date' },
            { key: 'active', label: 'Activa', type: 'boolean' },
          ]}
        />
      )}

      {tab === 'facilityTypes' && (
        <OrgMaintainerPage
          title="Tipo de establecimiento"
          resource="/aps-facility-types"
          canWrite={isAdmin}
          columns={[
            { key: 'code', label: 'Código' },
            { key: 'name', label: 'Nombre' },
            { key: 'isActive', label: 'Estado', format: (v) => (v ? 'Activo' : 'Inactivo') },
          ]}
          fields={[
            { key: 'code', label: 'Código', type: 'text', required: true, maxLength: 30 },
            { key: 'name', label: 'Nombre', type: 'text', required: true, maxLength: 150 },
            { key: 'isActive', label: 'Activo', type: 'boolean' },
          ]}
        />
      )}

      {tab === 'healthServices' && (
        <OrgMaintainerPage
          title="Servicio de Salud"
          resource="/aps-health-services"
          canWrite={isAdmin}
          columns={[
            { key: 'code', label: 'Código' },
            { key: 'name', label: 'Nombre' },
            { key: 'region.name', label: 'Región' },
          ]}
          fields={[
            { key: 'code', label: 'Código', type: 'text', required: true, maxLength: 20 },
            { key: 'name', label: 'Nombre', type: 'text', required: true, maxLength: 150 },
            { key: 'regionId', label: 'Región', type: 'select', options: { resource: '/regions' } },
            { key: 'isActive', label: 'Activo', type: 'boolean' },
          ]}
        />
      )}

      {tab === 'facilities' && (
        <OrgMaintainerPage
          title="Establecimiento"
          resource="/aps-health-facilities"
          canWrite={isAdmin}
          columns={[
            { key: 'code', label: 'Código' },
            { key: 'name', label: 'Nombre' },
            { key: 'facilityType.name', label: 'Tipo' },
            { key: 'commune.name', label: 'Comuna' },
            { key: 'active', label: 'Estado', format: (v) => (v ? 'Activo' : 'Inactivo') },
          ]}
          fields={[
            { key: 'administrativeEntityId', label: 'Entidad administradora', type: 'select', required: true, options: { resource: '/legal-entities' } },
            { key: 'code', label: 'Código', type: 'text', required: true, maxLength: 30 },
            { key: 'name', label: 'Nombre', type: 'text', required: true, maxLength: 200 },
            { key: 'facilityTypeId', label: 'Tipo de establecimiento', type: 'select', required: true, options: { resource: '/aps-facility-types' } },
            { key: 'urbanRural', label: 'Urbano / rural', type: 'select', required: true, staticOptions: URBAN_RURAL_OPTIONS },
            { key: 'address', label: 'Dirección', type: 'text', maxLength: 300 },
            { key: 'communeId', label: 'Comuna', type: 'select', required: true, options: { resource: '/communes' } },
            { key: 'healthServiceId', label: 'Servicio de Salud', type: 'select', options: { resource: '/aps-health-services' } },
            { key: 'effectiveFrom', label: 'Vigente desde', type: 'date', required: true },
            { key: 'effectiveTo', label: 'Vigente hasta', type: 'date' },
            { key: 'active', label: 'Activo', type: 'boolean' },
          ]}
        />
      )}

      {tab === 'laborInstitutions' && (
        <OrgMaintainerPage
          title="Institución laboral"
          resource="/aps-labor-institutions"
          canWrite={isAdmin}
          columns={[
            { key: 'code', label: 'Código' },
            { key: 'name', label: 'Nombre' },
            { key: 'institutionType', label: 'Tipo', format: (v) => INSTITUTION_TYPE_OPTIONS.find((o) => o.value === v)?.label ?? String(v) },
            { key: 'aps', label: 'APS', format: (v) => (v ? 'Sí' : 'No') },
          ]}
          fields={[
            { key: 'code', label: 'Código', type: 'text', required: true, maxLength: 30 },
            { key: 'name', label: 'Nombre', type: 'text', required: true, maxLength: 200 },
            { key: 'institutionType', label: 'Tipo de institución', type: 'select', required: true, staticOptions: INSTITUTION_TYPE_OPTIONS },
            { key: 'aps', label: 'Servicios cuentan como APS', type: 'boolean' },
            { key: 'publicSector', label: 'Sector público', type: 'boolean' },
            { key: 'effectiveFrom', label: 'Vigente desde', type: 'date', required: true },
            { key: 'effectiveTo', label: 'Vigente hasta', type: 'date' },
            { key: 'active', label: 'Activa', type: 'boolean' },
          ]}
        />
      )}

      {tab === 'institutionTypes' && (
        <OrgMaintainerPage
          title="Tipo de institución académica"
          resource="/education-institution-types"
          canWrite={isAdmin}
          columns={[
            { key: 'code', label: 'Código' },
            { key: 'name', label: 'Nombre' },
          ]}
          fields={[
            { key: 'code', label: 'Código', type: 'text', required: true, maxLength: 40 },
            { key: 'name', label: 'Nombre', type: 'text', required: true, maxLength: 150 },
            { key: 'isActive', label: 'Activo', type: 'boolean' },
          ]}
        />
      )}

      {tab === 'institutions' && (
        <OrgMaintainerPage
          title="Institución académica"
          resource="/education-institutions"
          canWrite={isAdmin || isRrhh}
          columns={[
            { key: 'code', label: 'Código' },
            { key: 'name', label: 'Nombre' },
            { key: 'institutionType.name', label: 'Tipo' },
            { key: 'country.name', label: 'País' },
          ]}
          fields={[
            { key: 'code', label: 'Código', type: 'text', required: true, maxLength: 40 },
            { key: 'name', label: 'Nombre', type: 'text', required: true, maxLength: 200 },
            { key: 'institutionTypeId', label: 'Tipo de institución', type: 'select', required: true, options: { resource: '/education-institution-types' } },
            { key: 'rut', label: 'RUT', type: 'text', maxLength: 12 },
            { key: 'countryId', label: 'País', type: 'select', required: true, options: { resource: '/countries' } },
            { key: 'recognizedByState', label: 'Reconocida por el Estado', type: 'boolean' },
            { key: 'recognizedByMinsal', label: 'Reconocida por MINSAL', type: 'boolean' },
            { key: 'accreditationCode', label: 'Código de acreditación', type: 'text', maxLength: 60 },
            { key: 'effectiveFrom', label: 'Vigente desde', type: 'date', required: true },
            { key: 'effectiveTo', label: 'Vigente hasta', type: 'date' },
            { key: 'active', label: 'Activa', type: 'boolean' },
          ]}
        />
      )}

      {tab === 'educationTypes' && (
        <OrgMaintainerPage
          title="Tipo de formación"
          resource="/education-types"
          canWrite={isAdmin}
          columns={[
            { key: 'code', label: 'Código' },
            { key: 'name', label: 'Nombre' },
            { key: 'countsForApsCareer', label: 'Puntúa para carrera APS', format: (v) => (v ? 'Sí' : 'No') },
          ]}
          fields={[
            { key: 'code', label: 'Código', type: 'text', required: true, maxLength: 40 },
            { key: 'name', label: 'Nombre', type: 'text', required: true, maxLength: 150 },
            { key: 'countsForApsCareer', label: 'Puntúa para la carrera funcionaria APS', type: 'boolean' },
            { key: 'isActive', label: 'Activo', type: 'boolean' },
          ]}
        />
      )}

      {tab === 'trainingTypes' && (
        <OrgMaintainerPage
          title="Tipo de capacitación"
          resource="/aps-training-types"
          canWrite={isAdmin}
          columns={[
            { key: 'code', label: 'Código' },
            { key: 'name', label: 'Nombre' },
          ]}
          fields={[
            { key: 'code', label: 'Código', type: 'text', required: true, maxLength: 30 },
            { key: 'name', label: 'Nombre', type: 'text', required: true, maxLength: 150 },
            { key: 'isActive', label: 'Activo', type: 'boolean' },
          ]}
        />
      )}

      {tab === 'technicalLevels' && (
        <OrgMaintainerPage
          title="Nivel técnico"
          resource="/aps-training-technical-levels"
          canWrite={isAdmin}
          columns={[
            { key: 'code', label: 'Código' },
            { key: 'name', label: 'Nombre' },
            { key: 'factor', label: 'Factor' },
          ]}
          fields={[
            { key: 'code', label: 'Código', type: 'text', required: true, maxLength: 20 },
            { key: 'name', label: 'Nombre', type: 'text', required: true, maxLength: 100 },
            { key: 'factor', label: 'Factor (ej. 1.0 / 1.1 / 1.2)', type: 'number', required: true },
            { key: 'effectiveFrom', label: 'Vigente desde', type: 'date', required: true },
            { key: 'effectiveTo', label: 'Vigente hasta', type: 'date' },
          ]}
        />
      )}

      {tab === 'evaluationLevels' && (
        <OrgMaintainerPage
          title="Nivel de evaluación"
          resource="/aps-training-evaluation-levels"
          canWrite={isAdmin}
          columns={[
            { key: 'code', label: 'Código' },
            { key: 'name', label: 'Nombre' },
            { key: 'minimumGrade', label: 'Nota mínima' },
            { key: 'maximumGrade', label: 'Nota máxima' },
            { key: 'factor', label: 'Factor' },
          ]}
          fields={[
            { key: 'code', label: 'Código', type: 'text', required: true, maxLength: 20 },
            { key: 'name', label: 'Nombre', type: 'text', required: true, maxLength: 100 },
            { key: 'minimumGrade', label: 'Nota mínima', type: 'number', required: true },
            { key: 'maximumGrade', label: 'Nota máxima', type: 'number', required: true },
            { key: 'factor', label: 'Factor (0,4 a 1,0)', type: 'number', required: true },
            { key: 'effectiveFrom', label: 'Vigente desde', type: 'date', required: true },
            { key: 'effectiveTo', label: 'Vigente hasta', type: 'date' },
          ]}
        />
      )}

      {tab === 'durationRules' && (
        <OrgMaintainerPage
          title="Tramo de horas"
          resource="/aps-training-duration-rules"
          canWrite={isAdmin}
          rowLabel={(row) => `${row.minimumHours}–${row.maximumHours ?? '∞'} horas`}
          columns={[
            { key: 'minimumHours', label: 'Desde (horas)' },
            { key: 'maximumHours', label: 'Hasta (horas)', format: (v) => (v == null ? 'Sin tope' : String(v)) },
            { key: 'points', label: 'Puntos' },
          ]}
          fields={[
            { key: 'minimumHours', label: 'Desde (horas pedagógicas)', type: 'number', required: true },
            { key: 'maximumHours', label: 'Hasta (horas, vacío = sin tope)', type: 'number' },
            { key: 'points', label: 'Puntos', type: 'number', required: true },
            { key: 'effectiveFrom', label: 'Vigente desde', type: 'date', required: true },
            { key: 'effectiveTo', label: 'Vigente hasta', type: 'date' },
          ]}
        />
      )}

      {tab === 'trainingActivities' && (
        <OrgMaintainerPage
          title="Curso"
          resource="/aps-training-activities"
          canWrite={isAdmin || isRrhh}
          columns={[
            { key: 'code', label: 'Código' },
            { key: 'name', label: 'Nombre' },
            { key: 'trainingType.name', label: 'Tipo' },
            { key: 'institution.name', label: 'Institución' },
            { key: 'pedagogicalHours', label: 'Horas' },
            { key: 'status', label: 'Estado', format: (v) => TRAINING_ACTIVITY_STATUS_OPTIONS.find((o) => o.value === v)?.label ?? String(v) },
          ]}
          fields={[
            { key: 'code', label: 'Código', type: 'text', required: true, maxLength: 40 },
            { key: 'name', label: 'Nombre', type: 'text', required: true, maxLength: 200 },
            { key: 'trainingTypeId', label: 'Tipo de capacitación', type: 'select', required: true, options: { resource: '/aps-training-types' } },
            { key: 'institutionId', label: 'Institución que dicta', type: 'select', required: true, options: { resource: '/education-institutions' } },
            { key: 'description', label: 'Descripción', type: 'textarea', maxLength: 500 },
            { key: 'pedagogicalHours', label: 'Horas pedagógicas', type: 'number', required: true },
            { key: 'technicalLevelId', label: 'Nivel técnico', type: 'select', required: true, options: { resource: '/aps-training-technical-levels' } },
            { key: 'startDate', label: 'Fecha de inicio', type: 'date' },
            { key: 'endDate', label: 'Fecha de término', type: 'date' },
            { key: 'includedInMunicipalProgram', label: 'Incluido en programa municipal', type: 'boolean' },
            { key: 'minsalRecognized', label: 'Reconocido por MINSAL', type: 'boolean' },
            { key: 'minimumAttendance', label: 'Asistencia mínima (%)', type: 'number' },
            { key: 'evaluationRequired', label: 'Requiere evaluación', type: 'boolean' },
            { key: 'effectiveFrom', label: 'Vigente desde', type: 'date', required: true },
            { key: 'effectiveTo', label: 'Vigente hasta', type: 'date' },
            { key: 'status', label: 'Estado', type: 'select', staticOptions: TRAINING_ACTIVITY_STATUS_OPTIONS },
          ]}
        />
      )}
    </div>
  );
}
