import React, { useState, useEffect } from 'react';
import { Modal } from '../../../../components/Modal';
import type { ExamDto } from '../api/examApi';
import { validateRequired, FieldError } from '../../../../validations';

interface ExamFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ExamDto) => Promise<void>;
  initialData?: ExamDto | null;
}

export const ExamFormModal: React.FC<ExamFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [examName, setExamName] = useState('');
  const [examType, setExamType] = useState('Unit Test');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialData) {
      setExamName(initialData.examName || '');
      setExamType(initialData.examType || 'Unit Test');
    } else {
      setExamName('');
      setExamType('Unit Test');
    }
    setFieldErrors({});
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    const enErr = validateRequired(examName);
    if (enErr) errors.examName = enErr;

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSaving(true);
    try {
      await onSave({
        examName,
        examType,
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
      title={initialData ? 'Edit Exam' : 'Add Exam'}
      onClose={onClose}
    >
      <form noValidate onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div className="form-field">
          <label>Exam Name <span className="required-asterisk">*</span></label>
          <input
            type="text"
            className={fieldErrors.examName ? 'input-error' : ''}
            placeholder="e.g. August Monthly Test"
            value={examName}
            onChange={(e) => {
              setExamName(e.target.value);
              if (fieldErrors.examName) setFieldErrors((prev) => ({ ...prev, examName: '' }));
            }}
          />
          <FieldError error={fieldErrors.examName} />
        </div>

        <div className="form-field">
          <label>Exam Type</label>
          <select value={examType} onChange={(e) => setExamType(e.target.value)}>
            <option value="Unit Test">Unit Test</option>
            <option value="Weekly Test">Weekly Test</option>
            <option value="Monthly Test">Monthly Test</option>
            <option value="Final Exam">Final Exam</option>
            <option value="Scholarship Test">Scholarship Test</option>
            <option value="Custom">Custom</option>
          </select>
        </div>

        <div className="modal-footer" style={{ padding: 0, marginTop: '10px' }}>
          <button type="button" className="btn" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Exam'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

