import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { api, ApiError } from '../api/client';
import { downloadListPdf } from '../lib/listPdf';

export type FieldType = 'text' | 'textarea' | 'date' | 'select' | 'number' | 'boolean';

export interface FieldOptionSource {
  resource: string;
  labelKey?: string; // default 'name'
}

export interface FieldConfig {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  maxLength?: number;
  options?: FieldOptionSource;
  staticOptions?: { value: string; label: string }[];
}

export interface ColumnConfig {
  key: string;
  label: string;
  render?: (row: any) => ReactNode;
  format?: (value: unknown, row: any) => string;
}

export interface OrgMaintainerConfig {
  title: string;
  resource: string;
  columns: ColumnConfig[];
  fields: FieldConfig[];
  canWrite: boolean;
  rowLabel?: (row: any) => string;
}

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Activo' },
  { value: 'INACTIVE', label: 'Inactivo' },
];

function getPath(obj: any, path: string): any {
  return path.split('.').reduce((acc, key) => (acc == null ? acc : acc[key]), obj);
}

function cellText(col: ColumnConfig, row: any): string {
  const value = getPath(row, col.key);
  if (col.format) return col.format(value, row);
  if (value == null || value === '') return '-';
  return String(value);
}

export function OrgMaintainerPage({ title, resource, columns, fields, canWrite, rowLabel }: OrgMaintainerConfig) {
  const [items, setItems] = useState<any[]>([]);
  const [optionsCache, setOptionsCache] = useState<Record<string, any[]>>({});
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    setItems(await api.get<any[]>(resource));
  }

  useEffect(() => {
    load().catch((err) => setError(err instanceof ApiError ? err.message : 'Error al cargar'));
    const optionFields = fields.filter((f) => f.options);
    if (optionFields.length > 0) {
      Promise.all(optionFields.map((f) => api.get<any[]>(f.options!.resource).then((data) => [f.key, data] as const)))
        .then((entries) => setOptionsCache(Object.fromEntries(entries)))
        .catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resource]);

  function blankForm(): Record<string, string> {
    const initial: Record<string, string> = {};
    fields.forEach((f) => {
      if (f.key === 'status') initial[f.key] = 'ACTIVE';
      else if (f.type === 'boolean') initial[f.key] = 'true';
      else initial[f.key] = '';
    });
    return initial;
  }

  function openCreate() {
    setForm(blankForm());
    setEditing({});
  }

  function openEdit(row: any) {
    const initial: Record<string, string> = {};
    fields.forEach((f) => {
      const v = getPath(row, f.key);
      initial[f.key] = f.type === 'date' && v ? String(v).slice(0, 10) : v == null ? '' : String(v);
    });
    setForm(initial);
    setEditing(row);
  }

  function closeForm() {
    setEditing(null);
    setForm({});
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const payload: Record<string, unknown> = {};
    for (const f of fields) {
      const raw = form[f.key];
      if (raw === '') {
        payload[f.key] = undefined;
      } else if (f.type === 'number') {
        payload[f.key] = Number(raw);
      } else if (f.type === 'boolean') {
        payload[f.key] = raw === 'true';
      } else {
        payload[f.key] = raw;
      }
    }
    try {
      if (editing?.id) {
        await api.patch(`${resource}/${editing.id}`, payload);
      } else {
        await api.post(resource, payload);
      }
      closeForm();
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo guardar el registro');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(row: any) {
    const label = rowLabel ? rowLabel(row) : (row.name ?? row.title ?? row.id);
    if (!window.confirm(`¿Eliminar "${label}"? Esta acción no se puede deshacer.`)) return;
    setError(null);
    try {
      await api.delete(`${resource}/${row.id}`);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo eliminar el registro');
    }
  }

  function handlePdf() {
    downloadListPdf(
      title,
      columns.map((c) => ({ header: c.label, accessor: (row: unknown) => cellText(c, row) })),
      items,
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1>{title}</h1>
        <div className="row-actions">
          <button onClick={handlePdf}>Generar PDF</button>
          {canWrite && <button onClick={openCreate}>Agregar</button>}
        </div>
      </div>
      {error && <p className="error">{error}</p>}

      {editing && canWrite && (
        <form className="card form-grid" onSubmit={handleSubmit}>
          {fields.map((f) => (
            <label key={f.key}>
              {f.label}
              {f.type === 'select' || f.type === 'boolean' ? (
                <select
                  required={f.required}
                  value={form[f.key] ?? ''}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                >
                  {f.type === 'select' && <option value="">-- Seleccionar --</option>}
                  {(
                    f.type === 'boolean'
                      ? [
                          { value: 'true', label: 'Activo' },
                          { value: 'false', label: 'Inactivo' },
                        ]
                      : (f.staticOptions ??
                        (optionsCache[f.key] ?? []).map((o) => ({ value: o.id, label: o[f.options?.labelKey ?? 'name'] })))
                  ).map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : f.type === 'textarea' ? (
                <textarea
                  value={form[f.key] ?? ''}
                  maxLength={f.maxLength}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                />
              ) : (
                <input
                  type={f.type === 'date' ? 'date' : f.type === 'number' ? 'number' : 'text'}
                  step={f.type === 'number' ? 'any' : undefined}
                  required={f.required}
                  maxLength={f.maxLength}
                  value={form[f.key] ?? ''}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                />
              )}
            </label>
          ))}
          <div className="form-actions row-actions">
            <button type="submit" disabled={saving}>
              {editing.id ? 'Guardar cambios' : 'Crear'}
            </button>
            <button type="button" onClick={closeForm} disabled={saving}>
              Cancelar
            </button>
          </div>
        </form>
      )}

      <table className="table">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key}>{c.label}</th>
            ))}
            {canWrite && <th>Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {items.map((row) => (
            <tr key={row.id}>
              {columns.map((c) => (
                <td key={c.key}>{c.render ? c.render(row) : cellText(c, row)}</td>
              ))}
              {canWrite && (
                <td className="row-actions">
                  <button onClick={() => openEdit(row)}>Editar</button>
                  <button className="danger-btn" onClick={() => handleDelete(row)}>
                    Eliminar
                  </button>
                </td>
              )}
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td className="empty" colSpan={columns.length + (canWrite ? 1 : 0)}>
                Sin registros.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export { STATUS_OPTIONS };
