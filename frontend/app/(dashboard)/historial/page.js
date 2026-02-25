'use client';
import { useState, useEffect, useMemo, Fragment } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getEvaluaciones } from '../../lib/api';
import { IconSearch, IconHistory, IconChevronLeft, IconChevronRight, IconEdit, IconChevronDown } from '../../components/Icons';

function getBadgeClass(severity) {
  if (severity === 'Leve') return 'badge badge-low';
  if (severity === 'Moderada') return 'badge badge-mid';
  return 'badge badge-high';
}

const ITEMS_PER_PAGE = 8;

/** Muestra un campo con label y valor. Retorna null si no hay valor. */
function Field({ label, value, color, fullWidth }) {
  if (value === null || value === undefined || value === '' || value === '—') return null;
  return (
    <div style={{ gridColumn: fullWidth ? '1 / -1' : undefined }}>
      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 3 }}>
        {label}
      </span>
      <strong style={{ color: color || 'var(--text-primary)', fontSize: '0.88rem' }}>
        {value}
      </strong>
    </div>
  );
}

/** Sección con título y campos en grid. */
function Section({ title, children, color }) {
  const validChildren = Array.isArray(children)
    ? children.filter(Boolean)
    : children ? [children] : [];
  if (validChildren.length === 0) return null;
  return (
    <div style={{ marginBottom: '1rem' }}>
      <div style={{
        fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase',
        letterSpacing: '0.08em', color: color || 'var(--accent)',
        marginBottom: '0.6rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.25rem'
      }}>
        {title}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.75rem' }}>
        {validChildren}
      </div>
    </div>
  );
}

