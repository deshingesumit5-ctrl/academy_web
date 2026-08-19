import React, { useState, useEffect } from 'react';
import { Modal } from '../../../../components/Modal';
import type { InquirySourceDto } from '../api/inquirySourceApi';

interface InquirySourceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: InquirySourceDto) => Promise<void>;
  initialData?: InquirySourceDto | null;
}

export const InquirySourceFormModal: React.FC<InquirySourceFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [sourceName, setSourceName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialData) {
      setSourceName(initialData.sourceName || '');
    } else {
      setSourceName('');
    }
  }, [initialData, isOpen]);

  const isValid = sourceName.trim() !== '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setSaving(true);
    try {
      await onSave({ sourceName });
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      title={initialData ? 'Edit Inquiry Source' : 'Add Inquiry Source'}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div className="form-field">
          <label>Source Name <span className="required-asterisk">*</span></label>
          <input
            type="text"
            placeholder="e.g. Walk-in / Facebook / Instagram / Referral"
            value={sourceName}
            onChange={(e) => setSourceName(e.target.value)}
            required
          />
        </div>

        <div className="modal-footer" style={{ padding: 0, marginTop: '10px' }}>
          <button type="button" className="btn" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={!isValid || saving}>
            {saving ? 'Saving...' : 'Save Source'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
