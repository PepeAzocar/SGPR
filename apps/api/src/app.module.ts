import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './auth/auth.module.js';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard.js';
import { RolesGuard } from './common/guards/roles.guard.js';
import { EmployeesModule } from './employees/employees.module.js';
import { DepartmentsModule } from './departments/departments.module.js';
import { PositionsModule } from './positions/positions.module.js';
import { ContractsModule } from './contracts/contracts.module.js';
import { LeavesModule } from './leaves/leaves.module.js';
import { PayrollPeriodsModule } from './payroll-periods/payroll-periods.module.js';
import { PayrollConceptsModule } from './payroll-concepts/payroll-concepts.module.js';
import { PayslipsModule } from './payslips/payslips.module.js';
import { AfpEntitiesModule } from './afp-entities/afp-entities.module.js';
import { HealthInstitutionsModule } from './health-institutions/health-institutions.module.js';
import { EconomicIndicatorsModule } from './economic-indicators/economic-indicators.module.js';
import { TaxBracketsModule } from './tax-brackets/tax-brackets.module.js';
import { EmployeeAfpModule } from './employee-afp/employee-afp.module.js';
import { EmployeePensionSavingsModule } from './employee-pension-savings/employee-pension-savings.module.js';
import { HealthAffiliationsModule } from './health-affiliations/health-affiliations.module.js';
import { LegalEntitiesModule } from './legal-entities/legal-entities.module.js';
import { BusinessUnitsModule } from './business-units/business-units.module.js';
import { DivisionsModule } from './divisions/divisions.module.js';
import { CostCentersModule } from './cost-centers/cost-centers.module.js';
import { CargosModule } from './cargos/cargos.module.js';
import { MutualitiesModule } from './mutualities/mutualities.module.js';
import { CcafsModule } from './ccafs/ccafs.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    EmployeesModule,
    DepartmentsModule,
    PositionsModule,
    ContractsModule,
    LeavesModule,
    PayrollPeriodsModule,
    PayrollConceptsModule,
    PayslipsModule,
    AfpEntitiesModule,
    HealthInstitutionsModule,
    EconomicIndicatorsModule,
    TaxBracketsModule,
    EmployeeAfpModule,
    EmployeePensionSavingsModule,
    HealthAffiliationsModule,
    LegalEntitiesModule,
    BusinessUnitsModule,
    DivisionsModule,
    CostCentersModule,
    CargosModule,
    MutualitiesModule,
    CcafsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
