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

export interface Employee {
  id: string;
  documentType: string;
  documentNumber: string;
  rut?: string | null;
  firstName: string;
  lastName: string;
  secondLastName?: string | null;
  socialName?: string | null;
  birthCountry?: string | null;
  birthRegion?: string | null;
  birthCommune?: string | null;
  photoUrl?: string | null;
  email?: string | null;
  status: 'ACTIVE' | 'ON_LEAVE' | 'TERMINATED';
  afpAffiliations?: EmployeeAfp[];
  healthAffiliations?: HealthAffiliation[];
  pensionSavings?: EmployeePensionSaving[];
}

export interface Contract {
  id: string;
  employeeId: string;
  positionId: string;
  type: 'INDEFINIDO' | 'PLAZO_FIJO' | 'POR_OBRA_O_FAENA' | 'HONORARIOS';
  startDate: string;
  endDate?: string | null;
  baseSalary: string;
  isActive: boolean;
  employee?: Employee;
  position?: Position;
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
