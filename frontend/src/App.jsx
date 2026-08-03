import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login/Login';
import Register from './components/Register/Register';
import DashboardAdmin from './components/Admin/DashboardAdmin';
import DashboardProfessor from './components/Professor/DashboardProfessor';
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
      <header className="app-header">
        <img src="/logo.png" alt="Fitnessapp planes" className="app-header-logo" />
        <div className="app-header-actions">
          <span>Hola, {user.nombre || user.email}</span>
          <button onClick={logout} className="btn-logout">
            Cerrar Sesión
          </button>
        </div>
      </header>
      
      <main>
        {user.role === 'ADMIN' && <DashboardAdmin />}
        {user.role === 'PROFESOR' && <DashboardProfessor />}
        {user.role === 'CLIENT' && <ClientDashboard />}
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
