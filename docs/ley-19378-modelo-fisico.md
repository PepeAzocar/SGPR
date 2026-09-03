# Modelo físico — Carrera Funcionaria APS (Ley N°19.378)

Especificación de base de datos para el submódulo de Carrera Funcionaria APS,
siguiendo la estructura funcional de 12 dominios propuesta y reconciliada con
lo que **ya existe** en GPR (`apps/api/prisma/schema.prisma`) para no duplicar
entidades. Este documento es la entrada para la Fase 1 (migración Prisma) —
ver Hoja de ruta al final.

> Referencia normativa: Ley N°19.378 (Estatuto de Atención Primaria de Salud
> Municipal, texto actualizado en LeyChile) y su Reglamento de Carrera
> Funcionaria, Decreto N°1.889 del Ministerio de Salud.

## Cómo leer este documento

Cada tabla nueva se documenta como:

`NombreModelo` (dominio N · NUEVA)

| Campo | Tipo PostgreSQL | PK/FK | Oblig. | Descripción |
|---|---|---|---|---|

`PK/FK` indica si la columna es llave primaria, llave foránea (con el modelo
referenciado) o ninguna. Las columnas `effectiveFrom`/`effectiveTo` (vigencia)
se listan explícitamente en cada tabla que las requiere — casi todas, porque
en un sistema de remuneraciones no basta saber el valor actual, hay que poder
reconstruir cuál era la regla vigente en cualquier fecha pasada.

---

## 1. Decisiones de integración — qué se reutiliza y qué es nuevo

Tu instrucción fue explícita: si la entidad principal y los establecimientos
ya existen, no crearlos. Esto es lo que encontré en el schema actual y cómo
se conecta:

| Concepto de tu especificación | ¿Ya existe en GPR? | Decisión |
|---|---|---|
| `APS_ADMINISTRATIVE_ENTITY` (municipalidad/corporación) | **Sí** — `LegalEntity` ya tiene code, name, rut, legalName, address, representante legal | **No se crea tabla nueva.** Se extiende con `ApsAdministrativeEntityProfile` (1:1 con `LegalEntity`) sólo con los campos que le faltan: `entityType`, comuna/región, servicio de salud. |
| Establecimientos (CESFAM, CECOSF, postas…) | **No** — `Division`/`Department` no tienen comuna, tipo de establecimiento ni urbano/rural | **Se crea** `ApsHealthFacility`, referenciando `LegalEntity` (administradora) y `Commune` (ya existente) en vez de duplicar geografía. |
| Régimen jurídico "Estatuto APS" | **Sí** — `LaborRegime` código `LEY_19378` ya está sembrado (`prisma/seed.ts:274`) | **No se crea nada.** Los contratos, tipos contractuales y fórmulas de nómina se filtran por este `laborRegimeId` existente. |
| Tipos contractuales APS (Titular, Contrata, Suplente) | La tabla `ContractType` ya existe (genérica, por régimen) | **No se crea tabla.** Sólo se agregan filas nuevas con `laborRegimeId = LEY_19378`. |
| Geografía (país/región/comuna) | **Sí** — `Country`/`Region`/`Commune` | Se reutilizan como FK en `ApsHealthFacility`, `ApsZoneAssignment`, `ApsAdministrativeEntityProfile`. |
| Cargo/Puesto | **Sí** — `Cargo` (clasificación reutilizable) y `Position` (asiento concreto) | Se reutilizan en Dotación APS (`ApsStaffingPosition`, `ApsEmployeeAssignment`) en vez de crear un catálogo de cargos paralelo. |
| `APS_PAYROLL_CONCEPT` / `APS_RULE` (motor de reglas y conceptos) | **Sí, conceptualmente** — GPR ya tiene un motor central: `PayrollConcept` + `PayrollFormula` (DSL con `IF/AND/OR/LOOKUP`, ciclo de vida DRAFT→ACTIVE) + `PayrollVariable`/`PayrollParameter`/`PayrollTable` | **No se duplica el motor.** Los conceptos APS (sueldo base, asignación APS, zona, desempeño difícil, responsabilidad, mérito) se crean como filas nuevas de `PayrollConcept`, y sus reglas de cálculo como `PayrollFormula` con `laborRegimeId = LEY_19378`. Esto es exactamente tu propia recomendación del punto 36 ("no conviertas Nómina en un motor Ley-19.378 aparte"): un único *Legal Regime Engine*, no uno por ley. |
| Historial de movimientos | **Sí** — `EmployeeEvent`/`EmployeeEventChange` (genérico) | Se mantiene aparte `ApsCareerHistory` porque necesita columnas propias de carrera (nivel anterior/nuevo, puntajes, bienios) que no calzan en el modelo genérico de cambios — pero cada fila puede referenciar opcionalmente el `EmployeeEvent` que la originó. |

**Todo lo demás de tu especificación es nuevo** — no existía nada parecido en
GPR. En total: **44 tablas nuevas** + 3 extensiones 1:1 de tablas existentes,
dentro del rango de 35–45 que estimaste.

### Ajuste de convención: llaves primarias

Tu especificación usa `BIGINT` autoincremental. GPR usa `String @id
@default(cuid())` en **todas** las tablas existentes (`Employee.id`,
`Contract.id`, `LegalEntity.id`, etc.). Para que las FK hacia esas tablas
sean del mismo tipo, **todas las tablas nuevas usan `TEXT` (cuid) como PK**,
no `BIGINT`. Se indica igual en cada tabla como "PK".

### Convención de tipos Postgres (vía Prisma)

| Uso | Tipo Prisma | Tipo Postgres resultante |
|---|---|---|
| id / FK | `String @default(cuid())` | `TEXT` |
| código corto | `String @db.VarChar(50)` | `VARCHAR(50)` |
| nombre | `String @db.VarChar(150-200)` | `VARCHAR(150)`/`VARCHAR(200)` |
| descripción larga | `String? @db.VarChar(500)` o `@db.Text` | `VARCHAR(500)` / `TEXT` |
| monto CLP | `Decimal @db.Decimal(12,2)` | `NUMERIC(12,2)` |
| porcentaje/factor | `Decimal @db.Decimal(14,6)` | `NUMERIC(14,6)` (ratio, ej. 0.15 = 15%) |
| puntaje | `Decimal @db.Decimal(10,4)` | `NUMERIC(10,4)` |
| fecha/vigencia | `DateTime` | `TIMESTAMP(3)` |
| booleano | `Boolean` | `BOOLEAN` |
| enumerado cerrado por ley | `enum` de Prisma | tipo `ENUM` nativo de Postgres |

Todas las tablas de catálogo llevan `createdAt`/`updatedAt`; las que son
mantenedores editables por usuario (no sólo lecturas del sistema) además
llevan `createdBy`/`updatedBy String? @db.VarChar(150)`, igual que
`LegalEntity`/`Department`/etc.

---

## 2. Enums nuevos

```
enum ApsAdministrativeEntityType { MUNICIPALITY  MUNICIPAL_CORPORATION  NON_PROFIT_ADMINISTRATOR  OTHER_LEGAL_ENTITY }
enum ApsUrbanRural                { URBAN  RURAL }
enum ApsBienniumStatus            { IN_PROGRESS  COMPLETED  RECOGNIZED  SUSPENDED  ANNULLED }
enum ApsServiceExclusionType      { UNPAID_LEAVE  UNRECOGNIZED_SERVICE  SERVICE_INTERRUPTION  OTHER }
enum ApsAcademicStatus            { IN_PROGRESS  COMPLETED  RECOGNIZED  REJECTED }
enum ApsTrainingParticipationStatus { REGISTERED  IN_PROGRESS  APPROVED  FAILED  RECOGNIZED  REJECTED }
enum ApsCareerEventType {
  CAREER_ENTRY  CATEGORY_CHANGE  BIENNIUM_RECOGNITION  TRAINING_RECOGNITION
  LEVEL_CHANGE  TITLE_RECOGNITION  POSTGRADUATE_RECOGNITION  MERIT_EVALUATION
  MERIT_ASSIGNMENT  POSITION_CHANGE  RESPONSIBILITY_ASSIGNMENT
  CAREER_RECALCULATION  RECTIFICATION
}
enum ApsResponsibilityScope { FACILITY_DIRECTOR  PROGRAM_HEAD  FUNCTIONAL_HEAD  OTHER_AUTHORIZED_RESPONSIBILITY }
enum ApsProgramStatus { DRAFT  APPROVED  IN_EXECUTION  CLOSED }
```

