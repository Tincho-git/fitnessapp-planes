import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  ClipboardList,
  TrendingUp,
  X,
  Plus,
  Trash2,
  Calendar,
  Dumbbell,
  Search,
} from 'lucide-react';
import { apiFetch } from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import { colors } from '../../theme';

const muscleGroups = ['Todos', 'Pecho', 'Espalda', 'Bíceps', 'Tríceps', 'Hombros', 'Abdomen', 'Piernas'];

const AssignPlanForm = ({ client, onClose }) => {
  const { toast, confirm } = useToast();
  const [activeModalTab, setActiveModalTab] = useState('routine'); // 'routine' or 'progress'
  const [exercises, setExercises] = useState([]);
  const [clientPlans, setClientPlans] = useState([]);

  // Filter state for exercise selector
  const [filterMuscle, setFilterMuscle] = useState('Todos');
  const [searchExercise, setSearchExercise] = useState('');

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
      const exRes = await apiFetch('/api/exercises');
      const exData = await exRes.json();
      setExercises(exData);
      if (exData.length > 0) setExerciseId(exData[0].id.toString());
      fetchClientPlan();
    } catch {
      setError('Error al cargar los datos iniciales.');
      toast.error('Error al cargar los datos iniciales.');
    } finally {
      setLoading(false);
    }
  };

  const filteredExercises = useMemo(() => {
    return exercises.filter((ex) => {
      const matchMuscle = filterMuscle === 'Todos' || ex.musculo === filterMuscle;
      const q = searchExercise.trim().toLowerCase();
      const matchSearch = !q || (ex.nombre && ex.nombre.toLowerCase().includes(q));
      return matchMuscle && matchSearch;
    });
  }, [exercises, filterMuscle, searchExercise]);

  useEffect(() => {
    if (filteredExercises.length > 0) {
      const exists = filteredExercises.some((ex) => ex.id.toString() === exerciseId);
      if (!exists) {
        setExerciseId(filteredExercises[0].id.toString());
      }
    } else {
      setExerciseId('');
    }
  }, [filteredExercises]);

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
      console.error('Error al cargar progreso del cliente:', err);
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

    const filtered = clientProgress
      .filter((p) => p.exercise && p.exercise.id.toString() === selectedProgressExId)
      .reverse();

    if (filtered.length === 0) {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
      return;
    }

    const labels = filtered.map((p) =>
      new Date(p.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })
    );
    const weights = filtered.map((p) => p.pesoUsado);
    const repsList = filtered.map((p) => p.repsRealizadas);

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
              borderColor: colors.accent,
              backgroundColor: 'rgba(250, 204, 21, 0.15)',
              yAxisID: 'yWeight',
              tension: 0.3,
            },
            {
              label: 'Repeticiones',
              data: repsList,
              borderColor: '#34d399',
              backgroundColor: 'rgba(52, 211, 153, 0.15)',
              yAxisID: 'yReps',
              tension: 0.3,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            tooltip: {
              backgroundColor: '#1e293b',
              titleColor: colors.accent,
              bodyColor: '#f8fafc',
            },
          },
          scales: {
            x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
            yWeight: {
              type: 'linear',
              position: 'left',
              title: { display: true, text: 'Peso (kg)', color: colors.accent },
              ticks: { color: colors.accent },
              grid: { color: 'rgba(255,255,255,0.05)' },
            },
            yReps: {
              type: 'linear',
              position: 'right',
              title: { display: true, text: 'Reps', color: '#34d399' },
              ticks: { color: '#34d399' },
              grid: { drawOnChartArea: false },
            },
          },
        },
      });
    }

    return () => {
      if (chartRef.current) chartRef.current.destroy();
    };
  }, [activeModalTab, selectedProgressExId, clientProgress]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!exerciseId) return;
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
          notasExtras,
        }),
      });

      if (!response.ok) throw new Error('Error al asignar el ejercicio.');

      setNotasExtras('');
      toast.success('Ejercicio agregado a la rutina del atleta');
      fetchClientPlan();
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePlan = async (plan) => {
    const exName = plan.exercise ? plan.exercise.nombre : 'este ejercicio';
    const ok = await confirm({
      title: '¿Quitar de la rutina?',
      message: `Se quitará "${exName}" del plan de entrenamiento de ${client.nombre}.`,
      confirmText: 'Quitar',
      cancelText: 'Cancelar',
      danger: true,
    });
    if (!ok) return;

    try {
      await apiFetch(`/api/training-plans/${plan.id}`, { method: 'DELETE' });
      toast.info(`"${exName}" removido de la rutina`);
      fetchClientPlan();
    } catch {
      setError('Error al eliminar el ejercicio del plan.');
      toast.error('Error al eliminar el ejercicio del plan.');
    }
  };

  // Build unique exercises with latest log for progress tab
  const getLatestProgressPerExercise = () => {
    const map = new Map();
    clientProgress.forEach((p) => {
      if (p.exercise && !map.has(p.exercise.id)) {
        map.set(p.exercise.id, p);
      }
    });
    return Array.from(map.values());
  };

  const latestLogs = getLatestProgressPerExercise();
  const selectedExProgressHistory = clientProgress.filter(
    (p) => p.exercise && p.exercise.id.toString() === selectedProgressExId
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(client.nombre)}&background=FACC15&color=0a0a0a&size=128&bold=true`}
              alt={client.nombre}
              className="client-avatar-modal"
            />
            <div>
              <h2 style={{ marginBottom: '0.35rem' }}>{client.nombre}</h2>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className={`nav-btn ${activeModalTab === 'routine' ? 'active' : ''}`}
                  style={{ padding: '0.42rem 0.95rem', fontSize: '0.86rem' }}
                  onClick={() => setActiveModalTab('routine')}
                >
                  <ClipboardList size={16} />
                  Rutina ({clientPlans.length})
                </button>
                <button
                  type="button"
                  className={`nav-btn ${activeModalTab === 'progress' ? 'active' : ''}`}
                  style={{ padding: '0.42rem 0.95rem', fontSize: '0.86rem' }}
                  onClick={() => setActiveModalTab('progress')}
                >
                  <TrendingUp size={16} />
                  Evolución
                </button>
              </div>
            </div>
          </div>
          <button className="btn-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {error && <div className="error-alert" style={{ margin: '1rem 1.75rem 0' }}>{error}</div>}

        {/* TAB 1: Routine Management */}
        {activeModalTab === 'routine' && (
          <div className="assign-layout">
            {/* Columna Izquierda: Formulario de Asignación */}
            <div className="assign-form-col">
              <h3>
                <Plus size={18} style={{ color: 'var(--accent-color)' }} />
                Asignar Nuevo Ejercicio
              </h3>
              {loading ? (
                <p style={{ color: 'var(--text-muted)' }}>Cargando ejercicios...</p>
              ) : (
                <form onSubmit={handleSubmit} className="custom-form">
                  <div className="form-group">
                    <label>Filtrar por Músculo</label>
                    <div className="muscle-chips" style={{ marginBottom: '0.6rem' }}>
                      {muscleGroups.map((m) => (
                        <button
                          key={m}
                          type="button"
                          className={`muscle-chip ${filterMuscle === m ? 'active' : ''}`}
                          onClick={() => setFilterMuscle(m)}
                          style={{ padding: '0.3rem 0.7rem', fontSize: '0.76rem' }}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                    <div className="search-input-wrap" style={{ marginBottom: '0.65rem' }}>
                      <Search size={15} className="search-input-icon" />
                      <input
                        type="text"
                        className="search-input"
                        placeholder="Buscar ejercicio..."
                        value={searchExercise}
                        onChange={(e) => setSearchExercise(e.target.value)}
                        style={{ padding: '0.55rem 2rem 0.55rem 2.3rem', fontSize: '0.86rem' }}
                      />
                      {searchExercise && (
                        <button
                          type="button"
                          className="search-clear-btn"
                          onClick={() => setSearchExercise('')}
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>
                    <label>Seleccionar Ejercicio ({filteredExercises.length})</label>
                    <select
                      value={exerciseId}
                      onChange={(e) => setExerciseId(e.target.value)}
                      required
                    >
                      {filteredExercises.length === 0 && (
                        <option value="">Sin ejercicios en este filtro</option>
                      )}
                      {filteredExercises.map((ex) => (
                        <option key={ex.id} value={ex.id}>
                          {ex.nombre} ({ex.musculo})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Sets</label>
                      <input
                        type="number"
                        min="1"
                        value={sets}
                        onChange={(e) => setSets(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Repeticiones</label>
                      <input
                        type="number"
                        min="1"
                        value={reps}
                        onChange={(e) => setReps(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Peso Sugerido (kg)</label>
                      <input
                        type="number"
                        step="0.5"
                        placeholder="Opcional"
                        value={pesoSugerido}
                        onChange={(e) => setPesoSugerido(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Notas / Indicaciones (opcional)</label>
                    <input
                      type="text"
                      value={notasExtras}
                      onChange={(e) => setNotasExtras(e.target.value)}
                      placeholder="Ej: Tempo controlado 3-1-1, cuidar técnica"
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn-primary"
                    style={{ width: '100%' }}
                    disabled={isSubmitting || filteredExercises.length === 0}
                  >
                    <Plus size={18} />
                    {isSubmitting ? 'Asignando...' : 'Asignar a la Rutina'}
                  </button>
                </form>
              )}
            </div>

            {/* Columna Derecha: Plan Actual del Cliente */}
            <div className="current-plan-col">
              <h3>
                <Dumbbell size={18} style={{ color: 'var(--accent-color)' }} />
                Rutina Actual ({clientPlans.length} ejercicios)
              </h3>
              <div className="plan-list">
                {clientPlans.length === 0 ? (
                  <div className="empty-state">
                    <ClipboardList size={32} style={{ color: 'var(--text-muted)' }} />
                    <p>El cliente aún no tiene ejercicios asignados.</p>
                  </div>
                ) : (
                  clientPlans.map((plan) => (
                    <div key={plan.id} className="plan-item">
                      <div className="plan-details">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <strong>
                            {plan.exercise ? plan.exercise.nombre : `Ejercicio ID: ${plan.exerciseId}`}
                          </strong>
                          {plan.exercise?.musculo && (
                            <span className="badge" style={{ fontSize: '0.7rem', padding: '0.12rem 0.5rem' }}>
                              {plan.exercise.musculo}
                            </span>
                          )}
                        </div>
                        <div className="plan-meta">
                          <span>
                            {plan.sets} series × {plan.reps} reps
                          </span>
                          {plan.pesoSugerido && <span>• Sugerido: {plan.pesoSugerido} kg</span>}
                        </div>
                        {plan.notasExtras && <div className="plan-notes">"{plan.notasExtras}"</div>}
                      </div>
                      <button
                        className="btn-danger-small"
                        onClick={() => handleDeletePlan(plan)}
                        title="Quitar ejercicio"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Progress Monitoring */}
        {activeModalTab === 'progress' && (
          <div style={{ padding: '1.5rem 1.75rem' }}>
            {progressLoading ? (
              <p style={{ color: '#94a3b8' }}>Cargando progreso del cliente...</p>
            ) : clientProgress.length === 0 ? (
              <div className="empty-state">
                <TrendingUp size={36} style={{ color: 'var(--text-muted)' }} />
                <p>Este cliente aún no ha registrado progreso en ningún ejercicio.</p>
              </div>
            ) : (
              <div>
                <h4 style={{ color: colors.accent, marginBottom: '0.85rem' }}>
                  Último Registro por Ejercicio
                </h4>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: '0.9rem',
                    marginBottom: '1.5rem',
                  }}
                >
                  {latestLogs.map((log) => {
                    const ex = log.exercise;
                    const isSelected = selectedProgressExId === ex.id.toString();
                    return (
                      <div
                        key={log.id}
                        onClick={() => setSelectedProgressExId(ex.id.toString())}
                        style={{
                          background: isSelected
                            ? 'rgba(250, 204, 21, 0.14)'
                            : 'rgba(255,255,255,0.04)',
                          border: isSelected
                            ? `1px solid ${colors.accent}`
                            : '1px solid rgba(255,255,255,0.09)',
                          borderRadius: '14px',
                          padding: '1rem',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                      >
                        <h5 style={{ margin: '0 0 0.45rem 0', color: '#f8fafc', fontSize: '0.96rem' }}>
                          {ex.nombre}
                        </h5>
                        <div style={{ fontSize: '0.88rem', color: '#34d399', fontWeight: 'bold' }}>
                          {log.pesoUsado} kg • {log.setsRealizados}×{log.repsRealizadas}
                        </div>
                        <div
                          style={{
                            fontSize: '0.76rem',
                            color: '#94a3b8',
                            marginTop: '0.35rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                          }}
                        >
                          <Calendar size={12} />
                          {new Date(log.fecha).toLocaleDateString('es-ES')}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {selectedProgressExId && (
                  <div>
                    <h4 style={{ color: '#f8fafc', marginBottom: '1rem' }}>
                      Evolución temporal del ejercicio seleccionado
                    </h4>

                    {selectedExProgressHistory.length > 0 && (
                      <div
                        style={{
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          padding: '1rem',
                          borderRadius: '14px',
                          marginBottom: '1.5rem',
                          height: '260px',
                        }}
                      >
                        <canvas ref={canvasRef}></canvas>
                      </div>
                    )}

                    <h4 style={{ color: '#cbd5e1', marginBottom: '0.75rem', fontSize: '1rem' }}>
                      Historial Completo
                    </h4>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                        <thead>
                          <tr style={{ background: 'rgba(255,255,255,0.06)', color: colors.accent }}>
                            <th style={{ padding: '0.7rem', textAlign: 'left' }}>Fecha</th>
                            <th style={{ padding: '0.7rem', textAlign: 'left' }}>Peso (kg)</th>
                            <th style={{ padding: '0.7rem', textAlign: 'left' }}>Series</th>
                            <th style={{ padding: '0.7rem', textAlign: 'left' }}>Reps</th>
                            <th style={{ padding: '0.7rem', textAlign: 'left' }}>Notas</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedExProgressHistory.map((item) => (
                            <tr
                              key={item.id}
                              style={{
                                borderBottom: '1px solid rgba(255,255,255,0.05)',
                                color: '#e2e8f0',
                              }}
                            >
                              <td style={{ padding: '0.7rem' }}>
                                {new Date(item.fecha).toLocaleString('es-ES')}
                              </td>
                              <td style={{ padding: '0.7rem' }}>
                                <strong>{item.pesoUsado} kg</strong>
                              </td>
                              <td style={{ padding: '0.7rem' }}>{item.setsRealizados}</td>
                              <td style={{ padding: '0.7rem' }}>{item.repsRealizadas}</td>
                              <td style={{ padding: '0.7rem' }}>{item.notas || '—'}</td>
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
