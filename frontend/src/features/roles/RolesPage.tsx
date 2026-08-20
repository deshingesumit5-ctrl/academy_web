import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../config/axiosInstance';
import { ActionButtons } from '../../components/ActionButtons';

interface Role {
  roleId: number;
  name: string;
  description: string;
  status: string;
  permissions: string;
  email: string;
  username: string;
  createdAt: string;
}

export const RolesPage: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchRoles = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axiosInstance.get('/roles');
      if (res.data.status) {
        setRoles(res.data.data || []);
      } else {
        setError(res.data.message || 'Failed to load roles');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error loading roles list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleDelete = async (roleId: number, roleName: string) => {
    if (roleName.toLowerCase().includes('super admin')) {
      alert('Super Admin role cannot be deleted');
      return;
    }
    if (!window.confirm(`Are you sure you want to delete role "${roleName}"? This will also remove the linked user login account.`)) {
      return;
    }

    try {
      const res = await axiosInstance.delete(`/roles/${roleId}`);
      if (res.data.status) {
        fetchRoles();
      } else {
        alert(res.data.message || 'Failed to delete role');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error deleting role');
    }
  };

  return (
    <div>
      <div className="section-title">
        <button
          className="btn btn-primary"
          onClick={() => navigate('/roles/create')}
        >
          <i className="ti ti-plus"></i>
          <span>Add Role</span>
        </button>
      </div>

      {error && (
        <div className="badge badge-red" style={{ width: '100%', padding: '10px 14px', marginBottom: '16px', borderRadius: '6px' }}>
          {error}
        </div>
      )}

      {/* Roles List Card */}
      <div className="card">
        {loading ? (
          <div className="empty">Loading roles...</div>
        ) : roles.length === 0 ? (
          <div className="empty">
            <i className="ti ti-shield"></i>
            <div>No roles created yet</div>
          </div>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Role Name</th>
                  <th>Description</th>
                  <th>Linked Login Email</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {roles.map((role) => {
                  const isSuperAdmin = role.name.toLowerCase().includes('super admin');
                  return (
                    <tr key={role.roleId}>
                      <td>
                        {role.name}
                        {isSuperAdmin && (
                          <span className="badge badge-purple" style={{ marginLeft: '8px', fontSize: '11px', padding: '2px 8px' }}>
                            System Reserved
                          </span>
                        )}
                      </td>
                      <td>{role.description || '-'}</td>
                      <td>{role.email || role.username || '-'}</td>
                      <td>
                        <span className={`badge ${role.status === 'Active' ? 'badge-green' : 'badge-gray'}`}>
                          {role.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <ActionButtons
                          onEdit={() => navigate(`/roles/edit/${role.roleId}`)}
                          onDelete={() => handleDelete(role.roleId, role.name)}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
