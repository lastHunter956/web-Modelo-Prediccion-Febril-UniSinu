'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { IconUser, IconMail, IconMedical, IconSave, IconLoader, IconCheck, IconAlertCircle } from '../../components/Icons';

export default function ProfilePage() {
    const { user, profile, updateProfile, loading: authLoading } = useAuth();

    const [formData, setFormData] = useState({
        nombre: '',
        especialidad: '',
        institucion: ''
    });

    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null); // { type: 'success'|'error', text: '' }

    useEffect(() => {
        if (profile) {
            setFormData({
                nombre: profile.nombre || '',
                especialidad: profile.especialidad || '',
                institucion: profile.institucion || ''
            });
        }
    }, [profile]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        const { success, error } = await updateProfile(formData);

        if (success) {
            setMessage({ type: 'success', text: 'Perfil actualizado correctamente' });
        } else {
            setMessage({ type: 'error', text: 'Error al actualizar: ' + error });
        }
        setSaving(false);
    };

    if (authLoading) return <div className="p-8 text-center"><IconLoader /></div>;

    return (
        <div className="page-container" style={{ maxWidth: '800px' }}>
            <div className="page-header">
                <h1>Mi Perfil</h1>
                <p>Administra tu información personal y profesional</p>
            </div>

            <div className="card">
                <div className="card-header">
                    <h3>Información de Usuario</h3>
                </div>

                <form onSubmit={handleSubmit} className="form-grid">
                    {/* Email (Read only) */}
                    <div className="form-group">
                        <label>Correo Electrónico</label>
                        <div className="input-with-icon">
                            <IconMail className="icon" />
                            <input
                                type="email"
                                value={user?.email || ''}
                                disabled
                                className="input"
                                style={{ opacity: 0.7, cursor: 'not-allowed' }}
                            />
                        </div>
                        <span className="text-secondary text-sm">El correo no se puede cambiar.</span>
                    </div>

                    <div style={{ height: 1 }} className="desktop-only" /> {/* Spacer for grid */}

                    {/* Nombre */}
                    <div className="form-group">
                        <label>Nombre Completo</label>
                        <div className="input-with-icon">
                            <IconUser className="icon" />
                            <input
                                type="text"
                                className="input"
                                placeholder="Dr. Juan Pérez"
                                value={formData.nombre}
                                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    {/* Especialidad */}
                    <div className="form-group">
                        <label>Especialidad Médica</label>
                        <div className="input-with-icon">
                            <IconMedical className="icon" />
                            <input
                                type="text"
                                className="input"
                                placeholder="Ej. Pediatría, Medicina General"
                                value={formData.especialidad}
                                onChange={(e) => setFormData({ ...formData, especialidad: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Institución */}
                    <div className="form-group full-width">
                        <label>Institución</label>
                        <div className="input-with-icon">
                            <IconMedical className="icon" /> {/* Reusing medical icon or could use building */}
                            <input
                                type="text"
                                className="input"
                                placeholder="Universidad del Sinú"
                                value={formData.institucion}
                                onChange={(e) => setFormData({ ...formData, institucion: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Messages */}
                    {message && (
                        <div className={`full-width p-3 rounded mb-4 flex items-center gap-2 ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`} style={{
                                background: message.type === 'success' ? 'var(--severity-low-bg)' : 'var(--severity-high-bg)',
                                color: message.type === 'success' ? 'var(--severity-low)' : 'var(--severity-high)',
                                padding: '0.75rem',
                                borderRadius: 'var(--radius-md)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}>
                            {message.type === 'success' ? <IconCheck /> : <IconAlertCircle />}
                            {message.text}
                        </div>
                    )}

                    <div className="full-width" style={{ marginTop: '1rem' }}>
                        <button type="submit" className="btn btn-primary" disabled={saving}>
                            {saving ? <><IconLoader /> Guardando...</> : <><IconSave /> Guardar Cambios</>}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
