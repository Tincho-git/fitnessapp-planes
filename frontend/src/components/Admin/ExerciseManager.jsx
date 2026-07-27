import React, { useState, useEffect, useRef } from 'react';
import { apiFetch } from '../../utils/api';

// Componente de campo de media con pestañas "Subir archivo / URL"
const MediaInput = ({ label, currentUrl, accept, inputRef, onFileChange, onUrlChange, urlValue, mode, onModeChange, isEdit }) => (
  <div className="form-group">
    <label>{label}</label>

    {/* Pestaña selector */}
    <div className="media-tabs">
      <button type="button" className={`media-tab ${mode === 'file' ? 'active' : ''}`} onClick={() => onModeChange('file')}>
        📁 Subir archivo
      </button>
      <button type="button" className={`media-tab ${mode === 'url' ? 'active' : ''}`} onClick={() => onModeChange('url')}>
        🔗 Ingresar URL
      </button>
    </div>

    {mode === 'file' ? (
      <div className="media-input-area">
        {isEdit && currentUrl && (
          accept === 'video/*'
            ? <a href={currentUrl} target="_blank" rel="noopener noreferrer" className="video-link" style={{ display: 'inline-flex', marginBottom: '0.5rem' }}>🎬 Ver actual</a>
            : <img src={currentUrl} alt="actual" className="ex-thumb" style={{ display: 'block', marginBottom: '0.5rem' }} />
        )}
        {isEdit && !currentUrl && (
          <p style={{ color: '#64748b', fontSize: '0.82rem', margin: '0 0 0.5rem 0' }}>Sin {accept === 'video/*' ? 'video' : 'imagen'} actual</p>
        )}
        <input type="file" accept={accept} ref={inputRef} onChange={(e) => onFileChange(e.target.files[0] || null)} />
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
        {/* Preview inline si es URL */}
        {urlValue && accept !== 'video/*' && (
          <img src={urlValue} alt="preview" className="ex-thumb" style={{ display: 'block', marginTop: '0.5rem' }} onError={(e) => { e.target.style.display = 'none'; }} />
        )}
        {urlValue && accept === 'video/*' && (
          <a href={urlValue} target="_blank" rel="noopener noreferrer" className="video-link" style={{ display: 'inline-flex', marginTop: '0.5rem' }}>
            🎬 Ver enlace
          </a>
        )}
      </div>
    )}
  </div>
);

