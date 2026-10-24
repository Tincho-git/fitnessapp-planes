import React, { useEffect, useState, useMemo } from 'react';
import { Users, Dumbbell, RefreshCw, Search, X, Mail, ClipboardList } from 'lucide-react';
import { apiFetch } from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import ExerciseManager from '../Admin/ExerciseManager';
import AssignPlanForm from '../Admin/AssignPlanForm';
import '../Admin/Admin.css';

const DashboardProfessor = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('clients');
  const [clients, setClients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchClients = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiFetch('/api/users/clients');
      if (!response.ok) throw new Error('No se pudo cargar la lista de clientes');
      setClients(await response.json());
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'clients') fetchClients();
  }, [activeTab]);

  const filteredClients = useMemo(() => {
    if (!searchQuery.trim()) return clients;
    const q = searchQuery.toLowerCase();
    return clients.filter(
      (c) =>
        (c.nombre && c.nombre.toLowerCase().includes(q)) ||
        (c.email && c.email.toLowerCase().includes(q))
    );
  }, [clients, searchQuery]);

  return (
    <div className="admin-dashboard">
      <aside className="admin-sidebar">
        <h2 className="sidebar-title">Panel Profesor</h2>
        <nav className="sidebar-nav">
          <button
            className={`nav-btn ${activeTab === 'clients' ? 'active' : ''}`}
            onClick={() => setActiveTab('clients')}
          >
            <Users size={19} />
            <span>Mis Clientes</span>
          </button>
          <button
            className={`nav-btn ${activeTab === 'exercises' ? 'active' : ''}`}
            onClick={() => setActiveTab('exercises')}
          >
            <Dumbbell size={19} />
            <span>Ejercicios</span>
          </button>
        </nav>
      </aside>

      <main className="admin-content">
        {error && <div className="error-alert">{error}</div>}

        {activeTab === 'clients' && (
          <div className="clients-section">
            <div className="section-header">
              <div>
                <h2>
                  <Users size={26} style={{ color: 'var(--accent-color)' }} />
                  Mis Clientes
                  {clients.length > 0 && <span className="count-pill">{clients.length}</span>}
                </h2>
                <p className="section-subtitle">Gestiona las rutinas y supervisa el progreso de tus atletas.</p>
              </div>
              <button className="btn-refresh" onClick={fetchClients} disabled={loading}>
                <RefreshCw size={16} className={loading ? 'spin-icon' : ''} />
                {loading ? 'Cargando...' : 'Actualizar'}
              </button>
            </div>

            {clients.length > 0 && (
              <div className="filter-toolbar">
                <div className="search-input-wrap">
                  <Search size={18} className="search-input-icon" />
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Buscar cliente por nombre o correo..."
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
              </div>
            )}

            {loading ? (
              <div className="skeleton-grid">
                <div className="skeleton-card" style={{ height: '165px' }} />
                <div className="skeleton-card" style={{ height: '165px' }} />
                <div className="skeleton-card" style={{ height: '165px' }} />
              </div>
            ) : clients.length === 0 ? (
              <div className="empty-state">
                <Users size={38} style={{ color: 'var(--accent-color)', opacity: 0.8 }} />
                <p>Aún no tienes clientes vinculados a tu cuenta.</p>
              </div>
            ) : filteredClients.length === 0 ? (
              <div className="empty-state">
                <Search size={34} style={{ color: 'var(--text-muted)' }} />
                <p>No se encontraron clientes que coincidan con "{searchQuery}".</p>
              </div>
            ) : (
              <div className="clients-grid">
                {filteredClients.map((client) => (
                  <div key={client.id} className="client-card">
                    <div className="client-card-header">
                      <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(client.nombre)}&background=FACC15&color=0a0a0a&size=128&bold=true`}
                        alt={client.nombre}
                        className="client-avatar"
                      />
                      <div className="client-info">
                        <h3>{client.nombre}</h3>
                        <p>
                          <Mail size={14} />
                          {client.email}
                        </p>
                      </div>
                    </div>
                    <button className="btn-primary" onClick={() => setSelectedClient(client)}>
                      <ClipboardList size={17} />
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

      {selectedClient && (
        <AssignPlanForm client={selectedClient} onClose={() => setSelectedClient(null)} />
      )}
    </div>
  );
};

export default DashboardProfessor;
