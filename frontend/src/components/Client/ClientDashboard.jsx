import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../utils/api';

const ClientDashboard = () => {
  const [plans, setPlans] = useState([]);
  const [newProfessorEmail, setNewProfessorEmail] = useState('');
  const [profError, setProfError] = useState('');
  const [profSuccess, setProfSuccess] = useState('');

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await apiFetch('/api/my-plan');
      if (response.ok) {
        const data = await response.json();
        setPlans(data);
      }
    } catch (error) {
      console.error("Error cargando el plan:", error);
    }
  };

  const handleChangeProfessor = async (e) => {
    e.preventDefault();
    setProfError('');
    setProfSuccess('');

    try {
      const response = await apiFetch('/api/users/clients/profesor', {
        method: 'PUT',
        body: JSON.stringify({ profesorEmail: newProfessorEmail })
      });

      if (!response.ok) {
        setProfError('Error al cambiar profesor. Asegúrate de que el email es válido y pertenece a un profesor.');
      } else {
        setProfSuccess('Profesor actualizado exitosamente.');
        setNewProfessorEmail('');
        fetchPlans(); // Recargar planes (quizás el nuevo profesor borró los viejos, o para actualizar estado)
      }
    } catch (err) {
      setProfError('Error de red al intentar cambiar de profesor.');
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', color: '#f8fafc' }}>Mi Plan de Entrenamiento</h2>
      
      <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', color: '#818cf8' }}>Configuración</h3>
        <p style={{ color: '#cbd5e1', marginBottom: '1rem', fontSize: '0.9rem' }}>¿Quieres cambiar de profesor? Ingresa su email aquí:</p>
        
        {profError && <div style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '0.9rem' }}>{profError}</div>}
        {profSuccess && <div style={{ color: '#10b981', marginBottom: '1rem', fontSize: '0.9rem' }}>{profSuccess}</div>}

        <form onSubmit={handleChangeProfessor} style={{ display: 'flex', gap: '1rem' }}>
          <input 
            type="email" 
            placeholder="Email del nuevo profesor..." 
            value={newProfessorEmail}
            onChange={(e) => setNewProfessorEmail(e.target.value)}
            required
            style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
          />
          <button type="submit" className="btn btn-admin" style={{ padding: '0.75rem 1.5rem' }}>Cambiar</button>
        </form>
      </div>

      <div>
        <h3 style={{ marginBottom: '1rem', color: '#f8fafc' }}>Ejercicios Asignados</h3>
        {plans.length === 0 ? (
          <p style={{ color: '#94a3b8' }}>No tienes ejercicios asignados por tu profesor actual.</p>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {plans.map(plan => (
              <div key={plan.id} style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <h4 style={{ color: '#818cf8', margin: '0 0 0.5rem 0' }}>{plan.exercise.nombre} <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>({plan.exercise.musculo})</span></h4>
                <div style={{ display: 'flex', gap: '2rem', color: '#e2e8f0', fontSize: '0.9rem' }}>
                  <span><strong>Sets:</strong> {plan.sets}</span>
                  <span><strong>Reps:</strong> {plan.reps}</span>
                  <span><strong>Peso:</strong> {plan.pesoSugerido} kg</span>
                </div>
                {plan.notasExtras && <p style={{ marginTop: '0.5rem', color: '#94a3b8', fontSize: '0.9rem', fontStyle: 'italic' }}>"{plan.notasExtras}"</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientDashboard;
