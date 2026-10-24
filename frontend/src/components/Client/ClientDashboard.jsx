import React, { useState, useEffect, useMemo } from 'react';
import {
  ClipboardList,
  TrendingUp,
  Settings,
  Dumbbell,
  PlayCircle,
  CheckCircle2,
  PlusCircle,
  Target,
  Search,
  X,
  Flame,
  ExternalLink,
  UserCheck,
  MessageSquare,
  Save,
  Calendar,
  Clock,
  Check,
  Plus,
  Trash2,
  Play,
  Pause,
  RotateCcw,
  Timer,
} from 'lucide-react';
import { apiFetch } from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import { colors } from '../../theme';
import ClientMetrics from './ClientMetrics';
import './Client.css';

// Sonido acústico suave generado con Web Audio API al finalizar el descanso
const playTimerBeep = () => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const playTone = (freq, start, duration) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
      gain.gain.setValueAtTime(0.18, ctx.currentTime + start);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + duration);
    };
    playTone(880, 0, 0.18);
    playTone(880, 0.22, 0.18);
    playTone(1174.66, 0.45, 0.35);
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 250]);
    }
  } catch {
    // Ignorar si el navegador bloquea el audio
  }
};

const formatSeconds = (sec) => {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

const getEmbedVideoUrl = (url) => {
  if (!url) return null;
  const youtubeMatch = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/
  );
  if (youtubeMatch && youtubeMatch[1]) {
    return { type: 'iframe', src: `https://www.youtube.com/embed/${youtubeMatch[1]}?autoplay=1` };
  }
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch && vimeoMatch[1]) {
    return { type: 'iframe', src: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1` };
  }
  if (url.match(/\.(mp4|webm|ogg)$/i) || url.includes('/video/upload/')) {
    return { type: 'video', src: url };
  }
  return { type: 'iframe', src: url };
};

const ClientDashboard = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('plan'); // 'plan', 'metrics', 'settings'
  const [plans, setPlans] = useState([]);
  const [todayProgress, setTodayProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  // Day/Session & Filters for Routine
  const [selectedDay, setSelectedDay] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState('Todos');

  // Settings tab state
  const [newProfessorEmail, setNewProfessorEmail] = useState('');
  const [profError, setProfError] = useState('');
  const [profSuccess, setProfSuccess] = useState('');

  // Modal State for Set-by-Set Progress Registration
  const [selectedPlanItem, setSelectedPlanItem] = useState(null);
  const [setRows, setSetRows] = useState([]); // [{ weight, reps, completed }]
  const [notas, setNotas] = useState('');
  const [submittingProgress, setSubmittingProgress] = useState(false);

  // Rest Timer State
  const [restDuration, setRestDuration] = useState(90);
  const [restRemaining, setRestRemaining] = useState(0);
  const [restRunning, setRestRunning] = useState(false);

  // Modal State for Video Player
  const [videoModalData, setVideoModalData] = useState(null);

  useEffect(() => {
    fetchPlansAndProgress();
  }, []);

  // Countdown Interval for Rest Timer
  useEffect(() => {
    if (!restRunning || restRemaining <= 0) return;

    const timer = setInterval(() => {
      setRestRemaining((prev) => {
        if (prev <= 1) {
          setRestRunning(false);
          playTimerBeep();
          toast.info('⏱️ ¡Descanso terminado! A darle a la siguiente serie 💪');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [restRunning, restRemaining]);

  const startRestTimer = (seconds) => {
    const sec = seconds || restDuration || 90;
    setRestDuration(sec);
    setRestRemaining(sec);
    setRestRunning(true);
  };

  const adjustRestTimer = (delta) => {
    setRestRemaining((prev) => Math.max(0, prev + delta));
    setRestDuration((prev) => Math.max(15, prev + delta));
  };

  const fetchPlansAndProgress = async () => {
    setLoading(true);
    try {
      const planRes = await apiFetch('/api/my-plan');
      if (planRes.ok) {
        const planData = await planRes.json();
        setPlans(planData);
        // Si hay más de un día, seleccionar el primer día por defecto en la primera carga
        const uniqueDays = Array.from(new Set(planData.map((p) => p.dia || 'Día 1')));
        if (uniqueDays.length > 0 && selectedDay === 'Todos') {
          setSelectedDay(uniqueDays[0]);
        }
      }

      const progressRes = await apiFetch('/api/progress/mine');
      if (progressRes.ok) {
        const progressData = await progressRes.json();
        setTodayProgress(progressData);
      }
    } catch (error) {
      console.error('Error al cargar datos del cliente:', error);
      toast.error('No se pudo cargar tu plan de entrenamiento.');
    } finally {
      setLoading(false);
    }
  };

  const isLoggedToday = (exerciseId) => {
    if (!todayProgress || !Array.isArray(todayProgress)) return false;
    const todayStr = new Date().toISOString().split('T')[0];
    return todayProgress.some((p) => {
      if (p.exercise && p.exercise.id === exerciseId && p.fecha) {
        const pDateStr = new Date(p.fecha).toISOString().split('T')[0];
        return pDateStr === todayStr;
      }
      return false;
    });
  };

  // Unique days in the client's routine
  const routineDays = useMemo(() => {
    const set = new Set();
    plans.forEach((p) => set.add(p.dia || 'Día 1'));
    const list = Array.from(set);
    return list.length > 1 ? [...list, 'Todos'] : list;
  }, [plans]);

  //Plans in the currently selected day
  const dayPlans = useMemo(() => {
    if (selectedDay === 'Todos' || routineDays.length <= 1) return plans;
    return plans.filter((p) => (p.dia || 'Día 1') === selectedDay);
  }, [plans, selectedDay, routineDays]);

  // Muscle groups available in the active day
  const routineMuscles = useMemo(() => {
    const set = new Set();
    dayPlans.forEach((p) => {
      if (p.exercise?.musculo) set.add(p.exercise.musculo);
    });
    return ['Todos', ...Array.from(set)];
  }, [dayPlans]);

  const filteredPlans = useMemo(() => {
    return dayPlans.filter((p) => {
      const ex = p.exercise;
      if (!ex) return false;
      const matchesMuscle = selectedMuscle === 'Todos' || ex.musculo === selectedMuscle;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        (ex.nombre && ex.nombre.toLowerCase().includes(q)) ||
        (ex.musculo && ex.musculo.toLowerCase().includes(q)) ||
        (p.notasExtras && p.notasExtras.toLowerCase().includes(q));
      return matchesMuscle && matchesSearch;
    });
  }, [dayPlans, selectedMuscle, searchQuery]);

  // Progress calculation for the selected day
  const completedInDayCount = useMemo(() => {
    if (!dayPlans.length) return 0;
    return dayPlans.filter((p) => p.exercise && isLoggedToday(p.exercise.id)).length;
  }, [dayPlans, todayProgress]);

  const progressPercentage =
    dayPlans.length > 0 ? Math.round((completedInDayCount / dayPlans.length) * 100) : 0;

  const openProgressModal = (planItem) => {
    setSelectedPlanItem(planItem);
    const totalSets = Math.max(1, planItem.sets || 3);
    const defaultWeight = planItem.pesoSugerido ? planItem.pesoSugerido.toString() : '';
    const defaultReps = planItem.reps ? planItem.reps.toString() : '10';
    const initialRows = Array.from({ length: totalSets }, (_, idx) => ({
      weight: defaultWeight,
      reps: defaultReps,
      completed: idx === 0, // primera serie lista para marcar o ya marcada
    }));
    // Dejamos todas desmarcadas al abrir para que al tocar ✓ dispare el temporizador de descanso
    setSetRows(
      initialRows.map((r) => ({
        ...r,
        completed: false,
      }))
    );
    const restSec = planItem.descansoSegundos || 90;
    setRestDuration(restSec);
    setNotas('');
  };

  const handleSetRowChange = (index, field, value) => {
    setSetRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  };

  const handleToggleSetCompleted = (index) => {
    setSetRows((prev) => {
      const next = prev.map((row, i) =>
        i === index ? { ...row, completed: !row.completed } : row
      );
      // Si se acaba de marcar como completada, iniciamos el Temporizador de Descanso automáticamente
      if (!prev[index].completed) {
        const restSec = selectedPlanItem?.descansoSegundos || restDuration || 90;
        startRestTimer(restSec);
      }
      return next;
    });
  };

  const handleAddSetRow = () => {
    setSetRows((prev) => {
      const last = prev[prev.length - 1] || { weight: '', reps: '10' };
      return [...prev, { weight: last.weight, reps: last.reps, completed: false }];
    });
  };

  const handleRemoveSetRow = (index) => {
    if (setRows.length <= 1) return;
    setSetRows((prev) => prev.filter((_, i) => i !== index));
  };

  const openVideoModal = (e, videoUrl, exerciseName) => {
    e.stopPropagation();
    setVideoModalData({ url: videoUrl, title: exerciseName });
  };

  const handleProgressSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPlanItem || !selectedPlanItem.exercise) return;

    // Usamos las series marcadas como completadas; si no marcó ninguna con el check, usamos todas las filas cargadas
    const activeRows = setRows.filter((r) => r.completed);
    const rowsToProcess = activeRows.length > 0 ? activeRows : setRows;

    const maxWeight = Math.max(
      0,
      ...rowsToProcess.map((r) => parseFloat(r.weight) || 0)
    );
    const avgReps = Math.max(
      1,
      Math.round(
        rowsToProcess.reduce((acc, r) => acc + (parseInt(r.reps) || 0), 0) /
          rowsToProcess.length
      )
    );
    const detalleSeries = rowsToProcess
      .map((r, idx) => `S${idx + 1}: ${parseFloat(r.weight) || 0}kg × ${parseInt(r.reps) || 0}`)
      .join(' | ');

    setSubmittingProgress(true);
    try {
      const response = await apiFetch('/api/progress', {
        method: 'POST',
        body: JSON.stringify({
          exerciseId: selectedPlanItem.exercise.id,
          pesoUsado: maxWeight,
          repsRealizadas: avgReps,
          setsRealizados: rowsToProcess.length,
          detalleSeries,
          notas,
        }),
      });

      if (!response.ok) throw new Error('Error al registrar progreso');

      toast.success(
        `¡${rowsToProcess.length} series registradas en ${selectedPlanItem.exercise.nombre}!`
      );
      setSelectedPlanItem(null);
      fetchPlansAndProgress();
    } catch (err) {
      toast.error('Error al guardar progreso: ' + (err.message || 'Intenta de nuevo'));
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
        body: JSON.stringify({ profesorEmail: newProfessorEmail }),
      });

      if (!response.ok) {
        const msg =
          'Error al cambiar profesor. Asegúrate de que el email es válido y pertenece a un profesor.';
        setProfError(msg);
        toast.error(msg);
      } else {
        const msg = 'Profesor actualizado exitosamente.';
        setProfSuccess(msg);
        toast.success(msg);
        setNewProfessorEmail('');
        fetchPlansAndProgress();
      }
    } catch {
      const msg = 'Error de red al intentar cambiar de profesor.';
      setProfError(msg);
      toast.error(msg);
    }
  };

  const selectedExercise = selectedPlanItem?.exercise;

  return (
    <div className="client-dashboard-layout">
      {/* Sidebar en Desktop / Bottom Navigation en Mobile */}
      <aside className="client-sidebar">
        <h2 className="sidebar-title">Mi Espacio</h2>
        <nav className="sidebar-nav">
          <button
            className={`nav-btn ${activeTab === 'plan' ? 'active' : ''}`}
            onClick={() => setActiveTab('plan')}
          >
            <ClipboardList size={19} />
            <span>Mi Plan</span>
          </button>
          <button
            className={`nav-btn ${activeTab === 'metrics' ? 'active' : ''}`}
            onClick={() => setActiveTab('metrics')}
          >
            <TrendingUp size={19} />
            <span>Métricas</span>
          </button>
          <button
            className={`nav-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <Settings size={19} />
            <span>Ajustes</span>
          </button>
        </nav>
      </aside>

      {/* Contenido Principal */}
      <main className="client-content">
        {/* TAB: Mi Plan */}
        {activeTab === 'plan' && (
          <div>
            <div className="client-header-row">
              <div>
                <h2 className="client-title">
                  <Dumbbell size={28} style={{ color: 'var(--accent-color)' }} />
                  Mi Plan de Entrenamiento
                </h2>
                <p className="client-subtitle">
                  Selecciona tu sesión del día y registra cada serie con el temporizador de descanso.
                </p>
              </div>
            </div>

            {!loading && plans.length > 0 && (
              <>
                {/* Selector de Días / Sesiones */}
                {routineDays.length > 0 && (
                  <div className="day-tabs-bar">
                    {routineDays.map((d) => {
                      const listForDay =
                        d === 'Todos'
                          ? plans
                          : plans.filter((p) => (p.dia || 'Día 1') === d);
                      const doneForDay = listForDay.filter(
                        (p) => p.exercise && isLoggedToday(p.exercise.id)
                      ).length;

                      return (
                        <button
                          key={d}
                          type="button"
                          className={`day-tab-btn ${selectedDay === d ? 'active' : ''}`}
                          onClick={() => {
                            setSelectedDay(d);
                            setSelectedMuscle('Todos');
                          }}
                        >
                          <Calendar size={16} />
                          <span>{d}</span>
                          <span className="day-tab-count">
                            {doneForDay}/{listForDay.length}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Banner de Resumen de la Sesión Actual */}
                <div className="workout-summary-banner">
                  <div className="workout-summary-top">
                    <div className="workout-summary-info">
                      <div className="workout-summary-icon">
                        <Flame size={22} />
                      </div>
                      <div className="workout-summary-text">
                        <h3>
                          Progreso de Hoy{' '}
                          {selectedDay !== 'Todos' ? `— ${selectedDay}` : ''}
                        </h3>
                        <p>
                          Has completado <strong>{completedInDayCount}</strong> de{' '}
                          <strong>{dayPlans.length}</strong> ejercicios en esta sesión
                        </p>
                      </div>
                    </div>
                    <div className="workout-summary-percent">{progressPercentage}%</div>
                  </div>
                  <div className="workout-progress-bar-bg">
                    <div
                      className="workout-progress-bar-fill"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Buscador y Filtros por Grupo Muscular */}
                <div className="filter-toolbar">
                  <div className="search-input-wrap">
                    <Search size={18} className="search-input-icon" />
                    <input
                      type="text"
                      className="search-input"
                      placeholder="Buscar ejercicio en esta sesión..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        className="search-clear-btn"
                        onClick={() => setSearchQuery('')}
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  {routineMuscles.length > 2 && (
                    <div className="muscle-chips">
                      {routineMuscles.map((group) => (
                        <button
                          key={group}
                          type="button"
                          className={`muscle-chip ${selectedMuscle === group ? 'active' : ''}`}
                          onClick={() => setSelectedMuscle(group)}
                        >
                          {group}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {loading ? (
              <div className="skeleton-grid">
                <div className="skeleton-card" />
                <div className="skeleton-card" />
                <div className="skeleton-card" />
              </div>
            ) : plans.length === 0 ? (
              <div className="empty-state">
                <Dumbbell size={40} style={{ color: 'var(--accent-color)', opacity: 0.8 }} />
                <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>
                  Aún no tienes un plan asignado. Contacta a tu profesor.
                </p>
              </div>
            ) : filteredPlans.length === 0 ? (
              <div className="empty-state">
                <Search size={36} style={{ color: 'var(--text-muted)' }} />
                <p>No hay ejercicios que coincidan con el filtro seleccionado.</p>
              </div>
            ) : (
              <div className="exercises-grid">
                {filteredPlans.map((planItem) => {
                  const ex = planItem.exercise;
                  const loggedToday = isLoggedToday(ex.id);

                  return (
                    <div
                      key={planItem.id}
                      className={`exercise-card-client ${loggedToday ? 'logged-card' : ''}`}
                      onClick={() => openProgressModal(planItem)}
                    >
                      {ex.imagenUrl && (
                        <div className="exercise-card-image-container">
                          <img
                            src={ex.imagenUrl}
                            alt={ex.nombre}
                            className="exercise-card-img"
                            onError={(e) => {
                              e.target.parentElement.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                      <div className="exercise-card-body">
                        <div className="card-header-row">
                          <h3 className="exercise-name-title">{ex.nombre}</h3>
                          {loggedToday && (
                            <span className="logged-badge">
                              <CheckCircle2 size={13} /> Hoy
                            </span>
                          )}
                        </div>

                        <div className="card-tags-row">
                          <span className="exercise-day-tag">
                            <Calendar size={12} style={{ color: 'var(--accent-color)' }} />
                            {planItem.dia || 'Día 1'}
                          </span>
                          <span className="exercise-muscle-tag">
                            <Target size={12} />
                            {ex.musculo}
                          </span>
                        </div>

                        {ex.descripcion && <p className="exercise-description">{ex.descripcion}</p>}

                        <div className="exercise-stats-row">
                          <div className="stat-box">
                            <span className="stat-box-label">Series</span>
                            <span className="stat-box-value">{planItem.sets}</span>
                          </div>
                          <div className="stat-box">
                            <span className="stat-box-label">Reps</span>
                            <span className="stat-box-value">{planItem.reps}</span>
                          </div>
                          {planItem.pesoSugerido && (
                            <div className="stat-box">
                              <span className="stat-box-label">Sugerido</span>
                              <span className="stat-box-value highlight">
                                {planItem.pesoSugerido} kg
                              </span>
                            </div>
                          )}
                          <div className="stat-box">
                            <span className="stat-box-label">Descanso</span>
                            <span className="stat-box-value">
                              {planItem.descansoSegundos || 90}s
                            </span>
                          </div>
                        </div>

                        {planItem.notasExtras && (
                          <div className="exercise-notes-pill">
                            <MessageSquare
                              size={14}
                              style={{ flexShrink: 0, marginTop: '2px', color: 'var(--accent-color)' }}
                            />
                            <span>{planItem.notasExtras}</span>
                          </div>
                        )}

                        <div className="exercise-card-actions">
                          {ex.videoUrl && (
                            <button
                              type="button"
                              className="btn-view-video"
                              onClick={(e) => openVideoModal(e, ex.videoUrl, ex.nombre)}
                            >
                              <PlayCircle size={16} />
                              Ver Video Demostrativo
                            </button>
                          )}
                          <div className="card-action-text">
                            <PlusCircle size={16} />
                            {loggedToday ? 'Entrenar otra vez / Editar series' : 'Iniciar Series y Descanso'}
                          </div>
                        </div>
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
            <div className="client-header-row">
              <div>
                <h2 className="client-title">
                  <TrendingUp size={28} style={{ color: 'var(--accent-color)' }} />
                  Métricas de Progreso
                </h2>
                <p className="client-subtitle">
                  Analiza la evolución de tus cargas y el detalle serie por serie.
                </p>
              </div>
            </div>
            <ClientMetrics plans={plans} />
          </div>
        )}

        {/* TAB: Configuración */}
        {activeTab === 'settings' && (
          <div>
            <div className="client-header-row">
              <div>
                <h2 className="client-title">
                  <Settings size={28} style={{ color: 'var(--accent-color)' }} />
                  Configuración de la Cuenta
                </h2>
                <p className="client-subtitle">Gestiona tu vinculación con tu entrenador.</p>
              </div>
            </div>

            <div className="settings-card">
              <h3
                style={{
                  marginBottom: '0.6rem',
                  color: colors.accent,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <UserCheck size={20} />
                Profesor Asignado
              </h3>
              <p style={{ color: '#cbd5e1', marginBottom: '1.35rem', fontSize: '0.94rem' }}>
                ¿Quieres cambiar de profesor? Ingresa su correo electrónico a continuación:
              </p>

              {profError && <div className="error-alert">{profError}</div>}
              {profSuccess && (
                <div
                  style={{
                    color: '#34d399',
                    background: 'rgba(16, 185, 129, 0.12)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    padding: '0.85rem 1rem',
                    borderRadius: '10px',
                    marginBottom: '1rem',
                    fontSize: '0.9rem',
                  }}
                >
                  {profSuccess}
                </div>
              )}

              <form
                onSubmit={handleChangeProfessor}
                style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
              >
                <input
                  type="email"
                  placeholder="Email del nuevo profesor..."
                  value={newProfessorEmail}
                  onChange={(e) => setNewProfessorEmail(e.target.value)}
                  required
                  style={{
                    padding: '0.85rem 1rem',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.18)',
                    background: 'rgba(0,0,0,0.35)',
                    color: 'white',
                    fontFamily: 'inherit',
                    fontSize: '0.95rem',
                  }}
                />
                <button
                  type="submit"
                  className="btn-submit-progress"
                  style={{ width: 'auto', alignSelf: 'flex-start', padding: '0.8rem 1.75rem' }}
                >
                  <Save size={17} />
                  Guardar Cambios
                </button>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* Barra Flotante de Descanso cuando el modal está cerrado */}
      {!selectedPlanItem && restRemaining > 0 && (
        <div className="floating-rest-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Timer size={20} style={{ color: 'var(--accent-color)' }} />
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Descanso activo
              </div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--accent-color)' }}>
                {formatSeconds(restRemaining)}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button
              type="button"
              className="btn-timer-ctrl"
              onClick={() => setRestRunning(!restRunning)}
            >
              {restRunning ? <Pause size={14} /> : <Play size={14} />}
            </button>
            <button
              type="button"
              className="btn-timer-ctrl"
              onClick={() => {
                setRestRunning(false);
                setRestRemaining(0);
              }}
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Modal para Registro Serie por Serie + Temporizador de Descanso */}
      {selectedPlanItem && selectedExercise && (
        <div className="modal-overlay" onClick={() => setSelectedPlanItem(null)}>
          <div className="modal-content-small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-small">
              <div>
                <h3>
                  <Dumbbell size={20} />
                  {selectedExercise.nombre}
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {selectedPlanItem.dia || 'Día 1'} • Objetivo: {selectedPlanItem.sets} series ×{' '}
                  {selectedPlanItem.reps} reps
                </span>
              </div>
              <button className="btn-close" onClick={() => setSelectedPlanItem(null)}>
                <X size={18} />
              </button>
            </div>

            {selectedExercise.imagenUrl && (
              <div className="modal-exercise-media">
                <img
                  src={selectedExercise.imagenUrl}
                  alt={selectedExercise.nombre}
                  className="modal-exercise-img"
                  onError={(e) => {
                    e.target.parentElement.style.display = 'none';
                  }}
                />
              </div>
            )}

            {selectedExercise.videoUrl && (
              <button
                type="button"
                className="btn-view-video"
                style={{ marginBottom: '1rem', width: '100%' }}
                onClick={(e) =>
                  openVideoModal(e, selectedExercise.videoUrl, selectedExercise.nombre)
                }
              >
                <PlayCircle size={16} />
                Ver Video de la Técnica
              </button>
            )}

            {/* Widget de Temporizador de Descanso (Rest Timer) */}
            <div className="rest-timer-card">
              <div className="rest-timer-top">
                <div>
                  <div
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      color: 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                    }}
                  >
                    <Clock size={13} style={{ color: 'var(--accent-color)' }} />
                    Temporizador de Descanso
                  </div>
                  <div className="rest-timer-clock">
                    {restRemaining > 0 ? formatSeconds(restRemaining) : formatSeconds(restDuration)}
                  </div>
                </div>

                <div className="rest-timer-controls">
                  {restRemaining > 0 ? (
                    <>
                      <button
                        type="button"
                        className="btn-timer-ctrl"
                        onClick={() => adjustRestTimer(-15)}
                      >
                        -15s
                      </button>
                      <button
                        type="button"
                        className="btn-timer-ctrl"
                        onClick={() => adjustRestTimer(15)}
                      >
                        +15s
                      </button>
                      <button
                        type="button"
                        className="btn-timer-ctrl active-preset"
                        onClick={() => setRestRunning(!restRunning)}
                      >
                        {restRunning ? <Pause size={14} /> : <Play size={14} />}
                        {restRunning ? 'Pausar' : 'Reanudar'}
                      </button>
                      <button
                        type="button"
                        className="btn-timer-ctrl"
                        onClick={() => {
                          setRestRunning(false);
                          setRestRemaining(0);
                        }}
                        title="Reiniciar"
                      >
                        <RotateCcw size={14} />
                      </button>
                    </>
                  ) : (
                    <>
                      {[60, 90, 120, 180].map((sec) => (
                        <button
                          key={sec}
                          type="button"
                          className={`btn-timer-ctrl ${restDuration === sec ? 'active-preset' : ''}`}
                          onClick={() => startRestTimer(sec)}
                        >
                          {sec}s
                        </button>
                      ))}
                    </>
                  )}
                </div>
              </div>

              {restRemaining > 0 && (
                <div className="workout-progress-bar-bg" style={{ height: '6px' }}>
                  <div
                    className="workout-progress-bar-fill"
                    style={{
                      width: `${Math.min(100, Math.round((restRemaining / Math.max(1, restDuration)) * 100))}%`,
                    }}
                  />
                </div>
              )}
            </div>

            <form onSubmit={handleProgressSubmit}>
              {/* Registro Serie por Serie */}
              <div className="sets-tracker-box">
                <div className="sets-tracker-header">
                  <h4>
                    <CheckCircle2 size={16} style={{ color: '#34d399' }} />
                    Registro Serie por Serie
                  </h4>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Toca ✓ al terminar cada serie
                  </span>
                </div>

                <div className="set-row-labels">
                  <span style={{ textAlign: 'center' }}>Serie</span>
                  <span style={{ textAlign: 'center' }}>Peso (kg)</span>
                  <span style={{ textAlign: 'center' }}>Reps</span>
                  <span style={{ textAlign: 'center' }}>Listo</span>
                  <span />
                </div>

                {setRows.map((row, index) => (
                  <div
                    key={index}
                    className={`set-row-grid ${row.completed ? 'completed' : ''}`}
                  >
                    <span className="set-num-badge">#{index + 1}</span>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      className="set-input"
                      placeholder="0"
                      value={row.weight}
                      onChange={(e) => handleSetRowChange(index, 'weight', e.target.value)}
                      required
                    />
                    <input
                      type="number"
                      min="1"
                      className="set-input"
                      placeholder="10"
                      value={row.reps}
                      onChange={(e) => handleSetRowChange(index, 'reps', e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className={`btn-check-set ${row.completed ? 'checked' : ''}`}
                      onClick={() => handleToggleSetCompleted(index)}
                      title="Marcar serie como completada e iniciar descanso"
                    >
                      <Check size={17} />
                    </button>
                    <button
                      type="button"
                      className="btn-remove-set"
                      onClick={() => handleRemoveSetRow(index)}
                      disabled={setRows.length <= 1}
                      title="Quitar serie"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}

                <button type="button" className="btn-add-set" onClick={handleAddSetRow}>
                  <Plus size={15} /> Añadir otra serie
                </button>
              </div>

              <div className="progress-form-group">
                <label>Notas de la sesión (opcional)</label>
                <textarea
                  rows="2"
                  placeholder="Ej: Subí 2.5kg en la última serie, buenas sensaciones"
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                ></textarea>
              </div>

              <button
                type="submit"
                className="btn-submit-progress"
                disabled={submittingProgress}
              >
                <CheckCircle2 size={18} />
                {submittingProgress ? 'Guardando...' : 'Finalizar y Guardar Ejercicio'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal para Visualizar Video */}
      {videoModalData && (
        <div className="modal-overlay" onClick={() => setVideoModalData(null)}>
          <div className="video-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-small">
              <h3>
                <PlayCircle size={20} />
                Demostración: {videoModalData.title}
              </h3>
              <button className="btn-close" onClick={() => setVideoModalData(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="video-player-container">
              {(() => {
                const embed = getEmbedVideoUrl(videoModalData.url);
                if (!embed)
                  return (
                    <p style={{ color: '#cbd5e1', padding: '2rem', textAlign: 'center' }}>
                      Video no disponible
                    </p>
                  );
                if (embed.type === 'video') {
                  return (
                    <video src={embed.src} controls autoPlay className="video-element">
                      Tu navegador no soporta el reproductor de video.
                    </video>
                  );
                }
                return (
                  <iframe
                    src={embed.src}
                    title={`Video demostrativo de ${videoModalData.title}`}
                    className="video-iframe"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                );
              })()}
            </div>
            <div style={{ marginTop: '1rem', textAlign: 'right' }}>
              <a
                href={videoModalData.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: colors.accent,
                  fontSize: '0.86rem',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <ExternalLink size={14} /> Abrir video en pestaña nueva
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientDashboard;
