import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Dumbbell,
  Plus,
  Search,
  X,
  Pencil,
  Trash2,
  Upload,
  Link2,
  PlayCircle,
  Image as ImageIcon,
  Save,
  Target,
} from 'lucide-react';
import { apiFetch } from '../../utils/api';
import { useToast } from '../../context/ToastContext';

const muscleGroups = ['Pecho', 'Espalda', 'Bíceps', 'Tríceps', 'Hombros', 'Abdomen', 'Piernas'];

// Componente de campo de media con pestañas "Subir archivo / URL"
// Definido fuera del componente principal para evitar re-montajes
const MediaInput = ({
  label,
  icon: IconComp,
  currentUrl,
  accept,
  inputRef,
  onFileChange,
  onUrlChange,
  urlValue,
  mode,
  onModeChange,
  isEdit,
}) => {
  return (
    <div className="form-group">
      <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        {IconComp && <IconComp size={15} style={{ color: 'var(--accent-color)' }} />}
        {label}
      </label>
      <div className="media-tabs">
        <button
          type="button"
          className={`media-tab ${mode === 'file' ? 'active' : ''}`}
          onClick={() => onModeChange('file')}
        >
          <Upload size={14} /> Subir archivo
        </button>
        <button
          type="button"
          className={`media-tab ${mode === 'url' ? 'active' : ''}`}
          onClick={() => onModeChange('url')}
        >
          <Link2 size={14} /> Ingresar URL
        </button>
      </div>

      {mode === 'file' ? (
        <div className="media-input-area">
          {isEdit && currentUrl && (
            accept === 'video/*' ? (
              <a
                href={currentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="video-link"
                style={{ display: 'inline-flex', marginBottom: '0.5rem', width: 'fit-content' }}
              >
                <PlayCircle size={15} /> Ver actual
              </a>
            ) : (
              <img
                src={currentUrl}
                alt="actual"
                className="ex-thumb-small"
                style={{ display: 'block', marginBottom: '0.5rem' }}
              />
            )
          )}
          {isEdit && !currentUrl && (
            <p style={{ color: '#64748b', fontSize: '0.82rem', margin: '0 0 0.5rem 0' }}>
              Sin {accept === 'video/*' ? 'video' : 'imagen'} actual
            </p>
          )}
          <input
            type="file"
            accept={accept}
            ref={inputRef}
            onChange={(e) => onFileChange(e.target.files[0] || null)}
          />
        </div>
      ) : (
        <div className="media-input-area">
          <input
            type="url"
            placeholder={`Pega aquí la URL de ${accept === 'video/*' ? 'YouTube, Vimeo, etc.' : 'la imagen'}`}
            value={urlValue}
            onChange={(e) => onUrlChange(e.target.value)}
            style={{ width: '100%', boxSizing: 'border-box' }}
          />
          {urlValue && accept !== 'video/*' && (
            <img
              src={urlValue}
              alt="preview"
              className="ex-thumb-small"
              style={{ display: 'block', marginTop: '0.5rem' }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          )}
          {urlValue && accept === 'video/*' && (
            <a
              href={urlValue}
              target="_blank"
              rel="noopener noreferrer"
              className="video-link"
              style={{ display: 'inline-flex', marginTop: '0.5rem', width: 'fit-content' }}
            >
              <PlayCircle size={15} /> Ver enlace
            </a>
          )}
        </div>
      )}
    </div>
  );
};

// Componente de formulario para crear/editar ejercicio
// Definido fuera de ExerciseManager para mantener el foco en los inputs al escribir
const ExerciseForm = ({
  onSubmit,
  isProcessing,
  processingText,
  onCancel,
  submitLabel,
  nameVal,
  onNameChange,
  muscleVal,
  onMuscleChange,
  descVal,
  onDescChange,
  onImgFile,
  imgUrl,
  onImgUrl,
  imgMode,
  onImgMode,
  onVidFile,
  vidUrl,
  onVidUrl,
  vidMode,
  onVidMode,
  imgRef,
  vidRef,
  currentImagenUrl,
  currentVideoUrl,
  isEdit,
}) => {
  return (
    <form onSubmit={onSubmit} className="custom-form">
      <div className="form-row">
        <div className="form-group">
          <label>Nombre del Ejercicio</label>
          <input
            type="text"
            value={nameVal}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Ej: Press de banca"
            required
          />
        </div>
        <div className="form-group">
          <label>Grupo Muscular</label>
          <select value={muscleVal} onChange={(e) => onMuscleChange(e.target.value)}>
            {muscleGroups.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label>Descripción / Técnica</label>
        <textarea
          value={descVal}
          onChange={(e) => onDescChange(e.target.value)}
          rows="3"
          placeholder="Describe cómo se realiza el ejercicio..."
        />
      </div>

      <MediaInput
        label="Imagen del Ejercicio"
        icon={ImageIcon}
        accept="image/*"
        currentUrl={currentImagenUrl}
        inputRef={imgRef}
        onFileChange={onImgFile}
        onUrlChange={onImgUrl}
        urlValue={imgUrl}
        mode={imgMode}
        onModeChange={onImgMode}
        isEdit={isEdit}
      />

      <MediaInput
        label="Video Demostrativo"
        icon={PlayCircle}
        accept="video/*"
        currentUrl={currentVideoUrl}
        inputRef={vidRef}
        onFileChange={onVidFile}
        onUrlChange={onVidUrl}
        urlValue={vidUrl}
        mode={vidMode}
        onModeChange={onVidMode}
        isEdit={isEdit}
      />

      <div style={{ display: 'flex', gap: '0.85rem', marginTop: '1.35rem' }}>
        <button type="submit" className="btn-primary" disabled={isProcessing} style={{ flex: 1 }}>
          <Save size={17} />
          {isProcessing ? processingText || 'Procesando...' : submitLabel}
        </button>
        <button
          type="button"
          className="btn-secondary-ghost"
          onClick={onCancel}
          style={{ flex: 1 }}
        >
          Cancelar
        </button>
      </div>
    </form>
  );
};

const ExerciseManager = () => {
  const { toast, confirm } = useToast();
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Filtros de búsqueda y grupo muscular
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState('Todos');

  // ── MODAL CREAR ──
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [nombre, setNombre] = useState('');
  const [musculo, setMusculo] = useState('Pecho');
  const [descripcion, setDescripcion] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [imageMode, setImageMode] = useState('file');
  const [videoFile, setVideoFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [videoMode, setVideoMode] = useState('file');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusText, setStatusText] = useState('');

  // ── MODAL EDITAR ──
  const [editingExercise, setEditingExercise] = useState(null);
  const [editNombre, setEditNombre] = useState('');
  const [editMusculo, setEditMusculo] = useState('Pecho');
  const [editDescripcion, setEditDescripcion] = useState('');
  const [editImageFile, setEditImageFile] = useState(null);
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editImageMode, setEditImageMode] = useState('file');
  const [editVideoFile, setEditVideoFile] = useState(null);
  const [editVideoUrl, setEditVideoUrl] = useState('');
  const [editVideoMode, setEditVideoMode] = useState('file');
  const [isEditing, setIsEditing] = useState(false);
  const [editStatusText, setEditStatusText] = useState('');

  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const editImageInputRef = useRef(null);
  const editVideoInputRef = useRef(null);

  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/exercises');
      if (!res.ok) throw new Error('Error al cargar ejercicios');
      setExercises(await res.json());
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredExercises = useMemo(() => {
    return exercises.filter((ex) => {
      const matchesMuscle = selectedMuscle === 'Todos' || ex.musculo === selectedMuscle;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        (ex.nombre && ex.nombre.toLowerCase().includes(q)) ||
        (ex.descripcion && ex.descripcion.toLowerCase().includes(q)) ||
        (ex.musculo && ex.musculo.toLowerCase().includes(q));
      return matchesMuscle && matchesSearch;
    });
  }, [exercises, selectedMuscle, searchQuery]);

  const uploadMedia = async (file, setStatus, label) => {
    setStatus(`Subiendo ${label}...`);
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiFetch('/api/exercises/upload', { method: 'POST', body: formData });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      throw new Error(d.error || `Error al subir ${label}`);
    }
    return (await res.json()).url || '';
  };

  const resolveMedia = async (mode, file, urlValue, existingUrl, setStatus, label) => {
    if (mode === 'file' && file) return await uploadMedia(file, setStatus, label);
    if (mode === 'url' && urlValue.trim()) return urlValue.trim();
    return existingUrl || '';
  };

  // ── CREAR ──
  const openCreateModal = () => {
    setNombre('');
    setMusculo(selectedMuscle !== 'Todos' ? selectedMuscle : 'Pecho');
    setDescripcion('');
    setImageFile(null);
    setImageUrl('');
    setImageMode('file');
    setVideoFile(null);
    setVideoUrl('');
    setVideoMode('file');
    setError('');
    setShowCreateModal(true);
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      const imagenUrl = await resolveMedia(imageMode, imageFile, imageUrl, '', setStatusText, 'imagen');
      const videoUrlFinal = await resolveMedia(videoMode, videoFile, videoUrl, '', setStatusText, 'video');
      setStatusText('Guardando ejercicio...');
      const res = await apiFetch('/api/exercises', {
        method: 'POST',
        body: JSON.stringify({ nombre, musculo, descripcion, imagenUrl, videoUrl: videoUrlFinal }),
      });
      if (!res.ok) throw new Error('Error al crear el ejercicio');
      toast.success(`Ejercicio "${nombre}" creado con éxito`);
      closeCreateModal();
      fetchExercises();
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
      setStatusText('');
    }
  };

  // ── EDITAR ──
  const openEditModal = (ex) => {
    setEditingExercise(ex);
    setEditNombre(ex.nombre);
    setEditMusculo(ex.musculo);
    setEditDescripcion(ex.descripcion || '');
    setEditImageFile(null);
    setEditImageUrl('');
    setEditImageMode('file');
    setEditVideoFile(null);
    setEditVideoUrl('');
    setEditVideoMode('file');
    setError('');
  };

  const closeEditModal = () => {
    setEditingExercise(null);
    setError('');
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsEditing(true);
    setError('');
    try {
      const imagenUrl = await resolveMedia(
        editImageMode,
        editImageFile,
        editImageUrl,
        editingExercise.imagenUrl,
        setEditStatusText,
        'imagen'
      );
      const videoUrlFinal = await resolveMedia(
        editVideoMode,
        editVideoFile,
        editVideoUrl,
        editingExercise.videoUrl,
        setEditStatusText,
        'video'
      );
      setEditStatusText('Guardando cambios...');
      const res = await apiFetch(`/api/exercises/${editingExercise.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          nombre: editNombre,
          musculo: editMusculo,
          descripcion: editDescripcion,
          imagenUrl,
          videoUrl: videoUrlFinal,
        }),
      });
      if (!res.ok) throw new Error('Error al actualizar el ejercicio');
      toast.success(`Ejercicio "${editNombre}" actualizado`);
      closeEditModal();
      fetchExercises();
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsEditing(false);
      setEditStatusText('');
    }
  };

  // ── ELIMINAR ──
  const handleDelete = async (ex) => {
    const ok = await confirm({
      title: '¿Eliminar ejercicio?',
      message: `Se eliminará "${ex.nombre}" del catálogo y de las rutinas donde esté asignado.`,
      confirmText: 'Sí, eliminar',
      cancelText: 'Cancelar',
      danger: true,
    });
    if (!ok) return;

    try {
      const res = await apiFetch(`/api/exercises/${ex.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar');
      toast.success(`Ejercicio "${ex.nombre}" eliminado`);
      fetchExercises();
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    }
  };

  return (
    <div className="exercise-manager">
      <div className="section-header">
        <div>
          <h2>
            <Dumbbell size={26} style={{ color: 'var(--accent-color)' }} />
            Catálogo de Ejercicios
            {exercises.length > 0 && <span className="count-pill">{exercises.length}</span>}
          </h2>
          <p className="section-subtitle">Administra tu biblioteca de ejercicios con fotos y videos demostrativos.</p>
        </div>
        <button className="btn-primary" onClick={openCreateModal}>
          <Plus size={18} />
          Nuevo Ejercicio
        </button>
      </div>

      {/* Barra de Búsqueda + Chips de Grupos Musculares */}
      <div className="filter-toolbar">
        <div className="search-input-wrap">
          <Search size={18} className="search-input-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Buscar ejercicio por nombre, descripción o músculo..."
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

        <div className="muscle-chips">
          {['Todos', ...muscleGroups].map((group) => (
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
      </div>

      {error && !showCreateModal && !editingExercise && (
        <div className="error-alert">{error}</div>
      )}

      {loading ? (
        <div className="skeleton-grid">
          <div className="skeleton-card" />
          <div className="skeleton-card" />
          <div className="skeleton-card" />
        </div>
      ) : exercises.length === 0 ? (
        <div className="empty-state">
          <Dumbbell size={38} style={{ color: 'var(--accent-color)', opacity: 0.8 }} />
          <p>No hay ejercicios en el catálogo. ¡Crea el primero!</p>
        </div>
      ) : filteredExercises.length === 0 ? (
        <div className="empty-state">
          <Search size={34} style={{ color: 'var(--text-muted)' }} />
          <p>No se encontraron ejercicios con los filtros actuales.</p>
        </div>
      ) : (
        <div className="exercise-list">
          {filteredExercises.map((ex) => (
            <div key={ex.id} className="exercise-item">
              <div className="ex-details">
                {ex.imagenUrl && (
                  <img
                    src={ex.imagenUrl}
                    alt={ex.nombre}
                    className="ex-thumb"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                )}
                <div className="ex-header-top">
                  <h4>{ex.nombre}</h4>
                  <span className="badge">
                    <Target size={12} />
                    {ex.musculo}
                  </span>
                </div>
                {ex.descripcion && <p>{ex.descripcion}</p>}
              </div>

              <div className="ex-card-footer">
                <div>
                  {ex.videoUrl ? (
                    <a
                      href={ex.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="video-link"
                    >
                      <PlayCircle size={15} /> Video
                    </a>
                  ) : (
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Sin video</span>
                  )}
                </div>
                <div className="ex-actions">
                  <button className="btn-edit" onClick={() => openEditModal(ex)}>
                    <Pencil size={14} /> Editar
                  </button>
                  <button className="btn-danger" onClick={() => handleDelete(ex)}>
                    <Trash2 size={14} /> Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── MODAL CREAR ── */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={closeCreateModal}>
          <div className="modal-content" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <Plus size={22} style={{ color: 'var(--accent-color)' }} />
                Nuevo Ejercicio
              </h2>
              <button className="btn-close" onClick={closeCreateModal}>
                <X size={18} />
              </button>
            </div>
            <div style={{ padding: '1.5rem' }}>
              {error && <div className="error-alert">{error}</div>}
              <ExerciseForm
                onSubmit={handleSubmit}
                isProcessing={isSubmitting}
                processingText={statusText}
                onCancel={closeCreateModal}
                submitLabel="Crear Ejercicio"
                nameVal={nombre}
                onNameChange={setNombre}
                muscleVal={musculo}
                onMuscleChange={setMusculo}
                descVal={descripcion}
                onDescChange={setDescripcion}
                onImgFile={setImageFile}
                imgUrl={imageUrl}
                onImgUrl={setImageUrl}
                imgMode={imageMode}
                onImgMode={setImageMode}
                onVidFile={setVideoFile}
                vidUrl={videoUrl}
                onVidUrl={setVideoUrl}
                vidMode={videoMode}
                onVidMode={setVideoMode}
                imgRef={imageInputRef}
                vidRef={videoInputRef}
                currentImagenUrl={null}
                currentVideoUrl={null}
                isEdit={false}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL EDITAR ── */}
      {editingExercise && (
        <div className="modal-overlay" onClick={closeEditModal}>
          <div className="modal-content" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <Pencil size={20} style={{ color: 'var(--accent-color)' }} />
                Editar Ejercicio
              </h2>
              <button className="btn-close" onClick={closeEditModal}>
                <X size={18} />
              </button>
            </div>
            <div style={{ padding: '1.5rem' }}>
              {error && <div className="error-alert">{error}</div>}
              <ExerciseForm
                onSubmit={handleEditSubmit}
                isProcessing={isEditing}
                processingText={editStatusText}
                onCancel={closeEditModal}
                submitLabel="Guardar Cambios"
                nameVal={editNombre}
                onNameChange={setEditNombre}
                muscleVal={editMusculo}
                onMuscleChange={setEditMusculo}
                descVal={editDescripcion}
                onDescChange={setEditDescripcion}
                onImgFile={setEditImageFile}
                imgUrl={editImageUrl}
                onImgUrl={setEditImageUrl}
                imgMode={editImageMode}
                onImgMode={setEditImageMode}
                onVidFile={setEditVideoFile}
                vidUrl={editVideoUrl}
                onVidUrl={setEditVideoUrl}
                vidMode={editVideoMode}
                onVidMode={setEditVideoMode}
                imgRef={editImageInputRef}
                vidRef={editVideoInputRef}
                currentImagenUrl={editingExercise.imagenUrl}
                currentVideoUrl={editingExercise.videoUrl}
                isEdit={true}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExerciseManager;
