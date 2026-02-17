'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  IconDashboard, IconEvaluation, IconPerformance, IconHistory,
  IconSun, IconMoon, IconLogout, IconUser,
} from './Icons';

const navItems = [
  { href: '/dashboard', icon: IconDashboard, label: 'Dashboard' },
  { href: '/evaluacion', icon: IconEvaluation, label: 'Evaluación' },
  { href: '/rendimiento', icon: IconPerformance, label: 'Validación' },
  { href: '/historial', icon: IconHistory, label: 'Historial' },
  { href: '/perfil', icon: IconUser, label: 'Perfil' },
];

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const { profile, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const initials = profile?.nombre
    ? profile.nombre.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  return (
    <>
      {/* Overlay for mobile sidebar */}
      <div
        className={`sidebar-overlay ${isOpen ? 'open' : ''}`}
        onClick={onClose}
      />

      {/* ── Desktop Sidebar ── */}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">PF</div>
          <div className="sidebar-brand">
            <h2>Predicción Febril</h2>
            <span>UniSinú · Cartagena</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-item ${pathname === item.href ? 'active' : ''}`}
                onClick={onClose}
              >
                <span className="nav-icon"><Icon /></span>
                {item.label}
              </Link>
            );
          })}

          <div style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
            <button className="nav-item" onClick={toggleTheme} style={{ cursor: 'pointer' }}>
              <span className="nav-icon">{theme === 'dark' ? <IconSun /> : <IconMoon />}</span>
              {theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}
            </button>
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">{initials}</div>
            <div className="sidebar-user-info">
              <div className="name">{profile?.nombre || 'Usuario'}</div>
              <div className="role">{profile?.especialidad || 'Investigador'}</div>
            </div>
          </div>
          <button
            className="btn btn-secondary btn-sm"
            style={{ width: '100%', marginTop: '0.5rem', gap: '0.4rem' }}
            onClick={signOut}
          >
            <IconLogout style={{ width: '0.9em', height: '0.9em' }} /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* ── Mobile Bottom Navigation ── */}
      <nav className="bottom-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`bottom-nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
