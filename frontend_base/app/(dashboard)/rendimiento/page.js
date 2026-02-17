'use client';
import { useState, useEffect } from 'react';

const modelsData = [
  { name: 'SVM (RBF)', f1: 95.5, accuracy: 94.3, best: true },
  { name: 'Extra Trees', f1: 94.8, accuracy: 93.7, best: false },
  { name: 'Gradient Boosting', f1: 94.2, accuracy: 93.1, best: false },
  { name: 'Random Forest', f1: 93.5, accuracy: 92.4, best: false },
  { name: 'XGBoost', f1: 92.8, accuracy: 91.9, best: false },
  { name: 'LightGBM', f1: 92.1, accuracy: 91.2, best: false },
  { name: 'Logistic Regression', f1: 88.3, accuracy: 87.5, best: false },
  { name: 'KNN', f1: 86.7, accuracy: 85.9, best: false },
  { name: 'Naive Bayes', f1: 82.4, accuracy: 81.1, best: false },
  { name: 'Decision Tree', f1: 81.9, accuracy: 80.7, best: false },
  { name: 'MLP', f1: 90.6, accuracy: 89.8, best: false },
];

const topFeatures = [
  { name: 'Nivel de Triage', importance: 100 },
  { name: 'Glasgow', importance: 87 },
  { name: 'Saturación O₂', importance: 78 },
  { name: 'Procalcitonina', importance: 72 },
  { name: 'Score Fisiológico', importance: 65 },
  { name: 'Leucocitos', importance: 58 },
  { name: 'Proteína C Reactiva', importance: 52 },
  { name: 'NLR', importance: 47 },
  { name: 'FC Percentil', importance: 41 },
  { name: 'Temperatura', importance: 36 },
];

const confusionMatrix = [
  [48, 2, 0],
  [3, 24, 1],
  [0, 0, 9],
];

const classLabels = ['Leve', 'Moderada', 'Severa'];

function getBarColor(index) {
  const colors = ['var(--accent)', 'var(--chart-blue)', 'var(--chart-purple)', 'var(--chart-orange)', 'var(--chart-pink)'];
  return colors[index % colors.length];
}

export default function RendimientoPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Rendimiento del <span className="text-gradient">Modelo</span></h1>
        <p>Métricas de evaluación y comparación de algoritmos de Machine Learning</p>
      </div>

      {/* Key Metrics */}
      <div className="kpi-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: 'rgba(230,0,35,0.12)', color: 'var(--accent)' }}>🎯</div>
          <div className="kpi-value">94.3%</div>
          <div className="kpi-label">Accuracy</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: 'rgba(212,168,67,0.12)', color: 'var(--unisinu-gold)' }}>📊</div>
          <div className="kpi-value">95.5%</div>
          <div className="kpi-label">F1-Macro</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: 'rgba(100,0,0,0.15)', color: '#e6768a' }}>📈</div>
          <div className="kpi-value">0.98</div>
          <div className="kpi-label">AUC-ROC Promedio</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: 'rgba(52,211,153,0.12)', color: 'var(--severity-low)' }}>🛡️</div>
          <div className="kpi-value">0</div>
          <div className="kpi-label">Severa→Leve (Errores Críticos)</div>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
        {/* Confusion Matrix */}
        <div className="card">
          <div className="card-header">
            <h3>Matriz de Confusión</h3>
            <span className="badge badge-info">Test Set</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem', fontWeight: 700 }}>
              Predicho →
            </div>
            <div className="confusion-matrix size-3">
              {/* Top-left corner (empty) */}
              <div className="cm-header" />
              {/* Column headers */}
              {classLabels.map(l => <div key={'h-' + l} className="cm-header">{l}</div>)}
              {/* Rows */}
              {confusionMatrix.map((row, i) => (
                <>
                  <div key={'r-' + i} className="cm-header cm-label-vertical">{classLabels[i]}</div>
                  {row.map((val, j) => (
                    <div
                      key={`${i}-${j}`}
                      className={`cm-cell ${i === j ? 'cm-diagonal' : val === 0 ? 'cm-zero' : 'cm-off'}`}
                    >
                      {val}
                    </div>
                  ))}
                </>
              ))}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.5rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              ← Real
            </div>
          </div>
        </div>

        {/* Top Feature Importance */}
        <div className="card">
          <div className="card-header">
            <h3>Importancia de Variables (SHAP)</h3>
          </div>
          <div className="feature-bar-chart">
            {topFeatures.map((f, i) => (
              <div className="feature-item" key={f.name}>
                <span className="feature-name">{f.name}</span>
                <div className="feature-bar-wrapper">
                  <div
                    className="feature-bar-fill"
                    style={{
                      width: mounted ? f.importance + '%' : '0%',
                      background: `linear-gradient(90deg, ${getBarColor(i)}, ${getBarColor(i)}88)`,
                    }}
                  />
                </div>
                <span className="feature-value">{f.importance}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Models Comparison */}
      <div className="card">
        <div className="card-header">
          <h3>Comparación de Modelos (11 Algoritmos)</h3>
        </div>
        {modelsData
          .sort((a, b) => b.f1 - a.f1)
          .map((model) => (
            <div className="model-comparison-row" key={model.name}>
              <span className="model-name">
                {model.best && <span style={{ color: 'var(--accent)', marginRight: '0.35rem' }}>★</span>}
                {model.name}
              </span>
              <div className="model-score-bar">
                <div
                  className="model-score-fill"
                  style={{
                    width: mounted ? (model.f1 / 100 * 100) + '%' : '0%',
                    background: model.best
                      ? 'linear-gradient(90deg, var(--accent), var(--chart-blue))'
                      : 'linear-gradient(90deg, var(--border-hover), var(--text-muted))',
                  }}
                />
              </div>
              <span className="model-score-value" style={{ color: model.best ? 'var(--accent)' : 'var(--text-secondary)' }}>
                {model.f1}%
              </span>
            </div>
          ))}
      </div>

      {/* Methodology note */}
      <div className="card" style={{ marginTop: '1.5rem' }}>
        <div className="card-header">
          <h3>Nota Metodológica</h3>
        </div>
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.8 }}>
          <p>
            El modelo seleccionado (<strong>SVM con kernel RBF</strong>) fue entrenado con <strong>258 variables clínicas</strong> derivadas
            de datos demográficos, signos vitales, resultados de laboratorio, panel respiratorio y hallazgos al examen físico.
            Se aplicó <strong>SMOTE</strong> para el balanceo de clases y <strong>validación cruzada de 5 folds</strong> con un scorer clínico
            personalizado que penaliza severamente los errores críticos (clasificar pacientes severos como leves).
          </p>
          <p style={{ marginTop: '0.75rem' }}>
            La interpretabilidad se verificó mediante análisis <strong>SHAP</strong>, confirmando que las variables de mayor impacto
            coinciden con la literatura médica: nivel de triage, escala de Glasgow, saturación de oxígeno y marcadores inflamatorios.
          </p>
        </div>
      </div>
    </div>
  );
}
