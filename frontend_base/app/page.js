'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';

function HomeRedirect() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      router.replace(isAuthenticated ? '/dashboard' : '/login');
    }
  }, [isAuthenticated, loading, router]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="animate-pulse" style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
        Cargando...
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <AuthProvider>
      <HomeRedirect />
    </AuthProvider>
  );
}
