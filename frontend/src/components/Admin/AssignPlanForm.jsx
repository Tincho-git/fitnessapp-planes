import React, { useState, useEffect, useRef } from 'react';
import { apiFetch } from '../../utils/api';

const AssignPlanForm = ({ client, onClose }) => {
  const [activeModalTab, setActiveModalTab] = useState('routine'); // 'routine' or 'progress'
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

  // Progress Tab State
  const [clientProgress, setClientProgress] = useState([]);
  const [progressLoading, setProgressLoading] = useState(false);
  const [selectedProgressExId, setSelectedProgressExId] = useState('');

  const chartRef = useRef(null);
  const canvasRef = useRef(null);

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
      if (exData.length > 0) setExerciseId(exData[0].id.toString());

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

  const fetchClientProgress = async () => {
    setProgressLoading(true);
    try {
      const res = await apiFetch(`/api/progress/client/${client.id}`);
      if (res.ok) {
        const data = await res.json();
        setClientProgress(data);
        if (data.length > 0 && !selectedProgressExId) {
          setSelectedProgressExId(data[0].exercise?.id?.toString() || '');
        }
      }
    } catch (err) {
      console.error("Error al cargar progreso del cliente:", err);
    } finally {
      setProgressLoading(false);
    }
  };

  useEffect(() => {
    if (activeModalTab === 'progress') {
      fetchClientProgress();
    }
  }, [activeModalTab]);

  // Chart Rendering for Admin Progress View
  useEffect(() => {
    if (activeModalTab !== 'progress' || !window.Chart || !selectedProgressExId) return;

    const filtered = clientProgress.filter(
      p => p.exercise && p.exercise.id.toString() === selectedProgressExId
    ).reverse(); // chronological order

    if (filtered.length === 0) {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
      return;
    }

    const labels = filtered.map(p => new Date(p.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }));
    const weights = filtered.map(p => p.pesoUsado);
    const repsList = filtered.map(p => p.repsRealizadas);

    if (chartRef.current) chartRef.current.destroy();

    if (canvasRef.current) {
      chartRef.current = new window.Chart(canvasRef.current, {
        type: 'line',
        data: {
          labels,
          datasets: [
            {
              label: 'Peso (kg)',
              data: weights,
              borderColor: '#818cf8',
              backgroundColor: 'rgba(129, 140, 248, 0.15)',
              yAxisID: 'yWeight',
              tension: 0.3
            },
            {
              label: 'Repeticiones',
              data: repsList,
              borderColor: '#34d399',
              backgroundColor: 'rgba(52, 211, 153, 0.15)',
              yAxisID: 'yReps',
              tension: 0.3
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            tooltip: {
              backgroundColor: '#1e293b',
              titleColor: '#818cf8',
              bodyColor: '#f8fafc'
            }
          },
          scales: {
            x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
            yWeight: {
              type: 'linear',
              position: 'left',
              title: { display: true, text: 'Peso (kg)', color: '#818cf8' },
              ticks: { color: '#818cf8' },
              grid: { color: 'rgba(255,255,255,0.05)' }
            },
            yReps: {
              type: 'linear',
              position: 'right',
              title: { display: true, text: 'Reps', color: '#34d399' },
              ticks: { color: '#34d399' },
              grid: { drawOnChartArea: false }
            }
          }
        }
      });
    }

    return () => {
      if (chartRef.current) chartRef.current.destroy();
    };
  }, [activeModalTab, selectedProgressExId, clientProgress]);

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

  // Build unique exercises with latest log for progress tab
  const getLatestProgressPerExercise = () => {
    const map = new Map();
    clientProgress.forEach(p => {
      if (p.exercise && !map.has(p.exercise.id)) {
        map.set(p.exercise.id, p);
      }
    });
    return Array.from(map.values());
  };

  const latestLogs = getLatestProgressPerExercise();
  const selectedExProgressHistory = clientProgress.filter(
    p => p.exercise && p.exercise.id.toString() === selectedProgressExId
  );

  return (
    <div className="modal-overlay">
      <div className="modal-content large-modal">
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(client.nombre)}&background=6366f1&color=fff&size=128&bold=true`}
              alt={client.nombre}
              className="client-avatar-modal"
            />
            <div>
              <h2 style={{ marginBottom: '0.25rem' }}>Cliente: {client.nombre}</h2>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className={`nav-btn ${activeModalTab === 'routine' ? 'active' : ''}`}
                  style={{ padding: '0.4rem 1rem', fontSize: '0.9rem' }}
                  onClick={() => setActiveModalTab('routine')}
                >
                  📋 Rutina / Asignar
                </button>
                <button
                  type="button"
                  className={`nav-btn ${activeModalTab === 'progress' ? 'active' : ''}`}
                  style={{ padding: '0.4rem 1rem', fontSize: '0.9rem' }}
                  onClick={() => setActiveModalTab('progress')}
                >
                  📈 Progreso del Cliente
                </button>
              </div>
            </div>
          </div>
          <button className="btn-close" onClick={onClose}>✖</button>
        </div>

        {error && <div className="error-alert">{error}</div>}

        {/* TAB 1: Routine Management */}
        {activeModalTab === 'routine' && (
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
        )}

        {/* TAB 2: Progress Monitoring */}
        {activeModalTab === 'progress' && (
          <div style={{ padding: '1.5rem' }}>
            {progressLoading ? (
              <p style={{ color: '#94a3b8' }}>Cargando progreso del cliente...</p>
            ) : clientProgress.length === 0 ? (
              <div className="empty-state" style={{ textAlign: 'center', padding: '2rem' }}>
                Este cliente aún no ha registrado progreso en ningún ejercicio.
              </div>
            ) : (
              <div>
                {/* Resumen de Últimos Registros por Ejercicio */}
                <h4 style={{ color: '#818cf8', marginBottom: '0.75rem' }}>Último Registro por Ejercicio</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                  {latestLogs.map(log => {
                    const ex = log.exercise;
                    const isSelected = selectedProgressExId === ex.id.toString();
                    return (
                      <div
                        key={log.id}
                        onClick={() => setSelectedProgressExId(ex.id.toString())}
                        style={{
                          background: isSelected ? 'rgba(79, 70, 229, 0.25)' : 'rgba(255,255,255,0.05)',
                          border: isSelected ? '1px solid #818cf8' : '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '12px',
                          padding: '1rem',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        <h5 style={{ margin: '0 0 0.5rem 0', color: '#f8fafc' }}>{ex.nombre}</h5>
                        <div style={{ fontSize: '0.85rem', color: '#34d399', fontWeight: 'bold' }}>
                          {log.pesoUsado} kg • {log.setsRealizados}x{log.repsRealizadas}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.3rem' }}>
                          📅 {new Date(log.fecha).toLocaleDateString('es-ES')}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Gráfico y Tabla para el ejercicio seleccionado */}
                {selectedProgressExId && (
                  <div>
                    <h4 style={{ color: '#f8fafc', marginBottom: '1rem' }}>
                      Evolución temporal de ejercicio seleccionado
                    </h4>

                    {selectedExProgressHistory.length > 0 && (
                      <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', height: '260px' }}>
                        <canvas ref={canvasRef}></canvas>
                      </div>
                    )}

                    <h4 style={{ color: '#cbd5e1', marginBottom: '0.75rem', fontSize: '1rem' }}>Historial Completo</h4>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                        <thead>
                          <tr style={{ background: 'rgba(255,255,255,0.05)', color: '#818cf8' }}>
                            <th style={{ padding: '0.6rem', textAlign: 'left' }}>Fecha</th>
                            <th style={{ padding: '0.6rem', textAlign: 'left' }}>Peso (kg)</th>
                            <th style={{ padding: '0.6rem', textAlign: 'left' }}>Series</th>
                            <th style={{ padding: '0.6rem', textAlign: 'left' }}>Reps</th>
                            <th style={{ padding: '0.6rem', textAlign: 'left' }}>Notas</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedExProgressHistory.map(item => (
                            <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#e2e8f0' }}>
                              <td style={{ padding: '0.6rem' }}>{new Date(item.fecha).toLocaleString('es-ES')}</td>
                              <td style={{ padding: '0.6rem' }}><strong>{item.pesoUsado} kg</strong></td>
                              <td style={{ padding: '0.6rem' }}>{item.setsRealizados}</td>
                              <td style={{ padding: '0.6rem' }}>{item.repsRealizadas}</td>
                              <td style={{ padding: '0.6rem' }}>{item.notas || '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignPlanForm;
