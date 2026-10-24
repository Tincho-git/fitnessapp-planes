import React, { useState } from 'react';
import { User, Mail, Lock, Dumbbell, UserCheck, UserPlus, Eye, EyeOff } from 'lucide-react';
import '../Login/Login.css';
import { API_URL } from '../../utils/api';
import { useToast } from '../../context/ToastContext';

const Register = ({ onSwitchToLogin }) => {
  const { toast } = useToast();
  const [role, setRole] = useState('CLIENT');
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [profesorEmail, setProfesorEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      const msg = 'Las contraseñas no coinciden';
      setError(msg);
      toast.error(msg);
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre,
          email,
          password,
          role,
          profesorEmail: role === 'CLIENT' ? profesorEmail : null,
        }),
      });
      const message = await response.text();
      if (!response.ok) throw new Error(message || 'Error al registrar usuario');
      toast.success(message || 'Registro exitoso. Ahora puedes iniciar sesión.');
      setTimeout(onSwitchToLogin, 1800);
    } catch (err) {
      const msg = err.message || 'Error de red. Intenta de nuevo.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card" style={{ maxWidth: '440px' }}>
        <h1 className="login-title">Crear Cuenta</h1>
        <p className="login-subtitle">Únete a FitnessApp y lleva tu progreso al día</p>

        {error && <div className="error-alert" style={{ justifyContent: 'center' }}>{error}</div>}

        <div className="role-switch-group">
          <button
            type="button"
            className={`role-switch-btn ${role === 'CLIENT' ? 'active' : ''}`}
            onClick={() => setRole('CLIENT')}
          >
            <Dumbbell size={17} />
            Soy Atleta
          </button>
          <button
            type="button"
            className={`role-switch-btn ${role === 'PROFESOR' ? 'active' : ''}`}
            onClick={() => setRole('PROFESOR')}
          >
            <UserCheck size={17} />
            Soy Profesor
          </button>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="auth-field">
            <label>Nombre completo</label>
            <div className="auth-input-wrap">
              <User size={18} className="auth-input-icon" />
              <input
                type="text"
                className="auth-input"
                placeholder="Ej: Martín Gómez"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </div>
          </div>

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

          <div className="auth-field">
            <label>Contraseña</label>
            <div className="auth-input-wrap">
              <Lock size={18} className="auth-input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                className="auth-input"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
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

          <div className="auth-field">
            <label>Confirmar contraseña</label>
            <div className="auth-input-wrap">
              <Lock size={18} className="auth-input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                className="auth-input"
                placeholder="Repite tu contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
          </div>

          {role === 'CLIENT' ? (
            <div className="auth-field">
              <label>Email de tu profesor asignado</label>
              <div className="auth-input-wrap">
                <UserCheck size={18} className="auth-input-icon" />
                <input
                  type="email"
                  className="auth-input"
                  placeholder="profesor@email.com"
                  value={profesorEmail}
                  onChange={(e) => setProfesorEmail(e.target.value)}
                  required
                />
              </div>
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem', margin: '0.5rem 0 1rem' }}>
              Tu cuenta quedará pendiente hasta que un administrador la apruebe.
            </p>
          )}

          <button
            type="submit"
            className="btn btn-admin"
            disabled={loading}
            style={{ width: '100%', marginTop: '0.5rem' }}
          >
            <UserPlus size={19} />
            {loading ? 'Registrando...' : 'Crear Cuenta'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem' }}>
          <button onClick={onSwitchToLogin} className="link-accent">
            ¿Ya tienes cuenta? Inicia sesión
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;
