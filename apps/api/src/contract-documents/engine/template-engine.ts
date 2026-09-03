/**
 * Motor de renderizado de plantillas contractuales: sustitución de tokens
 * ({{namespace.path}}, con pipes de formato {{namespace.path|formatter}} /
 * {{namespace.path|formatter:arg}}) y bloques condicionales simples
 * ({{#if namespace.path}}...{{/if}}). Parser manual, sin `eval` ni motor de
 * plantillas genérico de terceros — mismo espíritu que formula-engine.ts.
 *
 * La resolución de valores no vive aquí: se recibe como una función
 * `resolveToken(path)` inyectada por quien llama (ver token-resolvers.ts),
 * de forma que este archivo sólo entiende sintaxis, nunca de dónde vienen
 * los datos.
 */
import { FORMATTERS } from './formatters.js';

export class TemplateError extends Error {}

/** Marca un valor resuelto como HTML de confianza que no debe escaparse (ej. cláusulas ya renderizadas). */
export class RawHtml {
  constructor(public html: string) {}
}

type Node =
  | { kind: 'text'; value: string }
  | { kind: 'token'; path: string; formatter?: string; arg?: string }
  | { kind: 'if'; path: string; children: Node[] };

function parseTemplate(source: string): Node[] {
  let pos = 0;

  function parseUntil(closingTag: '/if' | null): Node[] {
    const nodes: Node[] = [];
    while (pos < source.length) {
      const open = source.indexOf('{{', pos);
      if (open === -1) {
        nodes.push({ kind: 'text', value: source.slice(pos) });
        pos = source.length;
        break;
      }
      if (open > pos) {
        nodes.push({ kind: 'text', value: source.slice(pos, open) });
      }
      const close = source.indexOf('}}', open + 2);
      if (close === -1) {
        throw new TemplateError(`Falta "}}" para la expresión abierta en la posición ${open}`);
      }
      const inner = source.slice(open + 2, close).trim();
      pos = close + 2;

      if (inner.startsWith('#if ')) {
        const path = inner.slice(4).trim();
        if (!path) throw new TemplateError(`"{{#if}}" sin condición en la posición ${open}`);
        const children = parseUntil('/if');
        nodes.push({ kind: 'if', path, children });
        continue;
      }
      if (inner === '/if') {
        if (closingTag !== '/if') {
          throw new TemplateError(`"{{/if}}" sin un "{{#if}}" que lo abra, en la posición ${open}`);
        }
        return nodes;
      }

      const [pathPart, ...pipeParts] = inner.split('|');
      const path = pathPart.trim();
      if (!path) throw new TemplateError(`Token vacío en la posición ${open}`);
      if (pipeParts.length > 0) {
        const [formatter, arg] = pipeParts.join('|').trim().split(':').map((s) => s.trim());
        nodes.push({ kind: 'token', path, formatter, arg });
      } else {
        nodes.push({ kind: 'token', path });
      }
    }
    if (closingTag) {
      throw new TemplateError(`Falta "{{/if}}" para cerrar un "{{#if}}" abierto`);
    }
    return nodes;
  }

  return parseUntil(null);
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function truthy(v: unknown): boolean {
  return v !== undefined && v !== null && v !== false && v !== '' && v !== 0;
}

export interface UsedToken {
  code: string;
  raw: unknown;
  formatted: string;
}

export interface RenderResult {
  html: string;
  usedTokens: UsedToken[];
  missingTokens: string[];
}

/**
 * Renderiza una plantilla contra un resolver de tokens. No lanza por tokens
 * desconocidos (quedan en `missingTokens`, para que el llamador decida si
 * bloquea o sólo advierte); sí lanza TemplateError por sintaxis inválida o
 * un formateador desconocido.
 */
export function renderTemplate(content: string, resolveToken: (path: string) => unknown): RenderResult {
  const nodes = parseTemplate(content);
  const usedTokens = new Map<string, UsedToken>();
  const missing = new Set<string>();

  function resolve(path: string): unknown {
    const value = resolveToken(path);
    if (value === undefined) missing.add(path);
    return value;
  }

  function renderNodes(list: Node[]): string {
    let out = '';
    for (const node of list) {
      if (node.kind === 'text') {
        out += node.value;
        continue;
      }
      if (node.kind === 'if') {
        const value = resolve(node.path);
        if (!usedTokens.has(node.path)) usedTokens.set(node.path, { code: node.path, raw: value, formatted: String(!!truthy(value)) });
        if (truthy(value)) out += renderNodes(node.children);
        continue;
      }
      // token
      const value = resolve(node.path);
      if (value instanceof RawHtml) {
        out += value.html;
        continue;
      }
      let formatted: string;
      if (node.formatter) {
        const fn = FORMATTERS[node.formatter];
        if (!fn) throw new TemplateError(`Formateador desconocido: ${node.formatter}`);
        formatted = fn(value, node.arg);
      } else {
        formatted = value == null ? '' : String(value);
      }
      if (!usedTokens.has(node.path)) usedTokens.set(node.path, { code: node.path, raw: value, formatted });
      out += escapeHtml(formatted);
    }
    return out;
  }

  const html = renderNodes(nodes);
  return { html, usedTokens: Array.from(usedTokens.values()), missingTokens: Array.from(missing) };
}

/** Extrae los tokens (sin resolver nada) que una plantilla referencia, para validarla contra el catálogo. */
export function extractTemplateTokens(content: string): string[] {
  const codes = new Set<string>();
  function walk(nodes: Node[]) {
    for (const node of nodes) {
      if (node.kind === 'token' || node.kind === 'if') codes.add(node.path);
      if (node.kind === 'if') walk(node.children);
    }
  }
  walk(parseTemplate(content));
  return Array.from(codes);
}
