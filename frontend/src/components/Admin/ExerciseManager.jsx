import React, { useState, useEffect, useRef } from 'react';
import { apiFetch } from '../../utils/api';

const ExerciseManager = () => {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form State
  const [nombre, setNombre] = useState('');
  const [musculo, setMusculo] = useState('Pecho');
  const [descripcion, setDescripcion] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusText, setStatusText] = useState('');

  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);

  const muscleGroups = ['Pecho', 'Espalda', 'Bíceps', 'Tríceps', 'Hombros', 'Abdomen', 'Piernas'];

  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    setLoading(true);
    try {
      const response = await apiFetch('/api/exercises');
      if (!response.ok) throw new Error('Error al cargar catálogo de ejercicios');
      const data = await response.json();
      setExercises(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const uploadMedia = async (file) => {
    if (!file) return '';
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiFetch('/api/exercises/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Error al subir el archivo ${file.name}`);
    }

    const data = await response.json();
    return data.url || '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      let imagenUrl = '';
      let videoUrl = '';

      if (imageFile) {
        setStatusText('Subiendo imagen a Cloudinary...');
        imagenUrl = await uploadMedia(imageFile);
      }

      if (videoFile) {
        setStatusText('Subiendo video a Cloudinary...');
        videoUrl = await uploadMedia(videoFile);
      }

      setStatusText('Guardando ejercicio...');
      const response = await apiFetch('/api/exercises', {
        method: 'POST',
        body: JSON.stringify({ nombre, musculo, descripcion, imagenUrl, videoUrl })
      });

      if (!response.ok) throw new Error('Error al crear el ejercicio');
      
      // Limpiar formulario y recargar
      setNombre('');
      setDescripcion('');
      setImageFile(null);
      setVideoFile(null);
      if (imageInputRef.current) imageInputRef.current.value = '';
      if (videoInputRef.current) videoInputRef.current.value = '';
      fetchExercises();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
      setStatusText('');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este ejercicio?')) return;
    
    try {
      const response = await apiFetch(`/api/exercises/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Error al eliminar');
      fetchExercises();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="exercise-manager">
      <h2>Catálogo de Ejercicios</h2>
      
      {error && <div className="error-alert">{error}</div>}

      <div className="manager-layout">
        <div className="form-section">
          <h3>Añadir Nuevo Ejercicio</h3>
          <form onSubmit={handleSubmit} className="custom-form">
            <div className="form-group">
              <label>Nombre del Ejercicio</label>
              <input 
                type="text" 
                value={nombre} 
                onChange={(e) => setNombre(e.target.value)} 
                required 
              />
            </div>
            <div className="form-group">
              <label>Grupo Muscular</label>
              <select value={musculo} onChange={(e) => setMusculo(e.target.value)}>
                {muscleGroups.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Descripción</label>
              <textarea 
                value={descripcion} 
                onChange={(e) => setDescripcion(e.target.value)}
                rows="3"
              ></textarea>
            </div>
            <div className="form-group">
              <label>Imagen del Ejercicio</label>
              <input 
                type="file" 
                accept="image/*"
                ref={imageInputRef}
                onChange={(e) => setImageFile(e.target.files[0] || null)}
              />
            </div>
            <div className="form-group">
              <label>Video Demostrativo</label>
              <input 
                type="file" 
                accept="video/*"
                ref={videoInputRef}
                onChange={(e) => setVideoFile(e.target.files[0] || null)}
              />
            </div>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? (statusText || 'Procesando...') : '➕ Añadir Ejercicio'}
            </button>
          </form>
        </div>

        <div className="list-section">
          <h3>Ejercicios Disponibles</h3>
          {loading ? <p>Cargando...</p> : (
            <div className="exercise-list">
              {exercises.length === 0 ? (
                <p className="empty-state">No hay ejercicios en el catálogo.</p>
              ) : (
                exercises.map(ex => (
                  <div key={ex.id} className="exercise-item">
                    <div className="ex-details">
                      <h4>{ex.nombre}</h4>
                      <span className="badge">{ex.musculo}</span>
                      {ex.descripcion && <p>{ex.descripcion}</p>}
                      {(ex.imagenUrl || ex.videoUrl) && (
                        <div className="ex-media">
                          {ex.imagenUrl && (
                            <img src={ex.imagenUrl} alt={ex.nombre} className="ex-thumb" />
                          )}
                          {ex.videoUrl && (
                            <a href={ex.videoUrl} target="_blank" rel="noopener noreferrer" className="video-link">
                              🎬 Ver Video
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                    <button className="btn-danger" onClick={() => handleDelete(ex.id)}>❌</button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExerciseManager;
