'use client';
import { IconCheck, IconAlertTriangle, IconShield, IconInfo, IconSave } from './Icons';

const severityConfig = {
    Leve: {
        icon: <IconCheck style={{ width: 48, height: 48 }} />,
        class: 'leve',
        color: 'var(--severity-low)',
        bg: 'rgba(52, 211, 153, 0.1)', // var(--severity-low-bg) equivalent 
        border: 'var(--severity-low)'
    },
    Moderada: {
        icon: <IconAlertTriangle style={{ width: 48, height: 48 }} />,
        class: 'moderada',
        color: 'var(--severity-mid)',
        bg: 'rgba(251, 191, 36, 0.1)', // var(--severity-mid-bg)
        border: 'var(--severity-mid)'
    },
    Severa: {
        icon: <IconShield style={{ width: 48, height: 48 }} />,
        class: 'severa',
        color: 'var(--severity-high)',
        bg: 'rgba(248, 113, 113, 0.1)', // var(--severity-high-bg)
        border: 'var(--severity-high)'
    },
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
        <div className="modal-overlay" onClick={onClose} style={{
            backdropFilter: 'blur(8px)',
            backgroundColor: 'rgba(0, 0, 0, 0.4)'
        }}>
            <div className="modal glass-panel" onClick={(e) => e.stopPropagation()} style={{
                maxWidth: '500px',
                width: '90%',
                borderRadius: '24px',
                padding: '0',
                border: `1px solid rgba(255, 255, 255, 0.1)`,
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                overflow: 'hidden',
                background: 'var(--bg-card)' // Fallback
            }}>
                {/* Header with gradient based on severity */}
                <div style={{
                    background: `linear-gradient(135deg, ${config.bg} 0%, transparent 100%)`,
                    padding: '2.5rem 2rem',
                    textAlign: 'center',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                }}>
                    <div style={{
                        display: 'inline-flex',
                        padding: '1.25rem',
                        borderRadius: '50%',
                        background: 'var(--bg-primary)',
                        boxShadow: '0 8px 16px -4px rgba(0, 0, 0, 0.1)',
                        marginBottom: '1.25rem',
                        color: config.color,
                        border: `2px solid ${config.border}`
                    }}>
                        {config.icon}
                    </div>

                    <h2 style={{
                        fontSize: '2.25rem',
                        fontWeight: '800',
                        color: config.color,
                        marginBottom: '0.25rem',
                        letterSpacing: '-0.02em',
                        lineHeight: 1.1
                    }}>
                        {result.prediccion}
                    </h2>

                    <div style={{
                        fontSize: '0.875rem',
                        color: 'var(--text-secondary)',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                    }}>
                        Nivel de Severidad
                    </div>

                    <div style={{
                        marginTop: '1.5rem',
                        display: 'inline-flex',
                        alignItems: 'baseline',
                        gap: '0.25rem',
                        background: 'var(--bg-secondary)',
                        padding: '0.5rem 1.25rem',
                        borderRadius: '9999px',
                        border: '1px solid var(--border)'
                    }}>
                        <span style={{ fontSize: '1.5rem', fontWeight: '800', lineHeight: 1, color: 'var(--text-primary)' }}>
                            {result.confianza}
                        </span>
                        <span style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-muted)' }}>% Confianza</span>
                    </div>
                </div>

                <div style={{ padding: '2rem' }}>
                    {/* Probability Bars */}
                    <div className="confidence-bars" style={{ gap: '1rem' }}>
                        {['leve', 'moderada', 'severa'].map((key) => (
                            <div className="confidence-item" key={key} style={{ marginBottom: 0 }}>
                                <div className="confidence-label" style={{ marginBottom: '0.4rem', justifyContent: 'space-between', display: 'flex' }}>
                                    <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
                                        {key.charAt(0).toUpperCase() + key.slice(1)}
                                    </span>
                                    <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                                        {result.probabilidades[key]}%
                                    </span>
                                </div>
                                <div className="progress-bar" style={{ height: '6px', background: 'var(--bg-secondary)' }}>
                                    <div
                                        className="progress-fill"
                                        style={{
                                            width: result.probabilidades[key] + '%',
                                            background: barColor[key],
                                            borderRadius: '6px'
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Factors */}
                    <div style={{ marginTop: '2rem', padding: '1.25rem', background: 'var(--bg-secondary)', borderRadius: '16px' }}>
                        <h4 style={{
                            fontSize: '0.75rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                            color: 'var(--text-muted)',
                            marginBottom: '1rem',
                            fontWeight: '700'
                        }}>
                            Factores Contribuyentes
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {result.factores.map((f, i) => (
                                <div key={i} style={{
                                    display: 'flex',
                                    gap: '0.75rem',
                                    fontSize: '0.9rem',
                                    color: 'var(--text-primary)',
                                    alignItems: 'center'
                                }}>
                                    <IconInfo style={{ width: 18, height: 18, color: 'var(--accent)', flexShrink: 0 }} />
                                    <span>{f}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                        <button
                            className="btn btn-secondary"
                            onClick={onClose}
                            style={{
                                flex: 1,
                                justifyContent: 'center',
                                padding: '0.875rem',
                                borderRadius: '12px',
                                fontSize: '1rem'
                            }}
                        >
                            Cerrar
                        </button>
                        {onSave && (
                            <button
                                className="btn btn-primary"
                                onClick={onSave}
                                disabled={isSaving}
                                style={{
                                    flex: 1,
                                    justifyContent: 'center',
                                    padding: '0.875rem',
                                    borderRadius: '12px',
                                    fontSize: '1rem'
                                }}
                            >
                                <IconSave style={{ width: 20, height: 20 }} />
                                {isSaving ? 'Guardando...' : 'Guardar'}
                            </button>
                        )}
                    </div>

                    <div style={{
                        marginTop: '1.5rem',
                        textAlign: 'center',
                        fontSize: '0.7rem',
                        color: 'var(--text-muted)',
                        lineHeight: 1.5,
                        opacity: 0.8
                    }}>
                        {result.disclaimer}
                    </div>
                </div>
            </div>
        </div>
    );
}