---

## 3. Dominio 1 — Configuración y parámetros legales

### `LegalParameter` (dominio 1 · NUEVA)

Genérica por diseño: no es "de Ley 19.378", es del sistema, para que Ley
19.070/19.464 la reutilicen después sin nueva tabla.

| Campo | Tipo PostgreSQL | PK/FK | Oblig. | Descripción |
|---|---|---|---|---|
| id | TEXT | PK | Sí | cuid |
| laborRegimeId | TEXT | FK → LaborRegime | No | Nulo = parámetro transversal a todos los regímenes |
| parameterCode | VARCHAR(80) | — | Sí | Ej. `LAW_19378.MAX_BIENNIUMS` (único junto a `effectiveFrom`) |
| parameterName | VARCHAR(200) | — | Sí | Nombre descriptivo |
| numericValue | NUMERIC(18,6) | — | No | Uno de los tres value* según `parameterCode` |
| textValue | VARCHAR(300) | — | No | — |
| booleanValue | BOOLEAN | — | No | — |
| category | VARCHAR(60) | — | No | Agrupador libre para la UI (ej. "Carrera", "Capacitación") |
| effectiveFrom | TIMESTAMP(3) | — | Sí | Vigencia — nunca se sobrescribe un valor, se cierra y se crea uno nuevo |
| effectiveTo | TIMESTAMP(3) | — | No | — |
| legalReference | VARCHAR(200) | — | No | Ej. "Art. 45, Ley 19.378" |
| articleNumber | VARCHAR(20) | — | No | — |
| version | INTEGER | — | Sí | Autoincremental por `parameterCode` |
| isActive | BOOLEAN | — | Sí | — |
| createdBy / updatedBy / createdAt / updatedAt | VARCHAR(150) / TIMESTAMP(3) | — | — | Auditoría estándar |

---

## 4. Dominio 2 — Entidad administradora y establecimientos

### `ApsAdministrativeEntityProfile` (dominio 2 · NUEVA — extensión 1:1 de `LegalEntity`)

| Campo | Tipo PostgreSQL | PK/FK | Oblig. | Descripción |
|---|---|---|---|---|
| id | TEXT | PK | Sí | cuid |
| legalEntityId | TEXT | FK → LegalEntity, `@unique` | Sí | 1:1 — la entidad ya existente que se está calificando como administradora de salud |
| entityType | ApsAdministrativeEntityType (ENUM) | — | Sí | MUNICIPALITY / MUNICIPAL_CORPORATION / NON_PROFIT_ADMINISTRATOR / OTHER_LEGAL_ENTITY |
| municipalityCommuneId | TEXT | FK → Commune | No | Comuna de la municipalidad (si aplica) |
| healthServiceId | TEXT | FK → ApsHealthService | No | Servicio de Salud del que depende técnicamente |
| regionId | TEXT | FK → Region | No | — |
| effectiveFrom | TIMESTAMP(3) | — | Sí | — |
| effectiveTo | TIMESTAMP(3) | — | No | — |
| active | BOOLEAN | — | Sí | — |

### `ApsHealthService` (dominio 2 · NUEVA — catálogo)

Servicio de Salud MINSAL del que dependen técnicamente los establecimientos.

| Campo | Tipo PostgreSQL | PK/FK | Oblig. | Descripción |
|---|---|---|---|---|
| id | TEXT | PK | Sí | cuid |
| code | VARCHAR(20) | — | Sí, único | Ej. `SS_METROPOLITANO_SUR` |
| name | VARCHAR(150) | — | Sí | — |
| regionId | TEXT | FK → Region | No | — |
| isActive | BOOLEAN | — | Sí | — |

### `ApsFacilityType` (dominio 2 · NUEVA — catálogo)

| Campo | Tipo PostgreSQL | PK/FK | Oblig. | Descripción |
|---|---|---|---|---|
| id | TEXT | PK | Sí | cuid |
| code | VARCHAR(30) | — | Sí, único | CESFAM / CECOSF / POSTA_RURAL / SAPU / SAR / COSAM / CONSULTORIO / DIRECCION_SALUD / OTRO |
| name | VARCHAR(150) | — | Sí | — |
| isActive | BOOLEAN | — | Sí | — |

### `ApsHealthFacility` (dominio 2 · NUEVA)

| Campo | Tipo PostgreSQL | PK/FK | Oblig. | Descripción |
|---|---|---|---|---|
| id | TEXT | PK | Sí | cuid |
| administrativeEntityId | TEXT | FK → LegalEntity | Sí | Entidad administradora (municipio/corporación) |
| code | VARCHAR(30) | — | Sí, único | — |
| name | VARCHAR(200) | — | Sí | — |
| facilityTypeId | TEXT | FK → ApsFacilityType | Sí | — |
| urbanRural | ApsUrbanRural (ENUM) | — | Sí | — |
| address | VARCHAR(300) | — | No | — |
| communeId | TEXT | FK → Commune | Sí | — |
| healthServiceId | TEXT | FK → ApsHealthService | No | — |
| divisionId | TEXT | FK → Division | No | Puente opcional hacia la jerarquía organizacional existente, para que Departamento/CostCenter puedan colgar del establecimiento |
| effectiveFrom | TIMESTAMP(3) | — | Sí | — |
| effectiveTo | TIMESTAMP(3) | — | No | — |
| active | BOOLEAN | — | Sí | — |

---

## 5. Dominio 3 — Categorías, profesiones y carrera

### `ApsEmployeeCategory` (dominio 3 · NUEVA — catálogo, A–F parametrizables)

| Campo | Tipo PostgreSQL | PK/FK | Oblig. | Descripción |
|---|---|---|---|---|
| id | TEXT | PK | Sí | cuid |
| code | VARCHAR(5) | — | Sí, único | "A".."F" — dato, no enum, para no codificarlo en el algoritmo |
| name | VARCHAR(200) | — | Sí | Ej. "Médicos Cirujanos, Farmacéuticos…" |
| description | VARCHAR(500) | — | No | — |
| qualificationLevel | VARCHAR(50) | — | No | Ej. "Profesional", "Técnico nivel superior" |
| professionalRequired | BOOLEAN | — | Sí | — |
| minimumSemesters | INTEGER | — | No | — |
| effectiveFrom | TIMESTAMP(3) | — | Sí | — |
| effectiveTo | TIMESTAMP(3) | — | No | — |
| active | BOOLEAN | — | Sí | — |

### `ApsProfession` (dominio 3 · NUEVA — catálogo)

| Campo | Tipo PostgreSQL | PK/FK | Oblig. | Descripción |
|---|---|---|---|---|
| id | TEXT | PK | Sí | cuid |
| code | VARCHAR(40) | — | Sí, único | MEDICO_CIRUJANO, ENFERMERO, TEC_ENFERMERIA… |
| name | VARCHAR(150) | — | Sí | — |
| categoryId | TEXT | FK → ApsEmployeeCategory | Sí | — |
| professionalTitleRequired | BOOLEAN | — | Sí | — |
| minimumSemesters | INTEGER | — | No | — |
| healthRegistryRequired | BOOLEAN | — | Sí | Registro de prestadores individuales de salud (Superintendencia de Salud) |
| effectiveFrom | TIMESTAMP(3) | — | Sí | — |
| effectiveTo | TIMESTAMP(3) | — | No | — |
| active | BOOLEAN | — | Sí | — |

### `ApsCareerLevel` (dominio 3 · NUEVA)

15 niveles, parametrizados por entidad administradora + categoría (cada
municipio puede fijar su propia escala dentro del marco legal).

| Campo | Tipo PostgreSQL | PK/FK | Oblig. | Descripción |
|---|---|---|---|---|
| id | TEXT | PK | Sí | cuid |
| administrativeEntityId | TEXT | FK → LegalEntity | Sí | — |
| categoryId | TEXT | FK → ApsEmployeeCategory | Sí | — |
| levelNumber | INTEGER | — | Sí | 1 a 15 (la carrera empieza en 15 y sube hacia 1) |
| minimumPoints | NUMERIC(10,4) | — | Sí | — |
| maximumPoints | NUMERIC(10,4) | — | No | Nulo = sin techo (nivel 1) |
| trainingPercentage | NUMERIC(14,6) | — | No | Ponderador de capacitación para este nivel, si aplica |
| experiencePercentage | NUMERIC(14,6) | — | No | Ponderador de experiencia |
| effectiveFrom | TIMESTAMP(3) | — | Sí | — |
| effectiveTo | TIMESTAMP(3) | — | No | — |
| active | BOOLEAN | — | Sí | — |

