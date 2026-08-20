import React, { useState, useEffect } from 'react';
import { Modal } from '../../../../components/Modal';
import type { AcademyDto } from '../api/academyApi';
import {
  MOBILE_PLACEHOLDER,
  handleMobileChange,
  validateMobile,
  validateRequired,
  FieldError,
} from '../../../../validations';

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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
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
    setFieldErrors({});
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    const acErr = validateRequired(academyName);
    if (acErr) errors.academyName = acErr;

    const brErr = validateRequired(branchName);
    if (brErr) errors.branchName = brErr;

    const addrErr = validateRequired(address);
    if (addrErr) errors.address = addrErr;

    const contactErr = validateMobile(contactNumber, true);
    if (contactErr) errors.contactNumber = contactErr;

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

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
      <form noValidate onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div className="form-field">
          <label>Academy Name <span className="required-asterisk">*</span></label>
          <input
            type="text"
            className={fieldErrors.academyName ? 'input-error' : ''}
            placeholder="e.g. Apex Science Academy"
            value={academyName}
            onChange={(e) => {
              setAcademyName(e.target.value);
              if (fieldErrors.academyName) setFieldErrors((prev) => ({ ...prev, academyName: '' }));
            }}
          />
          <FieldError error={fieldErrors.academyName} />
        </div>

        <div className="form-field">
          <label>Branch Name <span className="required-asterisk">*</span></label>
          <input
            type="text"
            className={fieldErrors.branchName ? 'input-error' : ''}
            placeholder="e.g. Kothrud Branch"
            value={branchName}
            onChange={(e) => {
              setBranchName(e.target.value);
              if (fieldErrors.branchName) setFieldErrors((prev) => ({ ...prev, branchName: '' }));
            }}
          />
          <FieldError error={fieldErrors.branchName} />
        </div>

        <div className="form-field">
          <label>Address <span className="required-asterisk">*</span></label>
          <textarea
            rows={3}
            className={fieldErrors.address ? 'input-error' : ''}
            placeholder="e.g. 102 Park Avenue, Kothrud, Pune"
            value={address}
            onChange={(e) => {
              setAddress(e.target.value);
              if (fieldErrors.address) setFieldErrors((prev) => ({ ...prev, address: '' }));
            }}
          />
          <FieldError error={fieldErrors.address} />
        </div>

        <div className="form-field">
          <label>Contact Details <span className="required-asterisk">*</span></label>
          <input
            type="text"
            className={fieldErrors.contactNumber ? 'input-error' : ''}
            placeholder={MOBILE_PLACEHOLDER}
            maxLength={10}
            value={contactNumber}
            onChange={(e) => {
              handleMobileChange(e, setContactNumber);
              if (fieldErrors.contactNumber) setFieldErrors((prev) => ({ ...prev, contactNumber: '' }));
            }}
          />
          <FieldError error={fieldErrors.contactNumber} />
        </div>

        <div className="modal-footer" style={{ padding: 0, marginTop: '10px' }}>
          <button type="button" className="btn" onClick={onClose}>
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Academy'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

