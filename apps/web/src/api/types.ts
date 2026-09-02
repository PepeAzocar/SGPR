export type OrgUnitStatus = 'ACTIVE' | 'INACTIVE';

export interface LegalEntity {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  effectiveFrom: string;
  effectiveTo?: string | null;
  status: OrgUnitStatus;
}

export interface BusinessUnit {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  effectiveFrom: string;
  effectiveTo?: string | null;
  status: OrgUnitStatus;
  legalEntityId: string;
  legalEntity?: LegalEntity;
}

export interface Division {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  effectiveFrom: string;
  effectiveTo?: string | null;
  status: OrgUnitStatus;
  businessUnitId: string;
  businessUnit?: BusinessUnit;
  parentDivisionId?: string | null;
  parent?: Division | null;
}

export interface CostCenter {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  effectiveFrom: string;
  effectiveTo?: string | null;
  status: OrgUnitStatus;
  legalEntityId?: string | null;
  legalEntity?: LegalEntity | null;
  parentId?: string | null;
  parent?: CostCenter | null;
  managerEmployeeId?: string | null;
}

export interface Cargo {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  effectiveFrom: string;
  effectiveTo?: string | null;
  status: OrgUnitStatus;
}

export interface Department {
  id: string;
  code?: string | null;
  name: string;
  description?: string | null;
  effectiveFrom?: string | null;
  effectiveTo?: string | null;
  status?: OrgUnitStatus;
  divisionId?: string | null;
  division?: Division | null;
  costCenterId?: string | null;
  costCenter?: CostCenter | null;
  parentId: string | null;
}

export interface Position {
  id: string;
  code?: string | null;
  title: string;
  description?: string | null;
  effectiveFrom?: string | null;
  effectiveTo?: string | null;
  status?: OrgUnitStatus;
  departmentId: string;
  department?: Department;
  cargoId?: string | null;
  cargo?: Cargo | null;
  costCenterId?: string | null;
  costCenter?: CostCenter | null;
}

export interface AfpEntity {
  id: string;
  name: string;
  workerRate: string;
  isActive: boolean;
  effectiveFrom?: string | null;
  effectiveTo?: string | null;
}

export interface HealthInstitution {
  id: string;
  name: string;
  type: 'FONASA' | 'ISAPRE';
  isActive: boolean;
  effectiveFrom?: string | null;
  effectiveTo?: string | null;
}

export interface Mutuality {
  id: string;
  code: string;
  rut: string;
  legalName: string;
  tradeName?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  previredCode?: string | null;
  isActive: boolean;
  effectiveFrom: string;
  effectiveTo?: string | null;
}

export interface Ccaf {
  id: string;
  code: string;
  rut: string;
  legalName: string;
  tradeName?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  previredCode?: string | null;
  isActive: boolean;
  effectiveFrom: string;
  effectiveTo?: string | null;
}

export type AffiliationStatus = 'ACTIVE' | 'FINISHED' | 'PENDING';

export interface EmployeeAfp {
  id: string;
  employeeId: string;
  afpId: string;
  afp?: AfpEntity;
  affiliationDate: string;
  afpJoinDate: string;
  effectiveFrom: string;
  effectiveTo?: string | null;
  status: AffiliationStatus;
  fundType?: string | null;
  mandatoryContributionPct: string;
  afpCommissionPct?: string | null;
  additionalContributionPct?: string | null;
  heavyWork: boolean;
  heavyWorkPct?: string | null;
  notes?: string | null;
}

export interface HealthAffiliation {
  id: string;
  employeeId: string;
  healthInstitutionId: string;
  healthInstitution?: HealthInstitution;
  planUfValue?: string | null;
  effectiveFrom: string;
  effectiveTo?: string | null;
  status: AffiliationStatus;
  notes?: string | null;
}

export type PensionProductType = 'APV' | 'CAV' | 'COTIZACION_VOLUNTARIA' | 'DEPOSITO_CONVENIDO';
export type ContributionMode = 'MONTO' | 'PORCENTAJE';
export type PensionSavingStatus = 'ACTIVE' | 'SUSPENDED' | 'FINISHED';

