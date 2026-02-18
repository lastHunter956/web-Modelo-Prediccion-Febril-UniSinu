'use client';
import { useState, useEffect, useMemo, Fragment } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getEvaluaciones } from '../../lib/api';
import { IconSearch, IconHistory, IconEvaluation, IconChevronLeft, IconChevronRight, IconEdit } from '../../components/Icons';

function getBadgeClass(severity) {
  if (severity === 'Leve') return 'badge badge-low';
  if (severity === 'Moderada') return 'badge badge-mid';
  return 'badge badge-high';
}

const ITEMS_PER_PAGE = 8;

export default function HistorialPage() {
  const { supabase } = useAuth();
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('Todas');
  const [page, setPage] = useState(1);
  const [expandedRow, setExpandedRow] = useState(null);
  const [observaciones, setObservaciones] = useState({});

  useEffect(() => {
    loadEvaluaciones();
  }, []);

  async function loadEvaluaciones() {
    setLoading(true);
    try {
      const { data } = await getEvaluaciones(supabase, { limit: 200 });
      setEvaluaciones(data || []);
      // Load mocked observations from local storage if any
      const savedObs = localStorage.getItem('clinical_observations');
      if (savedObs) setObservaciones(JSON.parse(savedObs));
    } catch (err) {
      console.error('Error cargando historial:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleEditObservation = (e, id) => {
    e.stopPropagation();
    const current = observaciones[id] || '';
    const newVal = prompt('Observación clínica (ej: "Diagnóstico confirmado"):', current);
    if (newVal !== null) {
      const newObs = { ...observaciones, [id]: newVal };
      setObservaciones(newObs);
      localStorage.setItem('clinical_observations', JSON.stringify(newObs));
    }
  };

  const filtered = useMemo(() => {
    return evaluaciones.filter((e) => {
      const q = search.toLowerCase();
      const datos = e.datos_paciente || {};
      const matchesSearch =
        !q ||
        e.prediccion?.toLowerCase().includes(q) ||
        datos.grupo_edad?.toLowerCase().includes(q) ||
        datos.triage?.toLowerCase().includes(q);
      const matchesSeverity =
        filterSeverity === 'Todas' || e.prediccion === filterSeverity;
      return matchesSearch && matchesSeverity;
    });
  }, [evaluaciones, search, filterSeverity]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const stats = useMemo(() => ({
    total: evaluaciones.length,
    leve: evaluaciones.filter((e) => e.prediccion_codigo === 0).length,
    moderada: evaluaciones.filter((e) => e.prediccion_codigo === 1).length,
    severa: evaluaciones.filter((e) => e.prediccion_codigo === 2).length,
  }), [evaluaciones]);

  const handlePageChange = (p) => {
    setPage(p);
    setExpandedRow(null);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('es-CO', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>
          Historial de <span className="text-gradient">Evaluaciones</span>
        </h1>
        <p>Registro de evaluaciones y seguimiento clínico</p>
      </div>

      {/* Summary stats */}
      <div className="kpi-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="kpi-card">
          <div className="kpi-value">{stats.total}</div>
          <div className="kpi-label">Total Evaluaciones</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-value" style={{ color: 'var(--severity-low)' }}>{stats.leve}</div>
          <div className="kpi-label">Leve</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-value" style={{ color: 'var(--severity-mid)' }}>{stats.moderada}</div>
          <div className="kpi-label">Moderada</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-value" style={{ color: 'var(--severity-high)' }}>{stats.severa}</div>
          <div className="kpi-label">Severa</div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="card">
        <div className="search-bar">
          <div className="search-input-wrapper">
            <span className="search-icon"><IconSearch /></span>
            <input
              className="input"
              type="text"
              placeholder="Buscar por severidad, edad..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>
          <select
            className="select"
            value={filterSeverity}
            onChange={(e) => { setFilterSeverity(e.target.value); setPage(1); }}
            style={{ maxWidth: '180px' }}
          >
            <option>Todas</option>
            <option>Leve</option>
            <option>Moderada</option>
            <option>Severa</option>
          </select>
        </div>

        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
          Mostrando {paginated.length} de {filtered.length} evaluaciones
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            Cargando historial...
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="table-container desktop-only">
              <table className="table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Grupo Edad</th>
                    <th>Triage</th>
                    <th>Severidad</th>
                    <th>Confianza</th>
                    <th>Observación</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((e) => {
                    const datos = e.datos_paciente || {};
                    const isExpanded = expandedRow === e.id;
                    const probs = e.probabilidades || {};

                    return (
                      <Fragment key={e.id}>
                        <tr
                          onClick={() => setExpandedRow(isExpanded ? null : e.id)}
                          style={{
                            cursor: 'pointer',
                            background: isExpanded ? 'rgba(255,255,255,0.03)' : 'transparent',
                            transition: 'background 0.2s ease'
                          }}
                        >
                          <td style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.8rem' }}>
                            {formatDate(e.created_at)}
                          </td>
                          <td>{datos.grupo_edad || '—'}</td>
                          <td><span className="badge badge-info">{datos.triage || '—'}</span></td>
                          <td><span className={getBadgeClass(e.prediccion)}>{e.prediccion}</span></td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <div className="progress-bar" style={{ width: '60px' }}>
                                <div
                                  className="progress-fill"
                                  style={{
                                    width: (e.confianza || 0) + '%',
                                    background:
                                      e.prediccion === 'Leve' ? 'var(--severity-low)' :
                                        e.prediccion === 'Moderada' ? 'var(--severity-mid)' :
                                          'var(--severity-high)',
                                  }}
                                />
                              </div>
                              <span style={{ fontWeight: 600, fontSize: '0.8rem' }}>
                                {e.confianza ? `${e.confianza}%` : '—'}
                              </span>
                            </div>
                          </td>
                          <td onClick={(x) => { x.stopPropagation(); handleEditObservation(x, e.id); }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: observaciones[e.id] ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                              {observaciones[e.id] || '—'}
                              <IconEdit style={{ width: 14, height: 14, opacity: 0.5 }} />
                            </div>
                          </td>
                        </tr>

                        {isExpanded && (
                          <tr className="expanded-row-desktop">
                            <td colSpan={6} style={{ padding: 0, borderBottom: '1px solid var(--border)' }}>
                              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem 1.5rem', borderLeft: '4px solid var(--accent)' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', fontSize: '0.85rem' }}>
                                  <div><span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', marginBottom: '2px' }}>Sexo</span> <strong style={{ color: 'var(--text-primary)' }}>{datos.sexo || '—'}</strong></div>
                                  <div><span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', marginBottom: '2px' }}>Área</span> <strong style={{ color: 'var(--text-primary)' }}>{datos.area || '—'}</strong></div>
                                  <div><span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', marginBottom: '2px' }}>Días de fiebre</span> <strong style={{ color: 'var(--text-primary)' }}>{datos.tiempo_fiebre ?? '—'}</strong></div>
                                  <div><span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', marginBottom: '2px' }}>Probabilidad (Leve)</span> <strong style={{ color: 'var(--severity-low)' }}>{probs.leve != null ? `${probs.leve}%` : '—'}</strong></div>
                                  <div><span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', marginBottom: '2px' }}>Probabilidad (Severa)</span> <strong style={{ color: 'var(--severity-high)' }}>{probs.severa != null ? `${probs.severa}%` : '—'}</strong></div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="eval-cards mobile-only">
              {paginated.map((e) => {
                const datos = e.datos_paciente || {};
                const isExpanded = expandedRow === e.id;
                const severityColor = e.prediccion === 'Leve' ? 'var(--severity-low)' :
                  e.prediccion === 'Moderada' ? 'var(--severity-mid)' :
                    'var(--severity-high)';
                return (
                  <div key={e.id} className="eval-card-mini" onClick={() => setExpandedRow(isExpanded ? null : e.id)} style={{ borderLeft: `4px solid ${severityColor}` }}>
                    <div className="eval-card-header">
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span className={getBadgeClass(e.prediccion)}>{e.prediccion}</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>{formatDate(e.created_at)}</span>
                      </div>
                      <div className="text-right">
                        <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{e.confianza}%</span>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>CONF</div>
                      </div>
                    </div>

                    <div className="eval-card-body" style={{ flexDirection: 'column', gap: 8, alignItems: 'stretch' }}>
                      <div className="eval-card-row">
                        <span className="eval-card-label">Edad:</span>
                        <span className="eval-card-val">{datos.grupo_edad || '—'}</span>
                      </div>
                      <div className="eval-card-row">
                        <span className="eval-card-label">Triage:</span>
                        <span className="badge badge-info">{datos.triage || '—'}</span>
                      </div>

                      <div className="eval-card-row" onClick={(x) => handleEditObservation(x, e.id)}>
                        <span className="eval-card-label">Obs:</span>
                        <span className="eval-card-val" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          {observaciones[e.id] || '—'}
                          <IconEdit style={{ width: 14, height: 14 }} />
                        </span>
                      </div>

                      {isExpanded && (
                        <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)', fontSize: '0.8rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                          <div className="eval-card-field">
                            <span className="eval-card-label">Días fiebre</span>
                            <span className="eval-card-val">{datos.tiempo_fiebre ?? '—'}</span>
                          </div>
                          <div className="eval-card-field">
                            <span className="eval-card-label">Sexo</span>
                            <span className="eval-card-val">{datos.sexo || '—'}</span>
                          </div>
                          <div className="eval-card-field">
                            <span className="eval-card-label">Área</span>
                            <span className="eval-card-val">{datos.area || '—'}</span>
                          </div>
                          <div className="eval-card-field">
                            <span className="eval-card-label">P(Severa)</span>
                            <span className="eval-card-val" style={{ color: 'var(--severity-high)' }}>{e.probabilidades?.severa ? e.probabilidades.severa + '%' : '—'}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {paginated.length === 0 && (
              <div className="empty-state">
                <div style={{ marginBottom: '0.75rem', opacity: 0.4 }}>
                  <IconHistory style={{ width: 48, height: 48 }} />
                </div>
                <h3>Sin resultados</h3>
                <p>No se encontraron evaluaciones.</p>
              </div>
            )}
          </>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button disabled={page === 1} onClick={() => handlePageChange(page - 1)}>
              <IconChevronLeft style={{ width: 14, height: 14 }} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button key={p} className={p === page ? 'active' : ''} onClick={() => handlePageChange(p)}>
                {p}
              </button>
            ))}
            <button disabled={page === totalPages} onClick={() => handlePageChange(page + 1)}>
              <IconChevronRight style={{ width: 14, height: 14 }} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
