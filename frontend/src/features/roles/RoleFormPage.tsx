import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../config/axiosInstance';
import { validateRequired, FieldError } from '../../validations';

interface ModuleConfig {
  name: string;
  actions: string[];
}

const MODULE_CONFIGS: ModuleConfig[] = [
  { name: 'User / Roles', actions: ['Read', 'Create', 'Edit', 'Delete'] },
  { name: 'Dashboard', actions: ['Read'] },
  { name: 'Academy Master', actions: ['Read', 'Create', 'Edit', 'Delete'] },
  { name: 'Library Plan', actions: ['Read', 'Create', 'Edit', 'Delete'] },
  { name: 'Course Master', actions: ['Read', 'Create', 'Edit', 'Delete'] },
  { name: 'Batch Master', actions: ['Read', 'Create', 'Edit', 'Delete'] },
  { name: 'Exam Master', actions: ['Read', 'Create', 'Edit', 'Delete'] },
  { name: 'Inquiry Source', actions: ['Read', 'Create', 'Edit', 'Delete'] },
  { name: 'Fee Structure', actions: ['Read', 'Create', 'Edit', 'Delete'] },
  { name: 'Student Registration', actions: ['Read', 'Create', 'Edit', 'Delete', 'Export', 'Print'] },
  { name: 'Attendance', actions: ['Read', 'Create', 'Edit'] },
  { name: 'Fee Management', actions: ['Read', 'Create', 'Edit', 'Approve', 'Export', 'Print'] },
  { name: 'Marksheet', actions: ['Read', 'Create', 'Edit', 'Print'] },
  { name: 'Inquiry', actions: ['Read', 'Create', 'Edit', 'Delete'] },
  { name: 'Follow-ups', actions: ['Read', 'Create', 'Edit'] },
  { name: 'WhatsApp', actions: ['Read', 'Send'] },
  { name: 'Tasks', actions: ['Read', 'Create', 'Edit', 'Delete'] },
  { name: 'Reports', actions: ['Read', 'Export'] },
];

