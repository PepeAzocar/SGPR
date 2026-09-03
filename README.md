# GPR — Sistema de Remuneraciones y Gestión de Personas

Sistema de RRHH y remuneraciones para Chile: gestión de empleados, estructura
organizacional, contratos, ausencias y cálculo de liquidaciones de sueldo
(AFP, salud, seguro de cesantía e impuesto único).

## Arquitectura

Monorepo con dos aplicaciones:

- **`apps/api`** — Backend NestJS + Prisma + PostgreSQL (TypeScript, ESM).
  Autenticación JWT con roles (`ADMIN`, `RRHH`, `EMPLOYEE`).
- **`apps/web`** — Frontend React + Vite + React Router.

```
apps/
  api/    # NestJS API (puerto 3000, prefijo /api)
  web/    # React SPA (puerto 5173)
docker-compose.yml   # PostgreSQL para desarrollo
```

## Requisitos

- Node.js 22+
- PostgreSQL. Cualquiera de estas opciones:
  - **PostgreSQL instalado localmente** (la que usa este proyecto actualmente): crea una
    base de datos `gpr` y apunta `DATABASE_URL` a ella. Ejemplo:
    ```sql
    CREATE DATABASE gpr WITH ENCODING 'UTF8';
    ```
    Si tienes varias versiones de PostgreSQL instaladas (por ejemplo 16 y 18), revisa el
    puerto de cada servicio en "Servicios" de Windows (`postgresql-x64-<version>`) — no
    siempre coincide el número de versión con el puerto por defecto.
  - **Docker**: `docker compose up -d` levanta Postgres en `localhost:5432` (útil si no
    quieres instalar Postgres directamente en tu máquina).
  - **Sin Docker ni instalación**: `npx prisma dev` (dentro de `apps/api`) levanta un
    Postgres local embebido. Es una herramienta de desarrollo cómoda, pero **no aísla
    bases de datos igual que un Postgres real** (ver nota abajo) — se recomienda usar una
    de las dos opciones anteriores.

