import React, { useState, useEffect } from 'react';
import { Modal } from '../../../../components/Modal';
import type { InquirySourceDto } from '../api/inquirySourceApi';
import { validateRequired, FieldError } from '../../../../validations';

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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialData) {
      setSourceName(initialData.sourceName || '');
    } else {
      setSourceName('');
    }
    setFieldErrors({});
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    const snErr = validateRequired(sourceName);
    if (snErr) errors.sourceName = snErr;

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

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
      <form noValidate onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div className="form-field">
          <label>Source Name <span className="required-asterisk">*</span></label>
          <input
            type="text"
            className={fieldErrors.sourceName ? 'input-error' : ''}
            placeholder="e.g. Walk-in / Facebook / Instagram / Referral"
            value={sourceName}
            onChange={(e) => {
              setSourceName(e.target.value);
              if (fieldErrors.sourceName) setFieldErrors((prev) => ({ ...prev, sourceName: '' }));
            }}
          />
          <FieldError error={fieldErrors.sourceName} />
        </div>

        <div className="modal-footer" style={{ padding: 0, marginTop: '10px' }}>
          <button type="button" className="btn" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Source'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