export interface EmployeePensionSaving {
  id: string;
  employeeId: string;
  productType: PensionProductType;
  institutionId: string;
  institution?: AfpEntity;
  taxRegime?: string | null;
  contributionMode: ContributionMode;
  amount?: string | null;
  percentage?: string | null;
  currency?: string | null;
  fundType?: string | null;
  effectiveFrom: string;
  effectiveTo?: string | null;
  status: PensionSavingStatus;
  payrollDeduction: boolean;
  contractNumber?: string | null;
  notes?: string | null;
}

export interface Bank {
  id: string;
  code: string;
  name: string;
  regulatorCode?: string | null;
  isActive: boolean;
  effectiveFrom?: string | null;
  effectiveTo?: string | null;
}

export interface BankAccountType {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
}

export interface PaymentMethod {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
}

export interface EmployeeBankAccount {
  id: string;
  employeeId: string;
  bankId: string;
  bank?: Bank;
  accountTypeId: string;
  accountType?: BankAccountType;
  paymentMethodId: string;
  paymentMethod?: PaymentMethod;
  accountNumber: string;
  accountHolderName: string;
  accountHolderRut: string;
  currencyCode: string;
  isPrimary: boolean;
  effectiveFrom: string;
  effectiveTo?: string | null;
  status: AffiliationStatus;
  employeeEventId?: string | null;
  notes?: string | null;
}

export interface Employee {
  id: string;
  documentType: string;
  documentNumber: string;
  rut?: string | null;
  firstName: string;
  lastName: string;
  secondLastName?: string | null;
  socialName?: string | null;
  nationality?: string | null;
  birthCountry?: string | null;
  birthRegion?: string | null;
  birthCommune?: string | null;
  photoUrl?: string | null;
  email?: string | null;
  status: 'ACTIVE' | 'ON_LEAVE' | 'TERMINATED';
  afpAffiliations?: EmployeeAfp[];
  healthAffiliations?: HealthAffiliation[];
  pensionSavings?: EmployeePensionSaving[];
  bankAccounts?: EmployeeBankAccount[];
}

export interface LaborRegime {
  id: string;
  code: string;
  name: string;
  mainNorm?: string | null;
  isActive: boolean;
  effectiveFrom?: string | null;
  effectiveTo?: string | null;
}

export interface ContractType {
  id: string;
  code: string;
  name: string;
  laborRegimeId: string;
  laborRegime?: LaborRegime;
  requiresEndDate: boolean;
  allowsExtension: boolean;
  allowsIndefiniteConversion: boolean;
  payrollRelevant: boolean;
  isActive: boolean;
  effectiveFrom?: string | null;
  effectiveTo?: string | null;
}

export interface Contract {
  id: string;
  employeeId: string;
  positionId: string;
  legalEntityId: string;
  legalEntity?: LegalEntity;
  laborRegimeId: string;
  laborRegime?: LaborRegime;
  contractTypeId: string;
  contractType?: ContractType;
  contractNumber: string;
  sequenceNumber: number;
  startDate: string;
  endDate?: string | null;
  baseSalary: string;
  weeklyHours: number;
  isActive: boolean;
  employee?: Employee;
  position?: Position;
}

export interface EventType {
  id: string;
  code: string;
  name: string;
  payrollRelevant: boolean;
  isActive: boolean;
}

export interface EventReason {
  id: string;
  code: string;
  name: string;
  eventTypeId: string;
  eventType?: EventType;
  isActive: boolean;
  displayName?: string;
}

export type EmployeeEventStatus = 'APPLIED' | 'CANCELLED';

export interface EmployeeEventChange {
  id: string;
  employeeEventId: string;
  fieldCode: string;
  oldValue?: string | null;
  newValue?: string | null;
  oldReferenceId?: string | null;
  newReferenceId?: string | null;
}