Si la contraseña de tu usuario de PostgreSQL tiene caracteres especiales (`#`, `@`, `%`,
etc.), deben ir [URL-encoded](https://www.w3schools.com/tags/ref_urlencode.ASP) dentro de
`DATABASE_URL` (ej. `#` → `%23`), o la conexión falla.

## Puesta en marcha

```bash
# 1. Backend
cd apps/api
npm install
cp .env.example .env        # ajustar DATABASE_URL según la opción de Postgres elegida
npm run db:migrate          # aplica las migraciones de Prisma
npm run db:seed             # crea usuario admin, catálogos y datos de ejemplo
npm run start:dev           # http://localhost:3000/api

# 2. Frontend (en otra terminal)
cd apps/web
npm install
cp .env.example .env
npm run dev                 # http://localhost:5173
```

Usuario administrador creado por el seed:

```
admin@gpr.local / Admin123!
```

**Cambiar esta contraseña antes de usar el sistema con datos reales.**

## ⚠️ Datos legales de ejemplo — deben actualizarse

El cálculo de liquidaciones depende de cifras que cambian periódicamente y que
la ley obliga a mantener al día. El *seed* inicial carga **valores de
ejemplo** para poder calcular liquidaciones de prueba, pero antes de usar el
sistema en producción un administrador debe actualizarlos desde los
catálogos (menú "Catálogos" en el frontend, o directamente por API):

- **AFP** (`afp-entities`): comisión de cada AFP. Verificar en la
  Superintendencia de Pensiones / Previred.
- **Instituciones de salud** (`health-institutions`) y el plan UF de cada
  trabajador con Isapre (`employee.isapreUfPlan`).
- **Indicadores económicos** (`economic-indicators`): valor UF, UTM, ingreso
  mínimo mensual y tope imponible del período — se cargan mes a mes.
- **Tabla de impuesto único** (`tax-brackets`): tramos vigentes publicados
  por el SII (sii.cl).

El motor de cálculo (`apps/api/src/payroll/chile/payroll-calculator.service.ts`)
no tiene estas cifras hardcodeadas; las lee siempre desde estos catálogos.

## Define Cálculo Nómina — motor de reglas de remuneraciones

Utilidades del sistema → **Define Cálculo Nómina** (`/payroll-formulas`).
Arquitectura híbrida, tal como se pidió: el motor técnico
(`apps/api/src/payroll-formulas/formula-engine.ts`) sólo sabe interpretar un
lenguaje de expresiones limitado y seguro (variables, `+ - * / > < >= <= = <>`,
`AND`/`OR`, y las funciones `IF`, `ROUND`, `MIN`, `MAX`, `SUM`, `ABS`,
`LOOKUP`) — nunca `eval()` ni código JS/Python/Java. Todo lo que cambia con
la normativa vive como configuración versionada:

- **Conceptos** (`payroll-concepts`, ya existente): a qué se le calcula algo.
- **Variables** (`payroll-variables`): catálogo documental (SUELDO_BASE, UF, etc.).
- **Parámetros** (`payroll-parameters`): valores con vigencia histórica (ej.
  un porcentaje) — nunca se sobrescriben, se cierra el anterior y se crea uno
  nuevo, igual que AFP/cuenta bancaria.
- **Tablas** (`payroll-tables`): tramos consultables con `LOOKUP(TABLA, valor)`.
- **Fórmulas** (`payroll-formulas`): versionadas por concepto, con ciclo de
  vida `DRAFT → TESTING → PENDING_APPROVAL → APPROVED → ACTIVE → INACTIVE`
  (o `REJECTED`). **Nunca se edita ni se borra una fórmula fuera de
  BORRADOR** — un cambio siempre crea una nueva versión; al activarla, la
  versión anterior del mismo concepto y alcance (régimen jurídico + entidad
  legal) se cierra automáticamente. Creador ≠ aprobador: RRHH crea/prueba,
  sólo ADMIN aprueba/activa. Simulador integrado (`POST
  /payroll-formulas/evaluate`) para probar antes de guardar.

**Deliberadamente fuera de esta entrega** (siguiendo tu propia regla 80/20 y
tu nota de que el módulo debe ser independiente del proceso de cálculo por
ahora): el motor de fórmulas **no está conectado** al cálculo real de
liquidaciones (`payroll-periods.service.ts` sigue usando la lógica
hardcodeada de siempre — AFP, salud, gratificación, impuesto único). Tampoco
se implementó el grafo de dependencias entre fórmulas (`PAYROLL_FORMULA_DEPENDENCY`)
— el orden de cálculo hoy sólo se documenta vía `priority`; ni los casos de
prueba guardados (`PAYROLL_FORMULA_TEST`) — el simulador evalúa al vuelo pero
no persiste casos con resultado esperado/actual.

## Gestión Contractual — motor de documentos contractuales

Utilidades del sistema → **Gestión Contractual** (`/contract-documents`,
backend en `apps/api/src/contract-documents/`). Separa la lógica contractual
(qué documento corresponde generar) de la generación física del documento,
siguiendo la misma filosofía del motor de fórmulas de nómina: nunca se edita
contenido ya publicado, todo cambio crea una nueva versión.

- **Matriz** (`contract-matrices`): sólo decide qué **plantilla** usar según
  tipo de documento (`CONTRATO`/`ANEXO`/`CERTIFICADO`) + régimen jurídico +
  tipo de contrato + prioridad. Ciclo de vida simple `DRAFT → ACTIVE →
  INACTIVE` (editable sólo en borrador); al activarla se cierra
  automáticamente cualquier otra matriz activa con el mismo alcance, igual
  mecanismo que `PayrollFormula.activate()`.
- **Plantillas** (`contract-templates`) y **cláusulas** (`clauses`): el
  contenido legal pesado. Cada una tiene versiones (`.../versions`) con
  ciclo `DRAFT → PUBLISHED → RETIRED`; **nunca se edita una versión
  publicada**, sólo se crea una nueva. La plantilla es un shell HTML con el
  placeholder `{{clauses}}`, que el motor reemplaza por las cláusulas
  asignadas a la matriz (`MatrixClause`, en el orden de `sequence`).
- **Tokens** (`document-tokens`): catálogo documental (`employee.fullName`,
  `contract.startDate`, `compensation.baseSalary`, etc.) que alimenta el
  selector "Insertar token" del editor. La resolución real vive en código
  (`engine/token-resolvers.ts`), no en el catálogo — AFP, salud y cuenta
  bancaria se resuelven "vigentes a la fecha efectiva" con el mismo patrón
  `effectiveFrom <= fecha AND (effectiveTo IS NULL OR effectiveTo >= fecha)`
  que usa `payroll-periods.service.ts`.
- **Motor de renderizado** (`engine/template-engine.ts`): parser manual, sin
  `eval`, que entiende `{{token}}`, `{{token|formatter}}`,
  `{{token|formatter:arg}}` y bloques `{{#if token}}...{{/if}}`. Formatos
  disponibles: `dateLong`, `currencyCLP`, `currencyCLPWords`, `rut`,
  `uppercase`, `decimal:N` (`engine/formatters.ts`).
- **Documentos generados** (`generated-documents`): `POST .../preview` (no
  persiste, útil para probar plantillas) y `POST .../generate` (persiste).
  Un documento generado congela el HTML final, su hash SHA-256 y el valor de
  cada token usado (`GeneratedDocumentToken`) — nunca se vuelve a renderizar
  con datos actuales, aunque el colaborador cambie después de sueldo, cargo o
  dirección. Se exporta como PDF desde el navegador (`Imprimir / Guardar
  PDF`, reutiliza los estilos `@media print` existentes) en vez de generarse
  en el servidor: el proyecto no tenía ninguna librería PDF/DOCX ni storage
  de archivos, e introducir esa infraestructura quedó fuera de esta entrega.

**Deliberadamente fuera de esta entrega**: generación automática disparada
por movimientos del colaborador (`EmployeeEvent`) — hoy la generación es
siempre manual, eligiendo empleado/matriz/fecha desde "Documentos
generados"; flujo de aprobación y firma electrónica (`requiresApproval`/
`requiresSignature` existen como columnas reservadas, sin flujo detrás);
exportación a DOCX; motor de reglas/condiciones genérico más allá del
alcance de la matriz (documento + régimen + tipo de contrato + prioridad);
bucles `{{#each}}` (no hay hoy tokens de tipo lista). Limitación heredada:
`Contract.baseSalary` no está historizado, así que
`{{compensation.baseSalary}}` siempre refleja el sueldo *actual* del
contrato, no el vigente en una fecha efectiva pasada.

