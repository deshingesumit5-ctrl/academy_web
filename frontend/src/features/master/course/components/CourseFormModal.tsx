import React, { useState, useEffect } from 'react';
import { Modal } from '../../../../components/Modal';
import type { CourseDto } from '../api/courseApi';

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
  }, [initialData, isOpen]);

  const isValid = courseName.trim() && fees !== '' && Number(fees) > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
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
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div className="form-field">
          <label>Course Name <span className="required-asterisk">*</span></label>
          <input
            type="text"
            placeholder="e.g. JEE Advanced 2-Year Program"
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
            required
          />
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
            placeholder="e.g. 45000"
            value={fees}
            onChange={(e) => setFees(e.target.value === '' ? '' : Number(e.target.value))}
            required
          />
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
          <button type="submit" className="btn btn-primary" disabled={!isValid || saving}>
            {saving ? 'Saving...' : 'Save Course'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
