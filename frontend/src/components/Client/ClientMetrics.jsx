import React, { useState, useEffect, useRef } from 'react';
import { apiFetch } from '../../utils/api';
import './ClientMetrics.css';

const ClientMetrics = ({ plans }) => {
  const [selectedExerciseId, setSelectedExerciseId] = useState('');
  const [exerciseProgress, setExerciseProgress] = useState([]);
  const [availableExercises, setAvailableExercises] = useState([]);
  const [loading, setLoading] = useState(false);

  const weightChartRef = useRef(null);
  const repsChartRef = useRef(null);
  const weightCanvasRef = useRef(null);
  const repsCanvasRef = useRef(null);

  useEffect(() => {
    // Extract unique exercises from plans or progress history
    fetchInitialExercises();
  }, [plans]);

  const fetchInitialExercises = async () => {
    try {
      const res = await apiFetch('/api/progress/mine');
      let progressData = [];
      if (res.ok) {
        progressData = await res.json();
      }

      // Build unique list of exercises from plans & progress
      const map = new Map();
      if (plans && Array.isArray(plans)) {
        plans.forEach(p => {
          if (p.exercise) map.set(p.exercise.id, p.exercise);
        });
      }
      progressData.forEach(p => {
        if (p.exercise) map.set(p.exercise.id, p.exercise);
      });

      const exList = Array.from(map.values());
      setAvailableExercises(exList);

      if (exList.length > 0) {
        setSelectedExerciseId(exList[0].id.toString());
      }
    } catch (err) {
      console.error("Error al cargar lista de ejercicios para métricas", err);
    }
  };

  useEffect(() => {
    if (selectedExerciseId) {
      fetchProgressForExercise(selectedExerciseId);
    }
  }, [selectedExerciseId]);

  const fetchProgressForExercise = async (exerciseId) => {
    setLoading(true);
    try {
      const res = await apiFetch(`/api/progress/mine/${exerciseId}`);
      if (res.ok) {
        const data = await res.json();
        setExerciseProgress(data);
      }
    } catch (err) {
      console.error("Error al obtener progreso de ejercicio", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!window.Chart || exerciseProgress.length === 0) {
      if (weightChartRef.current) {
        weightChartRef.current.destroy();
        weightChartRef.current = null;
      }
      if (repsChartRef.current) {
        repsChartRef.current.destroy();
        repsChartRef.current = null;
      }
      return;
    }

    const labels = exerciseProgress.map(p => {
      const date = new Date(p.fecha);
      return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
    });
    const weights = exerciseProgress.map(p => p.pesoUsado);
    const reps = exerciseProgress.map(p => p.repsRealizadas);

    // Destroy existing charts
    if (weightChartRef.current) weightChartRef.current.destroy();
    if (repsChartRef.current) repsChartRef.current.destroy();

    // Chart Options
    const commonOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#1e293b',
          titleColor: '#818cf8',
          bodyColor: '#f8fafc',
          borderColor: 'rgba(255,255,255,0.1)',
          borderWidth: 1
        }
      },
      scales: {
        x: {
          ticks: { color: '#94a3b8' },
          grid: { color: 'rgba(255,255,255,0.05)' }
        },
        y: {
          ticks: { color: '#94a3b8' },
          grid: { color: 'rgba(255,255,255,0.05)' }
        }
      }
    };

    // Render Weight Chart
    if (weightCanvasRef.current) {
      weightChartRef.current = new window.Chart(weightCanvasRef.current, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: 'Peso (kg)',
            data: weights,
            borderColor: '#818cf8',
            backgroundColor: 'rgba(129, 140, 248, 0.15)',
            fill: true,
            tension: 0.35,
            pointBackgroundColor: '#818cf8',
            pointRadius: 5
          }]
        },
        options: commonOptions
      });
    }

    // Render Reps Chart
    if (repsCanvasRef.current) {
      repsChartRef.current = new window.Chart(repsCanvasRef.current, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: 'Repeticiones',
            data: reps,
            borderColor: '#34d399',
            backgroundColor: 'rgba(52, 211, 153, 0.15)',
            fill: true,
            tension: 0.35,
            pointBackgroundColor: '#34d399',
            pointRadius: 5
          }]
        },
        options: commonOptions
      });
    }

    return () => {
      if (weightChartRef.current) weightChartRef.current.destroy();
      if (repsChartRef.current) repsChartRef.current.destroy();
    };
  }, [exerciseProgress]);

  const selectedExercise = availableExercises.find(e => e.id.toString() === selectedExerciseId);

  return (
    <div className="metrics-container">
      <div className="metrics-selector">
        <label htmlFor="exercise-select">Seleccionar Ejercicio:</label>
        <select
          id="exercise-select"
          className="metrics-select"
          value={selectedExerciseId}
          onChange={(e) => setSelectedExerciseId(e.target.value)}
        >
          {availableExercises.length === 0 && <option value="">No hay ejercicios disponibles</option>}
          {availableExercises.map(ex => (
            <option key={ex.id} value={ex.id}>
              {ex.nombre} ({ex.musculo})
            </option>
          ))}
        </select>
      </div>

      {loading && <p className="no-data-text">Cargando métricas...</p>}

      {!loading && exerciseProgress.length === 0 && (
        <div className="history-card">
          <p className="no-data-text">
            {selectedExercise ? `No hay registros de progreso para ${selectedExercise.nombre}.` : 'Selecciona un ejercicio.'}
          </p>
        </div>
      )}

      {!loading && exerciseProgress.length > 0 && (
        <>
          <div className="charts-grid">
            <div className="chart-card">
              <h4>🏋️ Progreso de Carga (kg)</h4>
              <div className="chart-wrapper">
                <canvas ref={weightCanvasRef}></canvas>
              </div>
            </div>

            <div className="chart-card">
              <h4>🔄 Progreso de Repeticiones</h4>
              <div className="chart-wrapper">
                <canvas ref={repsCanvasRef}></canvas>
              </div>
            </div>
          </div>

          <div className="history-card">
            <h4>📋 Historial de Registros</h4>
            <div className="history-table-wrapper">
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Peso (kg)</th>
                    <th>Series</th>
                    <th>Repeticiones</th>
                    <th>Notas</th>
                  </tr>
                </thead>
                <tbody>
                  {exerciseProgress.slice().reverse().map((item) => (
                    <tr key={item.id}>
                      <td>{new Date(item.fecha).toLocaleString('es-ES')}</td>
                      <td><strong>{item.pesoUsado} kg</strong></td>
                      <td>{item.setsRealizados}</td>
                      <td>{item.repsRealizadas}</td>
                      <td>{item.notas || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ClientMetrics;
