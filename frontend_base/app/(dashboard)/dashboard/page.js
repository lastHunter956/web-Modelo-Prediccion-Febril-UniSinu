'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const mockRecentPatients = [
  { id: 'P-0421', name: 'María García', age: '3 años', date: '2026-02-16', severity: 'Leve', confidence: '96%' },
  { id: 'P-0420', name: 'Carlos López', age: '1 año', date: '2026-02-16', severity: 'Moderada', confidence: '89%' },
  { id: 'P-0419', name: 'Ana Martínez', age: '5 años', date: '2026-02-15', severity: 'Severa', confidence: '93%' },
  { id: 'P-0418', name: 'Luis Rodríguez', age: '2 años', date: '2026-02-15', severity: 'Leve', confidence: '97%' },
  { id: 'P-0417', name: 'Sofía Herrera', age: '4 años', date: '2026-02-14', severity: 'Moderada', confidence: '91%' },
];

const severityData = [
  { label: 'Leve', count: 245, pct: 56.6, color: 'var(--severity-low)' },
  { label: 'Moderada', count: 128, pct: 29.6, color: 'var(--severity-mid)' },
  { label: 'Severa', count: 60, pct: 13.8, color: 'var(--severity-high)' },
];

function getBadgeClass(severity) {
  if (severity === 'Leve') return 'badge badge-low';
  if (severity === 'Moderada') return 'badge badge-mid';
  return 'badge badge-high';
}

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <h1>Dashboard <span className="text-gradient">General</span></h1>
        <p>Resumen del sistema de predicción de severidad febril pediátrica</p>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: 'rgba(230,0,35,0.12)', color: 'var(--accent)' }}>🏥</div>
          <div className="kpi-value">433</div>
          <div className="kpi-label">Pacientes Evaluados</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: 'rgba(212,168,67,0.12)', color: 'var(--unisinu-gold)' }}>🎯</div>
          <div className="kpi-value">94.3%</div>
          <div className="kpi-label">Accuracy del Modelo</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: 'rgba(100,0,0,0.15)', color: '#e6768a' }}>📊</div>
          <div className="kpi-value">95.5%</div>
          <div className="kpi-label">F1-Macro Score</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: 'rgba(52,211,153,0.12)', color: 'var(--severity-low)' }}>🛡️</div>
          <div className="kpi-value">0</div>
          <div className="kpi-label">Errores Críticos</div>
        </div>
      </div>

      {/* Two columns: Severity Distribution + Model Summary */}
      <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
        {/* Severity Distribution */}
        <div className="card">
          <div className="card-header">
            <h3>Distribución de Severidad</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            {/* Donut chart using conic-gradient */}
            <div
              className="donut-chart"
              style={{
                background: mounted
                  ? `conic-gradient(
                      var(--severity-low) 0% 56.6%,
                      var(--severity-mid) 56.6% 86.2%,
                      var(--severity-high) 86.2% 100%
                    )`
                  : 'var(--bg-secondary)',
                transition: 'background 1s ease',
              }}
            >
              <div className="donut-center">
                <div className="value">433</div>
                <div className="label">Total</div>
              </div>
            </div>
            <div className="donut-legend">
              {severityData.map((d) => (
                <div className="legend-item" key={d.label}>
                  <span className="legend-dot" style={{ background: d.color }} />
                  <span>{d.label}: <strong>{d.count}</strong> ({d.pct}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Model Summary Card */}
        <div className="card">
          <div className="card-header">
            <h3>Resumen del Modelo</h3>
            <span className="badge badge-info">SVM-RBF</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Algoritmo</span>
              <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>Support Vector Machine (RBF)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Features</span>
              <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>258 variables clínicas</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Clases</span>
              <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>Leve · Moderada · Severa</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Seguridad</span>
              <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--severity-low)' }}>✓ Sin errores graves→leve</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div className="quick-actions">
          <Link href="/evaluacion" className="btn btn-primary">
            🩺 Nueva Evaluación
          </Link>
          <Link href="/rendimiento" className="btn btn-secondary">
            📈 Ver Rendimiento
          </Link>
          <Link href="/historial" className="btn btn-secondary">
            📋 Ver Historial
          </Link>
        </div>
      </div>

      {/* Recent Evaluations Table */}
      <div className="card">
        <div className="card-header">
          <h3>Evaluaciones Recientes</h3>
          <Link href="/historial" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
            Ver todo →
          </Link>
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Paciente</th>
                <th>Edad</th>
                <th>Fecha</th>
                <th>Severidad</th>
                <th>Confianza</th>
              </tr>
            </thead>
            <tbody>
              {mockRecentPatients.map((p) => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.id}</td>
                  <td>{p.name}</td>
                  <td>{p.age}</td>
                  <td>{p.date}</td>
                  <td><span className={getBadgeClass(p.severity)}>{p.severity}</span></td>
                  <td style={{ fontWeight: 600 }}>{p.confidence}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
