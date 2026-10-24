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
} from 'lucide-react';
import { apiFetch } from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import { colors } from '../../theme';
import ClientMetrics from './ClientMetrics';
import './Client.css';

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

  // Filters for Routine
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState('Todos');

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

  // Modal State for Video Player
  const [videoModalData, setVideoModalData] = useState(null); // { url, title }

  useEffect(() => {
    fetchPlansAndProgress();
  }, []);

  const fetchPlansAndProgress = async () => {
    setLoading(true);
    try {
      const planRes = await apiFetch('/api/my-plan');
      if (planRes.ok) {
        const planData = await planRes.json();
        setPlans(planData);
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

  // Muscle groups available in the client's assigned routine
  const routineMuscles = useMemo(() => {
    const set = new Set();
    plans.forEach((p) => {
      if (p.exercise?.musculo) set.add(p.exercise.musculo);
    });
    return ['Todos', ...Array.from(set)];
  }, [plans]);

  const filteredPlans = useMemo(() => {
    return plans.filter((p) => {
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
  }, [plans, selectedMuscle, searchQuery]);

  // Daily progress calculation
  const completedTodayCount = useMemo(() => {
    if (!plans.length) return 0;
    return plans.filter((p) => p.exercise && isLoggedToday(p.exercise.id)).length;
  }, [plans, todayProgress]);

  const progressPercentage = plans.length > 0 ? Math.round((completedTodayCount / plans.length) * 100) : 0;

  const openProgressModal = (planItem) => {
    const exercise = planItem.exercise;
    setSelectedExercise(exercise);
    setPesoUsado(planItem.pesoSugerido ? planItem.pesoSugerido.toString() : '');
    setRepsRealizadas(planItem.reps ? planItem.reps.toString() : '');
    setSetsRealizados(planItem.sets ? planItem.sets.toString() : '');
    setNotas('');
  };

  const openVideoModal = (e, videoUrl, exerciseName) => {
    e.stopPropagation();
    setVideoModalData({ url: videoUrl, title: exerciseName });
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
          notas,
        }),
      });

      if (!response.ok) throw new Error('Error al registrar progreso');

      toast.success(`¡Progreso registrado en ${selectedExercise.nombre}!`);
      setSelectedExercise(null);
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
                  Toca cualquier ejercicio para registrar tus series y cargas del día.
                </p>
              </div>
            </div>

            {!loading && plans.length > 0 && (
              <>
                {/* Banner de Resumen de Entrenamiento de Hoy */}
                <div className="workout-summary-banner">
                  <div className="workout-summary-top">
                    <div className="workout-summary-info">
                      <div className="workout-summary-icon">
                        <Flame size={22} />
                      </div>
                      <div className="workout-summary-text">
                        <h3>Progreso de Hoy</h3>
                        <p>
                          Has registrado <strong>{completedTodayCount}</strong> de{' '}
                          <strong>{plans.length}</strong> ejercicios asignados
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
                      placeholder="Buscar ejercicio en mi rutina..."
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
                        <div className="exercise-muscle-tag">
                          <Target size={13} />
                          {ex.musculo}
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
                        </div>

                        {planItem.notasExtras && (
                          <div className="exercise-notes-pill">
                            <MessageSquare size={14} style={{ flexShrink: 0, marginTop: '2px', color: 'var(--accent-color)' }} />
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
                            {loggedToday ? 'Registrar otra serie / editar' : 'Registrar progreso'}
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
                  Analiza la evolución de tus cargas y repeticiones a lo largo del tiempo.
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

      {/* Modal para Registro de Progreso */}
      {selectedExercise && (
        <div className="modal-overlay" onClick={() => setSelectedExercise(null)}>
          <div className="modal-content-small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-small">
              <h3>
                <Dumbbell size={20} />
                {selectedExercise.nombre}
              </h3>
              <button className="btn-close" onClick={() => setSelectedExercise(null)}>
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
                style={{ marginBottom: '1.15rem', width: '100%' }}
                onClick={(e) =>
                  openVideoModal(e, selectedExercise.videoUrl, selectedExercise.nombre)
                }
              >
                <PlayCircle size={16} />
                Ver Video de la Técnica
              </button>
            )}

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
                <label>Notas de la sesión (opcional)</label>
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
                <CheckCircle2 size={18} />
                {submittingProgress ? 'Guardando...' : 'Guardar Progreso'}
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
