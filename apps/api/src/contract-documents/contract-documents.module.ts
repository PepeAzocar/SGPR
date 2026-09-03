import { Module } from '@nestjs/common';
import { ContractMatricesController } from './contract-matrices.controller.js';
import { ContractMatricesService } from './contract-matrices.service.js';
import { ContractTemplatesController } from './contract-templates.controller.js';
import { ContractTemplatesService } from './contract-templates.service.js';
import { ClausesController } from './clauses.controller.js';
import { ClausesService } from './clauses.service.js';
import { DocumentTokensController } from './document-tokens.controller.js';
import { DocumentTokensService } from './document-tokens.service.js';
import { GeneratedDocumentsController } from './generated-documents.controller.js';
import { GeneratedDocumentsService } from './generated-documents.service.js';

@Module({
  controllers: [
    ContractMatricesController,
    ContractTemplatesController,
    ClausesController,
    DocumentTokensController,
    GeneratedDocumentsController,
  ],
  providers: [
    ContractMatricesService,
    ContractTemplatesService,
    ClausesService,
    DocumentTokensService,
    GeneratedDocumentsService,
  ],
})
export class ContractDocumentsModule {}
