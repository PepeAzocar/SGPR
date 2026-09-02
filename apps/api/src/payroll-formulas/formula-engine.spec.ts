import { describe, expect, it } from 'vitest';
import { evaluateFormula, extractVariables, FormulaError } from './formula-engine.js';

describe('formula-engine', () => {
  it('evalúa aritmética básica con variables', () => {
    const result = evaluateFormula('SUELDO_BASE * PORC_RESPONSABILIDAD', {
      variables: { SUELDO_BASE: 1500000, PORC_RESPONSABILIDAD: 0.1 },
    });
    expect(result).toBe(150000);
  });

  it('respeta la precedencia de operadores', () => {
    expect(evaluateFormula('2 + 3 * 4', { variables: {} })).toBe(14);
    expect(evaluateFormula('(2 + 3) * 4', { variables: {} })).toBe(20);
  });

  it('evalúa el ejemplo de jornada parcial del enunciado', () => {
    const formula =
      'IF(HORAS_SEMANALES >= 44, SUELDO_BASE * 0.10, SUELDO_BASE * 0.10 * HORAS_SEMANALES / 44)';
    expect(evaluateFormula(formula, { variables: { HORAS_SEMANALES: 44, SUELDO_BASE: 1000000 } })).toBe(100000);
    expect(evaluateFormula(formula, { variables: { HORAS_SEMANALES: 22, SUELDO_BASE: 1000000 } })).toBe(50000);
  });

  it('soporta ROUND, MIN, MAX, ABS, SUM', () => {
    expect(evaluateFormula('ROUND(10.567, 2)', { variables: {} })).toBe(10.57);
    expect(evaluateFormula('MIN(5, 2, 9)', { variables: {} })).toBe(2);
    expect(evaluateFormula('MAX(5, 2, 9)', { variables: {} })).toBe(9);
    expect(evaluateFormula('ABS(-7)', { variables: {} })).toBe(7);
    expect(evaluateFormula('SUM(1, 2, 3, 4)', { variables: {} })).toBe(10);
  });

  it('aplica un tope con MIN', () => {
    const formula = 'MIN(SUELDO_BASE, TOPE)';
    expect(evaluateFormula(formula, { variables: { SUELDO_BASE: 2000000, TOPE: 1800000 } })).toBe(1800000);
  });

  it('resuelve LOOKUP contra una tabla de tramos', () => {
    const formula = 'LOOKUP(TABLA_IMPUESTO, BASE_TRIBUTABLE)';
    const ctx = {
      variables: { BASE_TRIBUTABLE: 700000 },
      tables: {
        TABLA_IMPUESTO: [
          { from: 0, to: 500000, value: 0 },
          { from: 500001, to: 1000000, value: 0.04 },
          { from: 1000001, to: null, value: 0.08 },
        ],
      },
    };
    expect(evaluateFormula(formula, ctx)).toBe(0.04);
  });

  it('evalúa condiciones con AND/OR y comparadores', () => {
    expect(evaluateFormula('A > 10 AND B < 5', { variables: { A: 20, B: 1 } })).toBe(1);
    expect(evaluateFormula('A > 10 AND B < 5', { variables: { A: 5, B: 1 } })).toBe(0);
    expect(evaluateFormula('A = 1 OR B = 1', { variables: { A: 0, B: 1 } })).toBe(1);
  });

  it('lanza FormulaError ante una variable desconocida', () => {
    expect(() => evaluateFormula('X + 1', { variables: {} })).toThrow(FormulaError);
  });

  it('lanza FormulaError ante división por cero', () => {
    expect(() => evaluateFormula('1 / 0', { variables: {} })).toThrow(FormulaError);
  });

  it('lanza FormulaError ante una expresión con sintaxis inválida', () => {
    expect(() => evaluateFormula('SUELDO_BASE *', { variables: { SUELDO_BASE: 1 } })).toThrow(FormulaError);
    expect(() => evaluateFormula('(1 + 2', { variables: {} })).toThrow(FormulaError);
  });

  it('rechaza sin caracteres no reconocidos (ej. intento de código)', () => {
    expect(() => evaluateFormula('eval("1+1")', { variables: {} })).toThrow(FormulaError);
  });

  it('extrae las variables usadas en una fórmula, sin confundir el nombre de tabla de LOOKUP', () => {
    const vars = extractVariables('IF(A > B, LOOKUP(TABLA_X, C), D)');
    expect(vars.sort()).toEqual(['A', 'B', 'C', 'D']);
  });
});
