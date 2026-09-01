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

## Módulos implementados

- **Personas**: empleados, departamentos, cargos, contratos, ausencias
  (vacaciones/licencias).
- **Remuneraciones**: períodos de remuneración, cálculo automático de
  liquidaciones (sueldo base, gratificación legal, AFP, salud, seguro de
  cesantía, impuesto único), conceptos de remuneración configurables.
- **Catálogos previsionales**: AFP, instituciones de salud, indicadores
  económicos, tabla de impuesto único.
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
