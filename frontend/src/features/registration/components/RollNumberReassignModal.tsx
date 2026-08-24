import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/Modal';
import axiosInstance from '../../../config/axiosInstance';
import type { StudentItem } from './StudentEditModal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  student: StudentItem | null;
  onSuccess: () => void;
}

export const RollNumberReassignModal: React.FC<Props> = ({ isOpen, onClose, student, onSuccess }) => {
  const [newRollNumber, setNewRollNumber] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (student) {
      setNewRollNumber(student.rollNumber || '');
    } else {
      setNewRollNumber('');
    }
    setError('');
  }, [student, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student || !student.studentId) return;

    if (!newRollNumber.trim()) {
      setError('New Roll Number is required');
      return;
    }

    setSaving(true);
    setError('');
    try {
      await axiosInstance.put(`/students/${student.studentId}/roll-number`, {
        rollNumber: newRollNumber.trim(),
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reassign roll number');
    } finally {
      setSaving(false);
    }
  };

  if (!student) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Reassign Roll Number">
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="badge badge-red" style={{ width: '100%', padding: '10px 14px', marginBottom: '14px', fontSize: '13px', borderRadius: '6px' }}>
            <i className="ti ti-alert-circle" style={{ marginRight: '6px' }}></i>
            {error}
          </div>
        )}

        <div style={{ marginBottom: 16, background: '#f8fafc', padding: 12, borderRadius: 8 }}>
          <div><strong>Student:</strong> {student.studentName}</div>
          <div><strong>Batch:</strong> {student.batchName || '-'}</div>
          <div><strong>Course:</strong> {student.courseName || '-'}</div>
          <div><strong>Current Roll Number:</strong> <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{student.rollNumber || 'Not Assigned'}</span></div>
        </div>

        <div className="form-group" style={{ marginBottom: 20 }}>
          <label className="form-label">New Roll Number <span className="required-asterisk">*</span></label>
          <input
            type="text"
            className="form-control"
            value={newRollNumber}
            onChange={(e) => setNewRollNumber(e.target.value)}
            placeholder="Enter new unique roll number"
            required
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Reassign Roll Number'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
