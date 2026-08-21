import React, { useState, useEffect } from 'react';
import { getUsers, createUser, updateUser, deleteUser } from './api/userMasterApi';
import type { UserMasterDto } from './api/userMasterApi';
import { UserFormModal } from './components/UserFormModal';
import { ConfirmDialog } from '../../../components/ConfirmDialog';
import { ActionButtons } from '../../../components/ActionButtons';

import { getCachedData } from '../../../config/apiCache';

export const UserMasterPage: React.FC = () => {
  const cached = getCachedData('/users');
  const [users, setUsers] = useState<UserMasterDto[]>(cached?.data || []);
  const [loading, setLoading] = useState(users.length === 0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<UserMasterDto | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchUsers = async (showLoading = users.length === 0) => {
    if (showLoading) setLoading(true);
    try {
      const data = await getUsers();
      setUsers(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(users.length === 0);
  }, []);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (item: UserMasterDto) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleSave = async (data: UserMasterDto) => {
    if (editingItem && editingItem.userId) {
      await updateUser(editingItem.userId, data);
    } else {
      await createUser(data);
    }
    await fetchUsers(false);
  };

  const handleConfirmDelete = async () => {
    if (deletingId) {
      try {
        await deleteUser(deletingId);
        await fetchUsers(false);
      } catch (err) {
        console.error(err);
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    <div>
      <div className="section-title">
        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <i className="ti ti-plus"></i>Add User
        </button>
      </div>

      <div className="card">
        {users.length === 0 && !loading ? (
          <div className="empty">
            <i className="ti ti-users"></i>
            <div>No users added yet</div>
          </div>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Employee Name</th>
                  <th>Role</th>
                  <th>Description</th>
                  <th>Email ID</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((item, index) => (
                  <tr key={item.userId}>
                    <td>{index + 1}</td>
                    <td style={{ fontWeight: 600 }}>{item.employeeName || '-'}</td>
                    <td>
                      <span className="badge badge-blue">{item.roleName || 'User'}</span>
                    </td>
                    <td>{item.description || '-'}</td>
                    <td>{item.email}</td>
                    <td>
                      <span className={`badge ${item.status === 'Inactive' ? 'badge-red' : 'badge-green'}`}>
                        {item.status || 'Active'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <ActionButtons
                        onEdit={() => handleOpenEdit(item)}
                        onDelete={() => setDeletingId(item.userId!)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <UserFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        initialData={editingItem}
      />

      <ConfirmDialog
        isOpen={deletingId !== null}
        title="Delete User"
        message="Do you want to delete this User account? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
};
