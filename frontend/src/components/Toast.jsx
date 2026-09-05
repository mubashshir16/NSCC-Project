import React from 'react';

export default function Toast({ toast, onClose }) {
  if (!toast) return null;

  const isError = toast.type === 'error';

  return (
    <div className={`toast-notification ${isError ? 'toast-error' : 'toast-success'}`}>
      <div className="toast-icon">
        {isError ? '⚠️' : '✅'}
      </div>
      <div className="toast-content">
        <div className="toast-message">{toast.message}</div>
      </div>
      <button className="toast-close-btn" onClick={onClose} aria-label="Close notification">
        &times;
      </button>
    </div>
  );
}
