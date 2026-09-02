/**
 * Motor de expresiones para fórmulas de remuneraciones: un lenguaje muy
 * limitado (variables, operadores aritméticos/comparación, AND/OR, y un
 * puñado de funciones) — nunca `eval()` ni código JS/Python/Java arbitrario.
 *
 * Gramática:
 *   expr       := orExpr
 *   orExpr     := andExpr ( OR andExpr )*
 *   andExpr    := comparison ( AND comparison )*
 *   comparison := additive ( ('>'|'<'|'>='|'<='|'='|'<>') additive )?
 *   additive   := multiplicative ( ('+'|'-') multiplicative )*
 *   multiplicative := unary ( ('*'|'/') unary )*
 *   unary      := '-' unary | primary
 *   primary    := NUMBER | IDENTIFIER | funcCall | '(' expr ')'
 *   funcCall   := IDENTIFIER '(' ( expr (',' expr)* )? ')'
 *
 * Funciones soportadas: IF, ROUND, MIN, MAX, SUM, ABS, LOOKUP.
 */

export class FormulaError extends Error {}

export interface TableRow {
  from: number;
  to: number | null;
  value: number;
}

export interface FormulaContext {
  variables: Record<string, number>;
  tables?: Record<string, TableRow[]>;
}

// ---------------------------------------------------------------------------
// Tokenizer
// ---------------------------------------------------------------------------

type TokenType =
  | 'NUMBER'
  | 'IDENTIFIER'
  | 'OP'
  | 'LPAREN'
  | 'RPAREN'
  | 'COMMA'
  | 'EOF';

interface Token {
  type: TokenType;
  value: string;
  pos: number;
}

const KEYWORDS = new Set(['AND', 'OR', 'NOT']);
const MULTI_CHAR_OPS = ['>=', '<=', '<>'];
const SINGLE_CHAR_OPS = new Set(['+', '-', '*', '/', '>', '<', '=']);

function tokenize(source: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const n = source.length;

  while (i < n) {
    const ch = source[i];

    if (/\s/.test(ch)) {
      i++;
      continue;
    }

    if (/[0-9]/.test(ch) || (ch === '.' && /[0-9]/.test(source[i + 1] ?? ''))) {
      const start = i;
      while (i < n && /[0-9]/.test(source[i])) i++;
      if (source[i] === '.') {
        i++;
        while (i < n && /[0-9]/.test(source[i])) i++;
      }
      tokens.push({ type: 'NUMBER', value: source.slice(start, i), pos: start });
      continue;
    }

    if (/[A-Za-z_]/.test(ch)) {
      const start = i;
      while (i < n && /[A-Za-z0-9_]/.test(source[i])) i++;
      tokens.push({ type: 'IDENTIFIER', value: source.slice(start, i), pos: start });
      continue;
    }

    if (ch === '(') {
      tokens.push({ type: 'LPAREN', value: ch, pos: i });
      i++;
      continue;
    }
    if (ch === ')') {
      tokens.push({ type: 'RPAREN', value: ch, pos: i });
      i++;
      continue;
    }
    if (ch === ',') {
      tokens.push({ type: 'COMMA', value: ch, pos: i });
      i++;
      continue;
    }

    const two = source.slice(i, i + 2);
    if (MULTI_CHAR_OPS.includes(two)) {
      tokens.push({ type: 'OP', value: two, pos: i });
      i += 2;
      continue;
    }
    if (SINGLE_CHAR_OPS.has(ch)) {
      tokens.push({ type: 'OP', value: ch, pos: i });
      i++;
      continue;
    }

    throw new FormulaError(`Carácter no reconocido "${ch}" en la posición ${i}`);
  }

  tokens.push({ type: 'EOF', value: '', pos: n });
  return tokens;
}

// ---------------------------------------------------------------------------
// AST
// ---------------------------------------------------------------------------

export type AstNode =
  | { kind: 'number'; value: number }
  | { kind: 'variable'; name: string }
  | { kind: 'unary'; op: '-' | 'NOT'; operand: AstNode }
  | { kind: 'binary'; op: string; left: AstNode; right: AstNode }
  | { kind: 'call'; name: string; args: AstNode[] };

// ---------------------------------------------------------------------------
// Parser (recursive descent)
// ---------------------------------------------------------------------------

class Parser {
  private tokens: Token[];
  private pos = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  private peek(): Token {
    return this.tokens[this.pos];
  }

  private next(): Token {
    return this.tokens[this.pos++];
  }

