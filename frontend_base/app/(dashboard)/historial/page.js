'use client';
import { useState, useMemo } from 'react';

const allPatients = [
  { id: 'P-0421', name: 'María García López', age: '3 años', ageGroup: '2-5', date: '2026-02-16', severity: 'Leve', confidence: 96, temp: '38.2°C', triage: 'III', diagnosis: 'Rinofaringitis aguda' },
  { id: 'P-0420', name: 'Carlos Andrés López', age: '1 año', ageGroup: '0-1', date: '2026-02-16', severity: 'Moderada', confidence: 89, temp: '39.1°C', triage: 'II', diagnosis: 'Neumonía adquirida' },
  { id: 'P-0419', name: 'Ana Martínez Ruiz', age: '5 años', ageGroup: '2-5', date: '2026-02-15', severity: 'Severa', confidence: 93, temp: '40.2°C', triage: 'I', diagnosis: 'Meningitis aguda' },
  { id: 'P-0418', name: 'Luis Rodríguez Pérez', age: '2 años', ageGroup: '2-5', date: '2026-02-15', severity: 'Leve', confidence: 97, temp: '37.8°C', triage: 'IV', diagnosis: 'Otitis media aguda' },
  { id: 'P-0417', name: 'Sofía Herrera Díaz', age: '4 años', ageGroup: '2-5', date: '2026-02-14', severity: 'Moderada', confidence: 91, temp: '39.4°C', triage: 'III', diagnosis: 'Infección urinaria' },
  { id: 'P-0416', name: 'Diego Morales Castro', age: '8 meses', ageGroup: '0-1', date: '2026-02-14', severity: 'Severa', confidence: 95, temp: '40.0°C', triage: 'II', diagnosis: 'Bronquiolitis' },
  { id: 'P-0415', name: 'Valentina Torres', age: '6 años', ageGroup: '6-12', date: '2026-02-13', severity: 'Leve', confidence: 94, temp: '38.0°C', triage: 'IV', diagnosis: 'Amigdalitis aguda' },
  { id: 'P-0414', name: 'Samuel Jiménez', age: '3 años', ageGroup: '2-5', date: '2026-02-13', severity: 'Leve', confidence: 98, temp: '37.9°C', triage: 'III', diagnosis: 'Rinofaringitis aguda' },
  { id: 'P-0413', name: 'Isabella Vargas', age: '1 año', ageGroup: '0-1', date: '2026-02-12', severity: 'Moderada', confidence: 87, temp: '39.0°C', triage: 'III', diagnosis: 'Enfermedad diarreica' },
  { id: 'P-0412', name: 'Mateo Sánchez', age: '7 años', ageGroup: '6-12', date: '2026-02-12', severity: 'Leve', confidence: 96, temp: '38.3°C', triage: 'IV', diagnosis: 'Sinusitis aguda' },
  { id: 'P-0411', name: 'Camila Restrepo', age: '2 años', ageGroup: '2-5', date: '2026-02-11', severity: 'Moderada', confidence: 88, temp: '39.3°C', triage: 'II', diagnosis: 'Laringotraqueítis' },
  { id: 'P-0410', name: 'Nicolás Ospina', age: '4 años', ageGroup: '2-5', date: '2026-02-11', severity: 'Leve', confidence: 95, temp: '38.1°C', triage: 'III', diagnosis: 'Otitis media aguda' },
  { id: 'P-0409', name: 'Luciana Mendoza', age: '11 meses', ageGroup: '0-1', date: '2026-02-10', severity: 'Severa', confidence: 92, temp: '40.5°C', triage: 'I', diagnosis: 'Sepsis neonatal' },
  { id: 'P-0408', name: 'Sebastián Rojas', age: '5 años', ageGroup: '2-5', date: '2026-02-10', severity: 'Leve', confidence: 97, temp: '37.7°C', triage: 'IV', diagnosis: 'Rinofaringitis aguda' },
  { id: 'P-0407', name: 'Mariana Castaño', age: '3 años', ageGroup: '2-5', date: '2026-02-09', severity: 'Moderada', confidence: 90, temp: '39.2°C', triage: 'III', diagnosis: 'Neumonía adquirida' },
  { id: 'P-0406', name: 'Tomás Beltrán', age: '9 años', ageGroup: '6-12', date: '2026-02-09', severity: 'Leve', confidence: 93, temp: '38.4°C', triage: 'III', diagnosis: 'Dengue sin alarma' },
  { id: 'P-0405', name: 'Emma Gutiérrez', age: '2 años', ageGroup: '2-5', date: '2026-02-08', severity: 'Leve', confidence: 96, temp: '38.0°C', triage: 'IV', diagnosis: 'Amigdalitis aguda' },
  { id: 'P-0404', name: 'Alejandro Parra', age: '14 años', ageGroup: '13-17', date: '2026-02-08', severity: 'Moderada', confidence: 86, temp: '39.5°C', triage: 'II', diagnosis: 'Dengue con alarma' },
  { id: 'P-0403', name: 'Gabriela Mejía', age: '1 año', ageGroup: '0-1', date: '2026-02-07', severity: 'Leve', confidence: 94, temp: '37.9°C', triage: 'IV', diagnosis: 'Rinofaringitis aguda' },
  { id: 'P-0402', name: 'Daniel Acosta', age: '4 años', ageGroup: '2-5', date: '2026-02-07', severity: 'Severa', confidence: 91, temp: '40.1°C', triage: 'I', diagnosis: 'Tos ferina' },
];

