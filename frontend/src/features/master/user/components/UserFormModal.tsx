import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../../../../components/Modal';
import type { UserMasterDto } from '../api/userMasterApi';
import { getEmployees } from '../../employee/api/employeeApi';
import type { EmployeeDto } from '../../employee/api/employeeApi';
import axiosInstance from '../../../../config/axiosInstance';
import { validateRequired, FieldError } from '../../../../validations';

interface RoleOption {
  roleId: number;
  name: string;
  description?: string;
  email?: string;
}

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: UserMasterDto) => Promise<void>;
  initialData?: UserMasterDto | null;
}

export const UserFormModal: React.FC<UserFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const navigate = useNavigate();
  const [employeeId, setEmployeeId] = useState<number | ''>('');
  const [roleId, setRoleId] = useState<number | 'NEW' | ''>('');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('Active');

  const [employeesList, setEmployeesList] = useState<EmployeeDto[]>([]);
  const [rolesList, setRolesList] = useState<RoleOption[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const empRes = await getEmployees();
        setEmployeesList(empRes || []);
      } catch (e) {
        console.error('Error fetching employees:', e);
      }

      try {
        const rolesRes = await axiosInstance.get('/roles');
        if (rolesRes.data && rolesRes.data.status) {
          setRolesList(rolesRes.data.data || []);
        }
      } catch (e) {
        console.error('Error fetching roles:', e);
      }
    };

    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (initialData) {
      setEmployeeId(initialData.employeeId || '');
      
      let matchedRoleId: number | '' = initialData.roleId || '';
      if (!matchedRoleId && initialData.roleName && rolesList.length > 0) {
        const found = rolesList.find((r) => r.name.toLowerCase() === initialData.roleName?.toLowerCase());
        if (found) matchedRoleId = found.roleId;
      }
      setRoleId(matchedRoleId);
      setDescription(initialData.description || '');
      setEmail(initialData.email || '');
      setPassword(initialData.password || '••••••••');
      setStatus(initialData.status || 'Active');
    } else {
      setEmployeeId('');
      setRoleId('');
      setDescription('');
      setEmail('');
      setPassword('');
      setStatus('Active');
    }
    setFieldErrors({});
  }, [initialData, isOpen, rolesList]);

  const handleRoleChange = (selectedVal: string) => {
    if (selectedVal === 'NEW') {
      onClose();
      navigate('/roles/create');
      return;
    } else if (selectedVal === '') {
      setRoleId('');
    } else {
      const selectedId = Number(selectedVal);
      setRoleId(selectedId);
      const foundRole = rolesList.find((r) => r.roleId === selectedId);
      if (foundRole) {
        if (foundRole.email && foundRole.email.trim() !== '') {
          setEmail(foundRole.email);
          setPassword('••••••••');
        }
        if (foundRole.description && !description) {
          setDescription(foundRole.description);
        }
      }
    }
    if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: '' }));
  };

  const handleEmployeeChange = (selectedVal: string) => {
    if (!selectedVal) {
      setEmployeeId('');
      return;
    }
    const empIdNum = Number(selectedVal);
    setEmployeeId(empIdNum);

    const foundEmp = employeesList.find((e) => e.employeeId === empIdNum);
    if (foundEmp && foundEmp.emailId && (!email || roleId === 'NEW' || roleId === '')) {
      setEmail(foundEmp.emailId);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    const emailErr = validateRequired(email);
    if (emailErr) errors.email = emailErr;

    if (!initialData && (!password || password.trim() === '')) {
      errors.password = 'Password is required';
    }

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSaving(true);
    try {
      const selectedEmp = employeesList.find((e) => e.employeeId === employeeId);
      const selectedRole = typeof roleId === 'number' ? rolesList.find((r) => r.roleId === roleId) : null;

      await onSave({
        employeeId: typeof employeeId === 'number' ? employeeId : undefined,
        employeeName: selectedEmp ? selectedEmp.employeeName : undefined,
        roleId: typeof roleId === 'number' ? roleId : undefined,
        roleName: selectedRole ? selectedRole.name : undefined,
        description,
        email,
        password,
        status,
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
      title={initialData ? 'Edit User' : 'Add User'}
      onClose={onClose}
    >
      <form noValidate onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Select Employee */}
        <div className="form-field">
          <label>Select Employee</label>
          <select
            value={employeeId}
            onChange={(e) => handleEmployeeChange(e.target.value)}
          >
            <option value="">-- Select Employee --</option>
            {employeesList.map((emp) => (
              <option key={emp.employeeId} value={emp.employeeId}>
                {emp.employeeName} {emp.designation ? `(${emp.designation})` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Select Role */}
        <div className="form-field">
          <label>Select Role</label>
          <select
            value={roleId}
            onChange={(e) => handleRoleChange(e.target.value)}
          >
            <option value="">-- Select Role --</option>
            {rolesList.map((r) => (
              <option key={r.roleId} value={r.roleId}>
                {r.name}
              </option>
            ))}
            <option value="NEW">+ Add New Role</option>
          </select>
        </div>

        {/* Description */}
        <div className="form-field">
          <label>Description</label>
          <textarea
            rows={2}
            placeholder="User role description or notes"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Email ID */}
        <div className="form-field">
          <label>Email ID <span className="required-asterisk">*</span></label>
          <input
            type="email"
            className={fieldErrors.email ? 'input-error' : ''}
            placeholder="e.g. user@academy.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: '' }));
            }}
          />
          <FieldError error={fieldErrors.email} />
        </div>

        {/* Password */}
        <div className="form-field">
          <label>Password {!initialData && <span className="required-asterisk">*</span>}</label>
          <input
            type="password"
            className={fieldErrors.password ? 'input-error' : ''}
            placeholder={initialData ? 'Leave blank to keep existing password' : 'Enter login password'}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: '' }));
            }}
          />
          <FieldError error={fieldErrors.password} />
        </div>

        {/* Status */}
        <div className="form-field">
          <label>Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        {/* Save and Cancel buttons at the end of form */}
        <div className="modal-footer" style={{ padding: 0, marginTop: '10px' }}>
          <button type="button" className="btn" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save User'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
