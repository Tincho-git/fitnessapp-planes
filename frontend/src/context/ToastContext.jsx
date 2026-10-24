import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [confirmDialog, setConfirmDialog] = useState(null);

  const addToast = useCallback((message, type = 'info', duration = 3800) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (msg) => addToast(msg, 'success'),
    error: (msg) => addToast(msg, 'error'),
    info: (msg) => addToast(msg, 'info'),
  };

  const confirm = useCallback(({ title = '¿Estás seguro?', message, confirmText = 'Confirmar', cancelText = 'Cancelar', danger = true }) => {
    return new Promise((resolve) => {
      setConfirmDialog({
        title,
        message,
        confirmText,
        cancelText,
        danger,
        onConfirm: () => {
          setConfirmDialog(null);
          resolve(true);
        },
        onCancel: () => {
          setConfirmDialog(null);
          resolve(false);
        },
      });
    });
  }, []);

  return (
    <ToastContext.Provider value={{ toast, confirm }}>
      {children}

      {/* Contenedor de Toasts */}
      <div className="toast-viewport" aria-live="polite">
        {toasts.map((item) => (
          <div key={item.id} className={`toast-item toast-${item.type}`}>
            <span className="toast-icon">
              {item.type === 'success' && <CheckCircle2 size={19} />}
              {item.type === 'error' && <AlertCircle size={19} />}
              {item.type === 'info' && <Info size={19} />}
            </span>
            <span className="toast-message">{item.message}</span>
            <button
              type="button"
              className="toast-close"
              onClick={() => removeToast(item.id)}
              aria-label="Cerrar notificación"
            >
              <X size={15} />
            </button>
          </div>
        ))}
      </div>

      {/* Modal de Confirmación moderno */}
      {confirmDialog && (
        <div className="modal-overlay confirm-overlay" onClick={confirmDialog.onCancel}>
          <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-icon-wrap">
              <AlertTriangle size={26} />
            </div>
            <h3 className="confirm-title">{confirmDialog.title}</h3>
            {confirmDialog.message && <p className="confirm-message">{confirmDialog.message}</p>}
            <div className="confirm-actions">
              <button
                type="button"
                className="btn-secondary-ghost"
                onClick={confirmDialog.onCancel}
              >
                {confirmDialog.cancelText}
              </button>
              <button
                type="button"
                className={confirmDialog.danger ? 'btn-danger-solid' : 'btn-primary'}
                onClick={confirmDialog.onConfirm}
              >
                {confirmDialog.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast debe usarse dentro de un ToastProvider');
  }
  return ctx;
};
