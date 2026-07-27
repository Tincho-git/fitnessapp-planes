import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login/Login';
import Register from './components/Register/Register';
import DashboardAdmin from './components/Admin/DashboardAdmin';
import ClientDashboard from './components/Client/ClientDashboard';

// route principal
const MainRouter = () => {
  const { user, logout } = useAuth();
  const [authView, setAuthView] = useState('login');

  // si no esta logeado se muesta el login o registro
  if (!user) {
    if (authView === 'login') {
      return <Login onSwitchToRegister={() => setAuthView('register')} />;
    } else {
      return <Register onSwitchToLogin={() => setAuthView('login')} />;
    }
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
          <span>Hola, {user.nombre || user.email}</span>
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
        {user.role === 'ADMIN' ? <DashboardAdmin /> : <ClientDashboard />}
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