  private expect(type: TokenType, value?: string): Token {
    const t = this.peek();
    if (t.type !== type || (value !== undefined && t.value.toUpperCase() !== value)) {
      throw new FormulaError(`Se esperaba "${value ?? type}" en la posición ${t.pos}, se encontró "${t.value || 'fin de expresión'}"`);
    }
    return this.next();
  }

  private isKeyword(word: string): boolean {
    const t = this.peek();
    return t.type === 'IDENTIFIER' && t.value.toUpperCase() === word;
  }

  parse(): AstNode {
    const node = this.parseOr();
    this.expect('EOF');
    return node;
  }

  private parseOr(): AstNode {
    let left = this.parseAnd();
    while (this.isKeyword('OR')) {
      this.next();
      const right = this.parseAnd();
      left = { kind: 'binary', op: 'OR', left, right };
    }
    return left;
  }

  private parseAnd(): AstNode {
    let left = this.parseComparison();
    while (this.isKeyword('AND')) {
      this.next();
      const right = this.parseComparison();
      left = { kind: 'binary', op: 'AND', left, right };
    }
    return left;
  }

  private parseComparison(): AstNode {
    const left = this.parseAdditive();
    const t = this.peek();
    if (t.type === 'OP' && ['>', '<', '>=', '<=', '=', '<>'].includes(t.value)) {
      this.next();
      const right = this.parseAdditive();
      return { kind: 'binary', op: t.value, left, right };
    }
    return left;
  }

  private parseAdditive(): AstNode {
    let left = this.parseMultiplicative();
    while (this.peek().type === 'OP' && (this.peek().value === '+' || this.peek().value === '-')) {
      const op = this.next().value;
      const right = this.parseMultiplicative();
      left = { kind: 'binary', op, left, right };
    }
    return left;
  }

  private parseMultiplicative(): AstNode {
    let left = this.parseUnary();
    while (this.peek().type === 'OP' && (this.peek().value === '*' || this.peek().value === '/')) {
      const op = this.next().value;
      const right = this.parseUnary();
      left = { kind: 'binary', op, left, right };
    }
    return left;
  }

  private parseUnary(): AstNode {
    if (this.peek().type === 'OP' && this.peek().value === '-') {
      this.next();
      return { kind: 'unary', op: '-', operand: this.parseUnary() };
    }
    if (this.isKeyword('NOT')) {
      this.next();
      return { kind: 'unary', op: 'NOT', operand: this.parseUnary() };
    }
    return this.parsePrimary();
  }

  private parsePrimary(): AstNode {
    const t = this.peek();

    if (t.type === 'NUMBER') {
      this.next();
      return { kind: 'number', value: Number(t.value) };
    }

    if (t.type === 'LPAREN') {
      this.next();
      const node = this.parseOr();
      this.expect('RPAREN');
      return node;
    }

    if (t.type === 'IDENTIFIER') {
      const upper = t.value.toUpperCase();
      if (KEYWORDS.has(upper)) {
        throw new FormulaError(`Uso inesperado de "${t.value}" en la posición ${t.pos}`);
      }
      this.next();
      if (this.peek().type === 'LPAREN') {
        this.next();
        const args: AstNode[] = [];
        if (this.peek().type !== 'RPAREN') {
          args.push(this.parseOr());
          while (this.peek().type === 'COMMA') {
            this.next();
            args.push(this.parseOr());
          }
        }
        this.expect('RPAREN');
        return { kind: 'call', name: upper, args };
      }
      return { kind: 'variable', name: t.value };
    }

    throw new FormulaError(`Expresión inválida en la posición ${t.pos}: "${t.value || 'fin de expresión'}"`);
  }
}

export function parseFormula(expression: string): AstNode {
  return new Parser(tokenize(expression)).parse();
}

// ---------------------------------------------------------------------------
// Evaluator
// ---------------------------------------------------------------------------

const FUNCTIONS = new Set(['IF', 'ROUND', 'MIN', 'MAX', 'SUM', 'ABS', 'LOOKUP']);

