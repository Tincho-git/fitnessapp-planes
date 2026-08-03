import React, { useState } from 'react';
import '../Login/Login.css';
import { API_URL } from '../../utils/api';

const inputStyle = { width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.2)', color: 'white' };

const Register = ({ onSwitchToLogin }) => {
  const [role, setRole] = useState('CLIENT');
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profesorEmail, setProfesorEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (password !== confirmPassword) return setError('Las contraseñas no coinciden');
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, email, password, role, profesorEmail: role === 'CLIENT' ? profesorEmail : null })
      });
      const message = await response.text();
      if (!response.ok) throw new Error(message || 'Error al registrar usuario');
      setSuccess(message || 'Registro exitoso.');
      setTimeout(onSwitchToLogin, 2500);
    } catch (err) {
      setError(err.message || 'Error de red. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card" style={{ maxWidth: '400px' }}>
        <h1 className="login-title">Crear Cuenta</h1>
        <p className="login-subtitle">Únete a Fitnessapp planes</p>
        {error && <div style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</div>}
        {success && <div style={{ color: '#10b981', marginBottom: '1rem' }}>{success}</div>}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <button type="button" className="btn btn-admin" onClick={() => setRole('CLIENT')} style={{ flex: 1, opacity: role === 'CLIENT' ? 1 : 0.55 }}>Soy cliente</button>
          <button type="button" className="btn btn-admin" onClick={() => setRole('PROFESOR')} style={{ flex: 1, opacity: role === 'PROFESOR' ? 1 : 0.55 }}>Soy profesor</button>
        </div>
        <form onSubmit={handleSubmit} className="login-form">
          <div style={{ marginBottom: '1rem', textAlign: 'left' }}><label>Nombre completo</label><input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required style={inputStyle} /></div>
          <div style={{ marginBottom: '1rem', textAlign: 'left' }}><label>Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} /></div>
          <div style={{ marginBottom: '1rem', textAlign: 'left' }}><label>Contraseña</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} style={inputStyle} /></div>
          <div style={{ marginBottom: '1rem', textAlign: 'left' }}><label>Confirmar contraseña</label><input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6} style={inputStyle} /></div>
          {role === 'CLIENT' ? (
            <div style={{ marginBottom: '1rem', textAlign: 'left' }}><label>Email del profesor asignado</label><input type="email" value={profesorEmail} onChange={(e) => setProfesorEmail(e.target.value)} required style={inputStyle} /></div>
          ) : <p style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>Tu cuenta quedará pendiente hasta que un administrador la apruebe.</p>}
          <button type="submit" className="btn btn-admin" disabled={loading} style={{ width: '100%', marginTop: '1rem' }}>{loading ? 'Registrando...' : 'Registrar'}</button>
        </form>
        <div style={{ marginTop: '1.5rem' }}><button onClick={onSwitchToLogin} className="link-accent">¿Ya tienes cuenta? Inicia sesión</button></div>
      </div>
    </div>
  );
};

export default Register;
