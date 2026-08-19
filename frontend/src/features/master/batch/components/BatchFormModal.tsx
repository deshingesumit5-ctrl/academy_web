import React, { useState, useEffect } from 'react';
import { Modal } from '../../../../components/Modal';
import type { BatchDto } from '../api/batchApi';

interface BatchFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: BatchDto) => Promise<void>;
  initialData?: BatchDto | null;
}

export const BatchFormModal: React.FC<BatchFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [batchName, setBatchName] = useState('');
  const [faculty, setFaculty] = useState('');
  const [batchTiming, setBatchTiming] = useState('');
  const [capacity, setCapacity] = useState<number | ''>('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialData) {
      setBatchName(initialData.batchName || '');
      setFaculty(initialData.faculty || '');
      setBatchTiming(initialData.batchTiming || '');
      setCapacity(initialData.capacity || '');
    } else {
      setBatchName('');
      setFaculty('');
      setBatchTiming('');
      setCapacity('');
    }
  }, [initialData, isOpen]);

  const isValid = batchName.trim() !== '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setSaving(true);
    try {
      await onSave({
        batchName,
        faculty,
        batchTiming,
        capacity: capacity === '' ? undefined : Number(capacity),
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
      title={initialData ? 'Edit Batch' : 'Add Batch'}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div className="form-field">
          <label>Batch Name <span className="required-asterisk">*</span></label>
          <input
            type="text"
            placeholder="e.g. Morning Batch A1"
            value={batchName}
            onChange={(e) => setBatchName(e.target.value)}
            required
          />
        </div>

        <div className="form-field">
          <label>Faculty</label>
          <input
            type="text"
            placeholder="e.g. Prof. Sharma (Physics)"
            value={faculty}
            onChange={(e) => setFaculty(e.target.value)}
          />
        </div>

        <div className="form-field">
          <label>Batch Timing</label>
          <input
            type="text"
            placeholder="e.g. 08:00 AM - 11:00 AM"
            value={batchTiming}
            onChange={(e) => setBatchTiming(e.target.value)}
          />
        </div>

        <div className="form-field">
          <label>Capacity</label>
          <input
            type="number"
            placeholder="e.g. 40"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value === '' ? '' : Number(e.target.value))}
          />
        </div>

        <div className="modal-footer" style={{ padding: 0, marginTop: '10px' }}>
          <button type="button" className="btn" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={!isValid || saving}>
            {saving ? 'Saving...' : 'Save Batch'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
