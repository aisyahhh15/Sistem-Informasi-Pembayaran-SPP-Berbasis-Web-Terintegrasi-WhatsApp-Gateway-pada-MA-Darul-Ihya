import React, { useEffect, useId, useState } from 'react';
import { X } from 'lucide-react';

export default function EntityDialog({ title, fields, initialValue = {}, onSave, onClose }) {
  const titleId = useId();
  const [values, setValues] = useState(() => Object.fromEntries(
    fields.map((field) => [field.name, initialValue[field.name] ?? field.defaultValue ?? '']),
  ));

  useEffect(() => {
    const closeOnEscape = (event) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);

  const update = (name, value) => setValues((current) => ({ ...current, [name]: value }));

  return (
    <div className="dialog-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="entity-dialog" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <header className="entity-dialog-header">
          <h3 id={titleId}>{title}</h3>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Tutup dialog"><X size={20} /></button>
        </header>
        <form className="entity-form" onSubmit={(event) => { event.preventDefault(); onSave(values); }}>
          {fields.map((field) => (
            <div className="field" key={field.name}>
              <label htmlFor={`${titleId}-${field.name}`}>{field.label}</label>
              {field.type === 'select' ? (
                <select
                  id={`${titleId}-${field.name}`}
                  value={values[field.name]}
                  onChange={(event) => update(field.name, event.target.value)}
                  required={field.required !== false}
                >
                  {field.options.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
                </select>
              ) : field.type === 'textarea' ? (
                <textarea
                  id={`${titleId}-${field.name}`}
                  rows={field.rows || 5}
                  value={values[field.name]}
                  onChange={(event) => update(field.name, event.target.value)}
                  placeholder={field.placeholder}
                  required={field.required !== false}
                />
              ) : (
                <input
                  id={`${titleId}-${field.name}`}
                  type={field.type || 'text'}
                  value={values[field.name]}
                  onChange={(event) => update(field.name, event.target.value)}
                  placeholder={field.placeholder}
                  min={field.min}
                  step={field.step}
                  required={field.required !== false}
                />
              )}
              {field.help && <span className="field-help">{field.help}</span>}
            </div>
          ))}
          <div className="dialog-actions">
            <button className="button button-secondary" type="button" onClick={onClose}>Batal</button>
            <button className="button button-primary" type="submit">Simpan</button>
          </div>
        </form>
      </section>
    </div>
  );
}
