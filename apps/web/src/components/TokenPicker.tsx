import { useMemo, type RefObject } from 'react';
import type { DocumentTokenDefinition } from '../api/types';

interface TokenPickerProps {
  tokens: DocumentTokenDefinition[];
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  value: string;
  onChange: (next: string) => void;
}

/**
 * Panel lateral de tokens agrupados por namespace: al hacer clic en uno,
 * inserta "{{namespace.code}}" en la posición del cursor del textarea
 * referenciado. No hay editor rich-text en el proyecto — se usa
 * selectionStart/selectionEnd directamente sobre el textarea, mismo enfoque
 * "sin librerías nuevas" que el resto del frontend.
 */
export function TokenPicker({ tokens, textareaRef, value, onChange }: TokenPickerProps) {
  const grouped = useMemo(() => {
    const byNamespace = new Map<string, DocumentTokenDefinition[]>();
    for (const t of tokens) {
      if (!t.active) continue;
      const list = byNamespace.get(t.namespace) ?? [];
      list.push(t);
      byNamespace.set(t.namespace, list);
    }
    return Array.from(byNamespace.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [tokens]);

  function insertToken(code: string) {
    const el = textareaRef.current;
    const snippet = `{{${code}}}`;
    if (!el) {
      onChange(value + snippet);
      return;
    }
    const start = el.selectionStart ?? value.length;
    const end = el.selectionEnd ?? value.length;
    const next = value.slice(0, start) + snippet + value.slice(end);
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + snippet.length;
      el.setSelectionRange(pos, pos);
    });
  }

  return (
    <div className="token-picker">
      <p className="hint" style={{ marginTop: 0 }}>
        Insertar token
      </p>
      {grouped.map(([namespace, items]) => (
        <div key={namespace} className="token-picker-group">
          <div className="token-picker-namespace">{namespace}</div>
          {items.map((t) => (
            <button
              key={t.code}
              type="button"
              className="token-picker-item"
              title={t.description ?? t.code}
              onClick={() => insertToken(t.code)}
            >
              {t.name}
            </button>
          ))}
        </div>
      ))}
      {grouped.length === 0 && <p className="hint">Sin tokens activos en el catálogo.</p>}
    </div>
  );
}
