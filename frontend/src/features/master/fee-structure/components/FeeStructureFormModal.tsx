import React, { useState, useEffect } from 'react';
import { Modal } from '../../../../components/Modal';
import type { FeeStructureDto } from '../api/feeStructureApi';
import { validateRequired, FieldError } from '../../../../validations';

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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialData) {
      setPlanName(initialData.planName || '');
      setTotalFee(initialData.totalFee !== undefined && initialData.totalFee !== null ? initialData.totalFee : '');
    } else {
      setPlanName('');
      setTotalFee('');
    }
    setFieldErrors({});
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    const pnErr = validateRequired(planName);
    if (pnErr) errors.planName = pnErr;

    const tfErr = validateRequired(totalFee);
    if (tfErr) errors.totalFee = tfErr;

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

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
      <form noValidate onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div className="form-field">
          <label>Name <span className="required-asterisk">*</span></label>
          <input
            type="text"
            className={fieldErrors.planName ? 'input-error' : ''}
            placeholder="e.g. Annual Course Fee / Monthly Coaching Fee"
            value={planName}
            onChange={(e) => {
              setPlanName(e.target.value);
              if (fieldErrors.planName) setFieldErrors((prev) => ({ ...prev, planName: '' }));
            }}
          />
          <FieldError error={fieldErrors.planName} />
        </div>

        <div className="form-field">
          <label>Amount (₹) <span className="required-asterisk">*</span></label>
          <input
            type="number"
            className={fieldErrors.totalFee ? 'input-error' : ''}
            placeholder="e.g. 15000"
            value={totalFee}
            onChange={(e) => {
              setTotalFee(e.target.value === '' ? '' : Number(e.target.value));
              if (fieldErrors.totalFee) setFieldErrors((prev) => ({ ...prev, totalFee: '' }));
            }}
            min="0"
          />
          <FieldError error={fieldErrors.totalFee} />
        </div>

        <div className="modal-footer" style={{ padding: 0, marginTop: '10px' }}>
          <button type="button" className="btn" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Fee Structure'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

