import React, { useEffect, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { FileText, Grid, FilePlus, BookTemplate, User, Settings, Menu, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';

export default function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (user) {
      supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
        .then(({ data }) => setProfile(data));
    }
  }, [user]);

  // Close sidebar on route change in mobile
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  const navItems = [
    { to: '/app', icon: <Grid size={16} />, label: 'Dashboard' },
    { to: '/app/nova-minuta', icon: <FilePlus size={16} />, label: 'Nova Minuta' },
    { to: '/app/templates', icon: <BookTemplate size={16} />, label: 'Templates' },
    { to: '/app/conta', icon: <User size={16} />, label: 'Conta e Planos' },
  ];

  if (profile?.role === 'admin') {
    navItems.push({ to: '/app/admin', icon: <Settings size={16} />, label: 'Administração' });
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="app-container">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="mobile-only" 
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 90 }}
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className={`sidebar ${isSidebarOpen ? 'mobile-open' : ''}`}>
        <div className="topbar-placeholder" style={{ height: '48px', backgroundColor: 'var(--color-primary)' }}></div>
        
        <div style={{ padding: '24px 0', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ padding: '0 16px', marginBottom: '8px', fontSize: '11px', color: 'var(--color-text-placeholder)', textTransform: 'uppercase', fontWeight: 600 }}>Menu</div>
          
          {navItems.map((item) => {
            const isActive = location.pathname === item.to || (item.to !== '/app' && location.pathname.startsWith(item.to));
            return (
              <Link 
                key={item.to}
                to={item.to} 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  height: '36px',
                  padding: '0 16px',
                  color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                  backgroundColor: isActive ? 'var(--color-bg-active)' : 'transparent',
                  borderLeft: isActive ? '2px solid var(--color-primary)' : '2px solid transparent',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: isActive ? 500 : 400
                }}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </div>
        
        <div style={{ marginTop: 'auto', padding: '16px', borderTop: '1px solid var(--color-border)' }}>
          <div style={{ fontSize: '12px', color: 'var(--color-text-main)', fontWeight: 500 }}>
            Plano {profile?.plan || 'Essencial'}
          </div>
          <Link to="/app/conta" style={{ fontSize: '12px', color: 'var(--color-primary)' }}>Gerir plano</Link>
        </div>
      </div>

      <div className="content-area">
        <div className="topbar" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button 
              className="btn btn-ghost mobile-only" 
              style={{ padding: '4px', color: 'white', display: 'none' }} 
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            <img src="/logo.png" alt="Minha Minuta" style={{ height: '24px', filter: 'brightness(0) invert(1)' }} />
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div className="mobile-hide" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 500 }}>
                {profile?.full_name || user?.email || 'A carregar...'}
              </span>
              <span className="badge badge-active" style={{ fontSize: '10px', backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', borderColor: 'transparent' }}>
                {(profile?.plan || 'ESSENCIAL').toUpperCase()}
              </span>
            </div>
            <Link to="/app/conta" className="mobile-hide" style={{ color: 'white', textDecoration: 'none', fontSize: '13px' }}>Perfil</Link>
            <button onClick={handleLogout} className="btn-ghost" style={{ color: 'white', fontSize: '13px', border: 'none', cursor: 'pointer', padding: 0 }}>Sair</button>
          </div>
        </div>
        
        <div style={{ marginTop: '48px', flexGrow: 1 }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
