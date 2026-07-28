import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../utils/api';
import './Admin.css';

const DashboardAdmin = () => {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadPending = async () => {
    setLoading(true); setError('');
    try {
      const res = await apiFetch('/api/users/admin/professors/pending');
      if (!res.ok) throw new Error('No se pudieron cargar las solicitudes');
      setPending(await res.json());
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  const decide = async (id, action) => {
    setMessage(''); setError('');
    try {
      const res = await apiFetch(`/api/users/admin/professors/${id}/${action}`, { method: 'POST' });
      if (!res.ok) throw new Error('No se pudo actualizar la solicitud');
      setMessage(action === 'approve' ? 'Profesor aprobado.' : 'Solicitud rechazada.');
      loadPending();
    } catch (err) { setError(err.message); }
  };

  useEffect(() => { loadPending(); }, []);
  return (
    <div className="admin-dashboard"><aside className="admin-sidebar"><h2 className="sidebar-title">Administración</h2></aside>
      <main className="admin-content"><div className="section-header"><div><h2>Solicitudes de profesores</h2><p>Aprueba solo profesionales que quieras habilitar.</p></div><button className="btn-refresh" onClick={loadPending} disabled={loading}>{loading ? 'Cargando...' : 'Actualizar'}</button></div>
        {error && <div className="error-alert">{error}</div>}{message && <div style={{ color: '#34d399', marginBottom: '1rem' }}>{message}</div>}
        {!loading && pending.length === 0 && <div className="empty-state">No hay solicitudes pendientes.</div>}
        <div className="clients-grid">{pending.map((professor) => <div className="client-card" key={professor.id}><div className="client-info"><h3>{professor.nombre}</h3><p>{professor.email}</p></div><div style={{ display: 'flex', gap: '0.75rem' }}><button className="btn-primary" onClick={() => decide(professor.id, 'approve')}>Aprobar</button><button className="btn-danger" onClick={() => decide(professor.id, 'reject')}>Rechazar</button></div></div>)}</div>
      </main>
    </div>
  );
};

export default DashboardAdmin;
