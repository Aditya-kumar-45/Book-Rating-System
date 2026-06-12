import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

const ToastContext = createContext(null);

let toastIdCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef({});

  const removeToast = useCallback((id) => {
    // Mark as removing for exit animation
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, removing: true } : t))
    );
    // Remove from DOM after animation
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 300);
    if (timersRef.current[id]) {
      clearTimeout(timersRef.current[id]);
      delete timersRef.current[id];
    }
  }, []);

  const addToast = useCallback(
    (message, type = 'success') => {
      const id = ++toastIdCounter;
      setToasts((prev) => [...prev, { id, message, type, removing: false }]);
      timersRef.current[id] = setTimeout(() => {
        removeToast(id);
      }, 4000);
      return id;
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, onClose }) {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-container" role="alert" aria-live="polite">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={onClose} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onClose }) {
  const iconMap = {
    success: '✓',
    error: '✕',
    warning: '!',
  };

  return (
    <div
      className={`toast toast-${toast.type} ${toast.removing ? 'removing' : ''}`}
      role="status"
    >
      <span className="toast-icon">{iconMap[toast.type]}</span>
      <span className="toast-message">{toast.message}</span>
      <button
        className="toast-close"
        onClick={() => onClose(toast.id)}
        aria-label="Close notification"
      >
        ✕
      </button>
    </div>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export default ToastContext;
