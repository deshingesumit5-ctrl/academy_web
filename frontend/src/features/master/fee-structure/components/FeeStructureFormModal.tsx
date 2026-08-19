import React, { useState, useEffect } from 'react';
import { Modal } from '../../../../components/Modal';
import type { FeeStructureDto } from '../api/feeStructureApi';

interface FeeStructureFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: FeeStructureDto) => Promise<void>;
  initialData?: FeeStructureDto | null;
}

export const FeeStructureFormModal: React.FC<FeeStructureFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [planName, setPlanName] = useState('');
  const [totalFee, setTotalFee] = useState<number | ''>('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialData) {
      setPlanName(initialData.planName || '');
      setTotalFee(initialData.totalFee !== undefined && initialData.totalFee !== null ? initialData.totalFee : '');
    } else {
      setPlanName('');
      setTotalFee('');
    }
  }, [initialData, isOpen]);

  const isValid = planName.trim() !== '' && totalFee !== '' && Number(totalFee) >= 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setSaving(true);
    try {
      await onSave({
        planName,
        totalFee: Number(totalFee),
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
      title={initialData ? 'Edit Fee Structure' : 'Add Fee Structure'}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div className="form-field">
          <label>Name <span className="required-asterisk">*</span></label>
          <input
            type="text"
            placeholder="e.g. Annual Course Fee / Monthly Coaching Fee"
            value={planName}
            onChange={(e) => setPlanName(e.target.value)}
            required
          />
        </div>

        <div className="form-field">
          <label>Amount (₹) <span className="required-asterisk">*</span></label>
          <input
            type="number"
            placeholder="e.g. 15000"
            value={totalFee}
            onChange={(e) => setTotalFee(e.target.value === '' ? '' : Number(e.target.value))}
            min="0"
            required
          />
        </div>

        <div className="modal-footer" style={{ padding: 0, marginTop: '10px' }}>
          <button type="button" className="btn" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={!isValid || saving}>
            {saving ? 'Saving...' : 'Save Fee Structure'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
