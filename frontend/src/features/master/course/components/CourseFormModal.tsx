import React, { useState, useEffect } from 'react';
import { Modal } from '../../../../components/Modal';
import type { CourseDto } from '../api/courseApi';
import { validateRequired, FieldError } from '../../../../validations';

interface CourseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CourseDto) => Promise<void>;
  initialData?: CourseDto | null;
}

export const CourseFormModal: React.FC<CourseFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [courseName, setCourseName] = useState('');
  const [duration, setDuration] = useState('');
  const [fees, setFees] = useState<number | ''>('');
  const [description, setDescription] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialData) {
      setCourseName(initialData.courseName || '');
      setDuration(initialData.duration || '');
      setFees(initialData.fees || '');
      setDescription(initialData.description || '');
    } else {
      setCourseName('');
      setDuration('');
      setFees('');
      setDescription('');
    }
    setFieldErrors({});
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    const cnErr = validateRequired(courseName);
    if (cnErr) errors.courseName = cnErr;

    const feeErr = validateRequired(fees);
    if (feeErr) errors.fees = feeErr;

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSaving(true);
    try {
      await onSave({
        courseName,
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
      title={initialData ? 'Edit Course' : 'Add Course'}
      onClose={onClose}
    >
      <form noValidate onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div className="form-field">
          <label>Course Name <span className="required-asterisk">*</span></label>
          <input
            type="text"
            className={fieldErrors.courseName ? 'input-error' : ''}
            placeholder="e.g. JEE Advanced 2-Year Program"
            value={courseName}
            onChange={(e) => {
              setCourseName(e.target.value);
              if (fieldErrors.courseName) setFieldErrors((prev) => ({ ...prev, courseName: '' }));
            }}
          />
          <FieldError error={fieldErrors.courseName} />
        </div>

        <div className="form-field">
          <label>Duration</label>
          <input
            type="text"
            placeholder="e.g. 24 Months"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          />
        </div>

        <div className="form-field">
          <label>Fees (₹) <span className="required-asterisk">*</span></label>
          <input
            type="number"
            className={fieldErrors.fees ? 'input-error' : ''}
            placeholder="e.g. 45000"
            value={fees}
            onChange={(e) => {
              setFees(e.target.value === '' ? '' : Number(e.target.value));
              if (fieldErrors.fees) setFieldErrors((prev) => ({ ...prev, fees: '' }));
            }}
          />
          <FieldError error={fieldErrors.fees} />
        </div>

        <div className="form-field">
          <label>Description</label>
          <textarea
            rows={3}
            placeholder="e.g. Comprehensive Physics, Chemistry, Maths coaching"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="modal-footer" style={{ padding: 0, marginTop: '10px' }}>
          <button type="button" className="btn" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Course'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

