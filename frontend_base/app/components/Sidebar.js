'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const navItems = [
  { href: '/dashboard', icon: '📊', label: 'Dashboard' },
  { href: '/evaluacion', icon: '🩺', label: 'Evaluación de Paciente' },
  { href: '/rendimiento', icon: '📈', label: 'Rendimiento del Modelo' },
  { href: '/historial', icon: '📋', label: 'Historial de Pacientes' },
];

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`sidebar-overlay ${isOpen ? 'open' : ''}`}
        onClick={onClose}
      />

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Header */}
        <div className="sidebar-header">
          <div className="sidebar-logo">PF</div>
          <div className="sidebar-brand">
            <h2>Predicción Febril</h2>
            <span>UniSinú · Cartagena</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item ${pathname === item.href ? 'active' : ''}`}
              onClick={onClose}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </Link>
          ))}

          <div style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
            <button className="nav-item" onClick={toggleTheme} style={{ cursor: 'pointer' }}>
              <span className="nav-icon">{theme === 'dark' ? '☀️' : '🌙'}</span>
              {theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}
            </button>
          </div>
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="sidebar-user-info">
              <div className="name">{user?.name || 'Usuario'}</div>
              <div className="role">{user?.role || 'Investigador'}</div>
            </div>
          </div>
          <button
            className="btn btn-danger btn-sm"
            style={{ width: '100%', marginTop: '0.5rem' }}
            onClick={logout}
          >
            Cerrar Sesión
          </button>
        </div>
      </aside>
    </>
  );
}
