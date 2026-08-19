import React, { useState, useEffect } from 'react';
import { Modal } from '../../../../components/Modal';
import type { LibraryPlanDto } from '../api/libraryPlanApi';

interface LibraryPlanFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: LibraryPlanDto) => Promise<void>;
  initialData?: LibraryPlanDto | null;
}

export const LibraryPlanFormModal: React.FC<LibraryPlanFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [planName, setPlanName] = useState('');
  const [duration, setDuration] = useState('');
  const [fees, setFees] = useState<number | ''>('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialData) {
      setPlanName(initialData.planName || '');
      setDuration(initialData.duration || '');
      setFees(initialData.fees || '');
      setDescription(initialData.description || '');
    } else {
      setPlanName('');
      setDuration('');
      setFees('');
      setDescription('');
    }
  }, [initialData, isOpen]);

  const isValid = planName.trim() && fees !== '' && Number(fees) > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setSaving(true);
    try {
      await onSave({
        planName,
        duration,
        fees: Number(fees),
        description,
      });
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
      title={initialData ? 'Edit Library Plan' : 'Add Library Plan'}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div className="form-field">
          <label>Plan Name <span className="required-asterisk">*</span></label>
          <input
            type="text"
            placeholder="e.g. Monthly Reserved Desk"
            value={planName}
            onChange={(e) => setPlanName(e.target.value)}
            required
          />
        </div>

        <div className="form-field">
          <label>Duration</label>
          <input
            type="text"
            placeholder="e.g. 1 Month / 3 Months"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          />
        </div>

        <div className="form-field">
          <label>Fees (₹) <span className="required-asterisk">*</span></label>
          <input
            type="number"
            placeholder="e.g. 1500"
            value={fees}
            onChange={(e) => setFees(e.target.value === '' ? '' : Number(e.target.value))}
            required
          />
        </div>

        <div className="form-field">
          <label>Description</label>
          <textarea
            rows={3}
            placeholder="e.g. 24x7 Wi-Fi + AC Desk access"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="modal-footer" style={{ padding: 0, marginTop: '10px' }}>
          <button type="button" className="btn" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={!isValid || saving}>
            {saving ? 'Saving...' : 'Save Plan'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
