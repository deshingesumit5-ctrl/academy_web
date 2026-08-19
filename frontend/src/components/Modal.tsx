import React from 'react';

interface ModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, title, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose}>
            <i className="ti ti-x"></i>
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
};