export const RoleFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Active');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Selected permissions map: moduleName -> array of checked actions
  const [permissions, setPermissions] = useState<Record<string, string[]>>({});

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit && id) {
      setLoading(true);
      axiosInstance.get(`/roles/${id}`)
        .then((res) => {
          if (res.data.status) {
            const role = res.data.data;
            setName(role.name || '');
            setDescription(role.description || '');
            setStatus(role.status || 'Active');
            setEmail(role.email || role.username || '');
            const initialPassword = role.password || '••••••••';
            setPassword(initialPassword);
            setConfirmPassword(initialPassword);
            
            if (role.permissions) {
              try {
                const parsed = JSON.parse(role.permissions);
                setPermissions(parsed);
              } catch (e) {
                setPermissions({});
              }
            }
          } else {
            setError(res.data.message || 'Failed to load role');
          }
        })
        .catch((err) => {
          setError(err.response?.data?.message || 'Error fetching role details');
        })
        .finally(() => setLoading(false));
    } else {
      setName('');
      setDescription('');
      setStatus('Active');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setPermissions({});
      setError('');
    }
    setFieldErrors({});
  }, [id, isEdit]);

  const handlePasswordChange = (val: string) => {
    setPassword(val);
    setConfirmPassword(val);
  };

  // Check if all permissions across all modules are selected
  const isAdminAllChecked = MODULE_CONFIGS.every((mod) => {
    const selected = permissions[mod.name] || [];
    return mod.actions.every((act) => selected.includes(act));
  });

  const toggleAdminAll = () => {
    if (isAdminAllChecked) {
      setPermissions({});
    } else {
      const all: Record<string, string[]> = {};
      MODULE_CONFIGS.forEach((mod) => {
        all[mod.name] = [...mod.actions];
      });
      setPermissions(all);
    }
  };

  const isRowCheckAll = (mod: ModuleConfig) => {
    const selected = permissions[mod.name] || [];
    return mod.actions.every((act) => selected.includes(act));
  };

  const toggleRowCheckAll = (mod: ModuleConfig) => {
    if (isRowCheckAll(mod)) {
      setPermissions((prev) => {
        const next = { ...prev };
        delete next[mod.name];
        return next;
      });
    } else {
      setPermissions((prev) => ({
        ...prev,
        [mod.name]: [...mod.actions],
      }));
    }
  };

  const toggleAction = (moduleName: string, action: string) => {
    setPermissions((prev) => {
      const current = prev[moduleName] || [];
      const updated = current.includes(action)
        ? current.filter((a) => a !== action)
        : [...current, action];

      if (updated.length === 0) {
        const next = { ...prev };
        delete next[moduleName];
        return next;
      }
      return { ...prev, [moduleName]: updated };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const errors: Record<string, string> = {};
    const nameErr = validateRequired(name);
    if (nameErr) errors.name = nameErr;

    const emailErr = validateRequired(email);
    if (emailErr) errors.email = emailErr;

    if (!isEdit) {
      const passErr = validateRequired(password);
      if (passErr) errors.password = passErr;
    }

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }

    if (!isEdit) {
      if (password.trim().length < 8) {
        setError('Password is required and must be at least 8 characters long');
        return;
      }
      if (password !== confirmPassword) {
        setError('Password and Confirm Password do not match');
        return;
      }
    } else {
      if (password && password !== '••••••••' && password.trim().length < 8) {
        setError('New password must be at least 8 characters long');
        return;
      }
      if (password !== confirmPassword) {
        setError('Password and Confirm Password do not match');
        return;
      }
    }

    setSubmitting(true);
    const isNewPasswordEntered = password && password !== '••••••••';
    const payload = {
      name: name.trim(),
      description: description.trim(),
      status,
      email: email.trim(),
      password: isNewPasswordEntered ? password.trim() : undefined,
      confirmPassword: isNewPasswordEntered ? confirmPassword.trim() : undefined,
      permissions: JSON.stringify(permissions),
    };

    try {
      const res = isEdit
        ? await axiosInstance.put(`/roles/${id}`, payload)
        : await axiosInstance.post('/roles', payload);

      if (res.data.status) {
        navigate('/roles');
      } else {
        setError(res.data.message || 'Operation failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error saving role');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>Loading role details...</div>;
  }

  return (
    <div className="page-content" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {error && (
        <div className="badge badge-red" style={{ width: '100%', padding: '12px 16px', marginBottom: '20px', borderRadius: '8px', fontSize: '14px' }}>
          {error}
        </div>
      )}

      <form noValidate onSubmit={handleSubmit} autoComplete="off">
        {/* Form Card 1: Role & Login Credentials */}
        <div className="card" style={{ background: '#fff', borderRadius: '12px', padding: '24px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '18px', fontWeight: 600, color: '#1E293B', borderBottom: '1px solid #F1F5F9', paddingBottom: '12px' }}>
            Role & Account Details
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            <div className="form-field">
              <label style={{ display: 'block', fontWeight: 500, fontSize: '14px', marginBottom: '6px', color: '#334155' }}>
                Name <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <input
                type="text"
                className={fieldErrors.name ? 'input-error' : ''}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: '' }));
                }}
                placeholder="e.g. Sales Manager"
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px' }}
              />
              <FieldError error={fieldErrors.name} />
            </div>

            <div className="form-field">
              <label style={{ display: 'block', fontWeight: 500, fontSize: '14px', marginBottom: '6px', color: '#334155' }}>
                Status <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', background: '#fff' }}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div className="form-field" style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontWeight: 500, fontSize: '14px', marginBottom: '6px', color: '#334155' }}>
                Description
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief summary of role responsibilities..."
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', fontFamily: 'inherit' }}
              />
            </div>

            <div className="form-field">
              <label style={{ display: 'block', fontWeight: 500, fontSize: '14px', marginBottom: '6px', color: '#334155' }}>
                Login Email <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <input
                type="email"
                className={fieldErrors.email ? 'input-error' : ''}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: '' }));
                }}
                placeholder="user@academy.com"
                autoComplete="new-password"
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px' }}
              />
              <FieldError error={fieldErrors.email} />
            </div>

            <div className="form-field">
              <label style={{ display: 'block', fontWeight: 500, fontSize: '14px', marginBottom: '6px', color: '#334155' }}>
                {isEdit ? 'Password (leave blank to keep current)' : 'Password *'}
              </label>
              <input
                type="password"
                className={fieldErrors.password ? 'input-error' : ''}
                value={password}
                onChange={(e) => {
                  handlePasswordChange(e.target.value);
                  if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: '' }));
                }}
                placeholder="••••••••"
                autoComplete="new-password"
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px' }}
              />
              <FieldError error={fieldErrors.password} />
            </div>

            <div className="form-field">
              <label style={{ display: 'block', fontWeight: 500, fontSize: '14px', marginBottom: '6px', color: '#334155' }}>
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px' }}
              />
            </div>
          </div>
        </div>

        {/* Form Card 2: Role Permissions Checkbox Grid */}
        <div className="card" style={{ background: '#fff', borderRadius: '12px', padding: '24px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #F1F5F9', paddingBottom: '12px' }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#1E293B' }}>
              Role Permissions
            </h3>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600, color: '#2563EB', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={isAdminAllChecked}
                onChange={toggleAdminAll}
                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
              />
              <span>Admin All Permissions</span>
            </label>
          </div>

          <div className="table-responsive">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0', textAlign: 'left' }}>
                  <th style={{ padding: '12px 16px', width: '220px', color: '#475569', fontWeight: 600 }}>Modules</th>
                  <th style={{ padding: '12px 16px', color: '#475569', fontWeight: 600 }}>Permissions</th>
                </tr>
              </thead>
              <tbody>
                {MODULE_CONFIGS.map((mod) => {
                  const selectedActions = permissions[mod.name] || [];
                  const isRowChecked = isRowCheckAll(mod);

                  return (
                    <tr key={mod.name} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 500, color: '#1E293B' }}>
                        {mod.name}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '16px' }}>
                          {mod.actions.map((act) => {
                            const isChecked = selectedActions.includes(act);
                            return (
                              <label key={act} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#334155', cursor: 'pointer' }}>
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => toggleAction(mod.name, act)}
                                  style={{ width: '15px', height: '15px', cursor: 'pointer' }}
                                />
                                <span>{act}</span>
                              </label>
                            );
                          })}

                          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#64748B', fontWeight: 500, cursor: 'pointer', marginLeft: '12px' }}>
                            <input
                              type="checkbox"
                              checked={isRowChecked}
                              onChange={() => toggleRowCheckAll(mod)}
                              style={{ width: '15px', height: '15px', cursor: 'pointer' }}
                            />
                            <span>Check all</span>
                          </label>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Buttons Bar */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/roles')}
            style={{ padding: '10px 24px', borderRadius: '8px', fontWeight: 500 }}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
            style={{ padding: '10px 24px', borderRadius: '8px', fontWeight: 500 }}
          >
            {submitting ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
};
