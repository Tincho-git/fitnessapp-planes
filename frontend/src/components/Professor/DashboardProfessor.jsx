import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../utils/api';
import ExerciseManager from '../Admin/ExerciseManager';
import AssignPlanForm from '../Admin/AssignPlanForm';
import '../Admin/Admin.css';

const DashboardProfessor = () => {
  const [activeTab, setActiveTab] = useState('clients');
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchClients = async () => {
    setLoading(true); setError('');
    try {
      const response = await apiFetch('/api/users/clients');
      if (!response.ok) throw new Error('No se pudo cargar la lista de clientes');
      setClients(await response.json());
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  useEffect(() => { if (activeTab === 'clients') fetchClients(); }, [activeTab]);

  return (
    <div className="admin-dashboard">
      <aside className="admin-sidebar"><h2 className="sidebar-title">Panel Profesor</h2><nav className="sidebar-nav">
        <button className={`nav-btn ${activeTab === 'clients' ? 'active' : ''}`} onClick={() => setActiveTab('clients')}>Mis clientes</button>
        <button className={`nav-btn ${activeTab === 'exercises' ? 'active' : ''}`} onClick={() => setActiveTab('exercises')}>Ejercicios</button>
      </nav></aside>
      <main className="admin-content">
        {error && <div className="error-alert">{error}</div>}
        {activeTab === 'clients' && <div className="clients-section">
          <div className="section-header"><h2>Mis clientes</h2><button className="btn-refresh" onClick={fetchClients} disabled={loading}>{loading ? 'Cargando...' : 'Actualizar'}</button></div>
          {!loading && clients.length === 0 && <div className="empty-state">Aún no tienes clientes registrados.</div>}
          <div className="clients-grid">{clients.map((client) => <div key={client.id} className="client-card"><div className="client-info"><h3>{client.nombre}</h3><p>{client.email}</p></div><button className="btn-primary" onClick={() => setSelectedClient(client)}>Ver / asignar plan</button></div>)}</div>
        </div>}
        {activeTab === 'exercises' && <ExerciseManager />}
      </main>
      {selectedClient && <AssignPlanForm client={selectedClient} onClose={() => setSelectedClient(null)} />}
    </div>
  );
};

export default DashboardProfessor;