*(`baseSalary` se retira de esta tabla y vive en `ApsBaseSalaryScale` —
separar el nivel/puntaje de su valor monetario histórico, como pediste en tu
punto 11.)*

### `ApsBaseSalaryScale` (dominio 3 · NUEVA)

| Campo | Tipo PostgreSQL | PK/FK | Oblig. | Descripción |
|---|---|---|---|---|
| id | TEXT | PK | Sí | cuid |
| administrativeEntityId | TEXT | FK → LegalEntity | Sí | — |
| categoryId | TEXT | FK → ApsEmployeeCategory | Sí | — |
| careerLevel | INTEGER | — | Sí | 1–15 |
| weeklyHours | INTEGER | — | Sí | Base de jornada de referencia (ej. 44) |
| amount | NUMERIC(12,2) | — | Sí | Sueldo base CLP |
| effectiveFrom | TIMESTAMP(3) | — | Sí | — |
| effectiveTo | TIMESTAMP(3) | — | No | — |
| approvalReference | VARCHAR(200) | — | No | Decreto/resolución municipal que lo aprueba |
| active | BOOLEAN | — | Sí | — |

### `ApsNationalMinimumBaseSalary` (dominio 3 · NUEVA)

Piso nacional — nunca se reemplaza un valor, se cierra y se agrega uno nuevo.

| Campo | Tipo PostgreSQL | PK/FK | Oblig. | Descripción |
|---|---|---|---|---|
| id | TEXT | PK | Sí | cuid |
| categoryId | TEXT | FK → ApsEmployeeCategory | Sí | — |
| weeklyHoursReference | INTEGER | — | Sí | — |
| amount | NUMERIC(12,2) | — | Sí | — |
| effectiveFrom | TIMESTAMP(3) | — | Sí | — |
| effectiveTo | TIMESTAMP(3) | — | No | — |
| legalReference | VARCHAR(200) | — | No | — |
| publicationDate | TIMESTAMP(3) | — | No | — |
| active | BOOLEAN | — | Sí | — |

### `ApsCareer` (dominio 3 · NUEVA — maestro de carrera del funcionario)

| Campo | Tipo PostgreSQL | PK/FK | Oblig. | Descripción |
|---|---|---|---|---|
| id | TEXT | PK | Sí | cuid |
| employeeId | TEXT | FK → Employee, `@unique` | Sí | 1:1 — una carrera activa por funcionario |
| administrativeEntityId | TEXT | FK → LegalEntity | Sí | — |
| categoryId | TEXT | FK → ApsEmployeeCategory | Sí | — |
| currentLevel | INTEGER | — | Sí | 1–15 |
| experiencePoints | NUMERIC(10,4) | — | Sí | — |
| trainingPoints | NUMERIC(10,4) | — | Sí | — |
| totalPoints | NUMERIC(10,4) | — | Sí | — |
| recognizedBienniums | INTEGER | — | Sí | Contador vigente (0–15) — el detalle vive en `ApsBiennium` |
| careerStartDate | TIMESTAMP(3) | — | Sí | — |
| levelEffectiveDate | TIMESTAMP(3) | — | Sí | Desde cuándo rige `currentLevel` |
| effectiveFrom | TIMESTAMP(3) | — | Sí | — |
| effectiveTo | TIMESTAMP(3) | — | No | — |
| status | VARCHAR(30) | — | Sí | ACTIVE / SUSPENDED / CLOSED |

### `ApsCareerHistory` (dominio 3 · NUEVA — Hoja de Carrera Funcionaria)

| Campo | Tipo PostgreSQL | PK/FK | Oblig. | Descripción |
|---|---|---|---|---|
| id | TEXT | PK | Sí | cuid |
| employeeId | TEXT | FK → Employee | Sí | — |
| eventType | ApsCareerEventType (ENUM) | — | Sí | Ver enum en sección 2 |
| eventDate | TIMESTAMP(3) | — | Sí | Fecha del evento administrativo |
| effectiveDate | TIMESTAMP(3) | — | Sí | Fecha desde la que rige |
| categoryId | TEXT | FK → ApsEmployeeCategory | No | — |
| previousLevel | INTEGER | — | No | — |
| newLevel | INTEGER | — | No | — |
| experiencePoints | NUMERIC(10,4) | — | No | Snapshot al momento del evento |
| trainingPoints | NUMERIC(10,4) | — | No | — |
| totalPoints | NUMERIC(10,4) | — | No | — |
| bienniums | INTEGER | — | No | — |
| resolutionNumber | VARCHAR(60) | — | No | — |
| resolutionDate | TIMESTAMP(3) | — | No | — |
| description | VARCHAR(500) | — | No | — |
| sourceEntity | VARCHAR(60) | — | No | Nombre de la tabla que originó el evento (ej. "ApsBiennium") |
| sourceId | TEXT | — | No | id del registro origen, sin FK física (source polimórfico) |
| employeeEventId | TEXT | FK → EmployeeEvent | No | Puente opcional al historial genérico existente |
| createdAt / createdBy | TIMESTAMP(3) / VARCHAR(150) | — | Sí / No | — |

---

## 6. Dominio 4 — Experiencia y bienios (maestro-detalle)

Pediste explícitamente maestro-detalle para "el registro laboral destinado a
determinar los bienios". Se modela así: **`ApsBiennium` es el maestro** (un
bienio reconocido o en curso) y **`ApsRecognizedService` es el detalle**
(cada período de servicio que aporta días a ese bienio) — un bienio se
compone de la suma de días de uno o varios servicios reconocidos.

### `ApsLaborInstitution` (dominio 4 · NUEVA — catálogo, mantenedor "Instituciones laborales")

| Campo | Tipo PostgreSQL | PK/FK | Oblig. | Descripción |
|---|---|---|---|---|
| id | TEXT | PK | Sí | cuid |
| code | VARCHAR(30) | — | Sí, único | — |
| name | VARCHAR(200) | — | Sí | Ej. "Servicio de Salud Metropolitano Sur", "I. Municipalidad de X" |
| institutionType | VARCHAR(40) | — | Sí | MUNICIPALITY / HEALTH_SERVICE / MUNICIPAL_CORPORATION / PUBLIC_SERVICE / PRIVATE / OTHER |
| aps | BOOLEAN | — | Sí | Si los servicios prestados ahí cuentan como servicio APS |
| publicSector | BOOLEAN | — | Sí | Para la calificación "servicio público" del reconocimiento de experiencia |
| effectiveFrom | TIMESTAMP(3) | — | Sí | — |
| effectiveTo | TIMESTAMP(3) | — | No | — |
| active | BOOLEAN | — | Sí | — |

### `ApsRecognizedService` (dominio 4 · NUEVA — DETALLE de `ApsBiennium`)

| Campo | Tipo PostgreSQL | PK/FK | Oblig. | Descripción |
|---|---|---|---|---|
| id | TEXT | PK | Sí | cuid |
| employeeId | TEXT | FK → Employee | Sí | — |
| institutionId | TEXT | FK → ApsLaborInstitution | Sí | — |
| biennium | TEXT | FK → ApsBiennium, `onDelete: SetNull` | No | Nulo mientras el servicio no ha sido asignado a un bienio |
| serviceType | VARCHAR(40) | — | Sí | Ej. TITULAR, CONTRATA, HONORARIOS, SUPLENCIA |
| legalRelationship | VARCHAR(40) | — | No | — |
| positionName | VARCHAR(150) | — | No | — |
| startDate | TIMESTAMP(3) | — | Sí | — |
| endDate | TIMESTAMP(3) | — | No | Nulo = servicio en curso |
| calendarDays | INTEGER | — | Sí | — |
| recognizedDays | INTEGER | — | Sí | Tras aplicar exclusiones |
| excludedDays | INTEGER | — | Sí | — |
| apsService | BOOLEAN | — | Sí | — |
| publicService | BOOLEAN | — | Sí | — |
| municipalService | BOOLEAN | — | Sí | — |
| recognized | BOOLEAN | — | Sí | — |
| recognitionDate | TIMESTAMP(3) | — | No | — |
| resolutionNumber | VARCHAR(60) | — | No | — |
| resolutionDate | TIMESTAMP(3) | — | No | — |
| documentId | TEXT | — | No | Referencia libre a un documento adjunto (sin storage de archivos aún, ver limitación ya documentada en `contract-documents`) |
| effectiveFrom | TIMESTAMP(3) | — | Sí | — |
| effectiveTo | TIMESTAMP(3) | — | No | — |
| status | VARCHAR(30) | — | Sí | PENDING / RECOGNIZED / REJECTED |

