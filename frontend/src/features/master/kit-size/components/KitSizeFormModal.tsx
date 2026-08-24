import React, { useState, useEffect } from 'react';
import { Modal } from '../../../../components/Modal';
import type { KitSizeDto } from '../api/kitSizeApi';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: KitSizeDto) => Promise<void>;
  initialData?: KitSizeDto | null;
}

export const KitSizeFormModal: React.FC<Props> = ({ isOpen, onClose, onSave, initialData }) => {
  const [name, setName] = useState('');
  const [status, setStatus] = useState('Active');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setStatus(initialData.status || 'Active');
    } else {
      setName('');
      setStatus('Active');
    }
    setError('');
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Kit size name is required');
      return;
    }
    setSaving(true);
    try {
      await onSave({ name: name.trim(), status });
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save kit size');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Kit Size' : 'Add Kit Size'}>
      <form onSubmit={handleSubmit}>
        {error && <div className="error-message" style={{ color: 'var(--danger)', marginBottom: 12 }}>{error}</div>}
        <div className="form-group" style={{ marginBottom: 16 }}>
          <label className="form-label">Kit Size <span className="required-asterisk">*</span></label>
          <input
            type="text"
            className="form-control"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. S, M, L, XL, XXL, 38, 40, 42"
            required
          />
        </div>
        <div className="form-group" style={{ marginBottom: 20 }}>
          <label className="form-label">Status</label>
          <select className="form-control" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Kit Size'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
