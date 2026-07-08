import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login/Login';
import DashboardAdmin from './components/Admin/DashboardAdmin';

// Placeholder components for routing (we'll implement them in 3.B and 3.C)
const ClientDashboardPlaceholder = () => (
  <div style={{ padding: '2rem', textAlign: 'center' }}>
    <h2>Mi Plan (Próximamente)</h2>
    <p>Aquí irá la visualización de la rutina agrupada por músculos.</p>
  </div>
);

// Main Router based on Role
const MainRouter = () => {
  const { user, logout } = useAuth();

  // If no user is logged in, show Login
  if (!user) {
    return <Login />;
  }

  // Basic Header for Navigation/Logout
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