### `ApsServiceExclusion` (dominio 4 · NUEVA — detalle de un `ApsRecognizedService`)

| Campo | Tipo PostgreSQL | PK/FK | Oblig. | Descripción |
|---|---|---|---|---|
| id | TEXT | PK | Sí | cuid |
| employeeId | TEXT | FK → Employee | Sí | Denormalizado para reportes directos |
| serviceId | TEXT | FK → ApsRecognizedService, `onDelete: Cascade` | Sí | — |
| exclusionType | ApsServiceExclusionType (ENUM) | — | Sí | UNPAID_LEAVE / UNRECOGNIZED_SERVICE / SERVICE_INTERRUPTION / OTHER |
| startDate | TIMESTAMP(3) | — | Sí | — |
| endDate | TIMESTAMP(3) | — | Sí | — |
| days | INTEGER | — | Sí | — |
| affectsBiennium | BOOLEAN | — | Sí | — |
| reason | VARCHAR(300) | — | No | — |
| legalReference | VARCHAR(200) | — | No | — |
| documentId | TEXT | — | No | — |

### `ApsBiennium` (dominio 4 · NUEVA — MAESTRO)

| Campo | Tipo PostgreSQL | PK/FK | Oblig. | Descripción |
|---|---|---|---|---|
| id | TEXT | PK | Sí | cuid |
| employeeId | TEXT | FK → Employee | Sí | — |
| bienniumNumber | INTEGER | — | Sí | 1–15 (tope legal, ver `ApsExperienceRule`) |
| periodStartDate | TIMESTAMP(3) | — | Sí | — |
| periodEndDate | TIMESTAMP(3) | — | No | — |
| recognizedServiceDays | INTEGER | — | Sí | Suma de `ApsRecognizedService.recognizedDays` asociados |
| excludedDays | INTEGER | — | Sí | — |
| completionDate | TIMESTAMP(3) | — | No | Fecha en que se cumplen los 730 días reconocidos |
| effectiveDate | TIMESTAMP(3) | — | No | Desde cuándo se paga |
| experiencePoints | NUMERIC(10,4) | — | No | Puntaje que aporta este bienio, según `ApsExperienceRule` |
| recognitionResolution | VARCHAR(60) | — | No | — |
| recognitionDate | TIMESTAMP(3) | — | No | — |
| status | ApsBienniumStatus (ENUM) | — | Sí | IN_PROGRESS / COMPLETED / RECOGNIZED / SUSPENDED / ANNULLED |

*Relación maestro-detalle: `ApsBiennium` (1) ←→ (N) `ApsRecognizedService`.*

### `ApsExperienceRule` (dominio 4 · NUEVA — parámetro de puntaje por bienio)

| Campo | Tipo PostgreSQL | PK/FK | Oblig. | Descripción |
|---|---|---|---|---|
| id | TEXT | PK | Sí | cuid |
| administrativeEntityId | TEXT | FK → LegalEntity | No | Nulo = regla nacional por defecto |
| categoryId | TEXT | FK → ApsEmployeeCategory | No | Nulo = aplica a todas las categorías |
| bienniumNumber | INTEGER | — | Sí | 1–15 |
| points | NUMERIC(10,4) | — | Sí | — |
| effectiveFrom | TIMESTAMP(3) | — | Sí | — |
| effectiveTo | TIMESTAMP(3) | — | No | — |

---

## 7. Dominio 5 — Capacitación (maestro-detalle)

Maestro-detalle pedido explícitamente para "control de capacitación":
**`ApsEmployeeTrainingYear` es el maestro** (un control anual por
funcionario) y **`EmployeeApsTraining` es el detalle** (cada curso tomado ese
año, con su puntaje calculado vs. reconocido).

### `ApsTrainingType` (dominio 5 · NUEVA — catálogo)

| Campo | Tipo PostgreSQL | PK/FK | Oblig. | Descripción |
|---|---|---|---|---|
| id | TEXT | PK | Sí | cuid |
| code | VARCHAR(30) | — | Sí, único | COURSE / INTERNSHIP / WORKSHOP / SEMINAR / DIPLOMA / SPECIALIZATION / MISSION_STUDY / CONGRESS / OTHER |
| name | VARCHAR(150) | — | Sí | — |
| isActive | BOOLEAN | — | Sí | — |

### `ApsTrainingTechnicalLevel` (dominio 5 · NUEVA — catálogo con factor)

| Campo | Tipo PostgreSQL | PK/FK | Oblig. | Descripción |
|---|---|---|---|---|
| id | TEXT | PK | Sí | cuid |
| code | VARCHAR(20) | — | Sí, único | LOW / MEDIUM / HIGH |
| name | VARCHAR(100) | — | Sí | — |
| factor | NUMERIC(6,4) | — | Sí | 1.0000 / 1.1000 / 1.2000 |
| effectiveFrom | TIMESTAMP(3) | — | Sí | — |
| effectiveTo | TIMESTAMP(3) | — | No | — |

### `ApsTrainingEvaluationLevel` (dominio 5 · NUEVA — catálogo, "tipificación de evaluación")

| Campo | Tipo PostgreSQL | PK/FK | Oblig. | Descripción |
|---|---|---|---|---|
| id | TEXT | PK | Sí | cuid |
| code | VARCHAR(20) | — | Sí, único | MINIMUM / MEDIUM / MAXIMUM |
| name | VARCHAR(100) | — | Sí | — |
| minimumGrade | NUMERIC(5,2) | — | Sí | — |
| maximumGrade | NUMERIC(5,2) | — | Sí | — |
| factor | NUMERIC(6,4) | — | Sí | 0.4000–1.0000 según reglamento |
| effectiveFrom | TIMESTAMP(3) | — | Sí | — |
| effectiveTo | TIMESTAMP(3) | — | No | — |

### `ApsTrainingDurationRule` (dominio 5 · NUEVA — tramos de horas → puntos)

| Campo | Tipo PostgreSQL | PK/FK | Oblig. | Descripción |
|---|---|---|---|---|
| id | TEXT | PK | Sí | cuid |
| minimumHours | INTEGER | — | Sí | — |
| maximumHours | INTEGER | — | No | Nulo = sin techo (tramo "80+") |
| points | NUMERIC(10,4) | — | Sí | — |
| effectiveFrom | TIMESTAMP(3) | — | Sí | — |
| effectiveTo | TIMESTAMP(3) | — | No | — |

### `ApsTrainingActivity` (dominio 5 · NUEVA — mantenedor "Cursos")

Representa el curso/estadía en sí, no la participación de una persona.

| Campo | Tipo PostgreSQL | PK/FK | Oblig. | Descripción |
|---|---|---|---|---|
| id | TEXT | PK | Sí | cuid |
| code | VARCHAR(40) | — | Sí, único | — |
| name | VARCHAR(200) | — | Sí | — |
| trainingTypeId | TEXT | FK → ApsTrainingType | Sí | — |
| institutionId | TEXT | FK → EducationInstitution | Sí | Quién lo dicta |
| description | VARCHAR(500) | — | No | — |
| pedagogicalHours | INTEGER | — | Sí | Base para `ApsTrainingDurationRule` |
| technicalLevelId | TEXT | FK → ApsTrainingTechnicalLevel | Sí | — |
| startDate | TIMESTAMP(3) | — | No | — |
| endDate | TIMESTAMP(3) | — | No | — |
| includedInMunicipalProgram | BOOLEAN | — | Sí | Requisito reglamentario para ser computable |
| minsalRecognized | BOOLEAN | — | Sí | — |
| minimumAttendance | NUMERIC(5,2) | — | No | % mínimo de asistencia exigido |
| evaluationRequired | BOOLEAN | — | Sí | — |
| effectiveFrom | TIMESTAMP(3) | — | Sí | — |
| effectiveTo | TIMESTAMP(3) | — | No | — |
| status | VARCHAR(30) | — | Sí | DRAFT / ACTIVE / INACTIVE |

