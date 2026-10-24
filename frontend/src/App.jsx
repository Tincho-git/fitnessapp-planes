import React, { useState } from 'react';
import { LogOut, User } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Login from './components/Login/Login';
import Register from './components/Register/Register';
import DashboardAdmin from './components/Admin/DashboardAdmin';
import DashboardProfessor from './components/Professor/DashboardProfessor';
import ClientDashboard from './components/Client/ClientDashboard';

const roleLabels = {
  ADMIN: 'Admin',
  PROFESOR: 'Profesor',
  CLIENT: 'Atleta',
};

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
        <div className="app-header-brand">
          <img src="/logo.png" alt="Fitnessapp planes" className="app-header-logo" />
          <span className="app-header-title">FitnessApp</span>
        </div>
        <div className="app-header-actions">
          <div className="user-pill">
            <User size={15} style={{ color: 'var(--accent-color)' }} />
            <span className="user-pill-name">{user.nombre || user.email}</span>
            {user.role && (
              <span className="user-pill-role">{roleLabels[user.role] || user.role}</span>
            )}
          </div>
          <button onClick={logout} className="btn-logout" title="Cerrar Sesión">
            <LogOut size={16} />
            <span>Salir</span>
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
      <ToastProvider>
        <MainRouter />
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
