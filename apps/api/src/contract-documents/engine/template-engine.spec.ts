import { describe, expect, it } from 'vitest';
import { extractTemplateTokens, RawHtml, renderTemplate, TemplateError } from './template-engine.js';

describe('template-engine', () => {
  it('sustituye tokens simples y escapa HTML', () => {
    const result = renderTemplate('Hola {{employee.fullName}}', (path) =>
      path === 'employee.fullName' ? 'Juan <Pérez>' : undefined,
    );
    expect(result.html).toBe('Hola Juan &lt;Pérez&gt;');
    expect(result.usedTokens).toEqual([{ code: 'employee.fullName', raw: 'Juan <Pérez>', formatted: 'Juan <Pérez>' }]);
  });

  it('aplica formateadores con y sin argumento', () => {
    const values: Record<string, unknown> = {
      'contract.startDate': '2026-09-01T00:00:00.000Z',
      'compensation.baseSalary': 1250000,
      'workSchedule.weeklyHours': 44.5,
      'employee.rut': '123456785',
    };
    const resolve = (path: string) => values[path];
    expect(renderTemplate('{{contract.startDate|dateLong}}', resolve).html).toBe('1 de septiembre de 2026');
    expect(renderTemplate('{{compensation.baseSalary|currencyCLP}}', resolve).html).toBe('$1.250.000');
    expect(renderTemplate('{{compensation.baseSalary|currencyCLPWords}}', resolve).html).toContain('un millón doscientos cincuenta mil pesos');
    expect(renderTemplate('{{workSchedule.weeklyHours|decimal:1}}', resolve).html).toBe('44.5');
    expect(renderTemplate('{{employee.rut|rut}}', resolve).html).toBe('12.345.678-5');
  });

  it('evalúa bloques {{#if}} según verdad del token', () => {
    const template = 'A{{#if contract.isFixedTerm}}B{{/if}}C';
    expect(renderTemplate(template, () => true).html).toBe('ABC');
    expect(renderTemplate(template, () => false).html).toBe('AC');
    expect(renderTemplate(template, () => undefined).html).toBe('AC');
  });

  it('registra tokens desconocidos en missingTokens sin lanzar', () => {
    const result = renderTemplate('{{employee.noExiste}}', () => undefined);
    expect(result.missingTokens).toEqual(['employee.noExiste']);
    expect(result.html).toBe('');
  });

  it('lanza TemplateError por sintaxis inválida', () => {
    expect(() => renderTemplate('{{employee.fullName', () => 'x')).toThrow(TemplateError);
    expect(() => renderTemplate('{{/if}}', () => 'x')).toThrow(TemplateError);
    expect(() => renderTemplate('{{#if a}}sin cerrar', () => true)).toThrow(TemplateError);
  });

  it('lanza TemplateError por formateador desconocido', () => {
    expect(() => renderTemplate('{{a|noExiste}}', () => 'x')).toThrow(TemplateError);
  });

  it('inserta RawHtml sin escapar (expansión de cláusulas)', () => {
    const result = renderTemplate('Antes {{clauses}} después', (path) =>
      path === 'clauses' ? new RawHtml('<p>Cláusula <b>uno</b></p>') : undefined,
    );
    expect(result.html).toBe('Antes <p>Cláusula <b>uno</b></p> después');
  });

  it('extractTemplateTokens detecta tokens dentro y fuera de {{#if}}', () => {
    const tokens = extractTemplateTokens('{{a.b}} {{#if c.d}}{{e.f|uppercase}}{{/if}}');
    expect(tokens.sort()).toEqual(['a.b', 'c.d', 'e.f']);
  });
});
