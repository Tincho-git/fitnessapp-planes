import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../utils/api';

const ExerciseManager = () => {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form State
  const [nombre, setNombre] = useState('');
  const [musculo, setMusculo] = useState('Pecho');
  const [descripcion, setDescripcion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await apiFetch('/api/exercises', {
        method: 'POST',
        body: JSON.stringify({ nombre, musculo, descripcion })
      });

      if (!response.ok) throw new Error('Error al crear el ejercicio');
      
      // Limpiar formulario y recargar
      setNombre('');
      setDescripcion('');
      fetchExercises();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
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
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : '➕ Añadir Ejercicio'}
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
                      <p>{ex.descripcion}</p>
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
