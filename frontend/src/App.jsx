import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login/Login';
import DashboardAdmin from './components/Admin/DashboardAdmin';

// dashboard del cliente
const ClientDashboardPlaceholder = () => (
  <div style={{ padding: '2rem', textAlign: 'center' }}>
    <h2>Mi Plan (Próximamente)</h2>
    <p>Aquí irá la visualización de la rutina agrupada por músculos.</p>
  </div>
);

// route principal
const MainRouter = () => {
  const { user, logout } = useAuth();

  // si no esta logeado se muesta el login
  if (!user) {
    return <Login />;
  }

  // el header si esta logeado
  return (
    <>
      <header style={{ 
        padding: '1rem 2rem', 
        background: 'rgba(255,255,255,0.05)', 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{ fontWeight: '700', fontSize: '1.2rem', color: '#818cf8' }}>FitManage</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span>Hola, {user.email || user.name}</span>
          <button 
            onClick={logout}
            style={{
              padding: '0.5rem 1rem',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.2)',
              color: 'white',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Cerrar Sesión
          </button>
        </div>
      </header>
      
      <main>
        {user.role === 'ADMIN' ? <DashboardAdmin /> : <ClientDashboardPlaceholder />}
      </main>
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <MainRouter />
    </AuthProvider>
  );
}

export default App;
