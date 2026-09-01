import { useEffect, useState, type FormEvent } from 'react';
import { api, ApiError } from '../api/client';
import type { AfpEntity, EconomicIndicator, HealthInstitution, TaxBracket } from '../api/types';

type Tab = 'afp' | 'health' | 'indicators' | 'brackets';

export function CatalogsPage() {
  const [tab, setTab] = useState<Tab>('afp');

  return (
    <div>
      <h1>Catálogos previsionales</h1>
      <div className="tabs">
        <button className={tab === 'afp' ? 'active' : ''} onClick={() => setTab('afp')}>
          AFP
        </button>
        <button className={tab === 'health' ? 'active' : ''} onClick={() => setTab('health')}>
          Instituciones de salud
        </button>
        <button className={tab === 'indicators' ? 'active' : ''} onClick={() => setTab('indicators')}>
          Indicadores económicos
        </button>
        <button className={tab === 'brackets' ? 'active' : ''} onClick={() => setTab('brackets')}>
          Tabla impuesto único
        </button>
      </div>
      {tab === 'afp' && <AfpTab />}
      {tab === 'health' && <HealthTab />}
      {tab === 'indicators' && <IndicatorsTab />}
      {tab === 'brackets' && <BracketsTab />}
    </div>
  );
}

function AfpTab() {
  const [items, setItems] = useState<AfpEntity[]>([]);
  const [name, setName] = useState('');
  const [rate, setRate] = useState('');
  const [error, setError] = useState<string | null>(null);

  const load = () => api.get<AfpEntity[]>('/afp-entities').then(setItems);
  useEffect(() => {
    load().catch((err) => setError(err instanceof ApiError ? err.message : 'Error'));
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await api.post('/afp-entities', { name, workerRate: Number(rate) });
      setName('');
      setRate('');
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo crear');
    }
  }

  return (
    <div>
      {error && <p className="error">{error}</p>}
      <form className="card inline-form" onSubmit={handleSubmit}>
        <input placeholder="Nombre AFP" value={name} onChange={(e) => setName(e.target.value)} required />
        <input
          placeholder="% cotización trabajador"
          type="number"
          step="0.01"
          value={rate}
          onChange={(e) => setRate(e.target.value)}
          required
        />
        <button type="submit">Agregar</button>
      </form>
      <table className="table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>% trabajador</th>
          </tr>
        </thead>
        <tbody>
          {items.map((a) => (
            <tr key={a.id}>
              <td>{a.name}</td>
              <td>{a.workerRate}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function HealthTab() {
  const [items, setItems] = useState<HealthInstitution[]>([]);
  const [name, setName] = useState('');
  const [type, setType] = useState<'FONASA' | 'ISAPRE'>('ISAPRE');
  const [error, setError] = useState<string | null>(null);

  const load = () => api.get<HealthInstitution[]>('/health-institutions').then(setItems);
  useEffect(() => {
    load().catch((err) => setError(err instanceof ApiError ? err.message : 'Error'));
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await api.post('/health-institutions', { name, type });
      setName('');
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo crear');
    }
  }

  return (
    <div>
      {error && <p className="error">{error}</p>}
      <form className="card inline-form" onSubmit={handleSubmit}>
        <input placeholder="Nombre institución" value={name} onChange={(e) => setName(e.target.value)} required />
        <select value={type} onChange={(e) => setType(e.target.value as 'FONASA' | 'ISAPRE')}>
          <option value="ISAPRE">Isapre</option>
          <option value="FONASA">Fonasa</option>
        </select>
        <button type="submit">Agregar</button>
      </form>
      <table className="table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Tipo</th>
          </tr>
        </thead>
        <tbody>
          {items.map((h) => (
            <tr key={h.id}>
              <td>{h.name}</td>
              <td>{h.type}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function IndicatorsTab() {
  const [items, setItems] = useState<EconomicIndicator[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<EconomicIndicator[]>('/economic-indicators')
      .then(setItems)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Error'));
  }, []);

  return (
    <div>
      {error && <p className="error">{error}</p>}
      <p className="hint">
        Estos valores deben actualizarse mensualmente con las cifras vigentes publicadas por el SII / Previred.
      </p>
      <table className="table">
        <thead>
          <tr>
            <th>Período</th>
            <th>UF</th>
            <th>UTM</th>
            <th>Ingreso mínimo</th>
            <th>Tope imponible (UF)</th>
          </tr>
        </thead>
        <tbody>
          {items.map((i) => (
            <tr key={i.id}>
              <td>{new Date(i.period).toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })}</td>
              <td>${Number(i.ufValue).toLocaleString('es-CL')}</td>
              <td>${Number(i.utmValue).toLocaleString('es-CL')}</td>
              <td>${Number(i.minWage).toLocaleString('es-CL')}</td>
              <td>{i.afpHealthCapUf} UF</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BracketsTab() {
  const [items, setItems] = useState<TaxBracket[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<TaxBracket[]>('/tax-brackets')
      .then(setItems)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Error'));
  }, []);

  return (
    <div>
      {error && <p className="error">{error}</p>}
      <p className="hint">Tabla de impuesto único de segunda categoría (tramos en UTM). Verificar vigencia en sii.cl.</p>
      <table className="table">
        <thead>
          <tr>
            <th>Desde (UTM)</th>
            <th>Hasta (UTM)</th>
            <th>Factor</th>
            <th>Rebaja (UTM)</th>
          </tr>
        </thead>
        <tbody>
          {items.map((b) => (
            <tr key={b.id}>
              <td>{b.fromUtm}</td>
              <td>{b.toUtm ?? 'Sin tope'}</td>
              <td>{b.factor}</td>
              <td>{b.deductionUtm}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
