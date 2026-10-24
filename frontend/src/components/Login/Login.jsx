import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import './Login.css';

const Login = ({ onSwitchToRegister }) => {
  const { login } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const success = await login(email, password);
    if (!success) {
      const msg = 'Credenciales incorrectas. Por favor, intenta de nuevo.';
      setError(msg);
      toast.error(msg);
    } else {
      toast.success('¡Bienvenido de nuevo!');
    }
    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <img src="/logo.png" alt="Fitnessapp planes" className="login-logo" />
        <h1 className="login-title">FitnessApp</h1>
        <p className="login-subtitle">Ingresa tus datos para continuar tu entrenamiento</p>

        {error && <div className="error-alert" style={{ justifyContent: 'center' }}>{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="auth-field">
            <label>Correo electrónico</label>
            <div className="auth-input-wrap">
              <Mail size={18} className="auth-input-icon" />
              <input
                type="email"
                className="auth-input"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="auth-field" style={{ marginBottom: '1.75rem' }}>
            <label>Contraseña</label>
            <div className="auth-input-wrap">
              <Lock size={18} className="auth-input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                className="auth-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="auth-eye-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-admin"
            disabled={loading}
            style={{ width: '100%' }}
          >
            <LogIn size={19} />
            {loading ? 'Ingresando...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem' }}>
          <button onClick={onSwitchToRegister} className="link-accent">
            ¿No tienes cuenta? Regístrate gratis
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