const ExerciseManager = () => {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const muscleGroups = ['Pecho', 'Espalda', 'Bíceps', 'Tríceps', 'Hombros', 'Abdomen', 'Piernas'];

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

  useEffect(() => { fetchExercises(); }, []);

  const fetchExercises = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/exercises');
      if (!res.ok) throw new Error('Error al cargar ejercicios');
      setExercises(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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

  // Resuelve la URL final para imagen o video según mode
  const resolveMedia = async (mode, file, urlValue, existingUrl, setStatus, label) => {
    if (mode === 'file' && file) return await uploadMedia(file, setStatus, label);
    if (mode === 'url' && urlValue.trim()) return urlValue.trim();
    return existingUrl || '';
  };

  // ── CREAR ──
  const openCreateModal = () => {
    setNombre(''); setMusculo('Pecho'); setDescripcion('');
    setImageFile(null); setImageUrl(''); setImageMode('file');
    setVideoFile(null); setVideoUrl(''); setVideoMode('file');
    setError('');
    setShowCreateModal(true);
  };

  const closeCreateModal = () => { setShowCreateModal(false); setError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true); setError('');
    try {
      const imagenUrl = await resolveMedia(imageMode, imageFile, imageUrl, '', setStatusText, 'imagen');
      const videoUrlFinal = await resolveMedia(videoMode, videoFile, videoUrl, '', setStatusText, 'video');
      setStatusText('Guardando ejercicio...');
      const res = await apiFetch('/api/exercises', {
        method: 'POST',
        body: JSON.stringify({ nombre, musculo, descripcion, imagenUrl, videoUrl: videoUrlFinal })
      });
      if (!res.ok) throw new Error('Error al crear el ejercicio');
      closeCreateModal();
      fetchExercises();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false); setStatusText('');
    }
  };

  // ── EDITAR ──
  const openEditModal = (ex) => {
    setEditingExercise(ex);
    setEditNombre(ex.nombre);
    setEditMusculo(ex.musculo);
    setEditDescripcion(ex.descripcion || '');
    setEditImageFile(null); setEditImageUrl(''); setEditImageMode('file');
    setEditVideoFile(null); setEditVideoUrl(''); setEditVideoMode('file');
    setError('');
  };

  const closeEditModal = () => { setEditingExercise(null); setError(''); };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsEditing(true); setError('');
    try {
      const imagenUrl = await resolveMedia(editImageMode, editImageFile, editImageUrl, editingExercise.imagenUrl, setEditStatusText, 'imagen');
      const videoUrlFinal = await resolveMedia(editVideoMode, editVideoFile, editVideoUrl, editingExercise.videoUrl, setEditStatusText, 'video');
      setEditStatusText('Guardando cambios...');
      const res = await apiFetch(`/api/exercises/${editingExercise.id}`, {
        method: 'PUT',
        body: JSON.stringify({ nombre: editNombre, musculo: editMusculo, descripcion: editDescripcion, imagenUrl, videoUrl: videoUrlFinal })
      });
      if (!res.ok) throw new Error('Error al actualizar el ejercicio');
      closeEditModal();
      fetchExercises();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsEditing(false); setEditStatusText('');
    }
  };

  // ── ELIMINAR ──
  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este ejercicio?')) return;
    try {
      const res = await apiFetch(`/api/exercises/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar');
      fetchExercises();
    } catch (err) {
      setError(err.message);
    }
  };

  // ── FORMULARIO COMPARTIDO (campos básicos + media) ──
  const ExerciseForm = ({
    onSubmit, isProcessing, processingText, onCancel, submitLabel,
    nameVal, onNameChange,
    muscleVal, onMuscleChange,
    descVal, onDescChange,
    imgFile, onImgFile, imgUrl, onImgUrl, imgMode, onImgMode,
    vidFile, onVidFile, vidUrl, onVidUrl, vidMode, onVidMode,
    imgRef, vidRef,
    currentImagenUrl, currentVideoUrl, isEdit
  }) => (
    <form onSubmit={onSubmit} className="custom-form">
      <div className="form-row">
        <div className="form-group">
          <label>Nombre del Ejercicio</label>
          <input type="text" value={nameVal} onChange={(e) => onNameChange(e.target.value)} placeholder="Ej: Press de banca" required />
        </div>
        <div className="form-group">
          <label>Grupo Muscular</label>
          <select value={muscleVal} onChange={(e) => onMuscleChange(e.target.value)}>
            {muscleGroups.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      </div>
      <div className="form-group">
        <label>Descripción</label>
        <textarea value={descVal} onChange={(e) => onDescChange(e.target.value)} rows="3" placeholder="Describe cómo se realiza el ejercicio..." />
      </div>

      <MediaInput
        label="🖼️ Imagen del Ejercicio"
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
        label="🎬 Video Demostrativo"
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

      <div style={{ display: 'flex', gap: '1rem', marginTop: '1.2rem' }}>
        <button type="submit" className="btn-primary" disabled={isProcessing} style={{ flex: 1 }}>
          {isProcessing ? (processingText || 'Procesando...') : submitLabel}
        </button>
        <button type="button" className="btn-danger" onClick={onCancel} style={{ flex: 1 }}>
          Cancelar
        </button>
      </div>
    </form>
  );

  return (
    <div className="exercise-manager">
      <div className="section-header">
        <h2>Catálogo de Ejercicios</h2>
        <button className="btn-primary" onClick={openCreateModal} style={{ width: 'auto', padding: '0.6rem 1.4rem' }}>
          ➕ Nuevo Ejercicio
        </button>
      </div>

      {error && !showCreateModal && !editingExercise && <div className="error-alert">{error}</div>}

      {loading ? <p>Cargando...</p> : (
        <div className="exercise-list">
          {exercises.length === 0 ? (
            <p className="empty-state">No hay ejercicios en el catálogo. ¡Crea el primero!</p>
          ) : exercises.map(ex => (
            <div key={ex.id} className="exercise-item">
              <div className="ex-details">
                <h4>{ex.nombre}</h4>
                <span className="badge">{ex.musculo}</span>
                {ex.descripcion && <p>{ex.descripcion}</p>}
                {(ex.imagenUrl || ex.videoUrl) && (
                  <div className="ex-media">
                    {ex.imagenUrl && <img src={ex.imagenUrl} alt={ex.nombre} className="ex-thumb" />}
                    {ex.videoUrl && (
                      <a href={ex.videoUrl} target="_blank" rel="noopener noreferrer" className="video-link">
                        🎬 Ver Video
                      </a>
                    )}
                  </div>
                )}
              </div>
              <div className="ex-actions">
                <button className="btn-edit" onClick={() => openEditModal(ex)}>✏️ Editar</button>
                <button className="btn-danger" onClick={() => handleDelete(ex.id)}>❌ Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── MODAL CREAR ── */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={closeCreateModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>➕ Nuevo Ejercicio</h2>
              <button className="btn-close" onClick={closeCreateModal}>✕</button>
            </div>
            <div style={{ padding: '2rem' }}>
              {error && <div className="error-alert">{error}</div>}
              <ExerciseForm
                onSubmit={handleSubmit}
                isProcessing={isSubmitting}
                processingText={statusText}
                onCancel={closeCreateModal}
                submitLabel="💾 Crear Ejercicio"
                nameVal={nombre} onNameChange={setNombre}
                muscleVal={musculo} onMuscleChange={setMusculo}
                descVal={descripcion} onDescChange={setDescripcion}
                imgFile={imageFile} onImgFile={setImageFile}
                imgUrl={imageUrl} onImgUrl={setImageUrl}
                imgMode={imageMode} onImgMode={setImageMode}
                vidFile={videoFile} onVidFile={setVideoFile}
                vidUrl={videoUrl} onVidUrl={setVideoUrl}
                vidMode={videoMode} onVidMode={setVideoMode}
                imgRef={imageInputRef} vidRef={videoInputRef}
                currentImagenUrl={null} currentVideoUrl={null}
                isEdit={false}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL EDITAR ── */}
      {editingExercise && (
        <div className="modal-overlay" onClick={closeEditModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>✏️ Editar Ejercicio</h2>
              <button className="btn-close" onClick={closeEditModal}>✕</button>
            </div>
            <div style={{ padding: '2rem' }}>
              {error && <div className="error-alert">{error}</div>}
              <ExerciseForm
                onSubmit={handleEditSubmit}
                isProcessing={isEditing}
                processingText={editStatusText}
                onCancel={closeEditModal}
                submitLabel="💾 Guardar Cambios"
                nameVal={editNombre} onNameChange={setEditNombre}
                muscleVal={editMusculo} onMuscleChange={setEditMusculo}
                descVal={editDescripcion} onDescChange={setEditDescripcion}
                imgFile={editImageFile} onImgFile={setEditImageFile}
                imgUrl={editImageUrl} onImgUrl={setEditImageUrl}
                imgMode={editImageMode} onImgMode={setEditImageMode}
                vidFile={editVideoFile} onVidFile={setEditVideoFile}
                vidUrl={editVideoUrl} onVidUrl={setEditVideoUrl}
                vidMode={editVideoMode} onVidMode={setEditVideoMode}
                imgRef={editImageInputRef} vidRef={editVideoInputRef}
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
