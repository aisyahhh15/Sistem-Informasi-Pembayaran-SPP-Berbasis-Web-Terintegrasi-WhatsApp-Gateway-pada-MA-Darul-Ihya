import React from 'react';
import './PageHeader.css';

export default function PageHeader({ title, description, action }) {
  return (
    <div className="page-header">
      <div className="page-header-content">
        <h2 className="page-header-title">{title}</h2>
        {description && <p className="page-header-description">{description}</p>}
      </div>
      {action && <div className="page-header-action">{action}</div>}
    </div>
  );
}
