import React, { useState, useEffect, useRef } from 'react';
import { Modal } from '../../../../components/Modal';
import type { EmployeeDto } from '../api/employeeApi';
import { getBloodGroups, type BloodGroupDto } from '../api/bloodGroupApi';
import {
  MOBILE_PLACEHOLDER,
  handleMobileChange,
  validateMobile,
  validateRequired,
  FieldError,
} from '../../../../validations';

interface EmployeeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: EmployeeDto) => Promise<void>;
  initialData?: EmployeeDto | null;
}

export const EmployeeFormModal: React.FC<EmployeeFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [employeeName, setEmployeeName] = useState('');
  const [gender, setGender] = useState('Male');
  const [dob, setDob] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [emailId, setEmailId] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [address, setAddress] = useState('');
  const [designation, setDesignation] = useState('');
  const [dateOfJoining, setDateOfJoining] = useState('');
  const [shift, setShift] = useState('General');
  const [status, setStatus] = useState('Active');
  const [employeePhoto, setEmployeePhoto] = useState<string>('');
  const [bloodGroupsList, setBloodGroupsList] = useState<Array<BloodGroupDto>>([]);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      getBloodGroups()
        .then((groups) => setBloodGroupsList(groups))
        .catch((err) => console.error('Failed to load blood groups from DB', err));
    }
  }, [isOpen]);

  useEffect(() => {
    if (initialData) {
      setEmployeeName(initialData.employeeName || '');
      setGender(initialData.gender || 'Male');
      setDob(initialData.dob || '');
      setMobileNumber(initialData.mobileNumber || '');
      setEmailId(initialData.emailId || '');
      setAadhaarNumber(initialData.aadhaarNumber || '');
      setPanNumber(initialData.panNumber || '');
      setBloodGroup(initialData.bloodGroup || '');
      setAddress(initialData.address || '');
      setDesignation(initialData.designation || '');
      setDateOfJoining(initialData.dateOfJoining || '');
      setShift(initialData.shift || 'General');
      setStatus(initialData.status || 'Active');
      setEmployeePhoto(initialData.employeePhoto || '');
    } else {
      setEmployeeName('');
      setGender('Male');
      setDob('');
      setMobileNumber('');
      setEmailId('');
      setAadhaarNumber('');
      setPanNumber('');
      setBloodGroup('');
      setAddress('');
      setDesignation('');
      setDateOfJoining('');
      setShift('General');
      setStatus('Active');
      setEmployeePhoto('');
    }
    setFieldErrors({});
  }, [initialData, isOpen]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEmployeePhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setEmployeePhoto('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleTriggerFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handlePanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.toUpperCase();
    let filtered = '';
    for (let i = 0; i < rawVal.length && i < 10; i++) {
      const char = rawVal[i];
      if (i < 5) {
        if (/[A-Z]/.test(char)) filtered += char;
      } else if (i < 9) {
        if (/[0-9]/.test(char)) filtered += char;
      } else if (i === 9) {
        if (/[A-Z]/.test(char)) filtered += char;
      }
    }
    setPanNumber(filtered);
    if (fieldErrors.panNumber) setFieldErrors((prev) => ({ ...prev, panNumber: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    const todayStr = new Date().toISOString().split('T')[0];

    const nameErr = validateRequired(employeeName);
    if (nameErr) errors.employeeName = nameErr;

    const dobErr = validateRequired(dob);
    if (dobErr) {
      errors.dob = dobErr;
    } else if (dob > todayStr) {
      errors.dob = 'Birth date cannot be in the future';
    }

    const mobErr = validateMobile(mobileNumber, true);
    if (mobErr) errors.mobileNumber = mobErr;

    const emailErr = validateRequired(emailId);
    if (emailErr) {
      errors.emailId = emailErr;
    } else if (!/\S+@\S+\.\S+/.test(emailId)) {
      errors.emailId = 'Enter a valid email address';
    }

    const panErr = validateRequired(panNumber);
    if (panErr) {
      errors.panNumber = panErr;
    } else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panNumber)) {
      errors.panNumber = 'Enter valid 10-character PAN (e.g. ABCDE1234F)';
    }

    const desigErr = validateRequired(designation);
    if (desigErr) errors.designation = desigErr;

    const addrErr = validateRequired(address);
    if (addrErr) errors.address = addrErr;

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSaving(true);
    try {
      await onSave({
        employeeName,
        gender,
        dob,
        mobileNumber,
        emailId,
        aadhaarNumber,
        panNumber,
        bloodGroup,
        address,
        designation,
        dateOfJoining,
        shift,
        status,
        employeePhoto,
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
      title={initialData ? 'Edit Employee' : 'Add Employee'}
      onClose={onClose}
    >
      <form noValidate onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          {/* Employee Name */}
          <div className="form-field">
            <label>Employee Name <span className="required-asterisk">*</span></label>
            <input
              type="text"
              className={fieldErrors.employeeName ? 'input-error' : ''}
              placeholder="Full Name"
              value={employeeName}
              onChange={(e) => {
                setEmployeeName(e.target.value);
                if (fieldErrors.employeeName) setFieldErrors((prev) => ({ ...prev, employeeName: '' }));
              }}
            />
            <FieldError error={fieldErrors.employeeName} />
          </div>

          {/* Gender */}
          <div className="form-field">
            <label>Gender</label>
            <select value={gender} onChange={(e) => setGender(e.target.value)}>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* DOB */}
          <div className="form-field">
            <label>Date of Birth (DOB) <span className="required-asterisk">*</span></label>
            <input
              type="date"
              className={fieldErrors.dob ? 'input-error' : ''}
              max={new Date().toISOString().split('T')[0]}
              value={dob}
              onChange={(e) => {
                setDob(e.target.value);
                if (fieldErrors.dob) setFieldErrors((prev) => ({ ...prev, dob: '' }));
              }}
            />
            <FieldError error={fieldErrors.dob} />
          </div>

          {/* Mobile Number */}
          <div className="form-field">
            <label>Mobile Number <span className="required-asterisk">*</span></label>
            <input
              type="text"
              className={fieldErrors.mobileNumber ? 'input-error' : ''}
              placeholder={MOBILE_PLACEHOLDER}
              maxLength={10}
              value={mobileNumber}
              onChange={(e) => {
                handleMobileChange(e, setMobileNumber);
                if (fieldErrors.mobileNumber) setFieldErrors((prev) => ({ ...prev, mobileNumber: '' }));
              }}
            />
            <FieldError error={fieldErrors.mobileNumber} />
          </div>

          {/* Email ID */}
          <div className="form-field">
            <label>Email ID <span className="required-asterisk">*</span></label>
            <input
              type="email"
              className={fieldErrors.emailId ? 'input-error' : ''}
              placeholder="e.g. employee@company.com"
              value={emailId}
              onChange={(e) => {
                setEmailId(e.target.value);
                if (fieldErrors.emailId) setFieldErrors((prev) => ({ ...prev, emailId: '' }));
              }}
            />
            <FieldError error={fieldErrors.emailId} />
          </div>

          {/* Aadhaar Number */}
          <div className="form-field">
            <label>Aadhaar Number</label>
            <input
              type="text"
              placeholder="12-digit Aadhaar Number"
              maxLength={12}
              value={aadhaarNumber}
              onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, ''))}
            />
          </div>

          {/* PAN Number */}
          <div className="form-field">
            <label>PAN Number <span className="required-asterisk">*</span></label>
            <input
              type="text"
              className={fieldErrors.panNumber ? 'input-error' : ''}
              placeholder="e.g. ABCDE1234F"
              maxLength={10}
              style={{ textTransform: 'uppercase' }}
              value={panNumber}
              onChange={handlePanChange}
            />
            <FieldError error={fieldErrors.panNumber} />
          </div>

          {/* Blood Group */}
          <div className="form-field">
            <label>Blood Group</label>
            <select value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)}>
              <option value="">Select Blood Group</option>
              {bloodGroupsList.map((bg) => (
                <option key={bg.bloodGroupId || bg.name} value={bg.name}>
                  {bg.name}
                </option>
              ))}
            </select>
          </div>

          {/* Designation */}
          <div className="form-field">
            <label>Designation <span className="required-asterisk">*</span></label>
            <input
              type="text"
              className={fieldErrors.designation ? 'input-error' : ''}
              placeholder="e.g. Senior Instructor / Manager"
              value={designation}
              onChange={(e) => {
                setDesignation(e.target.value);
                if (fieldErrors.designation) setFieldErrors((prev) => ({ ...prev, designation: '' }));
              }}
            />
            <FieldError error={fieldErrors.designation} />
          </div>

          {/* Date of Joining */}
          <div className="form-field">
            <label>Date of Joining</label>
            <input
              type="date"
              value={dateOfJoining}
              onChange={(e) => setDateOfJoining(e.target.value)}
            />
          </div>

          {/* Shift */}
          <div className="form-field">
            <label>Shift</label>
            <select value={shift} onChange={(e) => setShift(e.target.value)}>
              <option value="General">General (9 AM - 6 PM)</option>
              <option value="Morning">Morning (7 AM - 3 PM)</option>
              <option value="Afternoon">Afternoon (12 PM - 8 PM)</option>
              <option value="Evening">Evening (3 PM - 11 PM)</option>
              <option value="Night">Night (11 PM - 7 AM)</option>
            </select>
          </div>

          {/* Status */}
          <div className="form-field">
            <label>Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Address */}
        <div className="form-field">
          <label>Address <span className="required-asterisk">*</span></label>
          <textarea
            rows={2}
            className={fieldErrors.address ? 'input-error' : ''}
            placeholder="Full Residential Address"
            value={address}
            onChange={(e) => {
              setAddress(e.target.value);
              if (fieldErrors.address) setFieldErrors((prev) => ({ ...prev, address: '' }));
            }}
          />
          <FieldError error={fieldErrors.address} />
        </div>

        {/* Employee Photo Upload Box */}
        <div className="form-field">
          <label style={{ fontWeight: 600, marginBottom: '6px' }}>Employee Photo</label>
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handlePhotoUpload}
          />

          {!employeePhoto ? (
            <div
              onClick={handleTriggerFileSelect}
              style={{
                border: '2px dashed #CBD5E0',
                borderRadius: '8px',
                padding: '16px',
                textAlign: 'center',
                cursor: 'pointer',
                background: '#F8FAFC',
                transition: 'border-color 0.2s',
              }}
            >
              <i className="ti ti-camera" style={{ fontSize: '28px', color: '#718096' }}></i>
              <div style={{ fontSize: '13px', color: '#4A5568', marginTop: '4px' }}>
                Click to upload Employee Photo
              </div>
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                background: '#F8FAFC',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
              }}
            >
              <img
                src={employeePhoto}
                alt="Employee Preview"
                style={{
                  width: '70px',
                  height: '70px',
                  borderRadius: '6px',
                  objectFit: 'cover',
                  border: '1px solid #CBD5E0',
                }}
              />
              <div style={{ display: 'flex', gap: '8px' }}>
                {/* Edit Pencil Icon Button */}
                <button
                  type="button"
                  className="action-btn action-btn-edit"
                  onClick={handleTriggerFileSelect}
                  title="Edit Photo"
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '6px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </svg>
                </button>
                {/* Delete Trash Icon Button */}
                <button
                  type="button"
                  className="action-btn action-btn-delete"
                  onClick={handleRemovePhoto}
                  title="Delete Photo"
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '6px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 6h18" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    <line x1="10" y1="11" x2="10" y2="17" />
                    <line x1="14" y1="11" x2="14" y2="17" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Save and Cancel buttons at the end of form */}
        <div className="modal-footer" style={{ padding: 0, marginTop: '10px' }}>
          <button type="button" className="btn" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Employee'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
