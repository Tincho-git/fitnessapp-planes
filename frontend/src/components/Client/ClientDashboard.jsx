import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../utils/api';
import ClientMetrics from './ClientMetrics';
import './Client.css';

const getEmbedVideoUrl = (url) => {
  if (!url) return null;
  // YouTube URLs: https://www.youtube.com/watch?v=ID or https://youtu.be/ID or https://www.youtube.com/embed/ID
  const youtubeMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  if (youtubeMatch && youtubeMatch[1]) {
    return { type: 'iframe', src: `https://www.youtube.com/embed/${youtubeMatch[1]}?autoplay=1` };
  }
  // Vimeo URL: https://vimeo.com/ID
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch && vimeoMatch[1]) {
    return { type: 'iframe', src: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1` };
  }
  // Direct video link (.mp4, .webm, .ogg, cloudinary video url)
  if (url.match(/\.(mp4|webm|ogg)$/i) || url.includes('/video/upload/')) {
    return { type: 'video', src: url };
  }
  // Fallback iframe
  return { type: 'iframe', src: url };
};

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

  // Modal State for Video Player
  const [videoModalData, setVideoModalData] = useState(null); // { url, title }

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
                      {ex.imagenUrl && (
                        <div className="exercise-card-image-container">
                          <img
                            src={ex.imagenUrl}
                            alt={ex.nombre}
                            className="exercise-card-img"
                            onError={(e) => { e.target.parentElement.style.display = 'none'; }}
                          />
                        </div>
                      )}
                      <div className="exercise-card-body">
                        <div className="card-header-row">
                          <h3 className="exercise-name-title">{ex.nombre}</h3>
                          {loggedToday && (
                            <span className="logged-badge">
                              ✅ Hoy
                            </span>
                          )}
                        </div>
                        <div className="exercise-muscle-tag">🎯 {ex.musculo}</div>

                        {ex.descripcion && (
                          <p className="exercise-description">{ex.descripcion}</p>
                        )}

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
                        <div className="exercise-card-actions">
                          {ex.videoUrl && (
                            <button
                              type="button"
                              className="btn-view-video"
                              onClick={(e) => openVideoModal(e, ex.videoUrl, ex.nombre)}
                            >
                              🎬 Ver Video Demostrativo
                            </button>
                          )}
                          <div className="card-action-text">
                            ➕ Hacer click para registrar progreso
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

            {selectedExercise.imagenUrl && (
              <div className="modal-exercise-media">
                <img
                  src={selectedExercise.imagenUrl}
                  alt={selectedExercise.nombre}
                  className="modal-exercise-img"
                  onError={(e) => { e.target.parentElement.style.display = 'none'; }}
                />
              </div>
            )}

            {selectedExercise.videoUrl && (
              <button
                type="button"
                className="btn-view-video"
                style={{ marginBottom: '1rem', width: '100%' }}
                onClick={(e) => openVideoModal(e, selectedExercise.videoUrl, selectedExercise.nombre)}
              >
                🎬 Ver Video de la Técnica
              </button>
            )}

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

      {/* Modal para Visualizar Video */}
      {videoModalData && (
        <div className="modal-overlay" onClick={() => setVideoModalData(null)}>
          <div className="video-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-small">
              <h3>🎬 Demostración: {videoModalData.title}</h3>
              <button
                style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.2rem', cursor: 'pointer' }}
                onClick={() => setVideoModalData(null)}
              >
                ✖
              </button>
            </div>
            <div className="video-player-container">
              {(() => {
                const embed = getEmbedVideoUrl(videoModalData.url);
                if (!embed) return <p style={{ color: '#cbd5e1', padding: '2rem', textAlign: 'center' }}>Video no disponible</p>;
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
                style={{ color: '#818cf8', fontSize: '0.85rem', textDecoration: 'none' }}
              >
                🔗 Abrir video en pestaña nueva ↗
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientDashboard;