### `EmployeeApsTraining` (dominio 5 · NUEVA — DETALLE, participación del funcionario)

| Campo | Tipo PostgreSQL | PK/FK | Oblig. | Descripción |
|---|---|---|---|---|
| id | TEXT | PK | Sí | cuid |
| employeeId | TEXT | FK → Employee | Sí | — |
| trainingActivityId | TEXT | FK → ApsTrainingActivity | Sí | — |
| trainingYearId | TEXT | FK → ApsEmployeeTrainingYear, `onDelete: Cascade` | Sí | Maestro al que pertenece este detalle |
| registrationDate | TIMESTAMP(3) | — | Sí | — |
| attendancePercentage | NUMERIC(5,2) | — | No | — |
| finalGrade | NUMERIC(5,2) | — | No | — |
| approved | BOOLEAN | — | No | — |
| durationPoints | NUMERIC(10,4) | — | No | Desde `ApsTrainingDurationRule` |
| evaluationFactor | NUMERIC(6,4) | — | No | Desde `ApsTrainingEvaluationLevel` |
| technicalFactor | NUMERIC(6,4) | — | No | Desde `ApsTrainingTechnicalLevel` |
| calculatedPoints | NUMERIC(10,4) | — | No | `durationPoints * evaluationFactor * technicalFactor` |
| recognizedPoints | NUMERIC(10,4) | — | No | Puntaje calculado ≠ puntaje reconocido (puede topearse) |
| recognitionDate | TIMESTAMP(3) | — | No | — |
| recognitionResolution | VARCHAR(60) | — | No | — |
| careerYear | INTEGER | — | Sí | Año de carrera al que se imputa |
| documentId | TEXT | — | No | — |
| status | ApsTrainingParticipationStatus (ENUM) | — | Sí | — |

### `ApsEmployeeTrainingYear` (dominio 5 · NUEVA — MAESTRO, "Control de Capacitación")

| Campo | Tipo PostgreSQL | PK/FK | Oblig. | Descripción |
|---|---|---|---|---|
| id | TEXT | PK | Sí | cuid |
| employeeId | TEXT | FK → Employee | Sí | — |
| year | INTEGER | — | Sí | Único junto a `employeeId` |
| earnedPoints | NUMERIC(10,4) | — | Sí | Suma de `calculatedPoints` del año |
| recognizedPoints | NUMERIC(10,4) | — | Sí | Suma de `recognizedPoints` del año |
| computablePoints | NUMERIC(10,4) | — | Sí | Tras aplicar `annualLimit` |
| annualLimit | NUMERIC(10,4) | — | No | Desde `LegalParameter` (`LAW_19378.MAX_ANNUAL_TRAINING_POINTS`) |
| careerAccumulatedPoints | NUMERIC(10,4) | — | Sí | Acumulado histórico (tope `LAW_19378.MAX_CAREER_TRAINING_POINTS`) |
| closed | BOOLEAN | — | Sí | — |
| closingDate | TIMESTAMP(3) | — | No | — |

*Relación maestro-detalle: `ApsEmployeeTrainingYear` (1) ←→ (N)
`EmployeeApsTraining`.*

### `ApsMunicipalTrainingProgram` (dominio 5 · NUEVA — maestro)

| Campo | Tipo PostgreSQL | PK/FK | Oblig. | Descripción |
|---|---|---|---|---|
| id | TEXT | PK | Sí | cuid |
| administrativeEntityId | TEXT | FK → LegalEntity | Sí | — |
| year | INTEGER | — | Sí | — |
| programCode | VARCHAR(40) | — | Sí, único | — |
| name | VARCHAR(200) | — | Sí | — |
| approvalDate | TIMESTAMP(3) | — | No | — |
| resolutionNumber | VARCHAR(60) | — | No | — |
| startDate | TIMESTAMP(3) | — | Sí | — |
| endDate | TIMESTAMP(3) | — | Sí | — |
| status | ApsProgramStatus (ENUM) | — | Sí | — |

### `ApsMunicipalTrainingProgramItem` (dominio 5 · NUEVA — detalle)

| Campo | Tipo PostgreSQL | PK/FK | Oblig. | Descripción |
|---|---|---|---|---|
| id | TEXT | PK | Sí | cuid |
| programId | TEXT | FK → ApsMunicipalTrainingProgram, `onDelete: Cascade` | Sí | — |
| trainingActivityId | TEXT | FK → ApsTrainingActivity | Sí | — |
| categoryId | TEXT | FK → ApsEmployeeCategory | No | — |
| targetGroup | VARCHAR(150) | — | No | — |
| plannedSlots | INTEGER | — | No | — |
| budget | NUMERIC(14,2) | — | No | — |
| priority | INTEGER | — | No | — |

---

## 8. Dominio 6 — Formación académica e instituciones

### `EducationInstitutionType` (dominio 6 · NUEVA — catálogo)

| Campo | Tipo PostgreSQL | PK/FK | Oblig. | Descripción |
|---|---|---|---|---|
| id | TEXT | PK | Sí | cuid |
| code | VARCHAR(40) | — | Sí, único | UNIVERSITY / PROFESSIONAL_INSTITUTE / TECHNICAL_TRAINING_CENTER / MINSAL / HEALTH_SERVICE / MUNICIPALITY / MUNICIPAL_CORPORATION / OTEC / PUBLIC_INSTITUTION / PRIVATE_INSTITUTION / INTERNATIONAL_INSTITUTION |
| name | VARCHAR(150) | — | Sí | — |
| isActive | BOOLEAN | — | Sí | — |

### `EducationInstitution` (dominio 6 · NUEVA — mantenedor "Instituciones académicas")

| Campo | Tipo PostgreSQL | PK/FK | Oblig. | Descripción |
|---|---|---|---|---|
| id | TEXT | PK | Sí | cuid |
| code | VARCHAR(40) | — | Sí, único | — |
| name | VARCHAR(200) | — | Sí | — |
| institutionTypeId | TEXT | FK → EducationInstitutionType | Sí | — |
| rut | VARCHAR(12) | — | No | — |
| countryId | TEXT | FK → Country | Sí | — |
| recognizedByState | BOOLEAN | — | Sí | — |
| recognizedByMinsal | BOOLEAN | — | Sí | — |
| accreditationCode | VARCHAR(60) | — | No | — |
| effectiveFrom | TIMESTAMP(3) | — | Sí | — |
| effectiveTo | TIMESTAMP(3) | — | No | — |
| active | BOOLEAN | — | Sí | — |

### `EducationType` (dominio 6 · NUEVA — catálogo)

| Campo | Tipo PostgreSQL | PK/FK | Oblig. | Descripción |
|---|---|---|---|---|
| id | TEXT | PK | Sí | cuid |
| code | VARCHAR(40) | — | Sí, único | TECHNICAL_TITLE / PROFESSIONAL_TITLE / BACHELOR / LICENCIATURA / SPECIALTY / DIPLOMA / POSTGRADUATE_DIPLOMA / MASTER / DOCTORATE / POSTDOCTORATE / COURSE / INTERNSHIP / SEMINAR / WORKSHOP / CONGRESS / OTHER |
| name | VARCHAR(150) | — | Sí | — |
| countsForApsCareer | BOOLEAN | — | Sí | Distingue formación académica de capacitación válida para puntaje — no todo certificado puntúa |
| isActive | BOOLEAN | — | Sí | — |

### `EmployeeAcademicBackground` (dominio 6 · NUEVA)

