import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../utils/api';
import ClientMetrics from './ClientMetrics';
import './Client.css';

const ClientDashboard = () => {
  const [activeTab, setActiveTab] = useState('plan'); // 'plan', 'metrics', 'settings'
  const [plans, setPlans] = useState([]);
  const [todayProgress, setTodayProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  // Settings tab state
  const [newProfessorEmail, setNewProfessorEmail] = useState('');
  const [profError, setProfError] = useState('');
  const [profSuccess, setProfSuccess] = useState('');

  // Modal State for Progress Registration
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [pesoUsado, setPesoUsado] = useState('');
  const [repsRealizadas, setRepsRealizadas] = useState('');
  const [setsRealizados, setSetsRealizados] = useState('');
  const [notas, setNotas] = useState('');
  const [submittingProgress, setSubmittingProgress] = useState(false);
  const [progressSuccessMsg, setProgressSuccessMsg] = useState('');

  useEffect(() => {
    fetchPlansAndProgress();
  }, []);

  const fetchPlansAndProgress = async () => {
    setLoading(true);
    try {
      // 1. Fetch training plan
      const planRes = await apiFetch('/api/my-plan');
      if (planRes.ok) {
        const planData = await planRes.json();
        setPlans(planData);
      }

      // 2. Fetch client's progress history to check today's entries
      const progressRes = await apiFetch('/api/progress/mine');
      if (progressRes.ok) {
        const progressData = await progressRes.json();
        setTodayProgress(progressData);
      }
    } catch (error) {
      console.error("Error al cargar datos del cliente:", error);
    } finally {
      setLoading(false);
    }
  };

  const isLoggedToday = (exerciseId) => {
    if (!todayProgress || !Array.isArray(todayProgress)) return false;
    const todayStr = new Date().toISOString().split('T')[0];
    return todayProgress.some(p => {
      if (p.exercise && p.exercise.id === exerciseId && p.fecha) {
        const pDateStr = new Date(p.fecha).toISOString().split('T')[0];
        return pDateStr === todayStr;
      }
      return false;
    });
  };

  const openProgressModal = (planItem) => {
    const exercise = planItem.exercise;
    setSelectedExercise(exercise);
    setPesoUsado(planItem.pesoSugerido ? planItem.pesoSugerido.toString() : '');
    setRepsRealizadas(planItem.reps ? planItem.reps.toString() : '');
    setSetsRealizados(planItem.sets ? planItem.sets.toString() : '');
    setNotas('');
    setProgressSuccessMsg('');
  };

  const handleProgressSubmit = async (e) => {
    e.preventDefault();
    if (!selectedExercise) return;

    setSubmittingProgress(true);
    try {
      const response = await apiFetch('/api/progress', {
        method: 'POST',
        body: JSON.stringify({
          exerciseId: selectedExercise.id,
          pesoUsado: parseFloat(pesoUsado) || 0,
          repsRealizadas: parseInt(repsRealizadas) || 0,
          setsRealizados: parseInt(setsRealizados) || 0,
          notas
        })
      });

      if (!response.ok) throw new Error('Error al registrar progreso');

      setProgressSuccessMsg('¡Progreso registrado con éxito! 🎉');
      setTimeout(() => {
        setSelectedExercise(null);
        fetchPlansAndProgress();
      }, 1200);
    } catch (err) {
      alert("Error al guardar progreso: " + err.message);
    } finally {
      setSubmittingProgress(false);
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
        fetchPlansAndProgress();
      }
    } catch (err) {
      setProfError('Error de red al intentar cambiar de profesor.');
    }
  };

  return (
    <div className="client-dashboard-layout">
      {/* Sidebar a la izquierda (igual a Admin) */}
      <aside className="client-sidebar">
        <h2 className="sidebar-title">Mi Espacio</h2>
        <nav className="sidebar-nav">
          <button
            className={`nav-btn ${activeTab === 'plan' ? 'active' : ''}`}
            onClick={() => setActiveTab('plan')}
          >
            📋 Mi Plan
          </button>
          <button
            className={`nav-btn ${activeTab === 'metrics' ? 'active' : ''}`}
            onClick={() => setActiveTab('metrics')}
          >
            📈 Métricas
          </button>
          <button
            className={`nav-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            ⚙️ Configuración
          </button>
        </nav>
      </aside>

      {/* Contenido Principal */}
      <main className="client-content">
        {/* TAB: Mi Plan */}
        {activeTab === 'plan' && (
          <div>
            <h2 className="client-title">Mi Plan de Entrenamiento</h2>
            {loading ? (
              <p style={{ color: '#94a3b8' }}>Cargando tu plan...</p>
            ) : plans.length === 0 ? (
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '3rem', borderRadius: '16px' }}>
                <p style={{ color: '#cbd5e1', fontSize: '1.2rem', margin: 0 }}>
                  Aún no tienes un plan asignado. Contacta a tu profesor.
                </p>
              </div>
            ) : (
              <div className="exercises-grid">
                {plans.map(planItem => {
                  const ex = planItem.exercise;
                  const loggedToday = isLoggedToday(ex.id);

                  return (
                    <div
                      key={planItem.id}
                      className="exercise-card-client"
                      onClick={() => openProgressModal(planItem)}
                    >
                      <div>
                        <div className="card-header-row">
                          <h3 className="exercise-name-title">{ex.nombre}</h3>
                          {loggedToday && (
                            <span className="logged-badge">
                              ✅ Hoy
                            </span>
                          )}
                        </div>
                        <div className="exercise-muscle-tag">🎯 {ex.musculo}</div>
                        <div className="exercise-stats-row">
                          <span><strong>Sets:</strong> {planItem.sets}</span>
                          <span><strong>Reps:</strong> {planItem.reps}</span>
                          {planItem.pesoSugerido && (
                            <span><strong>Sugerido:</strong> {planItem.pesoSugerido} kg</span>
                          )}
                        </div>
                        {planItem.notasExtras && (
                          <p style={{ fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic', margin: '0 0 0.5rem 0' }}>
                            "{planItem.notasExtras}"
                          </p>
                        )}
                      </div>
                      <div className="card-action-text">
                        ➕ Hacer click para registrar progreso
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB: Métricas */}
        {activeTab === 'metrics' && (
          <div>
            <h2 className="client-title">Métricas de Progreso</h2>
            <ClientMetrics plans={plans} />
          </div>
        )}

        {/* TAB: Configuración */}
        {activeTab === 'settings' && (
          <div>
            <h2 className="client-title">Configuración de la Cuenta</h2>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '2rem', borderRadius: '16px', maxWidth: '600px' }}>
              <h3 style={{ marginBottom: '1rem', color: '#818cf8' }}>Profesor Asignado</h3>
              <p style={{ color: '#cbd5e1', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                ¿Quieres cambiar de profesor? Ingresa su email a continuación:
              </p>

              {profError && <div style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '0.9rem' }}>{profError}</div>}
              {profSuccess && <div style={{ color: '#10b981', marginBottom: '1rem', fontSize: '0.9rem' }}>{profSuccess}</div>}

              <form onSubmit={handleChangeProfessor} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input
                  type="email"
                  placeholder="Email del nuevo profesor..."
                  value={newProfessorEmail}
                  onChange={(e) => setNewProfessorEmail(e.target.value)}
                  required
                  style={{ padding: '0.75rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.3)', color: 'white' }}
                />
                <button type="submit" className="btn-submit-progress" style={{ width: 'auto', alignSelf: 'flex-start', padding: '0.75rem 2rem' }}>
                  Guardar Cambios
                </button>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* Modal para Registro de Progreso */}
      {selectedExercise && (
        <div className="modal-overlay" onClick={() => setSelectedExercise(null)}>
          <div className="modal-content-small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-small">
              <h3>Registrar Progreso: {selectedExercise.nombre}</h3>
              <button
                style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.2rem', cursor: 'pointer' }}
                onClick={() => setSelectedExercise(null)}
              >
                ✖
              </button>
            </div>

            {progressSuccessMsg ? (
              <div style={{ color: '#34d399', textAlign: 'center', padding: '2rem 0', fontWeight: 'bold', fontSize: '1.2rem' }}>
                {progressSuccessMsg}
              </div>
            ) : (
              <form onSubmit={handleProgressSubmit}>
                <div className="form-row-2">
                  <div className="progress-form-group">
                    <label>Peso usado (kg)</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={pesoUsado}
                      onChange={(e) => setPesoUsado(e.target.value)}
                      required
                    />
                  </div>
                  <div className="progress-form-group">
                    <label>Series completadas</label>
                    <input
                      type="number"
                      min="1"
                      value={setsRealizados}
                      onChange={(e) => setSetsRealizados(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="progress-form-group">
                  <label>Repeticiones logradas</label>
                  <input
                    type="number"
                    min="1"
                    value={repsRealizadas}
                    onChange={(e) => setRepsRealizadas(e.target.value)}
                    required
                  />
                </div>

                <div className="progress-form-group">
                  <label>Notas (opcional)</label>
                  <textarea
                    rows="3"
                    placeholder="Ej: Costó la última repetición, buenas sensaciones"
                    value={notas}
                    onChange={(e) => setNotas(e.target.value)}
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="btn-submit-progress"
                  disabled={submittingProgress}
                >
                  {submittingProgress ? 'Guardando...' : 'Guardar Progreso'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientDashboard;
