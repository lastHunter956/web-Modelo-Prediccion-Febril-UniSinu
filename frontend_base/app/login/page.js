'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthProvider, useAuth } from '../context/AuthContext';

function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, loading, router]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    setTimeout(() => {
      const result = login(username, password);
      if (result.success) {
        router.push('/dashboard');
      } else {
        setError(result.error);
        setIsSubmitting(false);
      }
    }, 600);
  };

  if (loading) return null;

  return (
    <div className="login-page">
      <div className="login-bg" />
      <div className="login-bg-pattern" />

      {/* Left — Hero Section */}
      <div className="login-left">
        <div className="login-hero-content">
          <div className="login-hero-icon">🏥</div>
          <h1>Modelo de Predicción de <span className="text-gradient">Severidad Febril</span> Pediátrica</h1>
          <p>
            Sistema inteligente basado en Machine Learning para clasificar la severidad
            de cuadros febriles en pacientes pediátricos, apoyando la toma de decisiones
            médicas en urgencias.
          </p>
          <div className="login-hero-stats">
            <div className="login-stat">
              <div className="value">94.3%</div>
              <div className="label">Accuracy</div>
            </div>
            <div className="login-stat">
              <div className="value">95.5%</div>
              <div className="label">F1-Macro</div>
            </div>
            <div className="login-stat">
              <div className="value">0</div>
              <div className="label">Errores Críticos</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right — Login Form */}
      <div className="login-right">
        <div className="login-card animate-slide">
          <h2>Iniciar Sesión</h2>
          <p className="subtitle">Accede al panel de análisis clínico</p>

          <form className="login-form" onSubmit={handleSubmit}>
            {error && <div className="login-error">{error}</div>}

            <div className="input-group">
              <label htmlFor="username">Usuario</label>
              <div className="input-icon-wrapper">
                <span className="input-icon">👤</span>
                <input
                  id="username"
                  className="input"
                  type="text"
                  placeholder="Ingrese su usuario"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="password">Contraseña</label>
              <div className="input-icon-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  id="password"
                  className="input"
                  type="password"
                  placeholder="Ingrese su contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
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
              {isSubmitting ? 'Verificando...' : 'Ingresar'}
            </button>
          </form>

          <div className="login-footer">
            Universidad del Sinú — Cartagena, Colombia<br />
            Investigación Clínica · Dra. Fontalvo · 2026
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <AuthProvider>
      <LoginForm />
    </AuthProvider>
  );
}
