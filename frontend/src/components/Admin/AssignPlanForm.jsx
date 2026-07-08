import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../utils/api';

const AssignPlanForm = ({ client, onClose }) => {
  const [exercises, setExercises] = useState([]);
  const [clientPlans, setClientPlans] = useState([]);
  
  // Form state
  const [exerciseId, setExerciseId] = useState('');
  const [sets, setSets] = useState(3);
  const [reps, setReps] = useState(10);
  const [pesoSugerido, setPesoSugerido] = useState('');
  const [notasExtras, setNotasExtras] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, [client]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      // Cargar catálogo de ejercicios
      const exRes = await apiFetch('/api/exercises');
      const exData = await exRes.json();
      setExercises(exData);
      if (exData.length > 0) setExerciseId(exData[0].id);

      // Cargar el plan actual del cliente
      fetchClientPlan();
    } catch (err) {
      setError('Error al cargar los datos iniciales.');
    } finally {
      setLoading(false);
    }
  };

  const fetchClientPlan = async () => {
    try {
      const planRes = await apiFetch(`/api/users/clients/${client.id}/plan`);
      const planData = await planRes.json();
      setClientPlans(planData);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await apiFetch('/api/training-plans', {
        method: 'POST',
        body: JSON.stringify({
          clientId: client.id,
          exerciseId: parseInt(exerciseId),
          sets: parseInt(sets),
          reps: parseInt(reps),
          pesoSugerido: pesoSugerido ? parseFloat(pesoSugerido) : null,
          notasExtras
        })
      });

      if (!response.ok) throw new Error('Error al asignar el ejercicio.');
      
      // Limpiar un poco el formulario y recargar el plan del cliente
      setNotasExtras('');
      fetchClientPlan();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePlan = async (planId) => {
    if (!window.confirm('¿Remover este ejercicio de la rutina del cliente?')) return;
    try {
      await apiFetch(`/api/training-plans/${planId}`, { method: 'DELETE' });
      fetchClientPlan();
    } catch (err) {
      setError('Error al eliminar el ejercicio del plan.');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content large-modal">
        <div className="modal-header">
          <h2>Rutina de: {client.nombre}</h2>
          <button className="btn-close" onClick={onClose}>✖</button>
        </div>

        {error && <div className="error-alert">{error}</div>}

        <div className="assign-layout">
          {/* Columna Izquierda: Formulario de Asignación */}
          <div className="assign-form-col">
            <h3>Asignar Nuevo Ejercicio</h3>
            {loading ? <p>Cargando ejercicios...</p> : (
              <form onSubmit={handleSubmit} className="custom-form">
                <div className="form-group">
                  <label>Ejercicio</label>
                  <select value={exerciseId} onChange={(e) => setExerciseId(e.target.value)} required>
                    {exercises.map(ex => (
                      <option key={ex.id} value={ex.id}>{ex.nombre} ({ex.musculo})</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Sets</label>
                    <input type="number" min="1" value={sets} onChange={(e) => setSets(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label>Repeticiones</label>
                    <input type="number" min="1" value={reps} onChange={(e) => setReps(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label>Peso Sugerido (kg)</label>
                    <input type="number" step="0.5" value={pesoSugerido} onChange={(e) => setPesoSugerido(e.target.value)} />
                  </div>
                </div>

                <div className="form-group">
                  <label>Notas (opcional)</label>
                  <input type="text" value={notasExtras} onChange={(e) => setNotasExtras(e.target.value)} placeholder="Ej: Mantener espalda recta" />
                </div>

                <button type="submit" className="btn-primary" disabled={isSubmitting || exercises.length === 0}>
                  {isSubmitting ? 'Asignando...' : 'Asignar a la Rutina'}
                </button>
              </form>
            )}
          </div>

          {/* Columna Derecha: Plan Actual del Cliente */}
          <div className="current-plan-col">
            <h3>Rutina Actual ({clientPlans.length} ejercicios)</h3>
            <div className="plan-list">
              {clientPlans.length === 0 ? (
                <p className="empty-state">El cliente aún no tiene ejercicios asignados.</p>
              ) : (
                clientPlans.map(plan => (
                  <div key={plan.id} className="plan-item">
                    <div className="plan-details">
                      <strong>{plan.exercise ? plan.exercise.nombre : `Ejercicio ID: ${plan.exerciseId}`}</strong>
                      <div className="plan-meta">
                        <span>{plan.sets}x{plan.reps}</span>
                        {plan.pesoSugerido && <span> • {plan.pesoSugerido}kg</span>}
                      </div>
                      {plan.notasExtras && <div className="plan-notes">Nota: {plan.notasExtras}</div>}
                    </div>
                    <button className="btn-danger-small" onClick={() => handleDeletePlan(plan.id)}>✖</button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignPlanForm;