function getBadgeClass(severity) {
  if (severity === 'Leve') return 'badge badge-low';
  if (severity === 'Moderada') return 'badge badge-mid';
  return 'badge badge-high';
}

const ITEMS_PER_PAGE = 8;

export default function HistorialPage() {
  const [search, setSearch] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('Todas');
  const [page, setPage] = useState(1);
  const [expandedRow, setExpandedRow] = useState(null);

  const filtered = useMemo(() => {
    return allPatients.filter(p => {
      const q = search.toLowerCase();
      const matchesSearch = !q || p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q) || p.diagnosis.toLowerCase().includes(q);
      const matchesSeverity = filterSeverity === 'Todas' || p.severity === filterSeverity;
      return matchesSearch && matchesSeverity;
    });
  }, [search, filterSeverity]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handlePageChange = (p) => {
    setPage(p);
    setExpandedRow(null);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Historial de <span className="text-gradient">Pacientes</span></h1>
        <p>Registro de evaluaciones de severidad febril realizadas</p>
      </div>

      {/* Summary stats */}
      <div className="kpi-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="kpi-card">
          <div className="kpi-value">{allPatients.length}</div>
          <div className="kpi-label">Total Evaluaciones</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-value" style={{ color: 'var(--severity-low)' }}>{allPatients.filter(p => p.severity === 'Leve').length}</div>
          <div className="kpi-label">Leve</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-value" style={{ color: 'var(--severity-mid)' }}>{allPatients.filter(p => p.severity === 'Moderada').length}</div>
          <div className="kpi-label">Moderada</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-value" style={{ color: 'var(--severity-high)' }}>{allPatients.filter(p => p.severity === 'Severa').length}</div>
          <div className="kpi-label">Severa</div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="card">
        <div className="search-bar">
          <div className="search-input-wrapper">
            <span className="search-icon">🔍</span>
            <input
              className="input"
              type="text"
              placeholder="Buscar por nombre, ID o diagnóstico..."
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

        {/* Results count */}
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
          Mostrando {paginated.length} de {filtered.length} evaluaciones
        </div>

        {/* Table */}
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Paciente</th>
                <th>Edad</th>
                <th>Fecha</th>
                <th>Diagnóstico</th>
                <th>Triage</th>
                <th>Severidad</th>
                <th>Confianza</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((p) => (
                <>
                  <tr
                    key={p.id}
                    onClick={() => setExpandedRow(expandedRow === p.id ? null : p.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.id}</td>
                    <td>{p.name}</td>
                    <td>{p.age}</td>
                    <td>{p.date}</td>
                    <td>{p.diagnosis}</td>
                    <td><span className="badge badge-info">{p.triage}</span></td>
                    <td><span className={getBadgeClass(p.severity)}>{p.severity}</span></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div className="progress-bar" style={{ width: '60px' }}>
                          <div className="progress-fill" style={{
                            width: p.confidence + '%',
                            background: p.severity === 'Leve' ? 'var(--severity-low)' : p.severity === 'Moderada' ? 'var(--severity-mid)' : 'var(--severity-high)'
                          }} />
                        </div>
                        <span style={{ fontWeight: 600, fontSize: '0.8rem' }}>{p.confidence}%</span>
                      </div>
                    </td>
                  </tr>
                  {expandedRow === p.id && (
                    <tr key={p.id + '-exp'}>
                      <td colSpan={8} style={{ background: 'var(--bg-secondary)', padding: '1rem 1.5rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem', fontSize: '0.825rem' }}>
                          <div><span style={{ color: 'var(--text-muted)' }}>Grupo Edad:</span> <strong>{p.ageGroup} años</strong></div>
                          <div><span style={{ color: 'var(--text-muted)' }}>Temperatura:</span> <strong>{p.temp}</strong></div>
                          <div><span style={{ color: 'var(--text-muted)' }}>Nivel Triage:</span> <strong>{p.triage}</strong></div>
                          <div><span style={{ color: 'var(--text-muted)' }}>Diagnóstico:</span> <strong>{p.diagnosis}</strong></div>
                          <div><span style={{ color: 'var(--text-muted)' }}>Confianza:</span> <strong>{p.confidence}%</strong></div>
                          <div><span style={{ color: 'var(--text-muted)' }}>Clasificación:</span> <strong style={{ color: p.severity === 'Leve' ? 'var(--severity-low)' : p.severity === 'Moderada' ? 'var(--severity-mid)' : 'var(--severity-high)' }}>{p.severity}</strong></div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={8}>
                    <div className="empty-state">
                      <div className="icon">🔍</div>
                      <h3>Sin resultados</h3>
                      <p>No se encontraron pacientes con los filtros aplicados.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button disabled={page === 1} onClick={() => handlePageChange(page - 1)}>‹</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} className={p === page ? 'active' : ''} onClick={() => handlePageChange(p)}>{p}</button>
            ))}
            <button disabled={page === totalPages} onClick={() => handlePageChange(page + 1)}>›</button>
          </div>
        )}
      </div>
    </div>
  );
}
