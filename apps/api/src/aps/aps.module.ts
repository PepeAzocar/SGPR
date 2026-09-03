import { Module } from '@nestjs/common';

import { ApsEmployeeCategoriesController } from './aps-employee-categories.controller.js';
import { ApsEmployeeCategoriesService } from './aps-employee-categories.service.js';
import { ApsProfessionsController } from './aps-professions.controller.js';
import { ApsProfessionsService } from './aps-professions.service.js';
import { ApsFacilityTypesController } from './aps-facility-types.controller.js';
import { ApsFacilityTypesService } from './aps-facility-types.service.js';
import { ApsHealthServicesController } from './aps-health-services.controller.js';
import { ApsHealthServicesService } from './aps-health-services.service.js';
import { ApsHealthFacilitiesController } from './aps-health-facilities.controller.js';
import { ApsHealthFacilitiesService } from './aps-health-facilities.service.js';
import { ApsLaborInstitutionsController } from './aps-labor-institutions.controller.js';
import { ApsLaborInstitutionsService } from './aps-labor-institutions.service.js';

import { ApsTrainingTypesController } from './aps-training-types.controller.js';
import { ApsTrainingTypesService } from './aps-training-types.service.js';
import { ApsTrainingTechnicalLevelsController } from './aps-training-technical-levels.controller.js';
import { ApsTrainingTechnicalLevelsService } from './aps-training-technical-levels.service.js';
import { ApsTrainingEvaluationLevelsController } from './aps-training-evaluation-levels.controller.js';
import { ApsTrainingEvaluationLevelsService } from './aps-training-evaluation-levels.service.js';
import { ApsTrainingDurationRulesController } from './aps-training-duration-rules.controller.js';
import { ApsTrainingDurationRulesService } from './aps-training-duration-rules.service.js';
import { ApsTrainingActivitiesController } from './aps-training-activities.controller.js';
import { ApsTrainingActivitiesService } from './aps-training-activities.service.js';

import { EducationInstitutionTypesController } from './education-institution-types.controller.js';
import { EducationInstitutionTypesService } from './education-institution-types.service.js';
import { EducationInstitutionsController } from './education-institutions.controller.js';
import { EducationInstitutionsService } from './education-institutions.service.js';
import { EducationTypesController } from './education-types.controller.js';
import { EducationTypesService } from './education-types.service.js';

import { ApsEmployeeTrainingYearsController } from './aps-employee-training-years.controller.js';
import { ApsEmployeeTrainingYearsService } from './aps-employee-training-years.service.js';
import { ApsBienniumsController } from './aps-bienniums.controller.js';
import { ApsBienniumsService } from './aps-bienniums.service.js';
import { ApsContractProfilesController } from './aps-contract-profiles.controller.js';
import { ApsContractProfilesService } from './aps-contract-profiles.service.js';

// Submódulo de Carrera Funcionaria APS (Ley N°19.378). Ver
// docs/ley-19378-modelo-fisico.md para el modelo completo. Fase 2 de la
// implementación cubre: catálogos base, los dos maestro-detalle pedidos
// (Control de Capacitación, Control Bienal) y la extensión de Contratos.
// Quedan para una Fase 2b: niveles/escalas de sueldo, mérito,
// responsabilidades, condiciones especiales y la ficha completa de carrera
// (ApsCareer/ApsCareerHistory), que dependen de cifras reales que aún no
// corresponde sembrar de ejemplo.
@Module({
  controllers: [
    ApsEmployeeCategoriesController,
    ApsProfessionsController,
    ApsFacilityTypesController,
    ApsHealthServicesController,
    ApsHealthFacilitiesController,
    ApsLaborInstitutionsController,
    ApsTrainingTypesController,
    ApsTrainingTechnicalLevelsController,
    ApsTrainingEvaluationLevelsController,
    ApsTrainingDurationRulesController,
    ApsTrainingActivitiesController,
    EducationInstitutionTypesController,
    EducationInstitutionsController,
    EducationTypesController,
    ApsEmployeeTrainingYearsController,
    ApsBienniumsController,
    ApsContractProfilesController,
  ],
  providers: [
    ApsEmployeeCategoriesService,
    ApsProfessionsService,
    ApsFacilityTypesService,
    ApsHealthServicesService,
    ApsHealthFacilitiesService,
    ApsLaborInstitutionsService,
    ApsTrainingTypesService,
    ApsTrainingTechnicalLevelsService,
    ApsTrainingEvaluationLevelsService,
    ApsTrainingDurationRulesService,
    ApsTrainingActivitiesService,
    EducationInstitutionTypesService,
    EducationInstitutionsService,
    EducationTypesService,
    ApsEmployeeTrainingYearsService,
    ApsBienniumsService,
    ApsContractProfilesService,
  ],
})
export class ApsModule {}
