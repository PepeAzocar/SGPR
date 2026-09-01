export interface Department {
  id: string;
  name: string;
  parentId: string | null;
}

export interface Position {
  id: string;
  title: string;
  departmentId: string;
  department?: Department;
}

export interface AfpEntity {
  id: string;
  name: string;
  workerRate: string;
  isActive: boolean;
}

export interface HealthInstitution {
  id: string;
  name: string;
  type: 'FONASA' | 'ISAPRE';
  isActive: boolean;
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