| Campo | Tipo PostgreSQL | PK/FK | Oblig. | Descripción |
|---|---|---|---|---|
| id | TEXT | PK | Sí | cuid |
| employeeId | TEXT | FK → Employee | Sí | — |
| educationTypeId | TEXT | FK → EducationType | Sí | — |
| institutionId | TEXT | FK → EducationInstitution | Sí | — |
| programName | VARCHAR(200) | — | Sí | — |
| titleName | VARCHAR(200) | — | No | — |
| specialty | VARCHAR(150) | — | No | — |
| startDate | TIMESTAMP(3) | — | No | — |
| endDate | TIMESTAMP(3) | — | No | — |
| graduationDate | TIMESTAMP(3) | — | No | — |
| certificateDate | TIMESTAMP(3) | — | No | — |
| totalHours | INTEGER | — | No | — |
| semesters | INTEGER | — | No | — |
| countryId | TEXT | FK → Country | No | — |
| recognizedInChile | BOOLEAN | — | Sí | — |
| recognitionAuthority | VARCHAR(150) | — | No | — |
| documentId | TEXT | — | No | — |
| effectiveFrom | TIMESTAMP(3) | — | Sí | — |
| effectiveTo | TIMESTAMP(3) | — | No | — |
| status | ApsAcademicStatus (ENUM) | — | Sí | — |

### `ApsPostgraduate` (dominio 6 · NUEVA)

| Campo | Tipo PostgreSQL | PK/FK | Oblig. | Descripción |
|---|---|---|---|---|
| id | TEXT | PK | Sí | cuid |
| employeeId | TEXT | FK → Employee | Sí | — |
| postgraduateType | VARCHAR(30) | — | Sí | SPECIALIZATION / POSTGRADUATE_DIPLOMA / MASTER / DOCTORATE |
| institutionId | TEXT | FK → EducationInstitution | Sí | — |
| name | VARCHAR(200) | — | Sí | — |
| specialtyId | TEXT | FK → ApsProfession | No | Cuando corresponde a una especialidad médica reconocida |
| startDate | TIMESTAMP(3) | — | No | — |
| endDate | TIMESTAMP(3) | — | No | — |
| totalHours | INTEGER | — | No | — |
| certificateDate | TIMESTAMP(3) | — | No | — |
| approved | BOOLEAN | — | Sí | — |
| apsRelated | BOOLEAN | — | Sí | — |
| recognized | BOOLEAN | — | Sí | — |
| recognitionDate | TIMESTAMP(3) | — | No | — |
| documentId | TEXT | — | No | — |
| effectiveFrom | TIMESTAMP(3) | — | Sí | — |
| effectiveTo | TIMESTAMP(3) | — | No | — |
| status | ApsAcademicStatus (ENUM) | — | Sí | — |

---

## 9. Dominio 7 — Mérito

### `ApsPerformanceEvaluation` (dominio 7 · NUEVA)

| Campo | Tipo PostgreSQL | PK/FK | Oblig. | Descripción |
|---|---|---|---|---|
| id | TEXT | PK | Sí | cuid |
| employeeId | TEXT | FK → Employee | Sí | — |
| evaluationPeriodCode | VARCHAR(20) | — | Sí | Ej. "2026" |
| evaluationStart | TIMESTAMP(3) | — | Sí | — |
| evaluationEnd | TIMESTAMP(3) | — | Sí | — |
| score | NUMERIC(6,2) | — | Sí | — |
| listNumber | INTEGER | — | No | Lista de calificación (1ª, 2ª, 3ª…) |
| qualification | VARCHAR(60) | — | No | — |
| rankingPosition | INTEGER | — | No | — |
| rankingPercentile | NUMERIC(5,2) | — | No | — |
| evaluationDate | TIMESTAMP(3) | — | Sí | — |
| appealed | BOOLEAN | — | Sí | — |
| appealResult | VARCHAR(200) | — | No | — |
| finalScore | NUMERIC(6,2) | — | No | — |
| status | VARCHAR(30) | — | Sí | DRAFT / FINAL / APPEALED / RESOLVED |

### `ApsMeritBand` (dominio 7 · NUEVA — catálogo, tramo de asignación de mérito)

| Campo | Tipo PostgreSQL | PK/FK | Oblig. | Descripción |
|---|---|---|---|---|
| id | TEXT | PK | Sí | cuid |
| code | VARCHAR(20) | — | Sí, único | — |
| name | VARCHAR(100) | — | Sí | — |
| percentage | NUMERIC(6,4) | — | Sí | — |
| effectiveFrom | TIMESTAMP(3) | — | Sí | — |
| effectiveTo | TIMESTAMP(3) | — | No | — |

### `ApsMeritAssignment` (dominio 7 · NUEVA)

| Campo | Tipo PostgreSQL | PK/FK | Oblig. | Descripción |
|---|---|---|---|---|
| id | TEXT | PK | Sí | cuid |
| employeeId | TEXT | FK → Employee | Sí | — |
| performanceEvaluationId | TEXT | FK → ApsPerformanceEvaluation | Sí | — |
| meritBandId | TEXT | FK → ApsMeritBand | Sí | — |
| percentage | NUMERIC(6,4) | — | Sí | — |
| calculationBase | VARCHAR(30) | — | Sí | Sobre qué concepto se calcula (ej. "BASE_SALARY") |
| amount | NUMERIC(12,2) | — | No | Snapshot calculado |
| effectiveFrom | TIMESTAMP(3) | — | Sí | — |
| effectiveTo | TIMESTAMP(3) | — | No | — |
| resolutionNumber | VARCHAR(60) | — | No | — |
| status | VARCHAR(30) | — | Sí | — |

---

## 10. Dominio 8 — Dotación APS

### `ApsStaffingPosition` (dominio 8 · NUEVA — plantilla/dotación)

| Campo | Tipo PostgreSQL | PK/FK | Oblig. | Descripción |
|---|---|---|---|---|
| id | TEXT | PK | Sí | cuid |
| administrativeEntityId | TEXT | FK → LegalEntity | Sí | — |
| facilityId | TEXT | FK → ApsHealthFacility | Sí | — |
| year | INTEGER | — | Sí | — |
| categoryId | TEXT | FK → ApsEmployeeCategory | Sí | — |
| cargoId | TEXT | FK → Cargo | Sí | Reutiliza el catálogo de cargos existente |
| plannedHours | INTEGER | — | Sí | — |
| authorizedHours | INTEGER | — | Sí | — |
| occupiedHours | INTEGER | — | Sí | — |
| availableHours | INTEGER | — | Sí | — |
| effectiveFrom | TIMESTAMP(3) | — | Sí | — |
| effectiveTo | TIMESTAMP(3) | — | No | — |

### `ApsEmployeeAssignment` (dominio 8 · NUEVA)

| Campo | Tipo PostgreSQL | PK/FK | Oblig. | Descripción |
|---|---|---|---|---|
| id | TEXT | PK | Sí | cuid |
| employeeId | TEXT | FK → Employee | Sí | — |
| facilityId | TEXT | FK → ApsHealthFacility | Sí | — |
| staffingPositionId | TEXT | FK → ApsStaffingPosition | No | — |
| categoryId | TEXT | FK → ApsEmployeeCategory | Sí | — |
| careerLevel | INTEGER | — | Sí | — |
| cargoId | TEXT | FK → Cargo | Sí | — |
| weeklyHours | INTEGER | — | Sí | — |
| contractType | VARCHAR(30) | — | Sí | Espejo informativo de `ContractType.code` al momento de la asignación |
| startDate | TIMESTAMP(3) | — | Sí | — |
| endDate | TIMESTAMP(3) | — | No | — |
| effectiveFrom | TIMESTAMP(3) | — | Sí | — |
| effectiveTo | TIMESTAMP(3) | — | No | — |
| status | VARCHAR(30) | — | Sí | — |

### `ApsWorkSchedule` (dominio 8 · NUEVA)

| Campo | Tipo PostgreSQL | PK/FK | Oblig. | Descripción |
|---|---|---|---|---|
| id | TEXT | PK | Sí | cuid |
| employeeId | TEXT | FK → Employee | Sí | — |
| weeklyHours | INTEGER | — | Sí | — |
| fullTimeHours | INTEGER | — | Sí | Referencia de jornada completa (44) |
| percentage | NUMERIC(6,4) | — | Sí | `weeklyHours / fullTimeHours`, usado para proporcionalidad del sueldo base y otros cálculos |
| effectiveFrom | TIMESTAMP(3) | — | Sí | — |
| effectiveTo | TIMESTAMP(3) | — | No | — |

---

## 11. Dominio 9 — Responsabilidades directivas

### `ApsResponsibilityType` (dominio 9 · NUEVA — catálogo)