function evalNode(node: AstNode, ctx: FormulaContext): number {
  switch (node.kind) {
    case 'number':
      return node.value;

    case 'variable': {
      const v = ctx.variables[node.name];
      if (v === undefined) {
        throw new FormulaError(`Variable desconocida: ${node.name}`);
      }
      return v;
    }

    case 'unary': {
      const v = evalNode(node.operand, ctx);
      return node.op === '-' ? -v : v === 0 ? 1 : 0;
    }

    case 'binary': {
      const { op } = node;
      // Cortocircuito para AND/OR, igual que en cualquier lenguaje de expresiones.
      if (op === 'AND') return evalNode(node.left, ctx) !== 0 && evalNode(node.right, ctx) !== 0 ? 1 : 0;
      if (op === 'OR') return evalNode(node.left, ctx) !== 0 || evalNode(node.right, ctx) !== 0 ? 1 : 0;

      const l = evalNode(node.left, ctx);
      const r = evalNode(node.right, ctx);
      switch (op) {
        case '+':
          return l + r;
        case '-':
          return l - r;
        case '*':
          return l * r;
        case '/':
          if (r === 0) throw new FormulaError('División por cero');
          return l / r;
        case '>':
          return l > r ? 1 : 0;
        case '<':
          return l < r ? 1 : 0;
        case '>=':
          return l >= r ? 1 : 0;
        case '<=':
          return l <= r ? 1 : 0;
        case '=':
          return l === r ? 1 : 0;
        case '<>':
          return l !== r ? 1 : 0;
        default:
          throw new FormulaError(`Operador no soportado: ${op}`);
      }
    }

    case 'call':
      return evalCall(node, ctx);
  }
}

function evalCall(node: { name: string; args: AstNode[] }, ctx: FormulaContext): number {
  if (!FUNCTIONS.has(node.name)) {
    throw new FormulaError(`Función desconocida: ${node.name}`);
  }

  switch (node.name) {
    case 'IF': {
      if (node.args.length !== 3) throw new FormulaError('IF requiere 3 argumentos: IF(condición, si_verdadero, si_falso)');
      const cond = evalNode(node.args[0], ctx);
      return cond !== 0 ? evalNode(node.args[1], ctx) : evalNode(node.args[2], ctx);
    }
    case 'ROUND': {
      if (node.args.length < 1 || node.args.length > 2) throw new FormulaError('ROUND requiere 1 o 2 argumentos: ROUND(valor[, decimales])');
      const value = evalNode(node.args[0], ctx);
      const decimals = node.args[1] ? evalNode(node.args[1], ctx) : 0;
      const factor = 10 ** decimals;
      return Math.round(value * factor) / factor;
    }
    case 'ABS': {
      if (node.args.length !== 1) throw new FormulaError('ABS requiere 1 argumento');
      return Math.abs(evalNode(node.args[0], ctx));
    }
    case 'MIN': {
      if (node.args.length === 0) throw new FormulaError('MIN requiere al menos 1 argumento');
      return Math.min(...node.args.map((a) => evalNode(a, ctx)));
    }
    case 'MAX': {
      if (node.args.length === 0) throw new FormulaError('MAX requiere al menos 1 argumento');
      return Math.max(...node.args.map((a) => evalNode(a, ctx)));
    }
    case 'SUM': {
      return node.args.reduce((acc, a) => acc + evalNode(a, ctx), 0);
    }
    case 'LOOKUP': {
      if (node.args.length !== 2) throw new FormulaError('LOOKUP requiere 2 argumentos: LOOKUP(TABLA, valor)');
      const tableArg = node.args[0];
      if (tableArg.kind !== 'variable') {
        throw new FormulaError('El primer argumento de LOOKUP debe ser el código de una tabla, ej. LOOKUP(TABLA_IMPUESTO, BASE)');
      }
      const tableName = tableArg.name;
      const table = ctx.tables?.[tableName];
      if (!table) throw new FormulaError(`Tabla desconocida: ${tableName}`);
      const value = evalNode(node.args[1], ctx);
      const row = table.find((r) => value >= r.from && (r.to === null || value <= r.to));
      if (!row) throw new FormulaError(`Sin tramo definido en ${tableName} para el valor ${value}`);
      return row.value;
    }
    default:
      throw new FormulaError(`Función no implementada: ${node.name}`);
  }
}

/** Parsea y evalúa una expresión del DSL en una sola llamada. */
export function evaluateFormula(expression: string, ctx: FormulaContext): number {
  const ast = parseFormula(expression);
  return evalNode(ast, ctx);
}

/** Extrae los nombres de variable que una fórmula referencia (para mostrarlas en la UI). */
export function extractVariables(expression: string): string[] {
  const names = new Set<string>();
  function walk(node: AstNode) {
    if (node.kind === 'variable') names.add(node.name);
    else if (node.kind === 'unary') walk(node.operand);
    else if (node.kind === 'binary') {
      walk(node.left);
      walk(node.right);
    } else if (node.kind === 'call') {
      node.args.forEach((a, i) => {
        // El primer argumento de LOOKUP es el nombre de una tabla, no una variable.
        if (node.name === 'LOOKUP' && i === 0) return;
        walk(a);
      });
    }
  }
  walk(parseFormula(expression));
  return Array.from(names);
}
