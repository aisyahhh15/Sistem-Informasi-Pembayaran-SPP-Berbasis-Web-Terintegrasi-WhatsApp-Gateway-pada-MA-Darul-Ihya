import React from 'react';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

const icons = { success: CheckCircle2, error: AlertCircle, warning: Info };

export default function Feedback({ message, tone = 'success' }) {
  if (!message) return null;
  const Icon = icons[tone] || icons.success;
  return <div className={`inline-feedback ${tone}`} role={tone === 'error' ? 'alert' : 'status'} aria-live={tone === 'error' ? 'assertive' : 'polite'}>
    <Icon size={17} aria-hidden="true" />
    <span>{message}</span>
  </div>;
}