export default function HistorialPage() {
  const { supabase } = useAuth();
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('Todas');
  const [page, setPage] = useState(1);
  const [expandedRow, setExpandedRow] = useState(null);
  const [observaciones, setObservaciones] = useState({});

  useEffect(() => { loadEvaluaciones(); }, []);

  async function loadEvaluaciones() {
    setLoading(true);
    try {
      const { data } = await getEvaluaciones(supabase, { limit: 200 });
      setEvaluaciones(data || []);
      const savedObs = localStorage.getItem('clinical_observations');
      if (savedObs) setObservaciones(JSON.parse(savedObs));
    } catch (err) {
      console.error('Error cargando historial:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleEditObservation = (ev, id) => {
    ev.stopPropagation();
    const current = observaciones[id] || '';
    const newVal = prompt('Observación clínica:', current);
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
        datos.sexo?.toLowerCase().includes(q) ||
        datos.area?.toLowerCase().includes(q) ||
        datos.estado_nutricional?.toLowerCase().includes(q) ||
        datos.hallazgo_examen_fisico?.toLowerCase().includes(q);
      const matchesSeverity = filterSeverity === 'Todas' || e.prediccion === filterSeverity;
      return matchesSearch && matchesSeverity;
    });
  }, [evaluaciones, search, filterSeverity]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const stats = useMemo(() => ({
    total: evaluaciones.length,
    leve: evaluaciones.filter((e) => e.prediccion_codigo === 0).length,
    moderada: evaluaciones.filter((e) => e.prediccion_codigo === 1).length,
    severa: evaluaciones.filter((e) => e.prediccion_codigo === 2).length,
  }), [evaluaciones]);

  const handlePageChange = (p) => { setPage(p); setExpandedRow(null); };

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('es-CO', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });

  /** Panel expandido con toda la información V3 */
  function DetailPanel({ datos, probs, factores }) {
    const d = datos || {};
    const p = probs || {};
    return (
      <div style={{ padding: '1.25rem 1.5rem', background: 'var(--bg-secondary)', borderLeft: '4px solid var(--accent)' }}>

        {/* Probabilidades */}
        <Section title="Probabilidades de Severidad">
          <Field label="Leve" value={p.leve != null ? `${p.leve}%` : null} color="var(--severity-low)" />
          <Field label="Moderada" value={p.moderada != null ? `${p.moderada}%` : null} color="var(--severity-mid)" />
          <Field label="Severa" value={p.severa != null ? `${p.severa}%` : null} color="var(--severity-high)" />
        </Section>

        {/* Datos generales */}
        <Section title="Datos Generales" color="var(--text-muted)">
          <Field label="Sexo" value={d.sexo} />
          <Field label="Área" value={d.area} />
          <Field label="Días de Fiebre" value={d.tiempo_fiebre != null ? `${d.tiempo_fiebre} días` : null} />
          <Field label="Vacunación" value={d.vacunacion} />
        </Section>

        {/* Evaluación clínica */}
        <Section title="Evaluación Clínica" color="#60a5fa">
          <Field label="Estado Nutricional" value={d.estado_nutricional === 'Riesgo de desnutrición' ? 'Desnutrición' : d.estado_nutricional} />
          <Field label="Glasgow" value={d.glasgow != null ? d.glasgow : null} />
          <Field label="Hallazgo Examen Físico" value={d.hallazgo_examen_fisico} fullWidth={true} />
          <Field label="Antecedentes" value={d.antecedentes_personales} fullWidth={true} />
          <Field label="Contacto Epidemiológico" value={d.contacto_epidemiologico} fullWidth={true} />
          <Field label="Exposición Ambiental" value={d.exposicion_ambiental} />
        </Section>

        {/* Laboratorios */}
        <Section title="Laboratorios" color="#34d399">
          <Field label="Procalcitonina (ng/mL)" value={d.procalcitonina != null ? d.procalcitonina : null} />
          <Field label="Leucocitos (cel/mm³)" value={d.leucocitos != null ? d.leucocitos.toLocaleString() : null} />
          <Field label="PCR (mg/dL)" value={d.pcr != null ? d.pcr : null} />
          <Field label="Plaquetas (cel/mm³)" value={d.plaquetas != null ? d.plaquetas.toLocaleString() : null} />
          <Field label="Albúmina (g/dl)" value={d.albumina != null ? d.albumina : null} />
          <Field label="Globulina (g/dl)" value={d.globulina != null ? d.globulina : null} />
          <Field label="Cayados Absolutos" value={d.cayados_absolutos != null ? d.cayados_absolutos : null} />
        </Section>

        {/* Factores Contribuyentes */}
        {factores && factores.length > 0 && (
          <div>
            <div style={{
              fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.08em', color: 'var(--severity-high)',
              marginBottom: '0.6rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.25rem'
            }}>
              Factores Contribuyentes
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {factores.map((f, i) => (
                <li key={i} style={{ fontSize: '0.82rem', color: 'var(--text-primary)', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                  <span style={{ color: 'var(--accent)', marginTop: 2 }}>›</span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Historial de <span className="text-gradient">Evaluaciones</span></h1>
        <p>Registro completo de evaluaciones y seguimiento clínico</p>
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
              placeholder="Buscar por severidad, edad, sexo, área..."
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
            {/* ── Desktop Table ────────────────────────────── */}
            <div className="table-container desktop-only">
              <table className="table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Grupo Edad</th>
                    <th>Sexo</th>
                    <th>Severidad</th>
                    <th>Confianza</th>
                    <th>Observación</th>
                    <th style={{ width: 32 }}></th>
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
                            transition: 'background 0.2s ease',
                          }}
                        >
                          <td style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.8rem' }}>
                            {formatDate(e.created_at)}
                          </td>
                          <td>{datos.grupo_edad || '—'}</td>
                          <td>{datos.sexo || '—'}</td>
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
                          <td>
                            <IconChevronDown style={{
                              width: 16, height: 16, color: 'var(--text-muted)',
                              transform: isExpanded ? 'rotate(180deg)' : 'none',
                              transition: 'transform 0.2s ease',
                            }} />
                          </td>
                        </tr>

                        {isExpanded && (
                          <tr>
                            <td colSpan={7} style={{ padding: 0, borderBottom: '2px solid var(--accent)' }}>
                              <DetailPanel datos={datos} probs={probs} factores={e.factores} />
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* ── Mobile Cards ────────────────────────────── */}
            <div className="eval-cards mobile-only">
              {paginated.map((e) => {
                const datos = e.datos_paciente || {};
                const isExpanded = expandedRow === e.id;
                const probs = e.probabilidades || {};
                const severityColor =
                  e.prediccion === 'Leve' ? 'var(--severity-low)' :
                    e.prediccion === 'Moderada' ? 'var(--severity-mid)' :
                      'var(--severity-high)';

                return (
                  <div
                    key={e.id}
                    className="eval-card-mini"
                    style={{ borderLeft: `4px solid ${severityColor}`, overflow: 'hidden' }}
                  >
                    {/* Header — clic expande */}
                    <div
                      onClick={() => setExpandedRow(isExpanded ? null : e.id)}
                      style={{ cursor: 'pointer', padding: '0.85rem 1rem' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <span className={getBadgeClass(e.prediccion)}>{e.prediccion}</span>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>
                            {formatDate(e.created_at)}
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                              {e.confianza}%
                            </span>
                            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>CONF</div>
                          </div>
                          <IconChevronDown style={{
                            width: 16, height: 16, color: 'var(--text-muted)', flexShrink: 0,
                            transform: isExpanded ? 'rotate(180deg)' : 'none',
                            transition: 'transform 0.2s ease',
                          }} />
                        </div>
                      </div>

                      {/* Siempre visible: resumen básico */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.75rem', fontSize: '0.82rem' }}>
                        <div>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem', textTransform: 'uppercase' }}>Edad</span>
                          <div style={{ fontWeight: 600 }}>{datos.grupo_edad || '—'}</div>
                        </div>
                        <div>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem', textTransform: 'uppercase' }}>Sexo</span>
                          <div style={{ fontWeight: 600 }}>{datos.sexo || '—'}</div>
                        </div>
                        <div>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem', textTransform: 'uppercase' }}>Área</span>
                          <div style={{ fontWeight: 600 }}>{datos.area || '—'}</div>
                        </div>
                        <div>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem', textTransform: 'uppercase' }}>Días Fiebre</span>
                          <div style={{ fontWeight: 600 }}>{datos.tiempo_fiebre != null ? `${datos.tiempo_fiebre}d` : '—'}</div>
                        </div>
                      </div>
                    </div>

                    {/* Expandido: toda la información */}
                    {isExpanded && (
                      <div style={{ borderTop: '1px solid var(--border)' }}>
                        <DetailPanel datos={datos} probs={probs} factores={e.factores} />

                        {/* Observación editable */}
                        <div
                          style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderTop: '1px solid var(--border)', cursor: 'pointer' }}
                          onClick={(x) => handleEditObservation(x, e.id)}
                        >
                          <IconEdit style={{ width: 14, height: 14, color: 'var(--accent)' }} />
                          <span style={{ fontSize: '0.8rem', color: observaciones[e.id] ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                            {observaciones[e.id] || 'Añadir observación clínica...'}
                          </span>
                        </div>
                      </div>
                    )}
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
                <p>No se encontraron evaluaciones con los filtros actuales.</p>
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
