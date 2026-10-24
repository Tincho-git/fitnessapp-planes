import React, { useState, useEffect } from 'react';
import {
  Layers,
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  UserCheck,
  Dumbbell,
  Calendar,
  Clock,
  Copy,
} from 'lucide-react';
import { apiFetch } from '../../utils/api';
import { useToast } from '../../context/ToastContext';

const dayPresets = ['Día 1', 'Día 2', 'Día 3', 'Día 4', 'Día 5', 'Día 6', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

const TemplateManager = ({ clients = [] }) => {
  const { toast, confirm } = useToast();
  const [templates, setTemplates] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal Crear / Editar Plantilla
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [items, setItems] = useState([]);
  const [saving, setSaving] = useState(false);

  // Nuevo item temporal dentro del modal de plantilla
  const [itemExId, setItemExId] = useState('');
  const [itemDia, setItemDia] = useState('Día 1');
  const [itemSets, setItemSets] = useState(3);
  const [itemReps, setItemReps] = useState(10);
  const [itemPeso, setItemPeso] = useState('');
  const [itemDescanso, setItemDescanso] = useState(90);
  const [itemNotas, setItemNotas] = useState('');

  // Modal Aplicar a Cliente
  const [applyModalTemplate, setApplyModalTemplate] = useState(null);
  const [targetClientId, setTargetClientId] = useState('');
  const [replaceExisting, setReplaceExisting] = useState(false);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tplRes, exRes] = await Promise.all([
        apiFetch('/api/templates'),
        apiFetch('/api/exercises'),
      ]);
      if (tplRes.ok) setTemplates(await tplRes.json());
      if (exRes.ok) {
        const exList = await exRes.json();
        setExercises(exList);
        if (exList.length > 0) setItemExId(exList[0].id.toString());
      }
    } catch {
      toast.error('Error al cargar las plantillas');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingTemplate(null);
    setNombre('');
    setDescripcion('');
    setItems([]);
    setItemDia('Día 1');
    setItemSets(3);
    setItemReps(10);
    setItemPeso('');
    setItemDescanso(90);
    setItemNotas('');
    if (exercises.length > 0) setItemExId(exercises[0].id.toString());
    setShowModal(true);
  };

  const openEditModal = (tpl) => {
    setEditingTemplate(tpl);
    setNombre(tpl.nombre);
    setDescripcion(tpl.descripcion || '');
    const mapped = (tpl.items || []).map((it) => ({
      exerciseId: it.exercise?.id,
      exerciseNombre: it.exercise?.nombre || 'Ejercicio',
      exerciseMusculo: it.exercise?.musculo || '',
      dia: it.dia || 'Día 1',
      sets: it.sets || 3,
      reps: it.reps || 10,
      pesoSugerido: it.pesoSugerido || '',
      descansoSegundos: it.descansoSegundos || 90,
      notasExtras: it.notasExtras || '',
    }));
    setItems(mapped);
    if (exercises.length > 0) setItemExId(exercises[0].id.toString());
    setShowModal(true);
  };

  const handleAddItemToDraft = () => {
    if (!itemExId) return;
    const exObj = exercises.find((e) => e.id.toString() === itemExId.toString());
    if (!exObj) return;

    setItems((prev) => [
      ...prev,
      {
        exerciseId: exObj.id,
        exerciseNombre: exObj.nombre,
        exerciseMusculo: exObj.musculo,
        dia: itemDia || 'Día 1',
        sets: parseInt(itemSets) || 3,
        reps: parseInt(itemReps) || 10,
        pesoSugerido: itemPeso ? parseFloat(itemPeso) : null,
        descansoSegundos: parseInt(itemDescanso) || 90,
        notasExtras: itemNotas,
      },
    ]);
    setItemNotas('');
  };

  const handleRemoveDraftItem = (idx) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSaveTemplate = async (e) => {
    e.preventDefault();
    if (!nombre.trim()) {
      toast.error('Ingresa un nombre para la plantilla');
      return;
    }
    if (items.length === 0) {
      toast.error('Agrega al menos un ejercicio a la plantilla');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        items: items.map((it) => ({
          exerciseId: it.exerciseId,
          dia: it.dia,
          sets: it.sets,
          reps: it.reps,
          pesoSugerido: it.pesoSugerido || null,
          descansoSegundos: it.descansoSegundos || 90,
          notasExtras: it.notasExtras || '',
        })),
      };

      const url = editingTemplate ? `/api/templates/${editingTemplate.id}` : '/api/templates';
      const method = editingTemplate ? 'PUT' : 'POST';

      const res = await apiFetch(url, {
        method,
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('No se pudo guardar la plantilla');

      toast.success(
        editingTemplate ? 'Plantilla actualizada con éxito' : 'Plantilla creada con éxito'
      );
      setShowModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTemplate = async (tpl) => {
    const ok = await confirm({
      title: '¿Eliminar plantilla?',
      message: `Se eliminará la plantilla "${tpl.nombre}". Los planes ya asignados a clientes no se verán afectados.`,
      confirmText: 'Sí, eliminar',
      cancelText: 'Cancelar',
      danger: true,
    });
    if (!ok) return;

    try {
      const res = await apiFetch(`/api/templates/${tpl.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar plantilla');
      toast.info(`Plantilla "${tpl.nombre}" eliminada`);
      fetchData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const openApplyModal = (tpl) => {
    setApplyModalTemplate(tpl);
    if (clients.length > 0 && !targetClientId) {
      setTargetClientId(clients[0].id.toString());
    }
    setReplaceExisting(false);
  };

  const handleApplyTemplate = async (e) => {
    e.preventDefault();
    if (!applyModalTemplate || !targetClientId) return;

    setApplying(true);
    try {
      const res = await apiFetch(`/api/templates/${applyModalTemplate.id}/apply`, {
        method: 'POST',
        body: JSON.stringify({
          clientId: parseInt(targetClientId),
          replaceExisting,
        }),
      });
      if (!res.ok) throw new Error('Error al asignar la plantilla al cliente');
      const clientObj = clients.find((c) => c.id.toString() === targetClientId.toString());
      toast.success(
        `Plantilla "${applyModalTemplate.nombre}" asignada a ${clientObj ? clientObj.nombre : 'cliente'}`
      );
      setApplyModalTemplate(null);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setApplying(false);
    }
  };

  const getTemplateDays = (tpl) => {
    const set = new Set();
    (tpl.items || []).forEach((i) => set.add(i.dia || 'Día 1'));
    return Array.from(set);
  };

  return (
    <div className="template-manager">
      <div className="section-header">
        <div>
          <h2>
            <Layers size={26} style={{ color: 'var(--accent-color)' }} />
            Plantillas de Rutinas
            {templates.length > 0 && <span className="count-pill">{templates.length}</span>}
          </h2>
          <p className="section-subtitle">
            Crea rutinas prearmadas por días y asígnalas a cualquier cliente en un solo clic.
          </p>
        </div>
        <button className="btn-primary" onClick={openCreateModal}>
          <Plus size={18} />
          Nueva Plantilla
        </button>
      </div>

      {loading ? (
        <div className="skeleton-grid">
          <div className="skeleton-card" />
          <div className="skeleton-card" />
        </div>
      ) : templates.length === 0 ? (
        <div className="empty-state">
          <Layers size={40} style={{ color: 'var(--accent-color)', opacity: 0.8 }} />
          <p>Aún no tienes plantillas guardadas.</p>
          <p style={{ fontSize: '0.86rem' }}>
            Crea una desde aquí o guarda la rutina actual de cualquier cliente como plantilla.
          </p>
        </div>
      ) : (
        <div className="exercise-list">
          {templates.map((tpl) => {
            const days = getTemplateDays(tpl);
            return (
              <div key={tpl.id} className="exercise-item">
                <div className="ex-details">
                  <div className="ex-header-top">
                    <h4>{tpl.nombre}</h4>
                    <span className="badge">
                      <Dumbbell size={12} />
                      {(tpl.items || []).length} ej.
                    </span>
                  </div>
                  {tpl.descripcion && <p>{tpl.descripcion}</p>}

                  {days.length > 0 && (
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                      {days.map((d) => (
                        <span
                          key={d}
                          style={{
                            fontSize: '0.74rem',
                            padding: '0.18rem 0.55rem',
                            borderRadius: '6px',
                            background: 'rgba(255,255,255,0.06)',
                            color: '#cbd5e1',
                            border: '1px solid rgba(255,255,255,0.1)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                          }}
                        >
                          <Calendar size={11} style={{ color: 'var(--accent-color)' }} />
                          {d}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Vista previa rápida de los primeros ejercicios */}
                  {(tpl.items || []).length > 0 && (
                    <div
                      style={{
                        marginTop: '0.65rem',
                        padding: '0.6rem 0.75rem',
                        background: 'rgba(0,0,0,0.28)',
                        borderRadius: '10px',
                        fontSize: '0.82rem',
                        color: 'var(--text-secondary)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.28rem',
                      }}
                    >
                      {tpl.items.slice(0, 4).map((it, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
                          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            <strong style={{ color: 'var(--accent-light)' }}>{it.dia}:</strong>{' '}
                            {it.exercise?.nombre}
                          </span>
                          <span style={{ color: '#34d399', flexShrink: 0 }}>
                            {it.sets}×{it.reps}
                          </span>
                        </div>
                      ))}
                      {tpl.items.length > 4 && (
                        <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                          + {tpl.items.length - 4} ejercicios más...
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="ex-card-footer">
                  <button
                    type="button"
                    className="btn-primary"
                    style={{ padding: '0.52rem 0.9rem', fontSize: '0.84rem' }}
                    onClick={() => openApplyModal(tpl)}
                  >
                    <Copy size={14} /> Asignar a Cliente
                  </button>
                  <div className="ex-actions">
                    <button className="btn-edit" onClick={() => openEditModal(tpl)}>
                      <Pencil size={14} />
                    </button>
                    <button className="btn-danger" onClick={() => handleDeleteTemplate(tpl)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── MODAL CREAR / EDITAR PLANTILLA ── */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div
            className="modal-content large-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>
                <Layers size={22} style={{ color: 'var(--accent-color)' }} />
                {editingTemplate ? 'Editar Plantilla' : 'Nueva Plantilla de Rutina'}
              </h2>
              <button className="btn-close" onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveTemplate} className="assign-layout">
              {/* Columna Izquierda: Datos de la Plantilla y Agregar Ejercicio */}
              <div className="assign-form-col">
                <div className="custom-form" style={{ marginBottom: '1.25rem' }}>
                  <div className="form-group">
                    <label>Nombre de la Plantilla</label>
                    <input
                      type="text"
                      placeholder="Ej: Hipertrofia 4 Días - Torso/Pierna"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Descripción / Objetivo (opcional)</label>
                    <input
                      type="text"
                      placeholder="Ej: Nivel intermedio enfocado en fuerza básica"
                      value={descripcion}
                      onChange={(e) => setDescripcion(e.target.value)}
                    />
                  </div>
                </div>

                <div className="custom-form">
                  <h4 style={{ marginBottom: '0.9rem', color: 'var(--accent-color)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Plus size={17} /> Agregar Ejercicio a la Plantilla
                  </h4>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Día / Sesión</label>
                      <input
                        type="text"
                        list="template-day-presets"
                        value={itemDia}
                        onChange={(e) => setItemDia(e.target.value)}
                        placeholder="Ej: Día 1"
                      />
                      <datalist id="template-day-presets">
                        {dayPresets.map((d) => (
                          <option key={d} value={d} />
                        ))}
                      </datalist>
                    </div>
                    <div className="form-group">
                      <label>Descanso (seg)</label>
                      <select
                        value={itemDescanso}
                        onChange={(e) => setItemDescanso(Number(e.target.value))}
                      >
                        <option value={45}>45 seg</option>
                        <option value={60}>60 seg (1m)</option>
                        <option value={90}>90 seg (1m 30s)</option>
                        <option value={120}>120 seg (2m)</option>
                        <option value={180}>180 seg (3m)</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Ejercicio</label>
                    <select value={itemExId} onChange={(e) => setItemExId(e.target.value)}>
                      {exercises.map((ex) => (
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
                        value={itemSets}
                        onChange={(e) => setItemSets(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Reps</label>
                      <input
                        type="number"
                        min="1"
                        value={itemReps}
                        onChange={(e) => setItemReps(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Peso Sug. (kg)</label>
                      <input
                        type="number"
                        step="0.5"
                        placeholder="Opcional"
                        value={itemPeso}
                        onChange={(e) => setItemPeso(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Notas (opcional)</label>
                    <input
                      type="text"
                      placeholder="Ej: Subir carga en última serie"
                      value={itemNotas}
                      onChange={(e) => setItemNotas(e.target.value)}
                    />
                  </div>

                  <button
                    type="button"
                    className="btn-edit"
                    style={{ width: '100%', padding: '0.75rem' }}
                    onClick={handleAddItemToDraft}
                    disabled={exercises.length === 0}
                  >
                    <Plus size={16} /> Añadir Ejercicio a la Lista
                  </button>
                </div>
              </div>

              {/* Columna Derecha: Lista de Ejercicios en la Plantilla */}
              <div className="current-plan-col" style={{ display: 'flex', flexDirection: 'column' }}>
                <h3>
                  <Dumbbell size={18} style={{ color: 'var(--accent-color)' }} />
                  Ejercicios en la Plantilla ({items.length})
                </h3>

                <div className="plan-list" style={{ flex: 1, marginBottom: '1.25rem' }}>
                  {items.length === 0 ? (
                    <div className="empty-state">
                      <p>Añade ejercicios desde el panel izquierdo para armar la plantilla.</p>
                    </div>
                  ) : (
                    items.map((it, index) => (
                      <div key={index} className="plan-item">
                        <div className="plan-details">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                            <span className="badge" style={{ fontSize: '0.7rem' }}>
                              {it.dia}
                            </span>
                            <strong>{it.exerciseNombre}</strong>
                          </div>
                          <div className="plan-meta">
                            <span>
                              {it.sets}×{it.reps}
                            </span>
                            {it.pesoSugerido && <span>• {it.pesoSugerido} kg</span>}
                            <span>
                              • <Clock size={12} style={{ verticalAlign: 'middle' }} />{' '}
                              {it.descansoSegundos || 90}s
                            </span>
                          </div>
                          {it.notasExtras && <div className="plan-notes">"{it.notasExtras}"</div>}
                        </div>
                        <button
                          type="button"
                          className="btn-danger-small"
                          onClick={() => handleRemoveDraftItem(index)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  style={{ width: '100%', marginTop: 'auto' }}
                  disabled={saving || items.length === 0}
                >
                  <Save size={18} />
                  {saving ? 'Guardando...' : 'Guardar Plantilla Completa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL APLICAR PLANTILLA A UN CLIENTE ── */}
      {applyModalTemplate && (
        <div className="modal-overlay" onClick={() => setApplyModalTemplate(null)}>
          <div className="modal-content-small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-small">
              <h3>
                <UserCheck size={20} />
                Asignar Plantilla
              </h3>
              <button className="btn-close" onClick={() => setApplyModalTemplate(null)}>
                <X size={18} />
              </button>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: '1.25rem' }}>
              Vas a asignar <strong>{applyModalTemplate.nombre}</strong> (
              {(applyModalTemplate.items || []).length} ejercicios).
            </p>

            {clients.length === 0 ? (
              <div className="empty-state">No tienes clientes registrados para asignar.</div>
            ) : (
              <form onSubmit={handleApplyTemplate}>
                <div className="progress-form-group">
                  <label>Seleccionar Cliente</label>
                  <select
                    className="metrics-select"
                    style={{ width: '100%' }}
                    value={targetClientId}
                    onChange={(e) => setTargetClientId(e.target.value)}
                    required
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre} ({c.email})
                      </option>
                    ))}
                  </select>
                </div>

                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    fontSize: '0.9rem',
                    color: 'var(--text-secondary)',
                    marginBottom: '1.25rem',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={replaceExisting}
                    onChange={(e) => setReplaceExisting(e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--accent-color)' }}
                  />
                  Reemplazar rutina actual del cliente (borrar ejercicios anteriores)
                </label>

                <button
                  type="submit"
                  className="btn-submit-progress"
                  disabled={applying}
                >
                  <Copy size={17} />
                  {applying ? 'Asignando...' : 'Confirmar y Asignar Rutina'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateManager;