export interface EmployeeEvent {
  id: string;
  employeeId: string;
  employee?: Employee;
  effectiveDate: string;
  sequenceNumber: number;
  eventTypeId: string;
  eventType?: EventType;
  eventReasonId: string;
  eventReason?: EventReason;
  description?: string | null;
  documentReference?: string | null;
  laborRegimeId?: string | null;
  laborRegime?: LaborRegime;
  payrollRelevant: boolean;
  retroactive: boolean;
  status: EmployeeEventStatus;
  changes?: EmployeeEventChange[];
  createdBy?: string | null;
  createdAt: string;
}

export interface Leave {
  id: string;
  employeeId: string;
  type: 'VACATION' | 'SICK_LEAVE' | 'PARENTAL' | 'UNPAID' | 'OTHER';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  startDate: string;
  endDate: string;
  days: number;
  reason?: string | null;
  employee?: Employee;
}

export interface PayrollPeriod {
  id: string;
  month: number;
  year: number;
  status: 'OPEN' | 'CALCULATED' | 'CLOSED' | 'PAID';
}

export interface PayrollConcept {
  id: string;
  code: string;
  name: string;
  type: 'EARNING' | 'DEDUCTION';
  category: string;
  isSystem?: boolean;
}

export interface PayslipItem {
  id: string;
  amount: string;
  concept: PayrollConcept;
}

export interface Payslip {
  id: string;
  employeeId: string;
  periodId: string;
  totalEarnings: string;
  totalDeductions: string;
  netPay: string;
  employee?: Employee;
  period?: PayrollPeriod;
  items?: PayslipItem[];
}

export interface Country {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
}

export interface Region {
  id: string;
  code?: string | null;
  name: string;
  isActive: boolean;
  countryId: string;
  country?: Country;
  displayName?: string;
}

export interface Commune {
  id: string;
  code?: string | null;
  name: string;
  isActive: boolean;
  regionId: string;
  region?: Region;
  displayName?: string;
}

export interface Nationality {
  id: string;
  code?: string | null;
  name: string;
  isActive: boolean;
}

export interface EconomicIndicator {
  id: string;
  period: string;
  ufValue: string;
  utmValue: string;
  minWage: string;
  afpHealthCapUf: string;
}

export interface TaxBracket {
  id: string;
  validFrom: string;
  fromUtm: string;
  toUtm: string | null;
  factor: string;
  deductionUtm: string;
}

export type PayrollVariableSource = 'EMPLOYEE' | 'CONTRACT' | 'INDICATOR' | 'PARAMETER' | 'TABLE' | 'SYSTEM';

export interface PayrollVariable {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  source: PayrollVariableSource;
  isActive: boolean;
}

export interface PayrollParameterValue {
  id: string;
  parameterId: string;
  value: string;
  effectiveFrom: string;
  effectiveTo?: string | null;
}

export interface PayrollParameter {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  values?: PayrollParameterValue[];
}

export interface PayrollTableRow {
  id: string;
  tableId: string;
  fromValue: string;
  toValue?: string | null;
  resultValue: string;
  effectiveFrom: string;
  effectiveTo?: string | null;
}

export interface PayrollTable {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
  rows?: PayrollTableRow[];
}

export type PayrollFormulaStatus = 'DRAFT' | 'TESTING' | 'PENDING_APPROVAL' | 'APPROVED' | 'ACTIVE' | 'INACTIVE' | 'REJECTED';

export interface PayrollFormula {
  id: string;
  conceptId: string;
  concept?: PayrollConcept;
  version: number;
  formulaExpression: string;
  condition?: string | null;
  laborRegimeId?: string | null;
  laborRegime?: LaborRegime | null;
  legalEntityId?: string | null;
  legalEntity?: LegalEntity | null;
  priority: number;
  effectiveFrom: string;
  effectiveTo?: string | null;
  status: PayrollFormulaStatus;
  createdBy?: string | null;
  createdAt: string;
  approvedBy?: string | null;
  approvedAt?: string | null;
}
