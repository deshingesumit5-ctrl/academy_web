import React from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: '420px' }}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onCancel}>
            <i className="ti ti-x"></i>
          </button>
        </div>
        <div className="modal-body">
          <p style={{ fontSize: '13.5px', color: '#4A5568' }}>{message}</p>
        </div>
        <div className="modal-footer">
          <button className="btn" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn btn-danger" onClick={onConfirm}>
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
};
