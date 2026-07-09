import React, { useState } from 'react';
import '../Login/Login.css';

const Register = ({ onSwitchToLogin }) => {
  const [role, setRole] = useState('CLIENT'); // 'CLIENT' o 'ADMIN'
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

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre,
          email,
          password,
          role,
          profesorEmail: role === 'CLIENT' ? profesorEmail : null
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        setError(errText || 'Error al registrar usuario');
      } else {
        setSuccess('¡Registro exitoso! Ya puedes iniciar sesión.');
        setTimeout(() => {
          onSwitchToLogin();
        }, 2000);
      }
    } catch (err) {
      setError('Error de red. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card" style={{ maxWidth: '400px' }}>
        <h1 className="login-title">Crear Cuenta</h1>
        <p className="login-subtitle">Únete a FitManage Pro</p>
        
        {error && <div style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</div>}
        {success && <div style={{ color: '#10b981', marginBottom: '1rem' }}>{success}</div>}

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <button 
            type="button" 
            className={`btn ${role === 'CLIENT' ? 'btn-admin' : ''}`}
            onClick={() => setRole('CLIENT')}
            style={{ flex: 1, background: role !== 'CLIENT' ? 'rgba(255,255,255,0.1)' : undefined }}
          >
            Soy Cliente
          </button>
          <button 
            type="button" 
            className={`btn ${role === 'ADMIN' ? 'btn-admin' : ''}`}
            onClick={() => setRole('ADMIN')}
            style={{ flex: 1, background: role !== 'ADMIN' ? 'rgba(255,255,255,0.1)' : undefined }}
          >
            Soy Profesor
          </button>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div style={{ marginBottom: '1rem', textAlign: 'left' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1' }}>Nombre Completo</label>
            <input 
              type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
            />
          </div>

          <div style={{ marginBottom: '1rem', textAlign: 'left' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1' }}>Email</label>
            <input 
              type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
            />
          </div>
          
          <div style={{ marginBottom: '1rem', textAlign: 'left' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1' }}>Contraseña</label>
            <input 
              type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
            />
          </div>

          <div style={{ marginBottom: '1rem', textAlign: 'left' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1' }}>Confirmar Contraseña</label>
            <input 
              type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
            />
          </div>

          {role === 'CLIENT' && (
            <div style={{ marginBottom: '2rem', textAlign: 'left' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1' }}>Email del Profesor asignado</label>
              <input 
                type="email" value={profesorEmail} onChange={(e) => setProfesorEmail(e.target.value)} required
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
              />
            </div>
          )}

          <button type="submit" className="btn btn-admin" disabled={loading} style={{ width: '100%', marginTop: '1rem' }}>
            {loading ? 'Registrando...' : 'Registrar'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem' }}>
          <button onClick={onSwitchToLogin} style={{ background: 'none', border: 'none', color: '#818cf8', cursor: 'pointer', textDecoration: 'underline' }}>
            ¿Ya tienes cuenta? Inicia Sesión
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;