| Campo | Tipo PostgreSQL | PK/FK | Oblig. | Descripción |
|---|---|---|---|---|
| id | TEXT | PK | Sí | cuid |
| code | VARCHAR(40) | — | Sí, único | Ver `ApsResponsibilityScope` |
| name | VARCHAR(150) | — | Sí | — |
| maxPercentage | NUMERIC(6,4) | — | No | Tope legal de porcentaje asociado |
| isActive | BOOLEAN | — | Sí | — |

### `ApsResponsibilityAssignment` (dominio 9 · NUEVA)

| Campo | Tipo PostgreSQL | PK/FK | Oblig. | Descripción |
|---|---|---|---|---|
| id | TEXT | PK | Sí | cuid |
| employeeId | TEXT | FK → Employee | Sí | — |
| facilityId | TEXT | FK → ApsHealthFacility | Sí | — |
| responsibilityTypeId | TEXT | FK → ApsResponsibilityType | Sí | — |
| cargoId | TEXT | FK → Cargo | No | — |
| percentage | NUMERIC(6,4) | — | Sí | — |
| calculationBase | VARCHAR(30) | — | Sí | — |
| startDate | TIMESTAMP(3) | — | Sí | — |
| endDate | TIMESTAMP(3) | — | No | — |
| resolutionNumber | VARCHAR(60) | — | No | — |
| approvalDate | TIMESTAMP(3) | — | No | — |
| effectiveFrom | TIMESTAMP(3) | — | Sí | — |
| effectiveTo | TIMESTAMP(3) | — | No | — |
| status | VARCHAR(30) | — | Sí | — |

---

## 12. Dominio 10 — Condiciones especiales (zona, desempeño difícil, transitorias)

### `ApsDifficultPerformanceFacility` (dominio 10 · NUEVA)

| Campo | Tipo PostgreSQL | PK/FK | Oblig. | Descripción |
|---|---|---|---|---|
| id | TEXT | PK | Sí | cuid |
| facilityId | TEXT | FK → ApsHealthFacility | Sí | — |
| year | INTEGER | — | Sí | — |
| classificationType | VARCHAR(40) | — | Sí | Ej. aislamiento, dispersión, marginalidad, riesgo |
| difficultyBand | VARCHAR(20) | — | Sí | — |
| percentage | NUMERIC(6,4) | — | Sí | — |
| decreeNumber | VARCHAR(60) | — | No | — |
| decreeDate | TIMESTAMP(3) | — | No | — |
| effectiveFrom | TIMESTAMP(3) | — | Sí | — |
| effectiveTo | TIMESTAMP(3) | — | No | — |
| active | BOOLEAN | — | Sí | — |

### `ApsEmployeeDifficultPerformance` (dominio 10 · NUEVA)

| Campo | Tipo PostgreSQL | PK/FK | Oblig. | Descripción |
|---|---|---|---|---|
| id | TEXT | PK | Sí | cuid |
| employeeId | TEXT | FK → Employee | Sí | — |
| facilityClassificationId | TEXT | FK → ApsDifficultPerformanceFacility | Sí | — |
| percentage | NUMERIC(6,4) | — | Sí | — |
| effectiveFrom | TIMESTAMP(3) | — | Sí | — |
| effectiveTo | TIMESTAMP(3) | — | No | — |

### `ApsZoneAssignment` (dominio 10 · NUEVA — catálogo de zonas)

| Campo | Tipo PostgreSQL | PK/FK | Oblig. | Descripción |
|---|---|---|---|---|
| id | TEXT | PK | Sí | cuid |
| code | VARCHAR(30) | — | Sí, único | — |
| name | VARCHAR(150) | — | Sí | — |
| communeId | TEXT | FK → Commune | No | Referencia geográfica cuando la zona corresponde a una comuna completa |
| percentage | NUMERIC(6,4) | — | Sí | — |
| legalReference | VARCHAR(200) | — | No | — |
| effectiveFrom | TIMESTAMP(3) | — | Sí | — |
| effectiveTo | TIMESTAMP(3) | — | No | — |

### `EmployeeApsZoneAssignment` (dominio 10 · NUEVA)

| Campo | Tipo PostgreSQL | PK/FK | Oblig. | Descripción |
|---|---|---|---|---|
| id | TEXT | PK | Sí | cuid |
| employeeId | TEXT | FK → Employee | Sí | — |
| zoneAssignmentId | TEXT | FK → ApsZoneAssignment | Sí | — |
| facilityId | TEXT | FK → ApsHealthFacility | No | — |
| percentage | NUMERIC(6,4) | — | Sí | Puede ser distinto del de la zona si hay un tope individual |
| effectiveFrom | TIMESTAMP(3) | — | Sí | — |
| effectiveTo | TIMESTAMP(3) | — | No | — |

### `ApsSpecialTemporaryAssignment` (dominio 10 · NUEVA)

Requiere aprobación del Concejo Municipal y vence como máximo el 31 de
diciembre del año presupuestario — por eso `budgetYear` y `effectiveTo` son
obligatorios de revisar juntos en la validación de negocio (no en el esquema).

| Campo | Tipo PostgreSQL | PK/FK | Oblig. | Descripción |
|---|---|---|---|---|
| id | TEXT | PK | Sí | cuid |
| administrativeEntityId | TEXT | FK → LegalEntity | Sí | — |
| code | VARCHAR(40) | — | Sí, único | — |
| name | VARCHAR(200) | — | Sí | — |
| description | VARCHAR(500) | — | No | — |
| categoryId | TEXT | FK → ApsEmployeeCategory | No | — |
| careerLevel | INTEGER | — | No | — |
| percentage | NUMERIC(6,4) | — | No | Uno de los dos: `percentage` o `fixedAmount` |
| fixedAmount | NUMERIC(12,2) | — | No | — |
| calculationBase | VARCHAR(30) | — | No | — |
| budgetYear | INTEGER | — | Sí | — |
| effectiveFrom | TIMESTAMP(3) | — | Sí | — |
| effectiveTo | TIMESTAMP(3) | — | Sí | Máximo 31-12 del `budgetYear` |
| municipalCouncilApproval | BOOLEAN | — | Sí | — |
| resolutionNumber | VARCHAR(60) | — | No | — |
| active | BOOLEAN | — | Sí | — |

---

## 13. Dominio 11/12 — Puente a Nómina

### `ApsContractProfile` (dominio 12 · NUEVA — extensión 1:1 de `Contract`)

Esta es la tabla que responde a "agrega todos los campos remuneracionales en
la definición del contrato de trabajo" — sólo aplicable/visible cuando
`Contract.laborRegimeId` corresponde a `LEY_19378`. Es el snapshot
remuneracional que un futuro monitor de réplica leerá para exportar hacia el
sistema de nómina externo — se arma a partir de `ApsCareer`,
`ApsEmployeeAssignment`, `ApsResponsibilityAssignment`,
`ApsEmployeeDifficultPerformance`, `EmployeeApsZoneAssignment` y
`ApsMeritAssignment`, sin que Nómina tenga que recorrer esas 5 tablas.

| Campo | Tipo PostgreSQL | PK/FK | Oblig. | Descripción |
|---|---|---|---|---|
| id | TEXT | PK | Sí | cuid |
| contractId | TEXT | FK → Contract, `@unique` | Sí | 1:1 — sólo tiene sentido si el contrato es régimen APS |
| categoryId | TEXT | FK → ApsEmployeeCategory | Sí | — |
| careerLevel | INTEGER | — | Sí | — |
| facilityId | TEXT | FK → ApsHealthFacility | Sí | — |
| weeklyHours | INTEGER | — | Sí | — |
| baseSalaryAmount | NUMERIC(12,2) | — | Sí | Snapshot desde `ApsBaseSalaryScale` |
| primaryCareAssignmentAmount | NUMERIC(12,2) | — | No | Asignación de atención primaria municipal |
| zonePercentage | NUMERIC(6,4) | — | No | — |
| zoneAmount | NUMERIC(12,2) | — | No | — |
| difficultPerformancePercentage | NUMERIC(6,4) | — | No | — |
| difficultPerformanceAmount | NUMERIC(12,2) | — | No | — |
| responsibilityPercentage | NUMERIC(6,4) | — | No | — |
| responsibilityAmount | NUMERIC(12,2) | — | No | — |
| meritPercentage | NUMERIC(6,4) | — | No | — |
| meritAmount | NUMERIC(12,2) | — | No | — |
| specialAssignmentAmount | NUMERIC(12,2) | — | No | Suma de `ApsSpecialTemporaryAssignment` vigentes |
| postgraduateAssignmentAmount | NUMERIC(12,2) | — | No | — |
| totalApsAssignments | NUMERIC(12,2) | — | Sí | Suma de todo lo anterior — lo que efectivamente ve Nómina |
| effectiveFrom | TIMESTAMP(3) | — | Sí | — |
| effectiveTo | TIMESTAMP(3) | — | No | — |
| version | INTEGER | — | Sí | Autoincremental — nunca se edita, se versiona (mismo patrón que `PayrollFormula`) |
| status | VARCHAR(30) | — | Sí | DRAFT / ACTIVE / SUPERSEDED |
| createdAt / createdBy | TIMESTAMP(3) / VARCHAR(150) | — | Sí / No | — |

