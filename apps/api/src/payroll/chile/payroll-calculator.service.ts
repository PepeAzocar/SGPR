import { Injectable } from '@nestjs/common';

/**
 * Cálculo de liquidación de sueldo según reglas previsionales chilenas.
 *
 * Los porcentajes de AFP, plan de salud, tabla de impuesto único e indicadores
 * económicos (UF, UTM, ingreso mínimo, tope imponible) NO se hardcodean aquí:
 * se leen de los catálogos (AfpEntity, HealthInstitution, TaxBracket,
 * EconomicIndicator) para que RRHH pueda mantenerlos al día con las cifras
 * vigentes que publica el SII / Previred cada mes.
 */

export interface ChileCalculationInput {
  baseSalary: number;
  otherTaxableEarnings: number;
  nonTaxableEarnings: number;
  contractType: 'INDEFINIDO' | 'PLAZO_FIJO' | 'POR_OBRA_O_FAENA' | 'HONORARIOS';
  afpWorkerRatePct: number;
  isFonasa: boolean;
  isapreMonthlyPlanClp: number | null;
  indicators: {
    ufValue: number;
    utmValue: number;
    minWage: number;
    afpHealthCapUf: number;
  };
  taxBrackets: Array<{
    fromUtm: number;
    toUtm: number | null;
    factor: number;
    deductionUtm: number;
  }>;
}

export interface ChileCalculationResult {
  taxableEarnings: number;
  gratificacionLegal: number;
  totalEarnings: number;
  taxableBaseCapped: number;
  afpDeduction: number;
  healthDeduction: number;
  afcDeduction: number;
  taxableIncomeAfterSocialSecurity: number;
  incomeTax: number;
  totalDeductions: number;
  netPay: number;
}

@Injectable()
export class PayrollCalculatorService {
  calculate(input: ChileCalculationInput): ChileCalculationResult {
    const { indicators } = input;

    // Gratificación legal (art. 50 Código del Trabajo): 25% de lo imponible,
    // con tope mensual de 4.75 ingresos mínimos / 12.
    const preGratificationTaxable = input.baseSalary + input.otherTaxableEarnings;
    const gratificacionCap = (4.75 * indicators.minWage) / 12;
    const gratificacionLegal = Math.min(preGratificationTaxable * 0.25, gratificacionCap);

    const taxableEarnings = preGratificationTaxable + gratificacionLegal;
    const totalEarnings = taxableEarnings + input.nonTaxableEarnings;

    // Tope imponible para AFP y salud.
    const capClp = indicators.afpHealthCapUf * indicators.ufValue;
    const taxableBaseCapped = Math.min(taxableEarnings, capClp);

    const afpDeduction = round(taxableBaseCapped * (input.afpWorkerRatePct / 100));

    let healthDeduction: number;
    if (input.isFonasa) {
      healthDeduction = round(taxableBaseCapped * 0.07);
    } else {
      const legalMinimum = taxableBaseCapped * 0.07;
      healthDeduction = round(Math.max(legalMinimum, input.isapreMonthlyPlanClp ?? 0));
    }

    // Seguro de cesantía (AFC): solo trabajador con contrato indefinido cotiza (0.6%).
    const afcDeduction =
      input.contractType === 'INDEFINIDO' ? round(taxableBaseCapped * 0.006) : 0;

    const taxableIncomeAfterSocialSecurity =
      taxableEarnings - afpDeduction - healthDeduction - afcDeduction;

    const incomeTax = this.calculateIncomeTax(
      taxableIncomeAfterSocialSecurity,
      indicators.utmValue,
      input.taxBrackets,
    );

    const totalDeductions = afpDeduction + healthDeduction + afcDeduction + incomeTax;
    const netPay = totalEarnings - totalDeductions;

    return {
      taxableEarnings: round(taxableEarnings),
      gratificacionLegal: round(gratificacionLegal),
      totalEarnings: round(totalEarnings),
      taxableBaseCapped: round(taxableBaseCapped),
      afpDeduction,
      healthDeduction,
      afcDeduction,
      taxableIncomeAfterSocialSecurity: round(taxableIncomeAfterSocialSecurity),
      incomeTax: round(incomeTax),
      totalDeductions: round(totalDeductions),
      netPay: round(netPay),
    };
  }

  private calculateIncomeTax(
    taxableIncomeClp: number,
    utmValue: number,
    brackets: ChileCalculationInput['taxBrackets'],
  ): number {
    if (taxableIncomeClp <= 0 || utmValue <= 0) return 0;

    const taxableUtm = taxableIncomeClp / utmValue;
    const bracket = brackets.find(
      (b) => taxableUtm >= b.fromUtm && (b.toUtm === null || taxableUtm <= b.toUtm),
    );
    if (!bracket) return 0;

    const taxUtm = taxableUtm * bracket.factor - bracket.deductionUtm;
    return Math.max(0, taxUtm * utmValue);
  }
}

function round(value: number): number {
  return Math.round(value);
}
