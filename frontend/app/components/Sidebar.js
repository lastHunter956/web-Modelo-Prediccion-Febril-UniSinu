'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  IconDashboard, IconEvaluation, IconPerformance, IconHistory,
  IconSun, IconMoon, IconLogout, IconUser, IconMenu, IconClose, IconChevronRight
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const initials = profile?.nombre
    ? profile.nombre.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <>
      {/* ── Mobile Header (Visible only on mobile) ── */}
      <div className="mobile-header-bar">
        <div className="mobile-brand-container">
          <div className="mobile-logo">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0z" />
              <line x1="12" y1="14" x2="12" y2="12" />
              <line x1="12" y1="10" x2="12" y2="8" />
            </svg>
          </div>
          <span className="mobile-brand-text">Predicción <strong>Febril</strong></span>
        </div>
        <button
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Abrir menú"
        >
          <IconMenu style={{ width: 24, height: 24 }} />
        </button>
      </div>

      {/* ── Mobile Menu Drawer ── */}
      <div className={`mobile-menu-overlay ${mobileMenuOpen ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
        <div className={`mobile-menu-drawer ${mobileMenuOpen ? 'active' : ''}`} onClick={e => e.stopPropagation()}>
          <div className="mobile-menu-header">
            <span className="mobile-menu-title">Menú</span>
            <button className="mobile-close-btn" onClick={() => setMobileMenuOpen(false)}>
              <IconClose style={{ width: 24, height: 24 }} />
            </button>
          </div>

          <div className="mobile-menu-content">
            <Link
              href="/perfil"
              className="mobile-user-card"
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="mobile-avatar">{initials}</div>
              <div className="mobile-user-details">
                <div className="mobile-user-name">{profile?.nombre || 'Usuario'}</div>
                <div className="mobile-user-role">{profile?.especialidad || 'Investigador'}</div>
              </div>
              <div style={{ marginLeft: 'auto', color: 'var(--text-muted)' }}>
                <IconChevronRight style={{ width: 20, height: 20, opacity: 0.5 }} />
              </div>
            </Link>

            <div className="mobile-menu-actions">
              <button className="mobile-menu-item" onClick={() => { toggleTheme(); setMobileMenuOpen(false); }}>
                <span className="mobile-icon-wrapper">
                  {theme === 'dark' ? <IconSun /> : <IconMoon />}
                </span>
                {theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}
              </button>

              <div className="mobile-divider"></div>

              <button className="mobile-menu-item danger" onClick={signOut}>
                <span className="mobile-icon-wrapper">
                  <IconLogout />
                </span>
                Cerrar Sesión
              </button>
            </div>

            <div className="mobile-app-info">
              Predicción Febril v2.0
              <br />University of Sinú
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for desktop/tablet sidebar */}
      <div
        className={`sidebar-overlay ${isOpen ? 'open' : ''}`}
        onClick={onClose}
      />

      {/* ── Desktop Sidebar ── */}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0z" />
              <line x1="12" y1="14" x2="12" y2="12" />
              <line x1="12" y1="10" x2="12" y2="8" />
            </svg>
          </div>
          <div className="sidebar-brand">
            <h2>Predicción <span className="sidebar-brand-accent">Febril</span></h2>
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
        {[
          { icon: IconDashboard, label: 'Inicio', href: '/dashboard' },
          { icon: IconEvaluation, label: 'Evaluar', href: '/evaluacion' },
          { icon: IconPerformance, label: 'Validación', href: '/rendimiento' },
          { icon: IconHistory, label: 'Historial', href: '/historial' },
        ].map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`bottom-nav-item ${isActive ? 'active' : ''}`}
            >
              <item.icon />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Mobile styles (Inline to avoid global pollution if not needed globally) */}
      <style jsx>{`
        .mobile-header-bar {
            display: none;
            position: fixed;
            top: 0; 
            left: 0; 
            right: 0;
            height: 60px;
            background: var(--bg-card);
            border-bottom: 1px solid var(--border);
            align-items: center;
            justify-content: space-between;
            padding: 0 1rem;
            z-index: 900;
            box-shadow: 0 4px 20px -5px rgba(0, 0, 0, 0.1);
        }

        /* Glassmorphism support */
        @supports (backdrop-filter: blur(12px)) {
            .mobile-header-bar {
                background: color-mix(in srgb, var(--bg-card) 85%, transparent);
                backdrop-filter: blur(12px);
                -webkit-backdrop-filter: blur(12px);
            }
        }
        
        .mobile-brand-container {
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }
        
        .mobile-logo {
            width: 32px;
            height: 32px;
            background: linear-gradient(135deg, var(--accent), var(--unisinu-dark));
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            box-shadow: 0 0 0 2px var(--accent-dim);
        }
        
        .mobile-brand-text {
            font-size: 1rem;
            color: var(--text-primary);
        }
        
        .mobile-menu-btn {
            background: transparent;
            border: none;
            color: var(--text-primary);
            padding: 0.5rem;
            cursor: pointer;
        }
        
        .mobile-menu-overlay {
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.6);
            backdrop-filter: blur(4px);
            z-index: 2000;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s;
        }
        
        .mobile-menu-overlay.active {
            opacity: 1;
            pointer-events: auto;
        }
        
        .mobile-menu-drawer {
            position: absolute;
            top: 0; right: 0; bottom: 0;
            width: 280px;
            background: var(--bg-card);
            border-left: 1px solid var(--border);
            transform: translateX(100%);
            transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            display: flex;
            flex-direction: column;
        }
        
        .mobile-menu-drawer.active {
            transform: translateX(0);
        }
        
        .mobile-menu-header {
            padding: 1.25rem;
            border-bottom: 1px solid var(--border);
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        
        .mobile-menu-title {
            font-weight: 700;
            font-size: 1.1rem;
        }
        
        .mobile-close-btn {
            background: transparent;
            border: none;
            color: var(--text-muted);
            cursor: pointer;
        }
        
        .mobile-menu-content {
            padding: 1.25rem;
            flex: 1;
            display: flex;
            flex-direction: column;
        }
        
        .mobile-user-card {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 1rem;
            background: var(--bg-secondary);
            border-radius: var(--radius-lg);
            margin-bottom: 2rem;
            border: 1px solid var(--border);
            text-decoration: none;
            position: relative;
            overflow: hidden;
            transition: all 0.2s ease;
        }

        .mobile-user-card:hover {
            background: var(--bg-card-hover);
            border-color: var(--border-hover);
            transform: translateY(-1px);
        }

        .mobile-user-card:active {
            transform: scale(0.98);
            background: var(--bg-primary);
        }
        
        .mobile-avatar {
            width: 44px; height: 44px;
            flex-shrink: 0;
            border-radius: 50%;
            background: var(--accent);
            color: white;
            display: flex; align-items: center; justify-content: center;
            font-weight: 600;
            font-size: 1rem;
            box-shadow: 0 2px 8px rgba(var(--accent-rgb), 0.25);
        }
        
        .mobile-user-details {
            display: flex; flex-direction: column;
            gap: 2px;
            flex: 1;
            min-width: 0; /* Prevent flex overflow */
        }
        
        .mobile-user-name {
            font-weight: 600; 
            font-size: 0.95rem;
            color: var(--text-primary);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        
        .mobile-user-role {
            font-size: 0.8rem; 
            color: var(--text-muted);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        
        .mobile-menu-actions {
            display: flex; flex-direction: column; gap: 0.5rem;
        }
        
        .mobile-menu-item {
            display: flex; align-items: center; gap: 1rem;
            padding: 1rem;
            background: transparent;
            border: none;
            color: var(--text-primary);
            font-size: 1rem;
            font-weight: 500;
            text-align: left;
            cursor: pointer;
            border-radius: var(--radius-lg);
            transition: all 0.2s ease;
            margin-bottom: 0.25rem;
        }
        
        .mobile-menu-item:hover {
            background: var(--bg-hover);
            transform: translateX(4px);
        }
        
        .mobile-menu-item:active {
            transform: scale(0.98);
        }
        
        .mobile-menu-item.danger {
            color: var(--severity-high);
            margin-top: 0.5rem;
        }
        
        .mobile-menu-item.danger:hover {
            background: var(--severity-high-bg);
            border: 1px solid var(--severity-high);
        }
        
        .mobile-icon-wrapper {
            width: 24px; display: flex; justify-content: center;
            color: var(--text-muted);
        }
        
        .mobile-menu-item.danger .mobile-icon-wrapper {
            color: var(--severity-high);
        }
        
        .mobile-divider {
            height: 1px; background: var(--border); margin: 0.5rem 0;
        }
        
        .mobile-app-info {
            margin-top: auto;
            text-align: center;
            font-size: 0.75rem;
            color: var(--text-muted);
            line-height: 1.5;
            padding-top: 2rem;
        }

        @media (max-width: 768px) {
            .mobile-header-bar { display: flex; }
        }
      `}</style>
    </>
  );
}
