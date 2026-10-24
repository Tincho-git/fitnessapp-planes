import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  ClipboardList,
  TrendingUp,
  X,
  Plus,
  Trash2,
  Pencil,
  Calendar,
  Dumbbell,
  Search,
  Clock,
  Layers,
  Save,
  Copy,
} from 'lucide-react';
import { apiFetch } from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import { colors } from '../../theme';

const muscleGroups = ['Todos', 'Pecho', 'Espalda', 'Bíceps', 'Tríceps', 'Hombros', 'Abdomen', 'Piernas'];
const dayPresets = ['Día 1', 'Día 2', 'Día 3', 'Día 4', 'Día 5', 'Día 6', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

const AssignPlanForm = ({ client, onClose }) => {
  const { toast, confirm } = useToast();
  const [activeModalTab, setActiveModalTab] = useState('routine'); // 'routine' or 'progress'
  const [exercises, setExercises] = useState([]);
  const [clientPlans, setClientPlans] = useState([]);
  const [templates, setTemplates] = useState([]);

  // Filter state for exercise selector
  const [filterMuscle, setFilterMuscle] = useState('Todos');
  const [searchExercise, setSearchExercise] = useState('');

  // Day filter in client's current routine
  const [selectedRoutineDay, setSelectedRoutineDay] = useState('Todos');

  // Form state (Create / Edit Plan Item)
  const [editingPlanId, setEditingPlanId] = useState(null);
  const [exerciseId, setExerciseId] = useState('');
  const [dia, setDia] = useState('Día 1');
  const [sets, setSets] = useState(3);
  const [reps, setReps] = useState(10);
  const [pesoSugerido, setPesoSugerido] = useState('');
  const [descansoSegundos, setDescansoSegundos] = useState(90);
  const [notasExtras, setNotasExtras] = useState('');

  // Quick Template Actions state
  const [showApplyTemplateBox, setShowApplyTemplateBox] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [replaceRoutine, setReplaceRoutine] = useState(false);
  const [showSaveAsTemplateBox, setShowSaveAsTemplateBox] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateDesc, setNewTemplateDesc] = useState('');

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
      const [exRes, tplRes] = await Promise.all([
        apiFetch('/api/exercises'),
        apiFetch('/api/templates'),
      ]);
      if (exRes.ok) {
        const exData = await exRes.json();
        setExercises(exData);
        if (exData.length > 0) setExerciseId(exData[0].id.toString());
      }
      if (tplRes.ok) {
        const tplData = await tplRes.json();
        setTemplates(tplData);
        if (tplData.length > 0) setSelectedTemplateId(tplData[0].id.toString());
      }
      await fetchClientPlan();
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
    if (!editingPlanId && filteredExercises.length > 0) {
      const exists = filteredExercises.some((ex) => ex.id.toString() === exerciseId);
      if (!exists) {
        setExerciseId(filteredExercises[0].id.toString());
      }
    }
  }, [filteredExercises, editingPlanId]);

  const fetchClientPlan = async () => {
    try {
      const planRes = await apiFetch(`/api/users/clients/${client.id}/plan`);
      if (planRes.ok) {
        const planData = await planRes.json();
        setClientPlans(planData);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Unique days in client's current routine
  const routineDays = useMemo(() => {
    const set = new Set();
    clientPlans.forEach((p) => set.add(p.dia || 'Día 1'));
    return ['Todos', ...Array.from(set)];
  }, [clientPlans]);

  const filteredClientPlans = useMemo(() => {
    if (selectedRoutineDay === 'Todos') return clientPlans;
    return clientPlans.filter((p) => (p.dia || 'Día 1') === selectedRoutineDay);
  }, [clientPlans, selectedRoutineDay]);

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

  const startEditingPlan = (plan) => {
    setEditingPlanId(plan.id);
    setFilterMuscle('Todos');
    setSearchExercise('');
    setExerciseId(plan.exercise ? plan.exercise.id.toString() : '');
    setDia(plan.dia || 'Día 1');
    setSets(plan.sets || 3);
    setReps(plan.reps || 10);
    setPesoSugerido(plan.pesoSugerido ? plan.pesoSugerido.toString() : '');
    setDescansoSegundos(plan.descansoSegundos || 90);
    setNotasExtras(plan.notasExtras || '');
  };

  const cancelEditingPlan = () => {
    setEditingPlanId(null);
    setSets(3);
    setReps(10);
    setPesoSugerido('');
    setDescansoSegundos(90);
    setNotasExtras('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!exerciseId) return;
    setIsSubmitting(true);
    setError('');

    const payload = {
      clientId: client.id,
      exerciseId: parseInt(exerciseId),
      dia: dia.trim() || 'Día 1',
      sets: parseInt(sets),
      reps: parseInt(reps),
      pesoSugerido: pesoSugerido ? parseFloat(pesoSugerido) : null,
      descansoSegundos: parseInt(descansoSegundos) || 90,
      notasExtras,
    };

    try {
      const url = editingPlanId ? `/api/training-plans/${editingPlanId}` : '/api/training-plans';
      const method = editingPlanId ? 'PUT' : 'POST';

      const response = await apiFetch(url, {
        method,
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Error al guardar el ejercicio en la rutina.');

      toast.success(
        editingPlanId
          ? 'Ejercicio actualizado en la rutina'
          : `Ejercicio asignado a ${dia || 'Día 1'}`
      );
      cancelEditingPlan();
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
      message: `Se quitará "${exName}" (${plan.dia || 'Día 1'}) del plan de ${client.nombre}.`,
      confirmText: 'Quitar',
      cancelText: 'Cancelar',
      danger: true,
    });
    if (!ok) return;

    try {
      await apiFetch(`/api/training-plans/${plan.id}`, { method: 'DELETE' });
      toast.info(`"${exName}" removido de la rutina`);
      if (editingPlanId === plan.id) cancelEditingPlan();
      fetchClientPlan();
    } catch {
      setError('Error al eliminar el ejercicio del plan.');
      toast.error('Error al eliminar el ejercicio del plan.');
    }
  };

  const handleApplyTemplateToClient = async (e) => {
    e.preventDefault();
    if (!selectedTemplateId) return;
    try {
      const res = await apiFetch(`/api/templates/${selectedTemplateId}/apply`, {
        method: 'POST',
        body: JSON.stringify({
          clientId: client.id,
          replaceExisting: replaceRoutine,
        }),
      });
      if (!res.ok) throw new Error('No se pudo aplicar la plantilla');
      toast.success('¡Plantilla aplicada a la rutina del cliente!');
      setShowApplyTemplateBox(false);
      fetchClientPlan();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleSaveCurrentAsTemplate = async (e) => {
    e.preventDefault();
    try {
      const res = await apiFetch(`/api/templates/from-client/${client.id}`, {
        method: 'POST',
        body: JSON.stringify({
          nombre: newTemplateName.trim() || `Rutina de ${client.nombre}`,
          descripcion: newTemplateDesc.trim(),
        }),
      });
      if (!res.ok) throw new Error('Error al guardar como plantilla');
      toast.success('¡Rutina guardada en tus Plantillas!');
      setShowSaveAsTemplateBox(false);
      setNewTemplateName('');
      setNewTemplateDesc('');
      const tplRes = await apiFetch('/api/templates');
      if (tplRes.ok) setTemplates(await tplRes.json());
    } catch (err) {
      toast.error(err.message);
    }
  };

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
            {/* Columna Izquierda: Formulario de Asignación / Edición */}
            <div className="assign-form-col">
              <h3>
                {editingPlanId ? (
                  <>
                    <Pencil size={18} style={{ color: 'var(--accent-color)' }} />
                    Editando Ejercicio de la Rutina
                  </>
                ) : (
                  <>
                    <Plus size={18} style={{ color: 'var(--accent-color)' }} />
                    Asignar Ejercicio por Día
                  </>
                )}
              </h3>
              {loading ? (
                <p style={{ color: 'var(--text-muted)' }}>Cargando ejercicios...</p>
              ) : (
                <form onSubmit={handleSubmit} className="custom-form">
                  {/* Selección rápida de Día / Sesión */}
                  <div className="form-group">
                    <label>Día / Sesión de Entrenamiento</label>
                    <div className="muscle-chips" style={{ marginBottom: '0.5rem' }}>
                      {['Día 1', 'Día 2', 'Día 3', 'Día 4', 'Día 5'].map((d) => (
                        <button
                          key={d}
                          type="button"
                          className={`muscle-chip ${dia === d ? 'active' : ''}`}
                          onClick={() => setDia(d)}
                          style={{ padding: '0.3rem 0.7rem', fontSize: '0.76rem' }}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                    <input
                      type="text"
                      list="assign-day-presets"
                      value={dia}
                      onChange={(e) => setDia(e.target.value)}
                      placeholder="Ej: Día 1 - Pecho y Tríceps, Lunes..."
                      required
                    />
                    <datalist id="assign-day-presets">
                      {dayPresets.map((d) => (
                        <option key={d} value={d} />
                      ))}
                    </datalist>
                  </div>

                  <div className="form-group">
                    <label>Filtrar Catálogo por Músculo</label>
                    <div className="muscle-chips" style={{ marginBottom: '0.55rem' }}>
                      {muscleGroups.map((m) => (
                        <button
                          key={m}
                          type="button"
                          className={`muscle-chip ${filterMuscle === m ? 'active' : ''}`}
                          onClick={() => setFilterMuscle(m)}
                          style={{ padding: '0.28rem 0.68rem', fontSize: '0.75rem' }}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                    <div className="search-input-wrap" style={{ marginBottom: '0.6rem' }}>
                      <Search size={15} className="search-input-icon" />
                      <input
                        type="text"
                        className="search-input"
                        placeholder="Buscar ejercicio..."
                        value={searchExercise}
                        onChange={(e) => setSearchExercise(e.target.value)}
                        style={{ padding: '0.52rem 2rem 0.52rem 2.3rem', fontSize: '0.85rem' }}
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
                    <label>Ejercicio ({filteredExercises.length})</label>
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
                      <label>Series</label>
                      <input
                        type="number"
                        min="1"
                        value={sets}
                        onChange={(e) => setSets(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Reps</label>
                      <input
                        type="number"
                        min="1"
                        value={reps}
                        onChange={(e) => setReps(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Peso Sug. (kg)</label>
                      <input
                        type="number"
                        step="0.5"
                        placeholder="Opcional"
                        value={pesoSugerido}
                        onChange={(e) => setPesoSugerido(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Descanso entre series</label>
                      <select
                        value={descansoSegundos}
                        onChange={(e) => setDescansoSegundos(Number(e.target.value))}
                      >
                        <option value={45}>45 segundos</option>
                        <option value={60}>60 segundos (1 min)</option>
                        <option value={90}>90 segundos (1m 30s)</option>
                        <option value={120}>120 segundos (2 min)</option>
                        <option value={180}>180 segundos (3 min)</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Notas (opcional)</label>
                      <input
                        type="text"
                        value={notasExtras}
                        onChange={(e) => setNotasExtras(e.target.value)}
                        placeholder="Ej: Controlar bajada"
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.65rem' }}>
                    <button
                      type="submit"
                      className="btn-primary"
                      style={{ flex: 1 }}
                      disabled={isSubmitting || filteredExercises.length === 0}
                    >
                      {editingPlanId ? <Save size={17} /> : <Plus size={18} />}
                      {isSubmitting
                        ? 'Guardando...'
                        : editingPlanId
                          ? 'Guardar Cambios'
                          : `Asignar a ${dia || 'Día 1'}`}
                    </button>
                    {editingPlanId && (
                      <button
                        type="button"
                        className="btn-secondary-ghost"
                        onClick={cancelEditingPlan}
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </form>
              )}
            </div>

            {/* Columna Derecha: Plan Actual del Cliente por Días + Plantillas */}
            <div className="current-plan-col">
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                  marginBottom: '0.85rem',
                }}
              >
                <h3 style={{ margin: 0 }}>
                  <Dumbbell size={18} style={{ color: 'var(--accent-color)' }} />
                  Rutina Actual ({clientPlans.length})
                </h3>
                <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="btn-edit"
                    style={{ fontSize: '0.78rem', padding: '0.38rem 0.7rem' }}
                    onClick={() => {
                      setShowApplyTemplateBox(!showApplyTemplateBox);
                      setShowSaveAsTemplateBox(false);
                    }}
                  >
                    <Copy size={13} /> Aplicar Plantilla
                  </button>
                  {clientPlans.length > 0 && (
                    <button
                      type="button"
                      className="btn-edit"
                      style={{ fontSize: '0.78rem', padding: '0.38rem 0.7rem' }}
                      onClick={() => {
                        setShowSaveAsTemplateBox(!showSaveAsTemplateBox);
                        setShowApplyTemplateBox(false);
                      }}
                    >
                      <Layers size={13} /> Guardar Plantilla
                    </button>
                  )}
                </div>
              </div>

              {/* Caja desplegable: Aplicar Plantilla */}
              {showApplyTemplateBox && (
                <form
                  onSubmit={handleApplyTemplateToClient}
                  style={{
                    background: 'rgba(250, 204, 21, 0.08)',
                    border: '1px solid var(--accent-border)',
                    borderRadius: '12px',
                    padding: '0.9rem',
                    marginBottom: '1rem',
                  }}
                >
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--accent-color)' }}>
                    Cargar una Plantilla en {client.nombre}
                  </div>
                  {templates.length === 0 ? (
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      No tienes plantillas creadas aún.
                    </p>
                  ) : (
                    <>
                      <select
                        value={selectedTemplateId}
                        onChange={(e) => setSelectedTemplateId(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.55rem',
                          borderRadius: '8px',
                          background: 'rgba(0,0,0,0.45)',
                          color: 'white',
                          border: '1px solid var(--card-border-strong)',
                          marginBottom: '0.55rem',
                        }}
                      >
                        {templates.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.nombre} ({(t.items || []).length} ejercicios)
                          </option>
                        ))}
                      </select>
                      <label
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.45rem',
                          fontSize: '0.8rem',
                          color: 'var(--text-secondary)',
                          marginBottom: '0.65rem',
                          cursor: 'pointer',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={replaceRoutine}
                          onChange={(e) => setReplaceRoutine(e.target.checked)}
                        />
                        Reemplazar rutina actual del cliente
                      </label>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button type="submit" className="btn-primary" style={{ padding: '0.45rem 0.9rem', fontSize: '0.82rem' }}>
                          Cargar Rutina
                        </button>
                        <button
                          type="button"
                          className="btn-secondary-ghost"
                          style={{ padding: '0.45rem 0.8rem', fontSize: '0.82rem' }}
                          onClick={() => setShowApplyTemplateBox(false)}
                        >
                          Cerrar
                        </button>
                      </div>
                    </>
                  )}
                </form>
              )}

              {/* Caja desplegable: Guardar Rutina del Cliente como Plantilla */}
              {showSaveAsTemplateBox && (
                <form
                  onSubmit={handleSaveCurrentAsTemplate}
                  style={{
                    background: 'rgba(16, 185, 129, 0.08)',
                    border: '1px solid rgba(16, 185, 129, 0.35)',
                    borderRadius: '12px',
                    padding: '0.9rem',
                    marginBottom: '1rem',
                  }}
                >
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: '#34d399' }}>
                    Guardar esta rutina como Plantilla reutilizable
                  </div>
                  <input
                    type="text"
                    placeholder={`Ej: Rutina de ${client.nombre}`}
                    value={newTemplateName}
                    onChange={(e) => setNewTemplateName(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '8px',
                      background: 'rgba(0,0,0,0.45)',
                      color: 'white',
                      border: '1px solid var(--card-border-strong)',
                      marginBottom: '0.5rem',
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Descripción corta (opcional)"
                    value={newTemplateDesc}
                    onChange={(e) => setNewTemplateDesc(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '8px',
                      background: 'rgba(0,0,0,0.45)',
                      color: 'white',
                      border: '1px solid var(--card-border-strong)',
                      marginBottom: '0.65rem',
                    }}
                  />
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button type="submit" className="btn-primary" style={{ padding: '0.45rem 0.9rem', fontSize: '0.82rem' }}>
                      Guardar Plantilla
                    </button>
                    <button
                      type="button"
                      className="btn-secondary-ghost"
                      style={{ padding: '0.45rem 0.8rem', fontSize: '0.82rem' }}
                      onClick={() => setShowSaveAsTemplateBox(false)}
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              )}

              {/* Pestañas de Días dentro de la rutina del cliente */}
              {routineDays.length > 1 && (
                <div className="muscle-chips" style={{ marginBottom: '0.9rem' }}>
                  {routineDays.map((d) => (
                    <button
                      key={d}
                      type="button"
                      className={`muscle-chip ${selectedRoutineDay === d ? 'active' : ''}`}
                      onClick={() => setSelectedRoutineDay(d)}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              )}

              <div className="plan-list">
                {clientPlans.length === 0 ? (
                  <div className="empty-state">
                    <ClipboardList size={32} style={{ color: 'var(--text-muted)' }} />
                    <p>El cliente aún no tiene ejercicios asignados.</p>
                  </div>
                ) : (
                  filteredClientPlans.map((plan) => (
                    <div
                      key={plan.id}
                      className="plan-item"
                      style={
                        editingPlanId === plan.id
                          ? { borderColor: 'var(--accent-color)', background: 'var(--accent-subtle)' }
                          : undefined
                      }
                    >
                      <div className="plan-details">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                          <span
                            style={{
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              padding: '0.12rem 0.5rem',
                              borderRadius: '6px',
                              background: 'rgba(255,255,255,0.08)',
                              color: 'var(--accent-light)',
                            }}
                          >
                            {plan.dia || 'Día 1'}
                          </span>
                          <strong>
                            {plan.exercise ? plan.exercise.nombre : `Ejercicio ID: ${plan.exerciseId}`}
                          </strong>
                          {plan.exercise?.musculo && (
                            <span className="badge" style={{ fontSize: '0.68rem', padding: '0.1rem 0.45rem' }}>
                              {plan.exercise.musculo}
                            </span>
                          )}
                        </div>
                        <div className="plan-meta">
                          <span>
                            {plan.sets} series × {plan.reps} reps
                          </span>
                          {plan.pesoSugerido && <span>• {plan.pesoSugerido} kg</span>}
                          <span>
                            • <Clock size={12} style={{ verticalAlign: 'middle' }} />{' '}
                            {plan.descansoSegundos || 90}s
                          </span>
                        </div>
                        {plan.notasExtras && <div className="plan-notes">"{plan.notasExtras}"</div>}
                      </div>
                      <div style={{ display: 'flex', gap: '0.35rem', flexShrink: 0 }}>
                        <button
                          type="button"
                          className="btn-edit"
                          style={{ padding: '0.35rem 0.5rem' }}
                          onClick={() => startEditingPlan(plan)}
                          title="Editar series, peso o día"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          className="btn-danger-small"
                          onClick={() => handleDeletePlan(plan)}
                          title="Quitar ejercicio"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
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
                            <th style={{ padding: '0.7rem', textAlign: 'left' }}>Peso Máx</th>
                            <th style={{ padding: '0.7rem', textAlign: 'left' }}>Series × Reps</th>
                            <th style={{ padding: '0.7rem', textAlign: 'left' }}>Detalle Serie por Serie</th>
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
                              <td style={{ padding: '0.7rem' }}>
                                {item.setsRealizados} × {item.repsRealizadas}
                              </td>
                              <td style={{ padding: '0.7rem', color: 'var(--accent-light)', fontSize: '0.82rem' }}>
                                {item.detalleSeries || '—'}
                              </td>
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