> **Conceptos de nómina (dominio 11 de tu especificación):** no se crea
> `APS_PAYROLL_CONCEPT` — se crean 8 filas nuevas en la tabla `PayrollConcept`
> ya existente (`APS_BASE_SALARY`, `APS_PRIMARY_CARE_ASSIGNMENT`,
> `APS_ZONE_ASSIGNMENT`, `APS_DIRECTIVE_RESPONSIBILITY`,
> `APS_DIFFICULT_PERFORMANCE`, `APS_MERIT_ASSIGNMENT`,
> `APS_SPECIAL_TEMPORARY_ASSIGNMENT`, `APS_POSTGRADUATE_ASSIGNMENT`), y sus
> reglas de cálculo se cargan como `PayrollFormula` filtradas por
> `laborRegimeId = LEY_19378`, leyendo `ApsContractProfile` a través de
> `PayrollVariable` con origen `SYSTEM`. El "motor de reglas APS" (tu punto
> 40, `APS_RULE`/`APS_RULE_VERSION`) es, literalmente, el motor de fórmulas
> que ya construimos — no uno nuevo.

---

## 14. Resumen de relaciones maestro-detalle

| Maestro | Detalle | Regla |
|---|---|---|
| `ApsBiennium` | `ApsRecognizedService` | Un bienio se compone de N servicios reconocidos que suman sus días |
| `ApsRecognizedService` | `ApsServiceExclusion` | Un servicio puede tener N períodos excluidos (licencias sin goce, interrupciones) |
| `ApsEmployeeTrainingYear` | `EmployeeApsTraining` | Un año de control agrupa N cursos tomados ese año |
| `ApsMunicipalTrainingProgram` | `ApsMunicipalTrainingProgramItem` | Un programa anual agrupa N cursos planificados |

---

## 15. Mapeo a la interfaz (dónde aparece cada cosa)

| Ubicación en el menú | Contenido | Tablas |
|---|---|---|
| **Gestión de Personas → Control Bienal** (nueva) | Maestro-detalle de bienios por funcionario | `ApsBiennium` + `ApsRecognizedService` (+ `ApsServiceExclusion` en el detalle del detalle) |
| **Gestión de Personas → Control de Capacitación** (nueva) | Maestro-detalle de capacitación anual | `ApsEmployeeTrainingYear` + `EmployeeApsTraining` |
| **Contratos** (existente, extendida) | Pestaña/sección que sólo aparece si `laborRegimeId = LEY_19378` | `ApsContractProfile` |
| **Utilidades del sistema → APS → Instituciones laborales** (nuevo mantenedor) | CRUD | `ApsLaborInstitution` |
| **Utilidades del sistema → APS → Instituciones académicas** (nuevo mantenedor) | CRUD | `EducationInstitution` (+ `EducationInstitutionType`) |
| **Utilidades del sistema → APS → Cursos** (nuevo mantenedor) | CRUD, con tipificación de evaluación | `ApsTrainingActivity`, `ApsTrainingType`, `ApsTrainingTechnicalLevel`, `ApsTrainingEvaluationLevel`, `ApsTrainingDurationRule` |
| **Utilidades del sistema → APS → (resto de catálogos)** | CRUD genérico (patrón `OrgMaintainerPage` ya existente) | `ApsEmployeeCategory`, `ApsProfession`, `ApsFacilityType`, `ApsHealthService`, `ApsHealthFacility`, `ApsCareerLevel`, `ApsBaseSalaryScale`, `ApsNationalMinimumBaseSalary`, `ApsExperienceRule`, `ApsResponsibilityType`, `ApsMeritBand`, `ApsZoneAssignment`, `ApsDifficultPerformanceFacility`, `ApsSpecialTemporaryAssignment`, `ApsLaborInstitution`, `LegalParameter`, `EducationType` |
| **Gestión de Personas → ficha del colaborador** (pestañas nuevas) | Formación académica, postgrados, carrera, mérito, responsabilidades, zona/desempeño difícil | `EmployeeAcademicBackground`, `ApsPostgraduate`, `ApsCareer`, `ApsCareerHistory`, `ApsPerformanceEvaluation`, `ApsMeritAssignment`, `ApsResponsibilityAssignment`, `EmployeeApsZoneAssignment`, `ApsEmployeeDifficultPerformance`, `ApsEmployeeAssignment`, `ApsWorkSchedule` |

Todos los mantenedores exponen create/update/delete/list, siguiendo
exactamente el patrón ya usado en `payroll-formulas.controller.ts` /
`OrgMaintainerPage` (DTO + servicio + controlador con `@Roles('ADMIN',
'RRHH')`, salvo activar/aprobar que queda reservado a `ADMIN` donde exista
ciclo de vida).

---

## 16. Hoja de ruta de implementación

| Fase | Contenido | Estado |
|---|---|---|
| **0** | Este documento — modelo físico completo | ✅ Esta entrega |
| **1** | Migración Prisma: 44 modelos + 8 enums nuevos, extensión 1:1 de `LegalEntity` y `Contract`; seed de catálogos base (categorías A–F, niveles 1–15, tipos de capacitación, tipos de institución) | Pendiente |
| **2** | Backend NestJS: un módulo CRUD por mantenedor (DTO/service/controller), maestro-detalle para Bienios y Capacitación, extensión del módulo de Contratos para `ApsContractProfile` condicional a `laborRegimeId` | Pendiente |
| **3** | Frontend: dos secciones nuevas en Gestión de Personas, mantenedores nuevos en Utilidades del sistema, pestaña condicional en Contratos, pestañas nuevas en la ficha del colaborador | Pendiente |
| **4** *(mencionada como "posteriormente" en tu mensaje — fuera de esta entrega)* | Motor de cálculo automático (recalcular bienios → puntaje → nivel → sueldo, tu punto 41) y monitor de réplica hacia el sistema de nómina externo | Futura |

**Siguiente paso sugerido:** confirmar este modelo (o pedir ajustes) y
avanzar con la Fase 1 (migración Prisma). Dado el tamaño (44 tablas), sugiero
implementarla en 2–3 migraciones sucesivas agrupadas por dominio en vez de
una sola migración gigante, para poder revisar cada tramo antes de seguir.

## 17. Puntos que decidí y que vale la pena que confirmes

1. **IDs `TEXT`/cuid en vez de `BIGINT`** — obligado por consistencia con el
   resto del esquema (ver sección 1).
2. **`ApsAdministrativeEntityProfile` como extensión 1:1 de `LegalEntity`**
   en vez de una tabla `APS_ADMINISTRATIVE_ENTITY` independiente — si
   preferías mantenerla separada de la estructura organizacional general,
   dímelo y la desacoplo.
3. **Reutilizar `PayrollConcept`/`PayrollFormula` en vez de
   `APS_PAYROLL_CONCEPT`/`APS_RULE`** — esto es tu propia recomendación del
   punto 36/"decisión de diseño clave", lo tomé como definitivo.
4. **`ApsContractProfile` en vez de `EMPLOYEE_APS_PROFILE`** — lo anclé al
   contrato (como pediste explícitamente: "en la definición del contrato de
   trabajo") en vez de al empleado directamente; si un funcionario puede
   tener remuneración APS sin pasar por un `Contract` (ej. honorarios), avísame
   y agrego también la variante a nivel de `Employee`.
