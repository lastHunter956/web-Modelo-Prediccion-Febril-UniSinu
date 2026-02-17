'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthProvider, useAuth } from '../../context/AuthContext';
import Link from 'next/link';
import { IconUser, IconMedical, IconMail, IconLock, IconCheck } from '../../components/Icons';

function RegisterForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [nombre, setNombre] = useState('');
    const [especialidad, setEspecialidad] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { signUp, isAuthenticated, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && isAuthenticated) {
            router.replace('/dashboard');
        }
    }, [isAuthenticated, loading, router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }
        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            return;
        }
        if (!nombre.trim()) {
            setError('El nombre es obligatorio');
            return;
        }

        setIsSubmitting(true);

        const result = await signUp(email, password, {
            nombre: nombre.trim(),
            especialidad: especialidad.trim() || null,
        });

        if (result.success) {
            setSuccess(true);
        } else {
            setError(result.error);
        }
        setIsSubmitting(false);
    };

    if (loading) return null;

    return (
        <div className="login-page">
            <div className="login-bg" />
            <div className="login-bg-pattern" />

            {/* Left — Hero */}
            <div className="login-left">
                <div className="login-hero-content">
                    <div className="login-hero-icon">
                        <IconMedical style={{ width: 48, height: 48 }} />
                    </div>
                    <h1>
                        Registro de{' '}
                        <span className="text-gradient">Profesional Médico</span>
                    </h1>
                    <p>
                        Crea tu cuenta para acceder al sistema de predicción de severidad
                        febril pediátrica. Solo personal médico autorizado.
                    </p>
                    <div className="login-hero-stats">
                        <div className="login-stat">
                            <div className="value">15</div>
                            <div className="label">Variables Clínicas</div>
                        </div>
                        <div className="login-stat">
                            <div className="value">3</div>
                            <div className="label">Niveles de Severidad</div>
                        </div>
                        <div className="login-stat">
                            <div className="value">612</div>
                            <div className="label">Pacientes Analizados</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right — Register Form */}
            <div className="login-right">
                <div className="login-card animate-slide">
                    <h2>Crear Cuenta</h2>
                    <p className="subtitle">Registra tus datos profesionales</p>

                    {success ? (
                        <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                            <div style={{ marginBottom: '1rem', color: 'var(--severity-low)' }}>
                                <IconCheck style={{ width: 48, height: 48 }} />
                            </div>
                            <h3 style={{ marginBottom: '0.5rem' }}>¡Registro exitoso!</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                                Revisa tu correo electrónico para confirmar tu cuenta.
                                Luego podrás iniciar sesión.
                            </p>
                            <Link href="/login" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                                Ir a Iniciar Sesión
                            </Link>
                        </div>
                    ) : (
                        <form className="login-form" onSubmit={handleSubmit}>
                            {error && <div className="login-error">{error}</div>}

                            <div className="input-group">
                                <label htmlFor="nombre">Nombre Completo *</label>
                                <div className="input-icon-wrapper">
                                    <span className="input-icon"><IconUser /></span>
                                    <input
                                        id="nombre"
                                        className="input"
                                        type="text"
                                        placeholder="Dr. Juan Pérez"
                                        value={nombre}
                                        onChange={(e) => setNombre(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="input-group">
                                <label htmlFor="especialidad">Especialidad</label>
                                <div className="input-icon-wrapper">
                                    <span className="input-icon"><IconMedical /></span>
                                    <input
                                        id="especialidad"
                                        className="input"
                                        type="text"
                                        placeholder="Pediatría, Urgencias, etc."
                                        value={especialidad}
                                        onChange={(e) => setEspecialidad(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="input-group">
                                <label htmlFor="reg-email">Correo Electrónico *</label>
                                <div className="input-icon-wrapper">
                                    <span className="input-icon"><IconMail /></span>
                                    <input
                                        id="reg-email"
                                        className="input"
                                        type="email"
                                        placeholder="doctor@ejemplo.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        autoComplete="email"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="input-group">
                                <label htmlFor="reg-password">Contraseña *</label>
                                <div className="input-icon-wrapper">
                                    <span className="input-icon"><IconLock /></span>
                                    <input
                                        id="reg-password"
                                        className="input"
                                        type="password"
                                        placeholder="Mínimo 6 caracteres"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        autoComplete="new-password"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="input-group">
                                <label htmlFor="reg-confirm">Confirmar Contraseña *</label>
                                <div className="input-icon-wrapper">
                                    <span className="input-icon"><IconLock /></span>
                                    <input
                                        id="reg-confirm"
                                        className="input"
                                        type="password"
                                        placeholder="Repita la contraseña"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        autoComplete="new-password"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary btn-lg"
                                disabled={isSubmitting}
                                style={{ width: '100%', marginTop: '0.5rem' }}
                            >
                                {isSubmitting ? 'Registrando...' : 'Crear Cuenta'}
                            </button>
                        </form>
                    )}

                    <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.85rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>¿Ya tienes cuenta? </span>
                        <Link href="/login" style={{ fontWeight: 600 }}>
                            Iniciar Sesión
                        </Link>
                    </div>

                    <div className="login-footer">
                        Universidad del Sinú — Cartagena, Colombia
                        <br />
                        Investigación Clínica · Dra. Fontalvo · 2026
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function RegisterPage() {
    return (
        <AuthProvider>
            <RegisterForm />
        </AuthProvider>
    );
}
