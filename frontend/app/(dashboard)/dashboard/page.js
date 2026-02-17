'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { getDashboardStats, healthCheck } from '../../lib/api';
import { IconEvaluation, IconPerformance, IconHistory, IconActivity, IconShield, IconCheck } from '../../components/Icons';

export default function DashboardPage() {
  const { profile, supabase } = useAuth();
  const [stats, setStats] = useState({ total: 0, leve: 0, moderada: 0, severa: 0, evaluaciones: [] });
  const [apiStatus, setApiStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [dashStats, health] = await Promise.all([
        getDashboardStats(supabase),
        healthCheck(),
      ]);
      setStats(dashStats);
      setApiStatus(health);
    } catch (err) {
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  }

  const recent = (stats.evaluaciones || [])
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('es-CO', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>
            Bienvenido, <span className="text-gradient">{profile?.nombre || 'Doctor'}</span>
          </h1>
          <p>Panel de control clínico</p>
        </div>
        <Link href="/evaluacion" className="btn btn-primary">
          <IconEvaluation style={{ width: '1em', height: '1em' }} /> Nueva Evaluación
        </Link>
      </div>

      {/* KPIs — compact horizontal cards on mobile */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: 'rgba(99,102,241,0.12)', color: '#818CF8' }}>
            <IconEvaluation />
          </div>
          <div className="kpi-value">{stats.total}</div>
          <div className="kpi-label">Evaluaciones</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: 'var(--severity-low-bg)', color: 'var(--severity-low)' }}>
            <IconCheck />
          </div>
          <div className="kpi-value" style={{ color: 'var(--severity-low)' }}>{stats.leve}</div>
          <div className="kpi-label">Leves</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: 'var(--severity-mid-bg)', color: 'var(--severity-mid)' }}>
            <IconActivity />
          </div>
          <div className="kpi-value" style={{ color: 'var(--severity-mid)' }}>{stats.moderada}</div>
          <div className="kpi-label">Moderados</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: 'var(--severity-high-bg)', color: 'var(--severity-high)' }}>
            <IconShield />
          </div>
          <div className="kpi-value" style={{ color: 'var(--severity-high)' }}>{stats.severa}</div>
          <div className="kpi-label">Severos</div>
        </div>
      </div>

      {/* Model summary — compact single card */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div className="card-header">
          <h3><IconPerformance style={{ width: '1em', height: '1em', verticalAlign: 'middle', marginRight: 6 }} />Modelo Predictivo</h3>
          <span className={apiStatus ? 'badge badge-low' : 'badge badge-high'}>
            {apiStatus === null ? (loading ? '...' : '—') : apiStatus ? '● Activo' : '● Desconectado'}
          </span>
        </div>
        <div className="model-stats-row">
          <div className="model-stat">
            <span className="model-stat-value">91.95%</span>
            <span className="model-stat-label">Precisión</span>
          </div>
          <div className="model-stat">
            <span className="model-stat-value">92.56%</span>
            <span className="model-stat-label">Confiabilidad</span>
          </div>
          <div className="model-stat">
            <span className="model-stat-value" style={{ color: 'var(--severity-low)' }}>0</span>
            <span className="model-stat-label">Errores Críticos</span>
          </div>
        </div>
      </div>

      {/* Recent evaluations */}
      <div className="card">
        <div className="card-header">
          <h3><IconHistory style={{ width: '1em', height: '1em', verticalAlign: 'middle', marginRight: 6 }} />Evaluaciones Recientes</h3>
          <Link href="/historial" className="btn btn-secondary btn-sm">Ver todas</Link>
        </div>
        {recent.length === 0 ? (
          <div className="empty-state">
            <div style={{ marginBottom: '0.75rem', opacity: 0.4 }}>
              <IconEvaluation style={{ width: 48, height: 48 }} />
            </div>
            <h3>Sin evaluaciones aún</h3>
            <p>Realiza tu primera evaluación para ver los resultados aquí</p>
            <Link href="/evaluacion" className="btn btn-primary">Comenzar</Link>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="table-container desktop-only">
              <table className="table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Grupo Edad</th>
                    <th>Triage</th>
                    <th>Severidad</th>
                    <th>Confianza</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((e) => {
                    const datos = e.datos_paciente || {};
                    return (
                      <tr key={e.id || e.created_at}>
                        <td style={{ fontWeight: 600, fontSize: '0.8rem' }}>{formatDate(e.created_at)}</td>
                        <td>{datos.grupo_edad || '—'}</td>
                        <td><span className="badge badge-info">{datos.triage || '—'}</span></td>
                        <td>
                          <span className={
                            e.prediccion === 'Leve' ? 'badge badge-low' :
                              e.prediccion === 'Moderada' ? 'badge badge-mid' :
                                'badge badge-high'
                          }>
                            {e.prediccion}
                          </span>
                        </td>
                        <td style={{ fontWeight: 600 }}>{e.confianza}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="mobile-only eval-cards">
              {recent.map((e) => {
                const datos = e.datos_paciente || {};
                const severityColor = e.prediccion === 'Leve' ? 'var(--severity-low)' :
                  e.prediccion === 'Moderada' ? 'var(--severity-mid)' :
                    'var(--severity-high)';
                return (
                  <div key={e.id || e.created_at} className="eval-card-mini" style={{ borderLeft: `4px solid ${severityColor}` }}>
                    <div className="eval-card-header">
                      <span className={
                        e.prediccion === 'Leve' ? 'badge badge-low' :
                          e.prediccion === 'Moderada' ? 'badge badge-mid' :
                            'badge badge-high'
                      }>
                        {e.prediccion}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {formatDate(e.created_at)}
                      </span>
                    </div>
                    <div className="eval-card-body">
                      <span>{datos.grupo_edad || '—'}</span>
                      <span className="badge badge-info">{datos.triage || '—'}</span>
                      <span style={{ fontWeight: 600 }}>{e.confianza}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
