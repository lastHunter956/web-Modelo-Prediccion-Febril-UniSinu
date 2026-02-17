'use client';
import { IconCheck, IconAlertTriangle, IconShield, IconInfo, IconSave } from './Icons';

const severityConfig = {
    Leve: { icon: <IconCheck style={{ width: 32, height: 32 }} />, class: 'leve', color: 'var(--severity-low)' },
    Moderada: { icon: <IconAlertTriangle style={{ width: 32, height: 32 }} />, class: 'moderada', color: 'var(--severity-mid)' },
    Severa: { icon: <IconShield style={{ width: 32, height: 32 }} />, class: 'severa', color: 'var(--severity-high)' },
};

const barColor = {
    leve: 'var(--severity-low)',
    moderada: 'var(--severity-mid)',
    severa: 'var(--severity-high)',
};

export default function PredictionResult({ result, onClose, onSave, isSaving }) {
    if (!result) return null;

    const config = severityConfig[result.prediccion] || severityConfig.Leve;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '560px' }}>
                <div className="modal-header">
                    <h3>Resultado de la Predicción</h3>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>

                {/* Severity badge */}
                <div className="prediction-result">
                    <div className={`prediction-severity ${config.class}`}>
                        {config.icon}
                    </div>
                    <div className="prediction-label" style={{ color: config.color }}>
                        {result.prediccion}
                    </div>
                    <div className="prediction-confidence">
                        Confianza: {result.confianza}%
                    </div>
                </div>

                {/* Probability bars */}
                <div className="confidence-bars">
                    {['leve', 'moderada', 'severa'].map((key) => (
                        <div className="confidence-item" key={key}>
                            <div className="confidence-label">
                                <span>{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                                <span>{result.probabilidades[key]}%</span>
                            </div>
                            <div className="progress-bar">
                                <div
                                    className="progress-fill"
                                    style={{
                                        width: result.probabilidades[key] + '%',
                                        background: barColor[key],
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Contributing factors */}
                <div style={{ marginTop: '1.5rem' }}>
                    <h4
                        style={{
                            fontSize: '0.85rem',
                            color: 'var(--text-muted)',
                            marginBottom: '0.75rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                        }}
                    >
                        Factores Contribuyentes
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        {result.factores.map((f, i) => (
                            <div
                                key={i}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    fontSize: '0.85rem',
                                    color: 'var(--text-secondary)',
                                }}
                            >
                                <span style={{ color: 'var(--accent)' }}>•</span> {f}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Disclaimer */}
                <div
                    style={{
                        marginTop: '1.25rem',
                        padding: '0.75rem',
                        background: 'var(--bg-secondary)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                        lineHeight: 1.6,
                        fontStyle: 'italic',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.5rem',
                    }}
                >
                    <IconInfo style={{ width: 16, height: 16, flexShrink: 0, marginTop: 2 }} />
                    <span>{result.disclaimer}</span>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
                    {onSave && (
                        <button
                            className="btn btn-primary"
                            style={{ flex: 1 }}
                            onClick={onSave}
                            disabled={isSaving}
                        >
                            <IconSave style={{ width: '1em', height: '1em' }} />
                            {isSaving ? ' Guardando...' : ' Guardar en Historial'}
                        </button>
                    )}
                    <button
                        className="btn btn-secondary"
                        style={{ flex: 1 }}
                        onClick={onClose}
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}