## Reglas de negocio relevantes

- **Contratos sin superposición de vigencia**: un colaborador puede tener más
  de un contrato activo simultáneamente sólo si sus rangos de fecha
  (`startDate`–`endDate`) no se cruzan (ej. renovaciones consecutivas de
  plazo fijo). Al crear o editar un contrato que queda activo, el sistema
  desactiva automáticamente cualquier otro contrato activo del mismo
  colaborador cuya vigencia se superponga con la de éste — no rechaza la
  operación, resuelve el conflicto dejando sólo los contratos no
  superpuestos como activos (`apps/api/src/contracts/contracts.service.ts`).

## Módulos implementados

- **Personas**: empleados, departamentos, cargos, contratos, ausencias
  (vacaciones/licencias). Cada contrato queda tipificado por su régimen
  jurídico (`labor-regimes`, hoy sólo Código del Trabajo) y su tipo
  contractual (`contract-types`), catálogos parametrizables pensados para
  poder activar a futuro regímenes estatutarios (docente, asistentes de la
  educación, salud APS) sin rediseñar el modelo de contrato.
- **Datos bancarios del colaborador** (`employee-bank-accounts`, pestaña
  "Datos bancarios" en la ficha del colaborador): historial de cuentas
  bancarias con vigencia (banco, tipo de cuenta, forma de pago, titular,
  moneda). Igual que AFP/salud: nunca se sobrescribe una cuenta, al
  registrar una nueva cuenta principal se cierra automáticamente la anterior
  en la fecha en que empieza a regir la nueva. El número de cuenta se
  muestra enmascarado en el historial (los últimos 4 dígitos) con opción de
  revelarlo; no está cifrado en la base de datos, igual que el resto de los
  datos sensibles del sistema (RUT, sueldo). Catálogos separados: `banks`,
  `bank-account-types`, `payment-methods`.
- **Movimientos del colaborador** (`employee-events`): registro histórico e
  inmutable (crear/anular, nunca editar) de todo cambio relevante en la
  relación laboral — contratación, cambio de remuneración, jornada, régimen
  jurídico, centro de costo, cargo, licencias, término, etc. — con motivo
  dependiente del tipo de evento, detección automática de retroactividad
  respecto de los períodos de remuneración ya calculados, e indicador de si
  afecta el cálculo de liquidaciones. Cambio de remuneración, de horas
  semanales y de régimen jurídico se aplican de inmediato al contrato
  vigente del colaborador; los cambios estructurales (centro de costo,
  posición) quedan en el historial pero su aplicación real sigue
  haciéndose creando un nuevo contrato, porque `Position` es un catálogo
  compartido entre colaboradores sin historial propio todavía.
- **Remuneraciones**: períodos de remuneración, cálculo automático de
  liquidaciones (sueldo base, gratificación legal, AFP, salud, seguro de
  cesantía, impuesto único), conceptos de remuneración configurables.
- **Catálogos previsionales**: AFP, instituciones de salud, indicadores
  económicos, tabla de impuesto único.
- **Catálogos geográficos**: país, región, comuna (con dependencia
  jerárquica país → región → comuna) y nacionalidad. Alimentan los
  selectores de las fichas de colaboradores para evitar texto libre.
- **Gestión Contractual** (`/contract-documents`): motor de documentos
  contractuales — matrices, plantillas y cláusulas versionadas, catálogo de
  tokens con resolución "vigente a la fecha efectiva", y generación
  inmutable de contratos/anexos con congelamiento de datos y hash SHA-256.
  Ver sección dedicada más arriba.
- **Autenticación**: login JWT, roles ADMIN / RRHH / EMPLOYEE.

## Pendiente / posibles siguientes pasos

- Generación de PDF de liquidación de sueldo.
- Portal de autoservicio para el empleado (ver sus propias liquidaciones,
  solicitar vacaciones).
- Reportes y dashboards (dotación, costo de remuneraciones).
- Control de asistencia y turnos.
- Tests automatizados (unitarios del motor de cálculo, e2e de la API).
- Despliegue (CI/CD, Postgres administrado, variables de entorno de
  producción).

## Comandos útiles (backend)

```bash
npm run db:migrate    # nueva migración de Prisma
npm run db:studio     # explorador visual de la base de datos
npm run db:seed       # re-ejecutar el seed (usa upsert, es seguro repetirlo)
npm run test          # tests unitarios
npm run build         # build de producción
```
