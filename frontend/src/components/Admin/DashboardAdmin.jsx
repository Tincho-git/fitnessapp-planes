import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../utils/api';
import ExerciseManager from './ExerciseManager';
import AssignPlanForm from './AssignPlanForm';
import './Admin.css';

const DashboardAdmin = () => {
  const [activeTab, setActiveTab] = useState('clients');
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [selectedClient, setSelectedClient] = useState(null);

  useEffect(() => {
    if (activeTab === 'clients') {
      fetchClients();
    }
  }, [activeTab]);

  const fetchClients = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiFetch('/api/users/clients');
      if (!response.ok) throw new Error('Error al cargar la lista de clientes');
      const data = await response.json();
      setClients(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-dashboard">
      <aside className="admin-sidebar">
        <h2 className="sidebar-title">Panel de Control</h2>
        <nav className="sidebar-nav">
          <button 
            className={`nav-btn ${activeTab === 'clients' ? 'active' : ''}`}
            onClick={() => setActiveTab('clients')}
          >
            👥 Mis Clientes
          </button>
          <button 
            className={`nav-btn ${activeTab === 'exercises' ? 'active' : ''}`}
            onClick={() => setActiveTab('exercises')}
          >
            🏋️ Catálogo de Ejercicios
          </button>
        </nav>
      </aside>

      <main className="admin-content">
        {error && <div className="error-alert">{error}</div>}
        
        {activeTab === 'clients' && (
          <div className="clients-section">
            <div className="section-header">
              <h2>Lista de Clientes</h2>
              <button className="btn-refresh" onClick={fetchClients} disabled={loading}>
                {loading ? 'Cargando...' : '🔄 Actualizar'}
              </button>
            </div>

            {loading && <p>Cargando datos de clientes...</p>}

            {!loading && clients.length === 0 && (
              <div className="empty-state">No hay clientes registrados aún.</div>
            )}

            {!loading && clients.length > 0 && (
              <div className="clients-grid">
                {clients.map(client => (
                  <div key={client.id} className="client-card">
                    <div className="client-info">
                      <h3>{client.nombre}</h3>
                      <p>{client.email}</p>
                    </div>
                    <button 
                      className="btn-primary"
                      onClick={() => setSelectedClient(client)}
                    >
                      Ver / Asignar Plan
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'exercises' && <ExerciseManager />}
      </main>

      {/* Modal para Asignar Plan */}
      {selectedClient && (
        <AssignPlanForm 
          client={selectedClient} 
          onClose={() => setSelectedClient(null)} 
        />
      )}
    </div>
  );
};

export default DashboardAdmin;
