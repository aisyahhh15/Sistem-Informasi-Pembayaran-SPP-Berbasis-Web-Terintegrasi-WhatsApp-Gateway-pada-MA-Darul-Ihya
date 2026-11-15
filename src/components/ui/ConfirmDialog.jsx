import React, { useEffect, useId, useRef } from 'react';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({ title, message, confirmText = 'Ya, lanjutkan', cancelText = 'Batal', onConfirm, onCancel, variant = 'danger' }) {
  const titleId = useId();
  const messageId = useId();
  const cancelRef = useRef(null);

  useEffect(() => {
    cancelRef.current?.focus();
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [onCancel]);

  return <div className="dialog-backdrop confirm-backdrop">
    <section className="confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={messageId}>
      <div className={`confirm-dialog-icon ${variant}`} aria-hidden="true"><AlertTriangle size={22} /></div>
      <div className="confirm-dialog-copy">
        <h2 id={titleId}>{title}</h2>
        <p id={messageId}>{message}</p>
      </div>
      <div className="confirm-dialog-actions">
        <button ref={cancelRef} className="button button-secondary" type="button" onClick={onCancel}>{cancelText}</button>
        <button className={`button ${variant === 'danger' ? 'button-danger' : 'button-primary'}`} type="button" onClick={onConfirm}>{confirmText}</button>
      </div>
    </section>
  </div>;
}
