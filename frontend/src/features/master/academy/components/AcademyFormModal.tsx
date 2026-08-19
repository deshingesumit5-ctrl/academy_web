import React, { useState, useEffect } from 'react';
import { Modal } from '../../../../components/Modal';
import type { AcademyDto } from '../api/academyApi';

interface AcademyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: AcademyDto) => Promise<void>;
  initialData?: AcademyDto | null;
}

export const AcademyFormModal: React.FC<AcademyFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [academyName, setAcademyName] = useState('');
  const [branchName, setBranchName] = useState('');
  const [address, setAddress] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialData) {
      setAcademyName(initialData.academyName || '');
      setBranchName(initialData.branchName || '');
      setAddress(initialData.address || '');
      setContactNumber(initialData.contactNumber || '');
    } else {
      setAcademyName('');
      setBranchName('');
      setAddress('');
      setContactNumber('');
    }
  }, [initialData, isOpen]);

  const isValid = academyName.trim() && branchName.trim() && address.trim() && contactNumber.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setSaving(true);
    try {
      await onSave({
        academyName,
        branchName,
        address,
        contactNumber,
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
      title={initialData ? 'Edit Academy' : 'Add Academy'}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div className="form-field">
          <label>Academy Name <span className="required-asterisk">*</span></label>
          <input
            type="text"
            placeholder="e.g. Apex Science Academy"
            value={academyName}
            onChange={(e) => setAcademyName(e.target.value)}
            required
          />
        </div>

        <div className="form-field">
          <label>Branch Name <span className="required-asterisk">*</span></label>
          <input
            type="text"
            placeholder="e.g. Kothrud Branch"
            value={branchName}
            onChange={(e) => setBranchName(e.target.value)}
            required
          />
        </div>

        <div className="form-field">
          <label>Address <span className="required-asterisk">*</span></label>
          <textarea
            rows={3}
            placeholder="e.g. 102 Park Avenue, Kothrud, Pune"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />
        </div>

        <div className="form-field">
          <label>Contact Details <span className="required-asterisk">*</span></label>
          <input
            type="text"
            placeholder="e.g. +91 98765 43210 / contact@apex.com"
            value={contactNumber}
            onChange={(e) => setContactNumber(e.target.value)}
            required
          />
        </div>

        <div className="modal-footer" style={{ padding: 0, marginTop: '10px' }}>
          <button type="button" className="btn" onClick={onClose}>
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!isValid || saving}
          >
            {saving ? 'Saving...' : 'Save Academy'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
