import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/Modal';
import axiosInstance from '../../../config/axiosInstance';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  student: {
    studentId: number;
    studentName: string;
    totalFee: number;
    paidAmount: number;
    discountAmount?: number;
    concessionAmount?: number;
  } | null;
  onSuccess: () => void;
}

export const DiscountModal: React.FC<Props> = ({ isOpen, onClose, student, onSuccess }) => {
  const [discount, setDiscount] = useState<number | ''>('');
  const [concession, setConcession] = useState<number | ''>('');
  const [remarks, setRemarks] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (student) {
      setDiscount(student.discountAmount || '');
      setConcession(student.concessionAmount || '');
      setRemarks('');
    } else {
      setDiscount('');
      setConcession('');
      setRemarks('');
    }
    setError('');
  }, [student, isOpen]);

  if (!student) return null;

  const totalFee = Number(student.totalFee || 0);
  const discountVal = Number(discount || 0);
  const concessionVal = Number(concession || 0);
  const finalFee = Math.max(0, totalFee - discountVal - concessionVal);
  const paidAmount = Number(student.paidAmount || 0);
  const balance = Math.max(0, finalFee - paidAmount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await axiosInstance.put(`/students/${student.studentId}/discount`, {
        discountAmount: discountVal,
        concessionAmount: concessionVal,
        remarks: remarks.trim(),
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update discount/concession');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Assign Discount / Concession">
      <form onSubmit={handleSubmit}>
        {error && <div className="error-message" style={{ color: 'var(--danger)', marginBottom: 12 }}>{error}</div>}

        <div style={{ marginBottom: 16, background: '#f8fafc', padding: 12, borderRadius: 8 }}>
          <div><strong>Student:</strong> {student.studentName}</div>
          <div><strong>Original Total Fee:</strong> ₹{totalFee.toLocaleString('en-IN')}</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <div className="form-group">
            <label className="form-label">Discount Amount (₹)</label>
            <input
              type="number"
              className="form-control"
              value={discount}
              onChange={(e) => setDiscount(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="0"
              min="0"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Concession Amount (₹)</label>
            <input
              type="number"
              className="form-control"
              value={concession}
              onChange={(e) => setConcession(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="0"
              min="0"
            />
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: 16 }}>
          <label className="form-label">Remarks / Reason</label>
          <input
            type="text"
            className="form-control"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="e.g. Merit discount, Sports quota, Single parent concession"
          />
        </div>

        {/* Live Calculation Preview */}
        <div style={{ marginBottom: 20, background: '#e0f2fe', padding: 12, borderRadius: 8, borderLeft: '4px solid #0284c7' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span>Total Fee:</span>
            <strong>₹{totalFee.toLocaleString('en-IN')}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, color: 'var(--danger)' }}>
            <span>Discount + Concession:</span>
            <strong>- ₹{(discountVal + concessionVal).toLocaleString('en-IN')}</strong>
          </div>
          <hr style={{ margin: '6px 0', borderColor: '#bae6fd' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 16, fontWeight: 700, color: '#0369a1' }}>
            <span>Recalculated Final Fee:</span>
            <span>₹{finalFee.toLocaleString('en-IN')}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#047857' }}>
            <span>Paid Amount:</span>
            <span>₹{paidAmount.toLocaleString('en-IN')}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 600, color: balance > 0 ? '#b91c1c' : '#047857' }}>
            <span>Remaining Balance:</span>
            <span>₹{balance.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Apply & Recalculate'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
