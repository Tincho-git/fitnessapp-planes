import React, { useEffect, useState } from 'react';
import { ShieldCheck, RefreshCw, Check, X, Mail, Users } from 'lucide-react';
import { apiFetch } from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import './Admin.css';

const DashboardAdmin = () => {
  const { toast } = useToast();
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadPending = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiFetch('/api/users/admin/professors/pending');
      if (!res.ok) throw new Error('No se pudieron cargar las solicitudes');
      setPending(await res.json());
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const decide = async (id, action) => {
    setError('');
    try {
      const res = await apiFetch(`/api/users/admin/professors/${id}/${action}`, { method: 'POST' });
      if (!res.ok) throw new Error('No se pudo actualizar la solicitud');
      toast.success(action === 'approve' ? 'Profesor aprobado con éxito.' : 'Solicitud rechazada.');
      loadPending();
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    }
  };

  useEffect(() => {
    loadPending();
  }, []);

  return (
    <div className="admin-dashboard">
      <aside className="admin-sidebar">
        <h2 className="sidebar-title">Administración</h2>
        <nav className="sidebar-nav">
          <button className="nav-btn active">
            <ShieldCheck size={19} />
            <span>Solicitudes</span>
          </button>
        </nav>
      </aside>

      <main className="admin-content">
        <div className="section-header">
          <div>
            <h2>
              <ShieldCheck size={26} style={{ color: 'var(--accent-color)' }} />
              Solicitudes de Profesores
              {pending.length > 0 && <span className="count-pill">{pending.length}</span>}
            </h2>
            <p className="section-subtitle">Aprueba solo profesionales que quieras habilitar en la plataforma.</p>
          </div>
          <button className="btn-refresh" onClick={loadPending} disabled={loading}>
            <RefreshCw size={16} className={loading ? 'spin-icon' : ''} />
            {loading ? 'Cargando...' : 'Actualizar'}
          </button>
        </div>

        {error && <div className="error-alert">{error}</div>}

        {loading ? (
          <div className="skeleton-grid">
            <div className="skeleton-card" style={{ height: '140px' }} />
            <div className="skeleton-card" style={{ height: '140px' }} />
          </div>
        ) : pending.length === 0 ? (
          <div className="empty-state">
            <Users size={36} style={{ color: 'var(--accent-color)', opacity: 0.8 }} />
            <p>No hay solicitudes pendientes en este momento.</p>
          </div>
        ) : (
          <div className="clients-grid">
            {pending.map((professor) => (
              <div className="client-card" key={professor.id}>
                <div className="client-card-header">
                  <img
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(professor.nombre)}&background=FACC15&color=0a0a0a&size=128&bold=true`}
                    alt={professor.nombre}
                    className="client-avatar"
                  />
                  <div className="client-info">
                    <h3>{professor.nombre}</h3>
                    <p>
                      <Mail size={14} />
                      {professor.email}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    className="btn-primary"
                    style={{ flex: 1 }}
                    onClick={() => decide(professor.id, 'approve')}
                  >
                    <Check size={16} /> Aprobar
                  </button>
                  <button
                    className="btn-danger"
                    style={{ flex: 1 }}
                    onClick={() => decide(professor.id, 'reject')}
                  >
                    <X size={16} /> Rechazar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default DashboardAdmin;
